import { MODELO_VERSION } from './inference.js';

/* global __BUILD_ID__, __ORT_VERSION__ */
// Los define vite.config.js en el build; en pruebas no existen.
export const BUILD_ID = typeof __BUILD_ID__ === 'undefined' ? 'dev' : __BUILD_ID__;
export const ORT_VERSION = typeof __ORT_VERSION__ === 'undefined' ? 'dev' : __ORT_VERSION__;

const UPDATE_CHECK_MS = 60 * 60 * 1000;

/** Fuera de la cache del service worker (ver isCacheFirst en public/sw.js). */
export const BUILD_VERSION_URL = '/build/version.json';

/**
 * La URL cambia con cada build, modelo o version de ORT; para el navegador
 * es un worker nuevo y lo instala. public/sw.js lee estos mismos parametros.
 */
export function serviceWorkerUrl({ build = BUILD_ID, modelo = MODELO_VERSION, ort = ORT_VERSION } = {}) {
    return `/sw.js?${new URLSearchParams({ v: build, m: modelo, o: ort })}`;
}

const listeners = new Set();
let waitingWorker = null;

function announce(worker) {
    waitingWorker = worker;
    listeners.forEach((listener) => listener());
}

/** Avisa cuando hay un worker nuevo instalado esperando. Devuelve la funcion para desuscribirse. */
export function onUpdateAvailable(listener) {
    listeners.add(listener);

    if (waitingWorker) {
        listener();
    }

    return () => listeners.delete(listener);
}

/**
 * Solo hay "actualizacion" si ya habia un worker controlando la pagina;
 * la primera instalacion no muestra aviso.
 */
export function trackRegistration(registration, container = navigator.serviceWorker) {
    if (registration.waiting && container.controller) {
        announce(registration.waiting);
    }

    registration.addEventListener('updatefound', () => {
        const worker = registration.installing;

        worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && container.controller) {
                announce(worker);
            }
        });
    });
}

/** Activa el worker que espera y recarga cuando ya controla la pagina. */
export function applyUpdate(container = navigator.serviceWorker, reload = () => window.location.reload()) {
    if (!waitingWorker) {
        reload();

        return;
    }

    container.addEventListener('controllerchange', () => reload(), { once: true });
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
}

/** Al cerrar sesion: borra la copia offline de la pagina con los datos de la cuenta. */
export function forgetAppShell() {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker?.controller) {
        return;
    }

    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_SHELL' });
}

/**
 * Una PWA abierta por dias no vuelve a pedir el HTML, asi que no ve la URL
 * nueva del worker. build/version.json (lo escribe vite.config.js) dice que
 * build esta desplegado; si es otro, se registra su worker y aparece el aviso.
 */
export async function checkForNewBuild({
    fetchImpl = fetch,
    register = (url) => navigator.serviceWorker.register(url, { scope: '/' }),
    currentBuild = BUILD_ID,
} = {}) {
    const response = await fetchImpl(BUILD_VERSION_URL, { cache: 'no-store' });

    if (!response.ok) {
        return false;
    }

    const remote = await response.json();

    if (!remote?.build || remote.build === currentBuild) {
        return false;
    }

    await register(serviceWorkerUrl({ build: remote.build, modelo: remote.modelo, ort: remote.ort }));

    return true;
}

export function registerEdgeWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return Promise.resolve(null);
    }

    if (!import.meta.env.PROD) {
        return Promise.resolve(null);
    }

    return navigator.serviceWorker
        .register(serviceWorkerUrl(), { scope: '/' })
        .then((registration) => {
            trackRegistration(registration);

            const check = () => {
                if (navigator.onLine) {
                    checkForNewBuild().catch(() => undefined);
                }
            };
            setInterval(check, UPDATE_CHECK_MS);
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    check();
                }
            });

            return registration;
        })
        .catch(() => null);
}

/** Solo para pruebas. */
export function resetUpdateStateForTests() {
    listeners.clear();
    waitingWorker = null;
}
