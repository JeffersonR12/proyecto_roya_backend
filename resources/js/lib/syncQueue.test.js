import { describe, expect, it, vi } from 'vitest';
import {
    BACKOFF_MAX_MS,
    STALE_SENDING_MS,
    isDue,
    nextRetryDelay,
    patchForResult,
    requeuePatch,
    syncPendientes,
    toSyncItem,
    validationErrorsByIndex,
} from './syncQueue.js';
import { fromApiDiagnostico, mergeDiagnosticos } from './cloudDiagnosticos.js';

const NOW = Date.parse('2026-11-06T12:00:00Z');

function row(overrides = {}) {
    return {
        uuid_local: overrides.uuid_local || crypto.randomUUID(),
        clase: 'roya_amarilla',
        confianza: 91.2,
        severidad: null,
        modelo_version: 'roya-mobilenetv3-small-v1',
        captured_at: '2026-11-06T10:00:00.000Z',
        imagen_thumb: 'data:image/jpeg;base64,AAAA',
        parcela_nota: 'Lote Norte',
        sync_status: 'pending',
        hitl_status: 'pending',
        retry_count: 0,
        ...overrides,
    };
}

function memoryDb(rows) {
    const store = new Map(rows.map((r) => [r.uuid_local, { ...r }]));
    return {
        store,
        list: async () => [...store.values()],
        update: async (uuid, patch) => store.set(uuid, { ...store.get(uuid), ...patch }),
    };
}

describe('backoff', () => {
    it('crece exponencialmente con tope', () => {
        expect(nextRetryDelay(0)).toBe(5000);
        expect(nextRetryDelay(1)).toBe(10000);
        expect(nextRetryDelay(3)).toBe(40000);
        expect(nextRetryDelay(50)).toBe(BACKOFF_MAX_MS);
    });
});

describe('isDue', () => {
    it('envia pending y error vencido; respeta backoff, finales y nube', () => {
        expect(isDue(row(), NOW)).toBe(true);
        expect(isDue(row({ sync_status: 'confirmed' }), NOW)).toBe(false);
        expect(isDue(row({ sync_status: 'error', next_retry_at: new Date(NOW + 1000).toISOString() }), NOW)).toBe(false);
        expect(isDue(row({ sync_status: 'error', next_retry_at: new Date(NOW - 1000).toISOString() }), NOW)).toBe(true);
        expect(isDue(row({ sync_status: 'error', sync_final: true }), NOW)).toBe(false);
        expect(isDue(row({ origen: 'cloud' }), NOW)).toBe(false);
    });

    it('recupera envios colgados en sending', () => {
        expect(isDue(row({ sync_status: 'sending', sending_at: new Date(NOW - 1000).toISOString() }), NOW)).toBe(false);
        expect(isDue(row({ sync_status: 'sending', sending_at: new Date(NOW - STALE_SENDING_MS).toISOString() }), NOW)).toBe(true);
    });
});

describe('toSyncItem', () => {
    it('mapea al contrato de /api/sync/diagnosticos sin campos locales', () => {
        const item = toSyncItem(row({ uuid_local: 'u-1', scores: { sana: 2 } }));
        expect(item).toMatchObject({
            uuid_local: 'u-1',
            clase: 'roya_amarilla',
            confianza: 91.2,
            severidad: null,
            modelo_version: 'roya-mobilenetv3-small-v1',
            parcela_nombre: 'Lote Norte',
            imagen_base64: 'data:image/jpeg;base64,AAAA',
            scores: { sana: 2 },
        });
        expect(item).not.toHaveProperty('sync_status');
        expect(item).not.toHaveProperty('retry_count');
    });

    it('no envia imagenes que no sean data URL de imagen', () => {
        expect(toSyncItem(row({ imagen_thumb: '/api/diagnosticos/x/imagen' }))).not.toHaveProperty('imagen_base64');
    });
});

describe('patchForResult', () => {
    it('confirmed y already_exists confirman; conflict y rejected son finales', () => {
        expect(patchForResult(row(), { status: 'confirmed' }, NOW).sync_status).toBe('confirmed');
        expect(patchForResult(row(), { status: 'already_exists' }, NOW).sync_status).toBe('confirmed');
        expect(patchForResult(row(), { status: 'conflict', message: 'x' }, NOW)).toMatchObject({ sync_status: 'error', sync_final: true });
        expect(patchForResult(row(), { status: 'rejected' }, NOW)).toMatchObject({ sync_status: 'error', sync_final: true });
    });

    it('sin confirmacion del servidor no marca confirmed', () => {
        expect(patchForResult(row(), undefined, NOW)).toMatchObject({ sync_status: 'error', retry_count: 1, sync_final: false });
    });

    it('requeue limpia el estado final', () => {
        expect(requeuePatch()).toMatchObject({ sync_status: 'pending', sync_final: false, retry_count: 0 });
    });
});

