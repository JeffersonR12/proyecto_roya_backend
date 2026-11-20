import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerEdgeWorker } from './pwa.js';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('registerEdgeWorker', () => {
    it('no hace nada si el navegador no soporta Service Workers', async () => {
        vi.stubGlobal('navigator', {});

        await expect(registerEdgeWorker()).resolves.toBeNull();
    });

    it('no registra el Service Worker fuera de producción (evita cachear assets de Vite)', async () => {
        const register = vi.fn();
        vi.stubGlobal('navigator', { serviceWorker: { register } });
        vi.stubEnv('PROD', false);

        await expect(registerEdgeWorker()).resolves.toBeNull();
        expect(register).not.toHaveBeenCalled();
    });

    it('en producción registra /sw.js con alcance raíz', async () => {
        const registro = { scope: '/' };
        const register = vi.fn().mockResolvedValue(registro);
        vi.stubGlobal('navigator', { serviceWorker: { register } });
        vi.stubEnv('PROD', true);

        await expect(registerEdgeWorker()).resolves.toBe(registro);
        expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
    });

    it('si el registro falla, la app sigue funcionando (devuelve null)', async () => {
        vi.stubGlobal('navigator', { serviceWorker: { register: vi.fn().mockRejectedValue(new Error('SecurityError')) } });
        vi.stubEnv('PROD', true);

        await expect(registerEdgeWorker()).resolves.toBeNull();
    });
});
