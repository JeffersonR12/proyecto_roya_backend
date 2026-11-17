import axios from 'axios';
import { listDiagnosticos, saveDiagnostico, updateDiagnostico } from './diagnosticosDb.js';
import { createSyncQueue } from './syncQueue.js';
import { SessionMismatchError, pullAndMerge } from './serverSync.js';
import { clearSession, getSession } from './session.js';

const db = { listDiagnosticos, saveDiagnostico, updateDiagnostico };

let redirecting = false;

/**
 * La sesion del navegador ya no es la de esta pantalla (expiro, o entro otra
 * cuenta en otra pestana): se detiene todo y se vuelve al login sin enviar nada.
 */
export function handleAuthLost() {
    syncQueue.stop();
    clearSession();

    if (!redirecting && typeof window !== 'undefined') {
        redirecting = true;
        window.location.href = '/login';
    }
}

export const syncQueue = createSyncQueue({ db, http: axios, onAuthLost: handleAuthLost });

let syncing = null;

/**
 * Ciclo completo: envia la cola, envia revisiones y trae lo nuevo del servidor.
 * Nunca lanza: sin red o con error, la app sigue funcionando offline.
 */
export function syncAll() {
    if (!syncing) {
        syncing = (async () => {
            const summary = await syncQueue.flush().catch(() => null);
            let descargados = 0;

            if (summary && !summary.offline && !summary.authLost && getSession()) {
                descargados = await pullAndMerge({ db, http: axios, session: getSession() }).catch((error) => {
                    if (error instanceof SessionMismatchError || [401, 419].includes(error?.response?.status)) {
                        handleAuthLost();
                    }

                    return 0;
                });
            }

            return { ...(summary || {}), descargados };
        })().finally(() => {
            syncing = null;
        });
    }

    return syncing;
}

export async function countPending() {
    const rows = await listDiagnosticos().catch(() => []);

    return rows.filter((row) => ['pending', 'sending', 'error'].includes(row.sync_status) && !row.sync_rejected).length;
}

function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);
}

/**
 * Cierre de sesion seguro: intenta vaciar la cola (max. timeoutMs), avisa si
 * quedan pendientes (se conservan en la base de esta cuenta para su proxima
 * sesion) y detiene los reintentos antes de cerrar la sesion en el servidor.
 *
 * @param {{ logoutUrl: string, confirm?: (n: number) => boolean, timeoutMs?: number }} options
 * @returns {Promise<boolean>} false si la persona cancelo.
 */
export async function logoutSafely({ logoutUrl, confirm = defaultConfirm, timeoutMs = 5000 }) {
    if (navigatorOnline()) {
        await withTimeout(syncAll(), timeoutMs);
    }

    const pendientes = await countPending();

    if (pendientes > 0 && !confirm(pendientes)) {
        return false;
    }

    syncQueue.stop();
    clearSession();

    try {
        await axios.post(logoutUrl);
    } finally {
        redirecting = true;
        window.location.href = '/login';
    }

    return true;
}

function navigatorOnline() {
    return typeof navigator === 'undefined' || navigator.onLine !== false;
}

function defaultConfirm(n) {
    const texto = n === 1 ? 'Tienes 1 diagnóstico sin enviar' : `Tienes ${n} diagnósticos sin enviar`;

    return window.confirm(`${texto}; se guardarán en este dispositivo para tu próxima sesión. ¿Cerrar sesión?`);
}
