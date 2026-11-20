import { CLASE_LABELS } from './inference.js';

export const REPORTS_API = '/api/reports';

export const ORIGENES = [
    { id: 'campo', label: 'Datos de campo' },
    { id: 'demo', label: 'Demostración (seeder)' },
    { id: 'todos', label: 'Todos' },
];

const MES_FMT = new Intl.DateTimeFormat('es-PE', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Parámetros de consulta: solo se envían los filtros con valor. */
export function buildParams({ desde = '', hasta = '', origen = 'campo' } = {}) {
    const params = { origen };
    if (desde) {
        params.desde = desde;
    }
    if (hasta) {
        params.hasta = hasta;
    }

    return params;
}

/** Mensaje de error del rango de fechas, o '' si es válido (AAAA-MM-DD se compara como texto). */
export function validarRango(desde, hasta) {
    if (desde && hasta && hasta < desde) {
        return 'La fecha final no puede ser anterior a la inicial.';
    }

    return '';
}

/** Barras por clase en el orden que define el backend (Diagnostico::CLASES). */
export function claseChartData(porClase = {}) {
    return Object.entries(porClase).map(([clase, total]) => ({
        clase,
        etiqueta: CLASE_LABELS[clase] || clase,
        total: Number(total) || 0,
    }));
}

/** '2026-06' -> 'jun 2026' */
export function mesLabel(mes) {
    const [anio, numero] = String(mes).split('-').map(Number);
    if (!anio || !numero) {
        return String(mes);
    }

    return MES_FMT.format(new Date(Date.UTC(anio, numero - 1, 1))).replace('.', '');
}

export function serieChartData(serie = []) {
    return serie.map((punto) => ({ ...punto, etiqueta: mesLabel(punto.mes) }));
}

export function formatPct(valor) {
    return valor === null || valor === undefined ? '—' : `${Number(valor).toLocaleString('es-PE', { maximumFractionDigits: 1 })} %`;
}

export function formatNumero(valor, sufijo = '') {
    return valor === null || valor === undefined
        ? '—'
        : `${Number(valor).toLocaleString('es-PE', { maximumFractionDigits: 1 })}${sufijo}`;
}

/** Nombre del archivo desde Content-Disposition (attachment; filename=...). */
export function filenameFromDisposition(header, fallback = 'reporte_diagnosticos.csv') {
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header || '');

    return match ? decodeURIComponent(match[1]) : fallback;
}
