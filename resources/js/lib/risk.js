// El riesgo se mide por severidad foliar (0-100), nunca por la confianza del modelo.
export const UMBRAL_MEDIO = 10;
export const UMBRAL_CRITICO = 30;

export function getRiskLevel(severidad) {
    if (severidad == null || severidad === '' || !Number.isFinite(Number(severidad))) {
        return 'sin_dato';
    }

    if (Number(severidad) >= UMBRAL_CRITICO) {
        return 'critical';
    }

    if (Number(severidad) >= UMBRAL_MEDIO) {
        return 'medium';
    }

    return 'healthy';
}

export function getRiskMeta(level) {
    if (level === 'critical') {
        return {
            label: 'CRITICO',
            recommendation: 'Severidad sobre el umbral. El tecnico valida HITL antes de aplicar fungicida.',
            className: 'text-rose-600 bg-rose-50',
            dotClass: 'bg-rose-500',
            textClass: 'text-rose-500',
        };
    }

    if (level === 'medium') {
        return {
            label: 'ALERTA MEDIA',
            recommendation: 'Reinspeccionar en 48 horas y vigilar humedad.',
            className: 'text-amber-600 bg-amber-50',
            dotClass: 'bg-gold',
            textClass: 'text-amber-500',
        };
    }

    if (level === 'sin_dato') {
        return {
            label: 'SIN SEVERIDAD',
            recommendation: 'El tecnico debe estimar la severidad foliar en campo.',
            className: 'text-navy/60 bg-sky',
            dotClass: 'bg-navy/30',
            textClass: 'text-navy/50',
        };
    }

    return {
        label: 'BAJO RIESGO',
        recommendation: 'Mantener vigilancia semanal del lote.',
        className: 'text-teal bg-teal/10',
        dotClass: 'bg-teal',
        textClass: 'text-teal',
    };
}

export function summarizeAnalyses(analyses) {
    const levels = analyses.map((analysis) => getRiskLevel(analysis.severidad));

    return {
        total: analyses.length,
        critical: levels.filter((level) => level === 'critical').length,
        medium: levels.filter((level) => level === 'medium').length,
        healthy: levels.filter((level) => level === 'healthy').length,
        sinDato: levels.filter((level) => level === 'sin_dato').length,
    };
}

export function formatDateTime(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function percent(value, digits = 1) {
    return `${(Number(value) * 100).toFixed(digits)}%`;
}

export function roleLabel(role) {
    return role === 'administrador' ? 'Administrador' : 'Tecnico de campo';
}
