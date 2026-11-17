import { requireSession } from './session.js';

/**
 * Almacen local de diagnosticos en IndexedDB, UNA base por cuenta:
 * 'roya-edge:t{tenant}:u{usuario}'. Nunca se abre una base sin scope.
 */

export const DB_PREFIX = 'roya-edge';
export const DB_VERSION = 1;
export const STORE = 'diagnosticos';

export function dbNameFor(scope) {
    if (!scope) {
        throw new Error('scope es obligatorio para abrir la base local');
    }

    return `${DB_PREFIX}:${scope}`;
}

function openNamed(idb, name) {
    return new Promise((resolve, reject) => {
        const request = idb.open(name, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE)) {
                const store = db.createObjectStore(STORE, { keyPath: 'uuid_local' });
                store.createIndex('sync_status', 'sync_status', { unique: false });
                store.createIndex('captured_at', 'captured_at', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function sortByCapture(rows) {
    return rows.sort((a, b) => String(b.captured_at).localeCompare(String(a.captured_at)));
}

/**
 * @param {{ scope: string, userId: number, tenantId: number }} session
 * @param {IDBFactory} [idb]
 */
export function createDiagnosticosDb(session, idb = globalThis.indexedDB) {
    const name = dbNameFor(session?.scope);
    const owner = { owner_user_id: session.userId, owner_tenant_id: session.tenantId };
    const open = () => openNamed(idb, name);

    async function saveDiagnostico(diagnostico) {
        if (!diagnostico?.uuid_local) {
            throw new Error('uuid_local es obligatorio');
        }

        if (!diagnostico.modelo_version) {
            throw new Error('modelo_version es obligatorio');
        }

        // Sello de dueno: solo se completa si falta, nunca se reescribe.
        const row = {
            ...diagnostico,
            owner_user_id: diagnostico.owner_user_id ?? owner.owner_user_id,
            owner_tenant_id: diagnostico.owner_tenant_id ?? owner.owner_tenant_id,
        };
        const db = await open();

        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(row);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        }).finally(() => db.close());

        return row;
    }

    async function listDiagnosticos() {
        const db = await open();

        return new Promise((resolve, reject) => {
            const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
            request.onsuccess = () => resolve(sortByCapture(request.result || []));
            request.onerror = () => reject(request.error);
        }).finally(() => db.close());
    }

    async function listPending() {
        const rows = await listDiagnosticos();

        return rows.filter((row) => row.sync_status === 'pending' || row.sync_status === 'error');
    }

    async function updateDiagnostico(uuidLocal, patch) {
        const db = await open();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const store = tx.objectStore(STORE);
            const getRequest = store.get(uuidLocal);
            let missing = false;

            getRequest.onsuccess = () => {
                const current = getRequest.result;

                if (!current) {
                    missing = true;
                    return;
                }

                // El dueno y la clave no se pueden cambiar por patch.
                store.put({
                    ...current,
                    ...patch,
                    uuid_local: uuidLocal,
                    owner_user_id: current.owner_user_id,
                    owner_tenant_id: current.owner_tenant_id,
                });
            };

            tx.oncomplete = () => (missing ? reject(new Error('diagnostico no encontrado')) : resolve(true));
            tx.onerror = () => reject(tx.error);
        }).finally(() => db.close());
    }

    return {
        name,
        saveDiagnostico,
        listDiagnosticos,
        listPending,
        updateDiagnostico,
        markSyncStatus: (uuidLocal, syncStatus) => updateDiagnostico(uuidLocal, { sync_status: syncStatus }),
    };
}

/*
 * Atajos ligados a la sesion activa (requireSession lanza si no hay usuario).
 * La instancia se recrea si cambia la sesion.
 */
let cached = null;

function currentDb() {
    const session = requireSession();

    if (!cached || cached.scope !== session.scope) {
        cached = { scope: session.scope, db: createDiagnosticosDb(session) };
    }

    return cached.db;
}

// async: sin sesion devuelven una promesa rechazada (no lanzan en sincronico),
// asi los .catch() de quien llama siempre funcionan.
export const saveDiagnostico = async (diagnostico) => currentDb().saveDiagnostico(diagnostico);
export const listDiagnosticos = async () => currentDb().listDiagnosticos();
export const listPending = async () => currentDb().listPending();
export const updateDiagnostico = async (uuidLocal, patch) => currentDb().updateDiagnostico(uuidLocal, patch);
export const markSyncStatus = async (uuidLocal, syncStatus) => currentDb().markSyncStatus(uuidLocal, syncStatus);
