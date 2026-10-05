const DB_NAME = 'roya-edge';
const DB_VERSION = 1;
const STORE = 'diagnosticos';

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

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

function withStore(mode, fn) {
    return openDb().then(
        (db) =>
            new Promise((resolve, reject) => {
                const tx = db.transaction(STORE, mode);
                const store = tx.objectStore(STORE);
                const result = fn(store);

                tx.oncomplete = () => {
                    db.close();
                    resolve(result);
                };
                tx.onerror = () => {
                    db.close();
                    reject(tx.error);
                };
            }),
    );
}

export async function saveDiagnostico(diagnostico) {
    if (!diagnostico?.uuid_local) {
        throw new Error('uuid_local es obligatorio');
    }

    if (!diagnostico.modelo_version) {
        throw new Error('modelo_version es obligatorio');
    }

    await withStore('readwrite', (store) => store.put(diagnostico));

    return diagnostico;
}

export async function listDiagnosticos() {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const request = tx.objectStore(STORE).getAll();

        request.onsuccess = () => {
            const rows = (request.result || []).sort((a, b) =>
                String(b.captured_at).localeCompare(String(a.captured_at)),
            );
            db.close();
            resolve(rows);
        };
        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

export async function listPending() {
    const rows = await listDiagnosticos();

    return rows.filter((row) => row.sync_status === 'pending' || row.sync_status === 'error');
}

export async function markSyncStatus(uuidLocal, syncStatus) {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        const getRequest = store.get(uuidLocal);

        getRequest.onsuccess = () => {
            const current = getRequest.result;

            if (!current) {
                db.close();
                reject(new Error('diagnostico no encontrado'));
                return;
            }

            current.sync_status = syncStatus;
            store.put(current);
        };

        tx.oncomplete = () => {
            db.close();
            resolve(true);
        };
        tx.onerror = () => {
            db.close();
            reject(tx.error);
        };
    });
}
