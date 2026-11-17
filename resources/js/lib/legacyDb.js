/**
 * Migracion de la base antigua 'roya-edge', compartida por todas las cuentas
 * del navegador. Sus registros no tienen dueno, asi que la regla es segura:
 * - confirmed: se descartan (el servidor ya los tiene y se vuelven a descargar).
 * - pending / sending / error: NO se suben solos. Quedan en cuarentena hasta
 *   que la persona elija "Son mios, enviarlos" o "Descartar".
 */

export const LEGACY_DB_NAME = 'roya-edge';
const STORE = 'diagnosticos';

export function classifyLegacy(rows = []) {
    const pendientes = rows.filter((row) => row?.uuid_local && row.sync_status !== 'confirmed');
    const confirmados = rows.filter((row) => row?.sync_status === 'confirmed');

    return { pendientes, confirmados };
}

/**
 * Lee la base antigua sin crearla. Devuelve null si no existe.
 */
export function readLegacy(idb = globalThis.indexedDB) {
    return new Promise((resolve) => {
        let request;

        try {
            request = idb.open(LEGACY_DB_NAME);
        } catch {
            resolve(null);
            return;
        }

        let existed = true;

        request.onupgradeneeded = (event) => {
            // oldVersion 0 = no existia: se aborta para no crearla.
            if (event.oldVersion === 0) {
                existed = false;
                request.transaction.abort();
            }
        };

        request.onerror = () => resolve(null);
        request.onblocked = () => resolve(null);
        request.onsuccess = () => {
            const db = request.result;

            if (!existed || !db.objectStoreNames.contains(STORE)) {
                db.close();
                resolve(existed ? [] : null);
                return;
            }

            const getAll = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
            getAll.onsuccess = () => {
                db.close();
                resolve(getAll.result || []);
            };
            getAll.onerror = () => {
                db.close();
                resolve([]);
            };
        };
    });
}

export function deleteLegacy(idb = globalThis.indexedDB) {
    return new Promise((resolve) => {
        try {
            const request = idb.deleteDatabase(LEGACY_DB_NAME);
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
            request.onblocked = () => resolve(false);
        } catch {
            resolve(false);
        }
    });
}

/**
 * Revisa la base antigua. Si solo tenia confirmados la elimina enseguida.
 * @returns {Promise<{ pendientes: object[] }>} pendientes en cuarentena.
 */
export async function inspectLegacy(idb = globalThis.indexedDB) {
    const rows = await readLegacy(idb);

    if (rows === null) {
        return { pendientes: [] };
    }

    const { pendientes } = classifyLegacy(rows);

    if (pendientes.length === 0) {
        await deleteLegacy(idb);
    }

    return { pendientes };
}

/**
 * "Son mios, enviarlos": los copia a la base de la cuenta actual (que los sella
 * con su dueno) como pendientes, y borra la base antigua.
 */
export async function adoptLegacy(pendientes, targetDb, idb = globalThis.indexedDB) {
    for (const row of pendientes) {
        const { owner_user_id: _u, owner_tenant_id: _t, ...rest } = row;
        await targetDb.saveDiagnostico({
            ...rest,
            sync_status: 'pending',
            sync_rejected: false,
            last_error: null,
        });
    }

    await deleteLegacy(idb);

    return pendientes.length;
}

export async function discardLegacy(idb = globalThis.indexedDB) {
    return deleteLegacy(idb);
}
