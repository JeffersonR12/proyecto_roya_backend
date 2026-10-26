import { describe, expect, it } from 'vitest';
import { protocoloPara } from './catalogo.js';
import { buildAlertas } from './alertas.js';

describe('protocolo fitosanitario', () => {
    it('no recomienda tratar si no_concluyente', () => {
        const proto = protocoloPara({
            clase: 'no_concluyente',
            confianza: 40,
            severidad: 80,
        });

        expect(proto.afirmado).toBe(false);
        expect(proto.puedeActivarProtocolo).toBe(false);
        expect(proto.cuandoTratar.toLowerCase()).toContain('no afirma');
    });

    it('usa severidad foliar y no la confianza para el umbral', () => {
        const proto = protocoloPara({
            clase: 'roya_amarilla',
            confianza: 92,
            severidad: 12,
            hitl_status: 'validated',
        });

        expect(proto.cuandoTratar).toContain('12%');
        expect(proto.cuandoTratar).toContain('30%');
        expect(proto.cuandoTratar.toLowerCase()).toContain('cultural');
    });

    it('exige HITL antes de activar protocolo de roya', () => {
        const sinHitl = protocoloPara({
            clase: 'roya_amarilla',
            confianza: 90,
            severidad: 40,
            hitl_status: 'pending',
        });
        const conHitl = protocoloPara({
            clase: 'roya_amarilla',
            confianza: 90,
            severidad: 40,
            hitl_status: 'validated',
        });

        expect(sinHitl.puedeActivarProtocolo).toBe(false);
        expect(conHitl.puedeActivarProtocolo).toBe(true);
    });
});

describe('alertas de negocio', () => {
    it('alerta brote solo si roya_amarilla y confianza >= 75', () => {
        const alertas = buildAlertas([
            { uuid_local: 'a', clase: 'roya_amarilla', confianza: 80, sync_status: 'confirmed', hitl_status: 'pending' },
            { uuid_local: 'b', clase: 'no_concluyente', confianza: 40, sync_status: 'confirmed', hitl_status: 'pending' },
            { uuid_local: 'c', clase: 'roya_amarilla', confianza: 60, sync_status: 'confirmed', hitl_status: 'pending' },
        ]);

        const brotes = alertas.filter((item) => item.tipo === 'brote');

        expect(brotes).toHaveLength(1);
        expect(brotes[0].uuid_local).toBe('a');
    });

    it('incluye cola pending y HITL para el tecnico', () => {
        const alertas = buildAlertas(
            [{ uuid_local: 'd', clase: 'sana', confianza: 90, sync_status: 'pending', hitl_status: 'pending', disease_detected: 'Sana' }],
            { staff: true },
        );

        expect(alertas.some((item) => item.tipo === 'sync')).toBe(true);
        expect(alertas.some((item) => item.tipo === 'hitl')).toBe(true);
        expect(alertas.some((item) => item.tipo === 'brote')).toBe(false);
    });
});
