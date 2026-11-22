import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

// Ejecuta public/sw.js en un sandbox con Cache API y red falsas.
const ORIGIN = 'https://riwiscan.test';
const SOURCE = readFileSync('public/sw.js', 'utf8');

const abs = (input) => (typeof input === 'string' ? new URL(input, ORIGIN).href : input.url);

function fakeResponse(url, { status = 200, body = '', type = 'basic', redirected = false } = {}) {
    return {
        ok: status >= 200 && status < 300,
        status,
        type,
        redirected,
        url,
        body,
        clone() {
            return this;
        },
        async json() {
            return JSON.parse(body);
        },
    };
}

class FakeCache {
    constructor() {
        this.entries = new Map();
    }

    async match(request, { ignoreSearch = false } = {}) {
        const key = abs(request);

        if (!ignoreSearch) {
            return this.entries.get(key);
        }

        const base = key.split('?')[0];

        return [...this.entries].find(([url]) => url.split('?')[0] === base)?.[1];
    }

    async put(request, response) {
        this.entries.set(abs(request), response);
    }

    async delete(request) {
        return this.entries.delete(abs(request));
    }

    async add(request) {
        const response = await this.fetch(request);

        if (!response.ok) {
            throw new TypeError(`add fallo: ${abs(request)}`);
        }

        await this.put(request, response);
    }

    async addAll(requests) {
        const responses = await Promise.all(requests.map((request) => this.fetch(request)));

        if (responses.some((response) => !response.ok)) {
            throw new TypeError('addAll fallo');
        }

        requests.forEach((request, i) => this.entries.set(abs(request), responses[i]));
    }
}

function loadWorker({ routes = {}, offline = false, query = 'v=B2&m=roya-v1&o=1.21.0', existingCaches = [] } = {}) {
    const network = { offline };
    const fetch = vi.fn(async (input) => {
        if (network.offline) {
            throw new TypeError('Failed to fetch');
        }

        const url = abs(input);
        const path = url.slice(ORIGIN.length);
        const route = routes[path];

        return route ? route(url) : fakeResponse(url, { status: 404 });
    });

    const stores = new Map(existingCaches.map((name) => [name, Object.assign(new FakeCache(), { fetch })]));
    const caches = {
        stores,
        async open(name) {
            if (!stores.has(name)) {
                stores.set(name, Object.assign(new FakeCache(), { fetch }));
            }

            return stores.get(name);
        },
        async keys() {
            return [...stores.keys()];
        },
        async delete(name) {
            return stores.delete(name);
        },
        async match(request, options) {
            for (const cache of stores.values()) {
                const hit = await cache.match(request, options);

                if (hit) {
                    return hit;
                }
            }

            return undefined;
        },
    };

    const listeners = {};
    const self = {
        location: new URL(`${ORIGIN}/sw.js?${query}`),
        addEventListener: (type, handler) => {
            listeners[type] = handler;
        },
        skipWaiting: vi.fn(),
        clients: { claim: vi.fn(async () => undefined) },
    };

    class Request {
        constructor(url, init = {}) {
            this.url = abs(url);
            this.cache = init.cache;
        }
    }

    vm.runInNewContext(SOURCE, { self, caches, fetch, Request, Response, URL, URLSearchParams, Promise, Set, Object });

    const dispatch = (type, event) => {
        let pending = Promise.resolve();
        listeners[type]({ ...event, waitUntil: (p) => (pending = p), respondWith: (p) => (pending = p) });

        return pending;
    };

    return { caches, fetch, self, network, dispatch, listeners };
}

const SHELL_HTML = '<html>app de Ana</html>';
const okRoutes = {
    '/build/manifest.json': (url) =>
        fakeResponse(url, {
            body: JSON.stringify({
                'resources/js/main.jsx': { file: 'assets/main-abc.js', css: ['assets/main-abc.css'], dynamicImports: ['ort'] },
                ort: { file: 'assets/ort-123.js' },
                'resources/css/app.css': { file: 'assets/app-xyz.css', assets: ['assets/font.woff2'] },
            }),
        }),
    '/': (url) => fakeResponse(url, { body: SHELL_HTML }),
};

for (const path of [
    '/models/modelo_roya.onnx?v=roya-v1',
    '/models/modelo_roya.json?v=roya-v1',
    '/onnx/ort-wasm-simd-threaded.wasm',
    '/onnx/ort-wasm-simd-threaded.mjs',
    '/build/assets/main-abc.js',
    '/build/assets/main-abc.css',
    '/build/assets/ort-123.js',
    '/build/assets/app-xyz.css',
    '/build/assets/font.woff2',
    '/manifest.webmanifest',
]) {
    okRoutes[path] = (url) => fakeResponse(url);
}

const cachedUrls = (store) => [...store.entries.keys()].map((url) => url.slice(ORIGIN.length)).sort();

