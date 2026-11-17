import { describe, expect, it, vi } from 'vitest';
import {
    BACKOFF_MAX_MS,
    LOTE_MAX,
    SYNC_URL,
    backoffDelay,
    chunk,
    createSyncQueue,
    erroresPorIndice,
    esEnviable,
    toPayload,
} from './syncQueue.js';

function memoryDb(rows) {
    const store = new Map(rows.map((row) => [row.uuid_local, { ...row }]));

    return {
        store,
        listDiagnosticos: vi.fn(async () => [...store.values()].map((row) => ({ ...row }))),
        updateDiagnostico: vi.fn(async (uuid, patch) => {
            store.set(uuid, { ...store.get(uuid), ...patch, uuid_local: uuid });

            return true;
        }),
    };
}

const SESSION = { userId: 1, tenantId: 1, scope: 't1:u1' };

function row(uuid, overrides = {}) {
    return {
        uuid_local: uuid,
        owner_user_id: 1,
        owner_tenant_id: 1,
        clase: 'roya_amarilla',
        confianza: 90,
        severidad: null,
        modelo_version: 'roya-mobilenetv3-small-v1',
        captured_at: '2026-11-16T10:00:00.000Z',
        parcela_nota: 'Lote Norte',
        imagen_thumb: 'data:image/jpeg;base64,AAAA',
        sync_status: 'pending',
        hitl_status: 'pending',
        ...overrides,
    };
}

function manualTimers() {
    const pending = [];

    return {
        setTimer: vi.fn((fn, ms) => {
            pending.push({ fn, ms });

            return pending.length;
        }),
        clearTimer: vi.fn(),
        pending,
    };
}

describe('helpers de la cola', () => {
    it('backoff exponencial 2s, 4s, 8s con tope de 5 minutos', () => {
        expect(backoffDelay(0)).toBe(2000);
        expect(backoffDelay(1)).toBe(4000);
        expect(backoffDelay(2)).toBe(8000);
        expect(backoffDelay(20)).toBe(BACKOFF_MAX_MS);
    });

    it('parte en lotes de 50', () => {
        const items = Array.from({ length: 120 }, (_, i) => i);
        expect(chunk(items).map((c) => c.length)).toEqual([LOTE_MAX, LOTE_MAX, 20]);
    });

    it('solo envia pending, error y sending que no fueron rechazados', () => {
        expect(esEnviable(row('a'))).toBe(true);
        expect(esEnviable(row('b', { sync_status: 'error' }))).toBe(true);
        expect(esEnviable(row('c', { sync_status: 'sending' }))).toBe(true);
        expect(esEnviable(row('d', { sync_status: 'confirmed' }))).toBe(false);
        expect(esEnviable(row('e', { sync_status: 'error', sync_rejected: true }))).toBe(false);
    });

    it('mapea el registro local al payload del servidor', () => {
        const payload = toPayload(row('a'));
        expect(payload.ubicacion).toBe('Lote Norte');
        expect(payload.imagen).toBe('data:image/jpeg;base64,AAAA');
        expect(payload).not.toHaveProperty('tenant_id');
        expect(payload).not.toHaveProperty('usuario_id');
    });

    it('lee los indices invalidos de un 422 de Laravel', () => {
        expect(
            erroresPorIndice({
                errors: { 'diagnosticos.2.imagen': ['Formato no permitido'], diagnosticos: ['x'] },
            }),
        ).toEqual({ 2: 'Formato no permitido' });
    });
});

