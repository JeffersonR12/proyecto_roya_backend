// Service Worker de RiwiScan (offline-first).
// - Precarga el runtime ONNX, el modelo y TODOS los assets compilados de Vite
//   (leídos de /build/manifest.json), incluido el chunk dinámico de onnxruntime-web.
// - Cachea el documento HTML de la SPA (/ y /reports) con estrategia network-first,
//   para que la aplicación abra sin red después de una primera visita en línea.
// - Borra el HTML cacheado al cerrar sesión o cuando la sesión expira (redirección
//   a /login), porque ese HTML contiene datos del usuario autenticado.
const VERSION = 'v2';
const STATIC_CACHE = `roya-edge-static-${VERSION}`;
const SHELL_CACHE = `roya-edge-shell-${VERSION}`;

const PRECACHE = [
    '/manifest.webmanifest',
    '/icons/roya.svg',
    '/imagenes/riwiscan-logo.png',
    '/models/modelo_roya.onnx',
    '/onnx/ort-wasm-simd-threaded.wasm',
    '/onnx/ort-wasm-simd-threaded.mjs',
];

const SHELL_PATHS = new Set(['/', '/reports']);

const CACHE_FIRST_PREFIXES = ['/onnx/', '/models/', '/icons/', '/build/', '/imagenes/'];

self.addEventListener('install', (event) => {
    event.waitUntil(precache());
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    const vigentes = new Set([STATIC_CACHE, SHELL_CACHE]);
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => !vigentes.has(key)).map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    // Cierre de sesión: se descarta el HTML del usuario y la petición sigue su curso.
    if (request.method === 'POST' && url.pathname === '/logout') {
        event.waitUntil(caches.delete(SHELL_CACHE));
        return;
    }

    if (request.method !== 'GET') {
        return;
    }

    if (request.mode === 'navigate' && SHELL_PATHS.has(url.pathname)) {
        event.respondWith(networkFirstShell(request, url.pathname));
        return;
    }

    const cacheFirst =
        CACHE_FIRST_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
        url.pathname === '/manifest.webmanifest';

    if (cacheFirst) {
        event.respondWith(cacheFirstResponse(event, request));
    }
});

async function precache() {
    const cache = await caches.open(STATIC_CACHE);
    const urls = [...PRECACHE, ...(await buildAssets())];
    // Cada recurso se agrega por separado: si uno falla, el resto igual queda en caché.
    await Promise.all([...urls.map((url) => cache.add(url).catch(() => undefined)), precacheShell()]);
}

// En la primera visita el HTML se descargó antes de que existiera el Service Worker;
// se guarda aquí para que la app abra sin red desde la siguiente vez.
// Solo si hay sesión válida: sin sesión Laravel redirige a /login y no se guarda nada.
async function precacheShell() {
    try {
        const response = await fetch('/', { credentials: 'same-origin' });
        if (response.ok && !response.redirected) {
            const cache = await caches.open(SHELL_CACHE);
            await cache.put('/', response);
        }
    } catch {
        // Sin red durante la instalación: se cacheará en la próxima navegación.
    }
}

async function buildAssets() {
    try {
        const response = await fetch('/build/manifest.json', { cache: 'no-store' });
        if (!response.ok) {
            return [];
        }
        const manifest = await response.json();
        const files = new Set();
        for (const chunk of Object.values(manifest)) {
            [chunk.file, ...(chunk.css ?? []), ...(chunk.assets ?? [])]
                .filter(Boolean)
                .forEach((file) => files.add(`/build/${file}`));
        }
        return [...files];
    } catch {
        // Sin build (modo desarrollo): no hay nada que precargar.
        return [];
    }
}

async function networkFirstShell(request, pathname) {
    try {
        const response = await fetch(request);
        if (response.redirected) {
            // Sesión expirada: Laravel redirigió a /login; el HTML anterior ya no es válido.
            await caches.delete(SHELL_CACHE);
        } else if (response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            await cache.put(pathname, response.clone());
        }
        return response;
    } catch (error) {
        const cache = await caches.open(SHELL_CACHE);
        const cached = (await cache.match(pathname)) ?? (await cache.match('/'));
        if (cached) {
            return cached;
        }
        throw error;
    }
}

async function cacheFirstResponse(event, request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
        // waitUntil mantiene vivo el Service Worker hasta terminar de guardar
        // (el modelo ONNX pesa ~6 MB) sin retrasar la respuesta al navegador.
        event.waitUntil(saveInCache(request, response.clone()));
    }

    return response;
}

async function saveInCache(request, response) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, response);
    } catch {
        // Sin espacio o almacenamiento bloqueado: la app sigue funcionando sin caché.
    }
}
