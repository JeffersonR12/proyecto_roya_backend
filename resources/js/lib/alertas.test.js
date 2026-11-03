import { describe, expect, it } from 'vitest';
import { buildAlertas, contarAlertas, neverAlertsRoyaIfInconclusive, tiempoRelativo } from './alertas.js';

const NOW = Date.parse('2026-10-28T12:00:00Z');
const hace = (horas) => new Date(NOW - horas * 3600000).toISOString();

const roya = (overrides = {}) => ({
    uuid_local: crypto.randomUUID(),
    clase: 'roya_amarilla',
    confianza: 92,
    sync_status: 'confirmed',
    hitl_status: 'pending',
    location: 'Lote Valle Norte',
    created_at: hace(2),
    ...overrides,
});

describe('alertas agrupadas', () => {
    it('agrupa varias hojas con roya del mismo lote en una sola alerta', () => {
        const alertas = buildAlertas([roya(), roya({ created_at: hace(5) }), roya({ created_at: hace(1) })], { now: NOW });
        const urgentes = alertas.filter((a) => a.nivel === 'urgente');

        expect(urgentes).toHaveLength(1);
        expect(urgentes[0].titulo).toBe('Posible roya amarilla en Lote Valle Norte');
        expect(urgentes[0].detalle).toBe('3 hojas afectadas · hace 1 hora');
        expect(urgentes[0].etiqueta).toBe('Esperando al técnico');
    });

    it('separa lotes distintos y nombra el lote vacío', () => {
        const alertas = buildAlertas([roya(), roya({ location: '' })], { now: NOW });
        const titulos = alertas.filter((a) => a.tipo === 'roya').map((a) => a.titulo);

        expect(titulos).toHaveLength(2);
        expect(titulos).toContain('Posible roya amarilla en Lote sin nombre');
    });

    it('marca confirmado cuando el técnico validó todas las hojas y oculta las descartadas', () => {
        const confirmada = buildAlertas([roya({ hitl_status: 'validated' })], { now: NOW });
        const descartada = buildAlertas([roya({ hitl_status: 'rejected' })], { now: NOW });

        expect(confirmada[0].etiqueta).toBe('Confirmado por el técnico');
        expect(descartada.filter((a) => a.tipo === 'roya')).toHaveLength(0);
    });

    it('junta 10 envíos pendientes en una tarjeta informativa que no suma al contador', () => {
        const rows = Array.from({ length: 10 }, () => ({
            uuid_local: crypto.randomUUID(),
            clase: 'sana',
            confianza: 95,
            sync_status: 'pending',
            hitl_status: 'not_required',
        }));
        const alertas = buildAlertas(rows, { now: NOW });

        expect(alertas).toHaveLength(1);
        expect(alertas[0].nivel).toBe('info');
        expect(alertas[0].titulo).toBe('10 revisiones guardadas en el teléfono');
        expect(alertas[0].accion).toBeNull();
        expect(contarAlertas(alertas)).toBe(0);
    });

    it('los errores de envío sí cuentan y ofrecen reintentar', () => {
        const alertas = buildAlertas(
            [
                { uuid_local: 'e1', clase: 'sana', confianza: 90, sync_status: 'error' },
                { uuid_local: 'e2', clase: 'sana', confianza: 90, sync_status: 'error' },
            ],
            { now: NOW },
        );

        expect(alertas[0].titulo).toBe('No pudimos enviar 2 revisiones');
        expect(alertas[0].accion).toBe('reintentar');
        expect(alertas[0].uuids).toEqual(['e1', 'e2']);
        expect(contarAlertas(alertas)).toBe(1);
    });

    it('no concluyente o confianza baja nunca generan alerta de roya', () => {
        const alertas = buildAlertas(
            [
                roya({ clase: 'no_concluyente', confianza: 40 }),
                roya({ confianza: 60 }),
            ],
            { now: NOW },
        );

        expect(alertas.some((a) => a.tipo === 'roya')).toBe(false);
        expect(neverAlertsRoyaIfInconclusive(alertas)).toBe(true);
    });

    it('solo staff ve la tarjeta para revisar, una sola con el total', () => {
        const rows = [roya(), roya({ clase: 'otra_enfermedad' }), roya({ clase: 'no_concluyente', confianza: 30 })];

        expect(buildAlertas(rows, { now: NOW }).some((a) => a.nivel === 'revisar')).toBe(false);

        const revisar = buildAlertas(rows, { staff: true, now: NOW }).filter((a) => a.nivel === 'revisar');
        expect(revisar).toHaveLength(1);
        expect(revisar[0].titulo).toBe('3 hojas esperan tu revisión');
        expect(revisar[0].accion).toBe('hitl');
    });

    it('ordena urgente, para revisar e información', () => {
        const alertas = buildAlertas(
            [
                { uuid_local: 'p', clase: 'sana', confianza: 90, sync_status: 'pending' },
                roya(),
            ],
            { staff: true, now: NOW },
        );

        expect(alertas.map((a) => a.nivel)).toEqual(['urgente', 'revisar', 'info']);
        expect(contarAlertas(alertas)).toBe(2);
    });

    it('marca como nuevas solo las alertas de las últimas 24 horas', () => {
        const alertas = buildAlertas([roya({ location: 'A' }), roya({ location: 'B', created_at: hace(30) })], { now: NOW });
        const porLote = Object.fromEntries(alertas.map((a) => [a.titulo.split(' en ')[1], a.nuevo]));

        expect(porLote).toEqual({ A: true, B: false });
    });

    it('ningún texto muestra UUID, porcentajes ni jerga técnica', () => {
        const alertas = buildAlertas(
            [
                roya({ uuid_local: 'cccdadca-6d2d-4711-b552-8b3afbcaa948', confianza: 99.71 }),
                { uuid_local: 'e5def894-786b-4dc1-a345-4324deb69183', clase: 'sana', confianza: 90, sync_status: 'error' },
                { uuid_local: '4911c763-2f7a-4b1b-99dc-b5d4967e27e5', clase: 'sana', confianza: 90, sync_status: 'pending' },
            ],
            { staff: true, now: NOW },
        );
        const visible = alertas.map((a) => [a.titulo, a.detalle, a.etiqueta, a.accionLabel].join(' ')).join(' ');

        expect(visible).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i);
        expect(visible).not.toMatch(/%|hitl|sync|pending|sending|modelo|confianza|severidad|brote|cola/i);
    });

    it('lista vacía o nula no genera alertas', () => {
        expect(buildAlertas(null)).toEqual([]);
        expect(buildAlertas([])).toEqual([]);
    });
});

describe('tiempo relativo', () => {
    it('usa frases cortas en lugar de fechas', () => {
        expect(tiempoRelativo(hace(0), { now: NOW })).toBe('hace un momento');
        expect(tiempoRelativo(hace(0.5), { now: NOW })).toBe('hace 30 min');
        expect(tiempoRelativo(hace(3), { now: NOW })).toBe('hace 3 horas');
        expect(tiempoRelativo(hace(30), { now: NOW })).toBe('ayer');
        expect(tiempoRelativo(hace(24 * 5), { now: NOW })).toBe('hace 5 días');
        expect(tiempoRelativo('', { now: NOW })).toBe('');
    });

    it('traduce al inglés', () => {
        expect(tiempoRelativo(hace(3), { now: NOW, lang: 'en' })).toBe('3 hours ago');
    });
});