describe('flush', () => {
    it('marca confirmed lo confirmado y error con sync_rejected lo rechazado', async () => {
        const db = memoryDb([row('a'), row('b'), row('c', { sync_status: 'confirmed' })]);
        const http = {
            post: vi.fn(async () => ({
                data: { confirmados: ['a'], rechazados: [{ uuid_local: 'b', error: 'uuid ajeno' }] },
            })),
            patch: vi.fn(),
        };
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...manualTimers() });

        const summary = await queue.flush();

        expect(http.post).toHaveBeenCalledTimes(1);
        expect(http.post.mock.calls[0][0]).toBe(SYNC_URL);
        expect(http.post.mock.calls[0][1].diagnosticos.map((d) => d.uuid_local)).toEqual(['a', 'b']);
        expect(db.store.get('a').sync_status).toBe('confirmed');
        expect(db.store.get('b')).toMatchObject({ sync_status: 'error', sync_rejected: true, last_error: 'uuid ajeno' });
        expect(summary).toMatchObject({ confirmados: 1, rechazados: 1, fallidos: 0 });
        expect(queue.retryScheduled).toBe(false);
    });

    it('sin red no envia nada', async () => {
        const db = memoryDb([row('a')]);
        const http = { post: vi.fn(), patch: vi.fn() };
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => false, ...manualTimers() });

        const summary = await queue.flush();

        expect(summary.offline).toBe(true);
        expect(http.post).not.toHaveBeenCalled();
        expect(db.store.get('a').sync_status).toBe('pending');
    });

    it('ante un fallo de red marca error y reintenta con backoff creciente', async () => {
        const db = memoryDb([row('a')]);
        const http = {
            post: vi
                .fn()
                .mockRejectedValueOnce(new Error('Network Error'))
                .mockRejectedValueOnce(new Error('Network Error'))
                .mockResolvedValueOnce({ data: { confirmados: ['a'], rechazados: [] } }),
            patch: vi.fn(),
        };
        const timers = manualTimers();
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...timers });

        await queue.flush();
        expect(db.store.get('a')).toMatchObject({ sync_status: 'error', last_error: 'Network Error', retry_count: 1 });
        expect(timers.pending.at(-1).ms).toBe(2000);

        timers.pending.at(-1).fn();
        await queue.flush();
        expect(timers.pending.at(-1).ms).toBe(4000);
        expect(db.store.get('a').retry_count).toBe(2);

        timers.pending.at(-1).fn();
        await queue.flush();
        expect(db.store.get('a').sync_status).toBe('confirmed');
        expect(queue.attempt).toBe(0);
    });

    it('un 422 rechaza solo los registros invalidos y reenvia el resto', async () => {
        const db = memoryDb([row('a'), row('b')]);
        const invalido = Object.assign(new Error('422'), {
            response: { status: 422, data: { errors: { 'diagnosticos.1.imagen': ['Imagen invalida'] } } },
        });
        const http = {
            post: vi
                .fn()
                .mockRejectedValueOnce(invalido)
                .mockResolvedValueOnce({ data: { confirmados: ['a'], rechazados: [] } }),
            patch: vi.fn(),
        };
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...manualTimers() });

        await queue.flush();

        expect(http.post).toHaveBeenCalledTimes(2);
        expect(http.post.mock.calls[1][1].diagnosticos.map((d) => d.uuid_local)).toEqual(['a']);
        expect(db.store.get('a').sync_status).toBe('confirmed');
        expect(db.store.get('b')).toMatchObject({ sync_status: 'error', sync_rejected: true, last_error: 'Imagen invalida' });
    });

    it('recupera registros que quedaron en sending tras cerrar el navegador', async () => {
        const db = memoryDb([row('a', { sync_status: 'sending' })]);
        const http = { post: vi.fn(async () => ({ data: { confirmados: ['a'], rechazados: [] } })), patch: vi.fn() };
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...manualTimers() });

        await queue.flush();

        expect(db.store.get('a').sync_status).toBe('confirmed');
    });

    it('el candado evita dos envios simultaneos', async () => {
        const db = memoryDb([row('a')]);
        let resolver;
        const http = {
            post: vi.fn(
                () =>
                    new Promise((resolve) => {
                        resolver = () => resolve({ data: { confirmados: ['a'], rechazados: [] } });
                    }),
            ),
            patch: vi.fn(),
        };
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...manualTimers() });

        const primero = queue.flush();
        const segundo = queue.flush();
        expect(segundo).toBe(primero);

        await vi.waitFor(() => expect(http.post).toHaveBeenCalled());
        resolver();
        await primero;

        expect(http.post).toHaveBeenCalledTimes(1);
    });

    it('envia las revisiones HITL pendientes con PATCH y las limpia', async () => {
        const db = memoryDb([
            row('a', { sync_status: 'confirmed', hitl_status: 'validated', etiqueta_humana: 'roya_amarilla', hitl_dirty: true }),
            row('b', { sync_status: 'confirmed', hitl_status: 'rejected', hitl_dirty: true }),
        ]);
        const prohibido = Object.assign(new Error('403'), { response: { status: 403 } });
        const http = {
            post: vi.fn(),
            patch: vi.fn().mockResolvedValueOnce({ data: {} }).mockRejectedValueOnce(prohibido),
        };
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...manualTimers() });

        const summary = await queue.flush();

        expect(http.patch).toHaveBeenCalledWith('/api/diagnosticos/a/revision', {
            hitl_status: 'validated',
            etiqueta_humana: 'roya_amarilla',
        });
        expect(db.store.get('a').hitl_dirty).toBe(false);
        expect(db.store.get('b').hitl_dirty).toBe(false);
        expect(summary.revisiones).toBe(1);
        expect(queue.retryScheduled).toBe(false);
    });

    it('notifica a los suscriptores al terminar', async () => {
        const db = memoryDb([]);
        const http = { post: vi.fn(), patch: vi.fn() };
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...manualTimers() });
        const listener = vi.fn();
        queue.subscribe(listener);

        await queue.flush();

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ confirmados: 0 }));
    });
});