describe('validationErrorsByIndex', () => {
    it('agrupa los errores 422 por item', () => {
        const map = validationErrorsByIndex({ 'items.2.confianza': ['malo'], 'items.2.clase': ['x'], items: ['y'] });
        expect([...map.entries()]).toEqual([[2, 'malo']]);
    });
});

describe('syncPendientes', () => {
    it('confirma solo lo que el servidor confirma', async () => {
        const a = row({ uuid_local: 'a' });
        const b = row({ uuid_local: 'b' });
        const db = memoryDb([a, b, row({ uuid_local: 'c', sync_status: 'confirmed' })]);
        const post = vi.fn(async (items) => ({
            data: { data: { items: [{ uuid_local: 'a', status: 'confirmed' }, { uuid_local: 'b', status: 'conflict', message: 'dup' }] } },
        }));

        const summary = await syncPendientes({ ...db, post, now: () => NOW });

        expect(post).toHaveBeenCalledTimes(1);
        expect(post.mock.calls[0][0].map((i) => i.uuid_local)).toEqual(['a', 'b']);
        expect(db.store.get('a').sync_status).toBe('confirmed');
        expect(db.store.get('b')).toMatchObject({ sync_status: 'error', sync_final: true, sync_error: 'dup' });
        expect(summary).toMatchObject({ sent: 2, confirmed: 1, failed: 1 });
    });

    it('sin red deja error con backoff y no reintenta en el mismo ciclo', async () => {
        const db = memoryDb([row({ uuid_local: 'a' })]);
        const post = vi.fn(async () => {
            throw new Error('Network Error');
        });

        const summary = await syncPendientes({ ...db, post, now: () => NOW });

        expect(summary.offline).toBe(true);
        expect(db.store.get('a')).toMatchObject({ sync_status: 'error', retry_count: 1 });
        expect(isDue(db.store.get('a'), NOW)).toBe(false);
        expect(isDue(db.store.get('a'), NOW + 5000)).toBe(true);
    });

    it('sesion expirada devuelve a pending sin contar intento', async () => {
        const db = memoryDb([row({ uuid_local: 'a' })]);
        const post = vi.fn(async () => {
            const error = new Error('401');
            error.response = { status: 401 };
            throw error;
        });

        const summary = await syncPendientes({ ...db, post, now: () => NOW });

        expect(summary.authRequired).toBe(true);
        expect(db.store.get('a')).toMatchObject({ sync_status: 'pending', retry_count: 0 });
    });

    it('envia por lotes', async () => {
        const db = memoryDb(Array.from({ length: 5 }, (_, i) => row({ uuid_local: `u${i}` })));
        const post = vi.fn(async (items) => ({ data: { data: { items: items.map((i) => ({ uuid_local: i.uuid_local, status: 'confirmed' })) } } }));

        await syncPendientes({ ...db, post, now: () => NOW, batchSize: 2 });

        expect(post).toHaveBeenCalledTimes(3);
        expect([...db.store.values()].every((r) => r.sync_status === 'confirmed')).toBe(true);
    });
});

describe('diagnosticos de la nube', () => {
    it('mapea la API al view model y lo local tiene prioridad', () => {
        const cloud = fromApiDiagnostico({
            uuid_local: 'x',
            clase: 'roya_amarilla',
            confianza: 90,
            captured_at: '2026-11-05T10:00:00Z',
            imagen_url: '/api/diagnosticos/x/imagen',
            parcela: { nombre: 'Lote Sur' },
            usuario: { name: 'Maria' },
            hitl_status: 'pending',
        });
        expect(cloud).toMatchObject({ origen: 'cloud', sync_status: 'confirmed', location: 'Lote Sur', image_base64: '/api/diagnosticos/x/imagen' });

        const local = { uuid_local: 'x', created_at: '2026-11-05T10:00:00Z', hitl_status: 'validated' };
        const other = { ...cloud, uuid_local: 'y', created_at: '2026-11-06T10:00:00Z' };
        const merged = mergeDiagnosticos([local], [cloud, other]);
        expect(merged.map((r) => r.uuid_local)).toEqual(['y', 'x']);
        expect(merged[1].hitl_status).toBe('validated');
    });
});