describe('service worker', () => {
    it('precachea el build de Vite, la pagina y el modelo versionado en caches separadas', async () => {
        const sw = loadWorker({ routes: okRoutes });

        await sw.dispatch('install', {});

        expect([...sw.caches.stores.keys()].sort()).toEqual(['roya-app-B2', 'roya-runtime-roya-v1-ort-1.21.0']);
        expect(cachedUrls(sw.caches.stores.get('roya-runtime-roya-v1-ort-1.21.0'))).toEqual([
            '/models/modelo_roya.json?v=roya-v1',
            '/models/modelo_roya.onnx?v=roya-v1',
            '/onnx/ort-wasm-simd-threaded.mjs',
            '/onnx/ort-wasm-simd-threaded.wasm',
        ]);
        expect(cachedUrls(sw.caches.stores.get('roya-app-B2'))).toEqual(
            expect.arrayContaining(['/', '/build/assets/main-abc.js', '/build/assets/ort-123.js', '/build/assets/font.woff2', '/manifest.webmanifest']),
        );
        expect(sw.self.skipWaiting).not.toHaveBeenCalled();
    });

    it('falla la instalacion si el servidor no tiene el modelo', async () => {
        const routes = { ...okRoutes };
        delete routes['/models/modelo_roya.onnx?v=roya-v1'];
        const sw = loadWorker({ routes });

        await expect(sw.dispatch('install', {})).rejects.toThrow();
    });

    it('no vuelve a descargar el modelo si solo cambio el build', async () => {
        const sw = loadWorker({ routes: okRoutes });
        await sw.dispatch('install', {});
        sw.fetch.mockClear();

        await sw.dispatch('install', {});

        const urls = sw.fetch.mock.calls.map(([input]) => abs(input));
        expect(urls.some((url) => url.includes('/models/'))).toBe(false);
    });

    it('al activar borra las caches viejas de la app y conserva las ajenas', async () => {
        const sw = loadWorker({
            routes: okRoutes,
            existingCaches: ['roya-edge-v1', 'roya-app-B1', 'roya-runtime-viejo-ort-1.0', 'otra-app'],
        });
        await sw.dispatch('install', {});

        await sw.dispatch('activate', {});

        expect([...sw.caches.stores.keys()].sort()).toEqual(['otra-app', 'roya-app-B2', 'roya-runtime-roya-v1-ort-1.21.0']);
        expect(sw.self.clients.claim).toHaveBeenCalled();
    });

    it('sin red abre la pagina guardada', async () => {
        const sw = loadWorker({ routes: okRoutes });
        await sw.dispatch('install', {});
        sw.network.offline = true;

        const response = await sw.dispatch('fetch', { request: { method: 'GET', mode: 'navigate', url: `${ORIGIN}/` } });

        expect(response.body).toBe(SHELL_HTML);
    });

    it('sin red y sin pagina guardada responde un aviso en español', async () => {
        const sw = loadWorker({ offline: true });

        const response = await sw.dispatch('fetch', { request: { method: 'GET', mode: 'navigate', url: `${ORIGIN}/` } });

        expect(response.status).toBe(503);
        expect(await response.text()).toContain('Sin conexión');
    });

    it('borra la pagina guardada cuando la sesion termina', async () => {
        const sw = loadWorker({ routes: okRoutes });
        await sw.dispatch('install', {});
        sw.network.offline = false;
        okRoutes['/'] = (url) => fakeResponse(url, { status: 0, type: 'opaqueredirect' });

        try {
            await sw.dispatch('fetch', { request: { method: 'GET', mode: 'navigate', url: `${ORIGIN}/` } });
        } finally {
            okRoutes['/'] = (url) => fakeResponse(url, { body: SHELL_HTML });
        }

        expect(await sw.caches.match('/')).toBeUndefined();
    });

    it('CLEAR_SHELL borra la pagina y SKIP_WAITING activa el worker', async () => {
        const sw = loadWorker({ routes: okRoutes });
        await sw.dispatch('install', {});

        await sw.dispatch('message', { data: { type: 'CLEAR_SHELL' } });
        await sw.dispatch('message', { data: { type: 'SKIP_WAITING' } });

        expect(await sw.caches.match('/')).toBeUndefined();
        expect(sw.self.skipWaiting).toHaveBeenCalledOnce();
    });

    it('version.json y la API siempre van a la red; el build sale de la cache', () => {
        const sw = loadWorker({ routes: okRoutes });
        const buildRespond = vi.fn();
        sw.listeners.fetch({ request: { method: 'GET', mode: 'cors', url: `${ORIGIN}/build/assets/main-abc.js` }, respondWith: buildRespond });
        expect(buildRespond).toHaveBeenCalledOnce();

        for (const path of ['/build/version.json', '/api/diagnosticos']) {
            const respondWith = vi.fn();
            sw.listeners.fetch({ request: { method: 'GET', mode: 'cors', url: `${ORIGIN}${path}` }, respondWith });
            expect(respondWith).not.toHaveBeenCalled();
        }
    });
});