describe('aislamiento por cuenta', () => {
    it('no envia registros cuyo dueno no es la sesion activa y los pone en cuarentena', async () => {
        const db = memoryDb([
            row('propio'),
            row('otro-usuario', { owner_user_id: 2 }),
            row('otro-tenant', { owner_tenant_id: 9 }),
            row('sin-dueno', { owner_user_id: undefined, owner_tenant_id: undefined }),
        ]);
        const http = { post: vi.fn(async () => ({ data: { confirmados: ['propio'], rechazados: [] } })), patch: vi.fn() };
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...manualTimers() });

        const summary = await queue.flush();

        expect(http.post).toHaveBeenCalledTimes(1);
        expect(http.post.mock.calls[0][1].diagnosticos.map((d) => d.uuid_local)).toEqual(['propio']);
        expect(summary.ajenos).toBe(3);
        expect(db.store.get('otro-usuario').sync_status).toBe('quarantine');
        expect(db.store.get('otro-tenant').sync_status).toBe('quarantine');
        expect(db.store.get('sin-dueno').sync_status).toBe('quarantine');
    });

    it('sin sesion no envia nada', async () => {
        const db = memoryDb([row('a')]);
        const http = { post: vi.fn(), patch: vi.fn() };
        const queue = createSyncQueue({ db, http, getSession: () => null, isOnline: () => true, ...manualTimers() });

        const summary = await queue.flush();

        expect(http.post).not.toHaveBeenCalled();
        expect(summary.authLost).toBe(true);
    });

    it('ante 401/419 se detiene, no reintenta y avisa', async () => {
        const db = memoryDb([row('a')]);
        const expirada = Object.assign(new Error('419'), { response: { status: 419 } });
        const http = { post: vi.fn().mockRejectedValue(expirada), patch: vi.fn() };
        const timers = manualTimers();
        const onAuthLost = vi.fn();
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, onAuthLost, ...timers });

        const summary = await queue.flush();

        expect(summary.authLost).toBe(true);
        expect(onAuthLost).toHaveBeenCalledTimes(1);
        expect(timers.setTimer).not.toHaveBeenCalled();
        expect(queue.stopped).toBe(true);
        expect(db.store.get('a').sync_status).toBe('pending');

        await queue.flush();
        expect(http.post).toHaveBeenCalledTimes(1);
    });

    it('stop() cancela el reintento programado', async () => {
        const db = memoryDb([row('a')]);
        const http = { post: vi.fn().mockRejectedValue(new Error('Network Error')), patch: vi.fn() };
        const timers = manualTimers();
        const queue = createSyncQueue({ db, http, getSession: () => SESSION, isOnline: () => true, ...timers });

        await queue.flush();
        expect(queue.retryScheduled).toBe(true);

        queue.stop();

        expect(timers.clearTimer).toHaveBeenCalled();
        expect(queue.retryScheduled).toBe(false);
    });
});
