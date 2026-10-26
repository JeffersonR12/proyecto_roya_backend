import { describe, expect, it } from 'vitest';
import { getRiskLevel, getRiskMeta, summarizeAnalyses } from './risk.js';
import { CATALOGO } from './catalogo.js';

describe('riesgo por severidad foliar', () => {
    it('clasifica por severidad 0-100 con umbral critico 30', () => {
        expect(getRiskLevel(5)).toBe('healthy');
        expect(getRiskLevel(10)).toBe('medium');
        expect(getRiskLevel(29.99)).toBe('medium');
        expect(getRiskLevel(30)).toBe('critical');
        expect(getRiskLevel(80)).toBe('critical');
    });

    it('sin severidad no se declara sano', () => {
        expect(getRiskLevel(null)).toBe('sin_dato');
        expect(getRiskLevel(undefined)).toBe('sin_dato');
        expect(getRiskLevel('')).toBe('sin_dato');
        expect(getRiskMeta('sin_dato').label).toBe('SIN SEVERIDAD');
    });

    it('ignora la confianza del modelo', () => {
        const resumen = summarizeAnalyses([
            { clase: 'roya_amarilla', confianza: 99, severidad: null },
            { clase: 'roya_amarilla', confianza: 76, severidad: 45 },
            { clase: 'sana', confianza: 95, severidad: 0 },
        ]);

        expect(resumen).toEqual({ total: 3, critical: 1, medium: 0, healthy: 1, sinDato: 1 });
    });

    it('el critico exige HITL antes del fungicida', () => {
        expect(getRiskMeta('critical').recommendation).toContain('HITL');
    });

    it('el umbral critico coincide con el catalogo de roya amarilla', () => {
        expect(getRiskLevel(CATALOGO.roya_amarilla.umbral_alerta)).toBe('critical');
    });
});
