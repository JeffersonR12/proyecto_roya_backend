export function registerEdgeWorker() {
    if (!('serviceWorker' in navigator)) {
        return Promise.resolve(null);
    }

    if (!import.meta.env.PROD) {
        return Promise.resolve(null);
    }

    return navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => null);
}
