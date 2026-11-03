import { describe, expect, it } from 'vitest';
import { CATALOGO, protocoloPara } from './catalogo.js';
import { buildAlertas, neverAlertsRoyaIfInconclusive } from './alertas.js';

describe('protocolo por clase', () => {
    it('una hoja sana no tiene umbral de tratamiento', () => {
        const res = protocoloPara({ clase: 'sana', confianza: 90 });

        expect(res.afirmado).toBe(true);
        expect(res.cuandoTratar).toContain('Sin umbral de tratamiento');
        expect(res.avisoHitl).toBeNull();
        expect(res.puedeActivarProtocolo).toBe(false);
    });

    it('una clase desconocida cae en no concluyente', () => {
        const res = protocoloPara({ clase: 'inventada', confianza: 99 });

        expect(res.ficha).toBe(CATALOGO.no_concluyente);
        expect(res.afirmado).toBe(false);
    });

    it('confianza no numerica no afirma diagnostico', () => {
        const res = protocoloPara({ clase: 'roya_amarilla', confianza: 'abc', severidad: 50 });

        expect(res.afirmado).toBe(false);
        expect(res.cuandoTratar).toContain('no afirma diagnostico');
    });

    it('severidad vacia pide estimacion del tecnico', () => {
        const res = protocoloPara({ clase: 'otra_enfermedad', confianza: 80, severidad: '' });

        expect(res.cuandoTratar).toContain('El tecnico debe estimar cobertura foliar');
        expect(res.avisoHitl).toBeNull();
    });

    it('roya validada con severidad en umbral activa el protocolo', () => {
        const res = protocoloPara({ clase: 'roya_amarilla', confianza: 75, severidad: 30, hitl_status: 'validated' });

        expect(res.cuandoTratar).toContain('alcanza el umbral 30%');
        expect(res.puedeActivarProtocolo).toBe(true);
        expect(res.avisoHitl).toBeNull();
    });
});

describe('alertas', () => {
    it('lista vacia o nula no genera alertas', () => {
        expect(buildAlertas(null)).toEqual([]);
        expect(buildAlertas([])).toEqual([]);
    });

    it('convierte confidence legado 0-1 a porcentaje', () => {
        const alertas = buildAlertas([
            { uuid_local: 'a', clase: 'roya_amarilla', confidence: 0.9, sync_status: 'synced' },
        ]);

        expect(alertas).toHaveLength(1);
        expect(alertas[0].tipo).toBe('roya');
        expect(alertas[0].titulo).toContain('Lote sin nombre');
    });

    it('marca error de envio y no muestra revision tecnica al agricultor', () => {
        const alertas = buildAlertas([
            { uuid_local: 'b', clase: 'sana', confianza: 90, sync_status: 'error', hitl_status: 'pending' },
        ]);

        expect(alertas.map((a) => a.tipo)).toEqual(['envio_error']);
    });

    it('ordena los lotes con roya del mas reciente al mas antiguo', () => {
        const alertas = buildAlertas([
            { uuid_local: 'old', clase: 'roya_amarilla', confianza: 90, location: 'Viejo', created_at: '2026-01-01', sync_status: 'confirmed' },
            { uuid_local: 'new', clase: 'roya_amarilla', confianza: 90, location: 'Nuevo', created_at: '2026-02-01', sync_status: 'confirmed' },
        ]);

        expect(alertas.map((a) => a.titulo)).toEqual([
            'Posible roya amarilla en Nuevo',
            'Posible roya amarilla en Viejo',
        ]);
    });

    it('detecta una alerta de roya mal etiquetada como no concluyente', () => {
        expect(neverAlertsRoyaIfInconclusive([{ tipo: 'roya', titulo: 'Roya No Concluyente' }])).toBe(false);
        expect(neverAlertsRoyaIfInconclusive([{ tipo: 'envio', titulo: 'no concluyente' }])).toBe(true);
    });
});
