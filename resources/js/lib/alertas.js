import { UMBRAL_CONFIANZA } from './inference.js';

export function buildAlertas(diagnosticos, { staff = false } = {}) {
    const items = [];

    for (const row of diagnosticos || []) {
        const clase = row.clase;
        const confianza = Number(row.confianza ?? (Number(row.confidence) * 100));
        const sync = row.sync_status || 'pending';

        if (clase === 'roya_amarilla' && confianza >= UMBRAL_CONFIANZA) {
            items.push({
                id: `brote-${row.uuid_local}`,
                tipo: 'brote',
                titulo: 'Roya Amarilla confirmada por el modelo',
                detalle: `${row.location || 'Lote sin nombre'} · confianza ${confianza}% · el tecnico debe validar HITL. La severidad foliar es un campo distinto.`,
                uuid_local: row.uuid_local,
                created_at: row.created_at,
            });
        }

        if (sync === 'pending' || sync === 'error' || sync === 'sending') {
            items.push({
                id: `sync-${row.uuid_local}`,
                tipo: 'sync',
                titulo: sync === 'error' ? 'Error de sincronizacion' : `Cola offline: ${sync}`,
                detalle: `${row.disease_detected || clase} · ${row.uuid_local}`,
                uuid_local: row.uuid_local,
                created_at: row.created_at,
            });
        }

        if (staff && row.hitl_status === 'pending') {
            items.push({
                id: `hitl-${row.uuid_local}`,
                tipo: 'hitl',
                titulo: 'Caso HITL pendiente',
                detalle: `${row.disease_detected || clase} · ${row.location || 'Sin parcela'}`,
                uuid_local: row.uuid_local,
                created_at: row.created_at,
            });
        }
    }

    return items.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
}

export function neverAlertsRoyaIfInconclusive(alertas) {
    return !alertas.some((item) => item.tipo === 'brote' && String(item.titulo).toLowerCase().includes('no concluyente'));
}
