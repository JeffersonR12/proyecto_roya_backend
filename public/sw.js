const CACHE = 'roya-edge-v1';
const PRECACHE = [
    '/manifest.webmanifest',
    '/icons/roya.svg',
    '/models/modelo_roya.onnx',
    '/onnx/ort-wasm-simd-threaded.wasm',
    '/onnx/ort-wasm-simd-threaded.mjs',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then(async (cache) => {
            await Promise.all(
                PRECACHE.map((url) =>
                    cache.add(url).catch(() => undefined),
                ),
            );
        }),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
        ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    const cacheFirst =
        url.pathname.startsWith('/onnx/') ||
        url.pathname.startsWith('/models/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.startsWith('/build/') ||
        url.pathname === '/manifest.webmanifest';

    if (!cacheFirst) {
        return;
    }

    event.respondWith(
        caches.match(request).then(async (cached) => {
            if (cached) {
                return cached;
            }

            const response = await fetch(request);
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE).then((cache) => cache.put(request, copy));
            }

            return response;
        }),
    );
});
