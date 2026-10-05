import { describe, expect, it } from 'vitest';
import {
    CLASES,
    UMBRAL_CONFIANZA,
    applyUmbral,
    createDiagnosticoLocal,
    fromLogits,
    softmax,
    summarizeDiagnosticos,
} from './inference.js';

describe('softmax y umbral', () => {
    it('normaliza logits a probabilidad 1', () => {
        const probs = softmax([2.0, 1.0, 0.1]);
        const sum = probs.reduce((total, value) => total + value, 0);

        expect(sum).toBeCloseTo(1, 5);
        expect(probs[0]).toBeGreaterThan(probs[1]);
    });

    it('marca no_concluyente si la confianza es menor a 75', () => {
        const result = applyUmbral({
            clase: 'roya_amarilla',
            confianza: 74.99,
            severidad: 40,
        });

        expect(result.clase).toBe('no_concluyente');
        expect(result.severidad).toBe(40);
        expect(result.confianza).toBe(74.99);
    });

    it('conserva la clase si la confianza alcanza el umbral', () => {
        const result = applyUmbral({
            clase: 'roya_amarilla',
            confianza: UMBRAL_CONFIANZA,
            severidad: null,
        });

        expect(result.clase).toBe('roya_amarilla');
        expect(result.severidad).toBeNull();
    });

    it('no mezcla confianza con severidad en logits uniformes', () => {
        const result = fromLogits([0, 0, 0]);

        expect(result.clase).toBe('no_concluyente');
        expect(result.confianza).toBeCloseTo(33.33, 1);
        expect(result.severidad).toBeNull();
        expect(Object.keys(result.scores)).toEqual(CLASES);
    });

    it('elige roya_amarilla cuando su logit domina con alta confianza', () => {
        const result = fromLogits([-4, 8, -4]);

        expect(result.clase).toBe('roya_amarilla');
        expect(result.confianza).toBeGreaterThanOrEqual(UMBRAL_CONFIANZA);
        expect(result.severidad).toBeNull();
    });
});

describe('diagnostico local', () => {
    it('crea uuid, modelo_version y cola pending', () => {
        const diagnostico = createDiagnosticoLocal({
            prediccion: { clase: 'no_concluyente', confianza: 40, severidad: null },
            imagen_thumb: 'data:image/jpeg;base64,xx',
            parcela_nota: 'Lote Norte',
            modelo_version: 'roya-mobilenetv3-small-v1',
        });

        expect(diagnostico.uuid_local).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(diagnostico.sync_status).toBe('pending');
        expect(diagnostico.confianza).toBe(40);
        expect(diagnostico.severidad).toBeNull();
        expect(diagnostico.modelo_version).toBe('roya-mobilenetv3-small-v1');
    });

    it('resume por clase y no por un confidence legado', () => {
        const stats = summarizeDiagnosticos([
            { clase: 'roya_amarilla' },
            { clase: 'sana' },
            { clase: 'no_concluyente' },
        ]);

        expect(stats).toEqual({
            total: 3,
            critical: 1,
            healthy: 1,
            other: 0,
            inconclusive: 1,
        });
    });
});
