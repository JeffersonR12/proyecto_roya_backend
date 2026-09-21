export function getRiskLevel(confidence) {
    if (confidence > 0.3) {
        return 'critical';
    }

    if (confidence >= 0.1) {
        return 'medium';
    }

    return 'healthy';
}

export function getRiskMeta(level) {
    if (level === 'critical') {
        return {
            label: 'CRITICO',
            className: 'text-rose-600 bg-rose-50',
            dotClass: 'bg-rose-500',
            textClass: 'text-rose-500',
        };
    }

    if (level === 'medium') {
        return {
            label: 'ALERTA MEDIA',
            className: 'text-amber-600 bg-amber-50',
            dotClass: 'bg-gold',
            textClass: 'text-amber-500',
        };
    }

    return {
        label: 'SANO',
        className: 'text-teal bg-teal/10',
        dotClass: 'bg-teal',
        textClass: 'text-teal',
    };
}

export function classifySeverity(severity) {
    if (severity > 30) {
        return {
            label: 'CRITICO',
            recommendation: 'Cuarentena inmediata y aplicacion de fungicida sistemico',
            classes: 'border-rose-100 bg-white text-navy',
        };
    }

    if (severity >= 10) {
        return {
            label: 'ALERTA MEDIA',
            recommendation: 'Reinspeccionar en 48 horas y vigilar humedad',
            classes: 'border-gold/40 bg-white text-navy',
        };
    }

    return {
        label: 'BAJO RIESGO / SANO',
        recommendation: 'Mantener plan preventivo',
            classes: 'border-teal/20 bg-white text-navy',
    };
}

export function summarizeAnalyses(analyses) {
    const total = analyses.length;
    const critical = analyses.filter((analysis) => analysis.confidence > 0.3).length;
    const medium = analyses.filter((analysis) => analysis.confidence >= 0.1 && analysis.confidence <= 0.3).length;
    const healthy = analyses.filter((analysis) => analysis.confidence < 0.1).length;

    return { total, critical, medium, healthy };
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
