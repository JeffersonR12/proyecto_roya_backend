import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDiagnosticosDb } from './diagnosticosDb.js';
import { LEGACY_DB_NAME, adoptLegacy, classifyLegacy, discardLegacy, inspectLegacy, readLegacy } from './legacyDb.js';

const ANA = { userId: 30, tenantId: 29, scope: 't29:u30' };

function seedLegacy(idb, rows) {
    return new Promise((resolve, reject) => {
        const request = idb.open(LEGACY_DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore('diagnosticos', { keyPath: 'uuid_local' });
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('diagnosticos', 'readwrite');
            rows.forEach((row) => tx.objectStore('diagnosticos').put(row));
            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
    });
}

function legacyRow(uuid, sync_status) {
    return {
        uuid_local: uuid,
        clase: 'roya_amarilla',
        confianza: 90,
        modelo_version: 'roya-mobilenetv3-small-v1',
        captured_at: '2026-11-16T10:00:00.000Z',
        sync_status,
    };
}

describe('migracion de la base antigua', () => {
    let idb;

    beforeEach(() => {
        idb = new IDBFactory();
    });

    it('clasifica confirmados y pendientes', () => {
        const { pendientes, confirmados } = classifyLegacy([
            legacyRow('a', 'confirmed'),
            legacyRow('b', 'pending'),
            legacyRow('c', 'error'),
            legacyRow('d', 'sending'),
        ]);

        expect(confirmados.map((r) => r.uuid_local)).toEqual(['a']);
        expect(pendientes.map((r) => r.uuid_local)).toEqual(['b', 'c', 'd']);
    });

    it('si no existe la base antigua no la crea', async () => {
        expect(await readLegacy(idb)).toBeNull();
        expect(await inspectLegacy(idb)).toEqual({ pendientes: [] });
        expect(await readLegacy(idb)).toBeNull();
    });

    it('con solo confirmados, la borra y no deja nada en cuarentena', async () => {
        await seedLegacy(idb, [legacyRow('a', 'confirmed'), legacyRow('b', 'confirmed')]);

        expect(await inspectLegacy(idb)).toEqual({ pendientes: [] });
        expect(await readLegacy(idb)).toBeNull();
    });

    it('deja los pendientes en cuarentena sin enviarlos ni borrarlos', async () => {
        await seedLegacy(idb, [legacyRow('a', 'confirmed'), legacyRow('b', 'pending'), legacyRow('c', 'error')]);
        const ana = createDiagnosticosDb(ANA, idb);
        const http = { post: vi.fn() };

        const { pendientes } = await inspectLegacy(idb);

        expect(pendientes.map((r) => r.uuid_local).sort()).toEqual(['b', 'c']);
        expect(http.post).not.toHaveBeenCalled();
        expect(await ana.listDiagnosticos()).toEqual([]);
        expect((await readLegacy(idb)).length).toBe(3);
    });

    it('"Son mios" los copia a la cuenta actual como pendientes con su dueno', async () => {
        await seedLegacy(idb, [legacyRow('b', 'error')]);
        const ana = createDiagnosticosDb(ANA, idb);
        const { pendientes } = await inspectLegacy(idb);

        await adoptLegacy(pendientes, ana, idb);

        const [row] = await ana.listDiagnosticos();
        expect(row).toMatchObject({ uuid_local: 'b', sync_status: 'pending', owner_user_id: 30, owner_tenant_id: 29 });
        expect(await readLegacy(idb)).toBeNull();
    });

    it('"Descartar" borra la base antigua', async () => {
        await seedLegacy(idb, [legacyRow('b', 'pending')]);

        await discardLegacy(idb);

        expect(await readLegacy(idb)).toBeNull();
    });
});
