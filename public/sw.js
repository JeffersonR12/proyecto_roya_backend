/*
 * Service worker de RiwiScan.
 *
 * Las versiones llegan por query string desde resources/js/lib/pwa.js:
 *   /sw.js?v=<BUILD_ID>&m=<MODELO_VERSION>&o=<version de onnxruntime-web>
 * Un build nuevo cambia la URL, el navegador instala este worker de nuevo y
 * la app muestra "Hay una versión nueva".
 *
 * Dos caches:
 *   roya-app-<build>              JS/CSS del build (manifest de Vite), iconos y la pagina "/".
 *   roya-runtime-<modelo>-ort-<v> modelo ONNX, su JSON y el WASM de ORT. Solo se
 *                                 descarga de nuevo si cambia el modelo o ORT.
 */
const params = new URL(self.location.href).searchParams;
const BUILD_ID = params.get('v') || 'dev';
const MODELO_VERSION = params.get('m') || 'sin-version';
const ORT_VERSION = params.get('o') || 'sin-version';

const APP_CACHE = `roya-app-${BUILD_ID}`;
const RUNTIME_CACHE = `roya-runtime-${MODELO_VERSION}-ort-${ORT_VERSION}`;
const SHELL_URL = '/';
const VITE_MANIFEST_URL = '/build/manifest.json';

const modelo = encodeURIComponent(MODELO_VERSION);

// Deben coincidir con MODEL_URL y MODEL_META_URL de resources/js/lib/modelo.js.
const RUNTIME_ASSETS = [
    `/models/modelo_roya.onnx?v=${modelo}`,
    `/models/modelo_roya.json?v=${modelo}`,
    '/onnx/ort-wasm-simd-threaded.wasm',
    '/onnx/ort-wasm-simd-threaded.mjs',
];

const STATIC_ASSETS = [
    '/manifest.webmanifest',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-512.png',
    '/icons/roya.svg',
    '/imagenes/riwiscan-logo.png',
];

/** Todos los archivos que emitio Vite: entradas, chunks dinamicos (ORT), CSS y fuentes. */
function assetsFromViteManifest(manifest) {
    const files = new Set();

    for (const entry of Object.values(manifest)) {
        if (entry.file) {
            files.add(entry.file);
        }

        for (const file of [...(entry.css ?? []), ...(entry.assets ?? [])]) {
            files.add(file);
        }
    }

    return [...files].map((file) => `/build/${file}`);
}

function isShell(response) {
    return response.ok && !response.redirected && response.type === 'basic' && new URL(response.url).pathname === SHELL_URL;
}

async function precacheRuntime() {
    const cache = await caches.open(RUNTIME_CACHE);
    const pending = [];

    for (const url of RUNTIME_ASSETS) {
        if (!(await cache.match(url))) {
            pending.push(new Request(url, { cache: 'reload' }));
        }
    }

    // addAll es atomico: si falta el modelo, la instalacion falla y sigue el worker anterior.
    await cache.addAll(pending);
}

async function precacheApp() {
    const cache = await caches.open(APP_CACHE);
    const response = await fetch(VITE_MANIFEST_URL, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`No se pudo leer ${VITE_MANIFEST_URL} (${response.status})`);
    }

    await cache.addAll(assetsFromViteManifest(await response.json()));
    await Promise.all(STATIC_ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)));

    try {
        const shell = await fetch(SHELL_URL, { credentials: 'same-origin', cache: 'no-store' });

        if (isShell(shell)) {
            await cache.put(SHELL_URL, shell);
        }
    } catch {
        // Sin sesion o sin red: la pagina se guarda en la siguiente visita con red.
    }
}

/** Borra la pagina guardada: contiene nombre, correo y cooperativa del usuario. */
async function clearShell() {
    const keys = await caches.keys();

    await Promise.all(
        keys.filter((key) => key.startsWith('roya-app-')).map(async (key) => (await caches.open(key)).delete(SHELL_URL)),
    );
}

function offlineResponse() {
    const html =
        '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>RiwiScan sin conexión</title><body style="font-family:system-ui;padding:2rem;color:#14532d">' +
        '<h1>Sin conexión</h1><p>Abre RiwiScan una vez con internet e inicia sesión. Después funciona sin red.</p></body></html>';

    return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

/** La pagina "/" va primero a la red (datos frescos) y sin red sale de la cache. */
async function networkFirstShell(request) {
    try {
        const response = await fetch(request);

        if (isShell(response)) {
            const cache = await caches.open(APP_CACHE);
            await cache.put(SHELL_URL, response.clone());
        } else if (response.type === 'opaqueredirect' || response.redirected || response.status === 401) {
            // Redirige al login: la sesion termino y la copia guardada ya no corresponde.
            await clearShell();
        }

        return response;
    } catch {
        return (await caches.match(SHELL_URL, { ignoreSearch: true })) ?? offlineResponse();
    }
}

function runtimeCacheFor(pathname) {
    return pathname.startsWith('/models/') || pathname.startsWith('/onnx/') ? RUNTIME_CACHE : APP_CACHE;
}

async function cacheFirst(request, pathname) {
    const cached = await caches.match(request);

    if (cached) {
        return cached;
    }

    const response = await fetch(request);

    if (response.ok) {
        const cache = await caches.open(runtimeCacheFor(pathname));
        await cache.put(request, response.clone());
    }

    return response;
}

function isCacheFirst(pathname) {
    // version.json dice que build esta desplegado: siempre de la red.
    if (pathname === '/build/version.json') {
        return false;
    }

    return (
        pathname.startsWith('/build/') ||
        pathname.startsWith('/models/') ||
        pathname.startsWith('/onnx/') ||
        pathname.startsWith('/icons/') ||
        pathname.startsWith('/imagenes/') ||
        pathname === '/manifest.webmanifest'
    );
}

self.addEventListener('install', (event) => {
    // Sin skipWaiting: el worker nuevo espera hasta que el usuario pulse "Actualizar".
    event.waitUntil(Promise.all([precacheRuntime(), precacheApp()]));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keep = [APP_CACHE, RUNTIME_CACHE];
            const keys = await caches.keys();

            // Incluye la cache fija antigua "roya-edge-v1".
            await Promise.all(keys.filter((key) => key.startsWith('roya-') && !keep.includes(key)).map((key) => caches.delete(key)));
            await self.clients.claim();
        })(),
    );
});

self.addEventListener('message', (event) => {
    const type = event.data?.type;

    if (type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (type === 'CLEAR_SHELL') {
        event.waitUntil(clearShell());
    }
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate' && url.pathname === SHELL_URL) {
        event.respondWith(networkFirstShell(request));

        return;
    }

    if (isCacheFirst(url.pathname)) {
        event.respondWith(cacheFirst(request, url.pathname));
    }
});
