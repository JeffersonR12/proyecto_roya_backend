import { UMBRAL_CONFIANZA } from './inference.js';
import { copyFor } from './fieldFlow.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const NIVEL_ORDEN = { urgente: 0, revisar: 1, info: 2 };

function confianzaDe(row) {
    return Number(row.confianza ?? Number(row.confidence) * 100);
}

function fechaDe(row) {
    return row.created_at || row.captured_at || '';
}

function masReciente(rows) {
    return rows.reduce((best, row) => (String(fechaDe(row)) > String(fechaDe(best)) ? row : best), rows[0]);
}

export function tiempoRelativo(iso, { now = Date.now(), lang = 'es' } = {}) {
    const time = Date.parse(iso);
    if (!iso || Number.isNaN(time)) {
        return '';
    }

    const t = copyFor(lang).time;
    const diff = Math.max(0, now - time);
    const min = Math.floor(diff / 60000);

    if (min < 1) {
        return t.now;
    }
    if (min < 60) {
        return t.minutes(min);
    }
    const hours = Math.floor(min / 60);
    if (hours < 24) {
        return t.hours(hours);
    }
    const days = Math.floor(hours / 24);
    return days === 1 ? t.yesterday : t.days(days);
}

// Alertas agrupadas y en lenguaje de campo:
// - urgente: una por lote con roya afirmada (confianza >= umbral) y no descartada por el técnico.
// - revisar: una sola tarjeta con las hojas que esperan revisión técnica (solo staff).
// - info: una tarjeta para envíos pendientes y otra para envíos con error.
export function buildAlertas(diagnosticos, { staff = false, lang = 'es', now = Date.now() } = {}) {
    const copy = copyFor(lang).alerts;
    const rows = diagnosticos || [];
    const items = [];

    const royaPorLote = new Map();
    for (const row of rows) {
        if (row.clase !== 'roya_amarilla' || confianzaDe(row) < UMBRAL_CONFIANZA || row.hitl_status === 'rejected') {
            continue;
        }
        const lote = row.location || row.parcela_nota || '';
        if (!royaPorLote.has(lote)) {
            royaPorLote.set(lote, []);
        }
        royaPorLote.get(lote).push(row);
    }

    for (const [lote, grupo] of royaPorLote) {
        const ultima = masReciente(grupo);
        const fecha = fechaDe(ultima);
        const cuando = tiempoRelativo(fecha, { now, lang });
        items.push({
            id: `roya-${lote || 'sin-lote'}`,
            tipo: 'roya',
            nivel: 'urgente',
            titulo: copy.royaTitle(lote || copy.noLote),
            detalle: [copy.leaves(grupo.length), cuando].filter(Boolean).join(' · '),
            etiqueta: grupo.every((row) => row.hitl_status === 'validated') ? copy.confirmed : copy.waiting,
            accion: 'protocolo',
            accionLabel: copy.actionProtocol,
            thumb: ultima.image_base64 || ultima.imagen_thumb || null,
            count: grupo.length,
            created_at: fecha,
            nuevo: Boolean(fecha) && now - Date.parse(fecha) < DAY_MS,
            cuenta: true,
        });
    }

    if (staff) {
        const pendientes = rows.filter((row) => row.hitl_status === 'pending');
        if (pendientes.length) {
            const fecha = fechaDe(masReciente(pendientes));
            items.push({
                id: 'revision',
                tipo: 'revision',
                nivel: 'revisar',
                titulo: copy.reviewTitle(pendientes.length),
                detalle: tiempoRelativo(fecha, { now, lang }),
                accion: 'hitl',
                accionLabel: copy.actionReview,
                count: pendientes.length,
                created_at: fecha,
                cuenta: true,
            });
        }
    }

    const conError = rows.filter((row) => row.sync_status === 'error');
    if (conError.length) {
        items.push({
            id: 'envio-error',
            tipo: 'envio_error',
            nivel: 'info',
            titulo: copy.sendErrorTitle(conError.length),
            detalle: copy.sendErrorText,
            accion: 'reintentar',
            accionLabel: copy.actionRetry,
            count: conError.length,
            uuids: conError.map((row) => row.uuid_local),
            cuenta: true,
        });
    }

    const enCola = rows.filter((row) => !row.sync_status || row.sync_status === 'pending' || row.sync_status === 'sending');
    if (enCola.length) {
        items.push({
            id: 'envio',
            tipo: 'envio',
            nivel: 'info',
            titulo: copy.queuedTitle(enCola.length),
            detalle: copy.queuedText,
            accion: null,
            count: enCola.length,
            cuenta: false,
        });
    }

    return items.sort(
        (a, b) =>
            NIVEL_ORDEN[a.nivel] - NIVEL_ORDEN[b.nivel] || String(b.created_at || '').localeCompare(String(a.created_at || '')),
    );
}

// Número para la campana, el menú y la barra inferior: solo lo que pide una acción.
export function contarAlertas(alertas) {
    return (alertas || []).filter((item) => item.cuenta).length;
}

export function neverAlertsRoyaIfInconclusive(alertas) {
    return !alertas.some((item) => item.tipo === 'roya' && String(item.titulo).toLowerCase().includes('no concluyente'));
}
