import { IDBFactory } from 'fake-indexeddb';
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    listDiagnosticos,
    listPending,
    markSyncStatus,
    saveDiagnostico,
    updateDiagnostico,
} from './diagnosticosDb.js';

// Persistencia Edge (IndexedDB 'roya-edge'): base nueva y vacía en cada prueba.
beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
});

function diagnostico(uuid, overrides = {}) {
    return {
        uuid_local: uuid,
        clase: 'roya_amarilla',
        confianza: 91.2,
        modelo_version: 'roya-mobilenetv3-small-v1',
        sync_status: 'pending',
        captured_at: '2026-11-10T10:00:00.000Z',
        ...overrides,
    };
}

describe('saveDiagnostico', () => {
    it('exige uuid_local y modelo_version (trazabilidad del diagnóstico)', async () => {
        await expect(saveDiagnostico({ modelo_version: 'v1' })).rejects.toThrow('uuid_local es obligatorio');
        await expect(saveDiagnostico({ uuid_local: 'a' })).rejects.toThrow('modelo_version es obligatorio');
    });

    it('guarda y es idempotente por uuid_local (put reemplaza, no duplica)', async () => {
        await saveDiagnostico(diagnostico('a'));
        await saveDiagnostico(diagnostico('a', { confianza: 95 }));

        const rows = await listDiagnosticos();

        expect(rows).toHaveLength(1);
        expect(rows[0].confianza).toBe(95);
    });
});

describe('listDiagnosticos y listPending', () => {
    it('devuelve vacío en un dispositivo sin capturas', async () => {
        await expect(listDiagnosticos()).resolves.toEqual([]);
    });

    it('ordena del más reciente al más antiguo por captured_at', async () => {
        await saveDiagnostico(diagnostico('viejo', { captured_at: '2026-11-01T08:00:00.000Z' }));
        await saveDiagnostico(diagnostico('nuevo', { captured_at: '2026-11-10T08:00:00.000Z' }));
        await saveDiagnostico(diagnostico('medio', { captured_at: '2026-11-05T08:00:00.000Z' }));

        const rows = await listDiagnosticos();

        expect(rows.map((row) => row.uuid_local)).toEqual(['nuevo', 'medio', 'viejo']);
    });

    it('la cola de envío incluye pendientes y con error, no los confirmados', async () => {
        await saveDiagnostico(diagnostico('p', { sync_status: 'pending' }));
        await saveDiagnostico(diagnostico('e', { sync_status: 'error' }));
        await saveDiagnostico(diagnostico('c', { sync_status: 'confirmed' }));

        const pendientes = await listPending();

        expect(pendientes.map((row) => row.uuid_local).sort()).toEqual(['e', 'p']);
    });
});

describe('updateDiagnostico y markSyncStatus', () => {
    it('fusiona el parche sin perder campos ni cambiar el uuid_local', async () => {
        await saveDiagnostico(diagnostico('a'));

        await updateDiagnostico('a', { hitl_status: 'validated', uuid_local: 'otro' });
        const [row] = await listDiagnosticos();

        expect(row).toMatchObject({ uuid_local: 'a', clase: 'roya_amarilla', hitl_status: 'validated' });
    });

    it('rechaza actualizar un diagnóstico que no existe', async () => {
        await expect(updateDiagnostico('no-existe', { sync_status: 'confirmed' })).rejects.toThrow(
            'diagnostico no encontrado',
        );
    });

    it('markSyncStatus cambia solo el estado de sincronización', async () => {
        await saveDiagnostico(diagnostico('a'));

        await markSyncStatus('a', 'confirmed');

        await expect(listPending()).resolves.toEqual([]);
        const [row] = await listDiagnosticos();
        expect(row.sync_status).toBe('confirmed');
        expect(row.confianza).toBe(91.2);
    });
});
