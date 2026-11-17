import { describe, expect, it, vi } from 'vitest';
import { SessionMismatchError, fetchServerRows, fromServer, mergeServerRows, pullAndMerge } from './serverSync.js';

function serverRow(uuid, overrides = {}) {
    return {
        uuid_local: uuid,
        clase: 'roya_amarilla',
        confianza: 92,
        severidad: null,
        latitud: null,
        longitud: null,
        ubicacion: 'Lote Sur',
        modelo_version: 'roya-mobilenetv3-small-v1',
        captured_at: '2026-11-16T10:00:00+00:00',
        synced_at: '2026-11-16T10:05:00+00:00',
        hitl_status: 'pending',
        etiqueta_humana: null,
        usuario: { id: 7, name: 'Ana' },
        imagen_url: `/api/diagnosticos/${uuid}/imagen`,
        ...overrides,
    };
}

describe('mergeServerRows', () => {
    it('crea localmente lo que solo existe en el servidor', () => {
        const cambios = mergeServerRows([], [serverRow('a')]);

        expect(cambios).toHaveLength(1);
        expect(cambios[0]).toMatchObject({
            uuid_local: 'a',
            sync_status: 'confirmed',
            parcela_nota: 'Lote Sur',
            imagen_url: '/api/diagnosticos/a/imagen',
            usuario_nombre: 'Ana',
        });
    });

    it('confirma un registro local que el servidor ya tiene', () => {
        const local = { ...fromServer(serverRow('a')), sync_status: 'error', last_error: 'timeout' };
        const [merged] = mergeServerRows([local], [serverRow('a')]);

        expect(merged).toMatchObject({ sync_status: 'confirmed', last_error: null });
    });

    it('la revision del servidor gana salvo que haya una revision local sin enviar', () => {
        const limpio = { ...fromServer(serverRow('a')), hitl_status: 'pending' };
        const sucio = { ...fromServer(serverRow('b')), hitl_status: 'rejected', hitl_dirty: true };

        const cambios = mergeServerRows(
            [limpio, sucio],
            [serverRow('a', { hitl_status: 'validated' }), serverRow('b', { hitl_status: 'validated' })],
        );

        expect(cambios.find((r) => r.uuid_local === 'a').hitl_status).toBe('validated');
        expect(cambios.find((r) => r.uuid_local === 'b')).toBeUndefined();
    });

    it('no reescribe registros sin cambios', () => {
        const local = fromServer(serverRow('a'));

        expect(mergeServerRows([local], [serverRow('a')])).toEqual([]);
    });

    it('conserva la miniatura local', () => {
        const local = { ...fromServer(serverRow('a')), imagen_thumb: 'data:image/jpeg;base64,AAAA', hitl_status: 'pending' };
        const [merged] = mergeServerRows([local], [serverRow('a', { hitl_status: 'validated' })]);

        expect(merged.imagen_thumb).toBe('data:image/jpeg;base64,AAAA');
    });
});

describe('descarga', () => {
    it('recorre todas las paginas', async () => {
        const http = {
            get: vi
                .fn()
                .mockResolvedValueOnce({ data: { data: [serverRow('a')], meta: { last_page: 2 } } })
                .mockResolvedValueOnce({ data: { data: [serverRow('b')], meta: { last_page: 2 } } }),
        };

        const { rows } = await fetchServerRows(http);

        expect(rows.map((r) => r.uuid_local)).toEqual(['a', 'b']);
        expect(http.get).toHaveBeenCalledTimes(2);
    });

    it('si el servidor responde para otro usuario, se detiene', async () => {
        const http = {
            get: vi.fn(async () => ({ data: { data: [serverRow('a')], meta: { last_page: 1, usuario_id: 99, tenant_id: 29 } } })),
        };

        await expect(fetchServerRows(http, { session: { userId: 30, tenantId: 29 } })).rejects.toBeInstanceOf(
            SessionMismatchError,
        );
    });

    it('sella cada registro descargado con su dueno real', async () => {
        const http = {
            get: vi.fn(async () => ({ data: { data: [serverRow('a')], meta: { last_page: 1, usuario_id: 30, tenant_id: 29 } } })),
        };
        const db = { listDiagnosticos: vi.fn(async () => []), saveDiagnostico: vi.fn(async (row) => row) };

        await pullAndMerge({ db, http, session: { userId: 30, tenantId: 29 } });

        expect(db.saveDiagnostico).toHaveBeenCalledWith(
            expect.objectContaining({ uuid_local: 'a', owner_user_id: 7, owner_tenant_id: 29 }),
        );
    });

    it('pullAndMerge guarda solo los cambios', async () => {
        const db = {
            listDiagnosticos: vi.fn(async () => [fromServer(serverRow('a'))]),
            saveDiagnostico: vi.fn(async (row) => row),
        };
        const http = {
            get: vi.fn(async () => ({ data: { data: [serverRow('a'), serverRow('b')], meta: { last_page: 1 } } })),
        };

        const cambios = await pullAndMerge({ db, http });

        expect(cambios).toBe(1);
        expect(db.saveDiagnostico).toHaveBeenCalledWith(expect.objectContaining({ uuid_local: 'b' }));
    });
});
