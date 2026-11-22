import { afterEach, describe, expect, it, vi } from 'vitest';
import { MODELO_VERSION } from './inference.js';
import { applyUpdate, checkForNewBuild, onUpdateAvailable, resetUpdateStateForTests, serviceWorkerUrl, trackRegistration } from './pwa.js';

class FakeTarget {
    constructor(props = {}) {
        Object.assign(this, props);
        this.handlers = {};
    }

    addEventListener(type, handler) {
        this.handlers[type] = handler;
    }

    emit(type) {
        this.handlers[type]?.();
    }
}

afterEach(() => resetUpdateStateForTests());

describe('service worker versionado', () => {
    it('la URL del worker lleva build, modelo y ORT', () => {
        const url = new URL(serviceWorkerUrl({ build: '20261120', modelo: 'roya-v2', ort: '1.21.0' }), 'https://x.test');

        expect(url.pathname).toBe('/sw.js');
        expect(Object.fromEntries(url.searchParams)).toEqual({ v: '20261120', m: 'roya-v2', o: '1.21.0' });
        expect(serviceWorkerUrl()).toContain(`m=${encodeURIComponent(MODELO_VERSION)}`);
    });

    it('no avisa en la primera instalacion', () => {
        const listener = vi.fn();
        onUpdateAvailable(listener);
        const worker = new FakeTarget({ state: 'installing', postMessage: vi.fn() });
        const registration = new FakeTarget({ waiting: null, installing: worker });

        trackRegistration(registration, { controller: null });
        registration.emit('updatefound');
        worker.state = 'installed';
        worker.emit('statechange');

        expect(listener).not.toHaveBeenCalled();
    });

    it('avisa cuando un worker nuevo queda esperando', () => {
        const listener = vi.fn();
        onUpdateAvailable(listener);
        const worker = new FakeTarget({ state: 'installing', postMessage: vi.fn() });
        const registration = new FakeTarget({ waiting: null, installing: worker });

        trackRegistration(registration, { controller: {} });
        registration.emit('updatefound');
        worker.state = 'installed';
        worker.emit('statechange');

        expect(listener).toHaveBeenCalledOnce();
    });

    it('avisa al abrir si ya habia un worker esperando, aunque se suscriba tarde', () => {
        const waiting = { postMessage: vi.fn() };
        trackRegistration(new FakeTarget({ waiting }), { controller: {} });
        const listener = vi.fn();

        onUpdateAvailable(listener);

        expect(listener).toHaveBeenCalledOnce();
    });

    it('Actualizar activa el worker en espera y recarga al tomar el control', () => {
        const waiting = { postMessage: vi.fn() };
        const container = new FakeTarget({ controller: {} });
        const reload = vi.fn();
        trackRegistration(new FakeTarget({ waiting }), container);

        applyUpdate(container, reload);

        expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
        expect(reload).not.toHaveBeenCalled();
        container.emit('controllerchange');
        expect(reload).toHaveBeenCalledOnce();
    });

    it('detecta un despliegue nuevo y registra su worker', async () => {
        const register = vi.fn().mockResolvedValue({});
        const fetchImpl = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ build: 'B2', modelo: 'roya-v2', ort: '1.22.0' }),
        });

        expect(await checkForNewBuild({ fetchImpl, register, currentBuild: 'B1' })).toBe(true);
        expect(fetchImpl).toHaveBeenCalledWith('/build/version.json', { cache: 'no-store' });
        expect(register).toHaveBeenCalledWith('/sw.js?v=B2&m=roya-v2&o=1.22.0');
    });

    it('no registra nada si el build desplegado es el mismo', async () => {
        const register = vi.fn();
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ build: 'B1' }) });

        expect(await checkForNewBuild({ fetchImpl, register, currentBuild: 'B1' })).toBe(false);
        expect(register).not.toHaveBeenCalled();
    });
});
