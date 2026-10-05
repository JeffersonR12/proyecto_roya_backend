export const CLASES = ['sana', 'roya_amarilla', 'otra_enfermedad'];

export const UMBRAL_CONFIANZA = 75;

export const MODELO_VERSION = 'roya-mobilenetv3-small-v1';

export const INPUT_SIZE = 224;

export const IMAGENET_MEAN = [0.485, 0.456, 0.406];

export const IMAGENET_STD = [0.229, 0.224, 0.225];

export const CLASE_LABELS = {
    sana: 'Sana',
    roya_amarilla: 'Roya Amarilla',
    otra_enfermedad: 'Otra enfermedad',
    no_concluyente: 'No concluyente',
};

export function softmax(logits) {
    const values = Array.from(logits, (value) => Number(value));
    const max = Math.max(...values);
    const exps = values.map((value) => Math.exp(value - max));
    const sum = exps.reduce((total, value) => total + value, 0) || 1;

    return exps.map((value) => value / sum);
}

export function round2(value) {
    return Math.round(Number(value) * 100) / 100;
}

export function applyUmbral(prediccion) {
    const confianza = round2(prediccion.confianza);
    const severidad = prediccion.severidad == null ? null : round2(prediccion.severidad);

    if (severidad != null && (severidad < 0 || severidad > 100)) {
        throw new Error('severidad debe estar entre 0 y 100');
    }

    const clase = confianza < UMBRAL_CONFIANZA ? 'no_concluyente' : prediccion.clase;

    return {
        ...prediccion,
        clase,
        confianza,
        severidad,
    };
}

export function fromLogits(logits) {
    const probs = softmax(logits);
    let index = 0;

    for (let i = 1; i < probs.length; i += 1) {
        if (probs[i] > probs[index]) {
            index = i;
        }
    }

    const scores = {};
    CLASES.forEach((clase, i) => {
        scores[clase] = round2((probs[i] ?? 0) * 100);
    });

    return applyUmbral({
        clase: CLASES[index] ?? 'no_concluyente',
        confianza: round2((probs[index] ?? 0) * 100),
        severidad: null,
        scores,
    });
}

export function createDiagnosticoLocal({ prediccion, imagen_thumb, parcela_nota, latitud, longitud, modelo_version }) {
    if (!prediccion?.clase || prediccion.confianza == null) {
        throw new Error('prediccion incompleta');
    }

    return {
        uuid_local: crypto.randomUUID(),
        clase: prediccion.clase,
        confianza: prediccion.confianza,
        severidad: prediccion.severidad,
        scores: prediccion.scores ?? null,
        imagen_thumb,
        parcela_nota: parcela_nota || null,
        latitud: latitud ?? null,
        longitud: longitud ?? null,
        modelo_version: modelo_version || MODELO_VERSION,
        sync_status: 'pending',
        retry_count: 0,
        captured_at: new Date().toISOString(),
    };
}

export function summarizeDiagnosticos(items) {
    const total = items.length;

    return {
        total,
        critical: items.filter((item) => item.clase === 'roya_amarilla').length,
        healthy: items.filter((item) => item.clase === 'sana').length,
        other: items.filter((item) => item.clase === 'otra_enfermedad').length,
        inconclusive: items.filter((item) => item.clase === 'no_concluyente').length,
    };
}

export function toViewModel(diagnostico) {
    const clase = diagnostico.clase || 'no_concluyente';

    return {
        id: diagnostico.uuid_local,
        uuid_local: diagnostico.uuid_local,
        clase,
        disease_detected: CLASE_LABELS[clase] || clase,
        confianza: diagnostico.confianza,
        confidence: Number(diagnostico.confianza) / 100,
        severidad: diagnostico.severidad,
        image_base64: diagnostico.imagen_thumb,
        location: diagnostico.parcela_nota,
        created_at: diagnostico.captured_at,
        modelo_version: diagnostico.modelo_version,
        sync_status: diagnostico.sync_status,
        latitud: diagnostico.latitud,
        longitud: diagnostico.longitud,
    };
}

export function resultadoVista(prediccion) {
    if (prediccion.clase === 'roya_amarilla') {
        return {
            label: CLASE_LABELS.roya_amarilla,
            recommendation: 'Confianza alta de roya amarilla. El técnico debe validar (HITL). La severidad foliar no se infiere de la clase.',
            classes: 'border-rose-100 bg-white text-navy',
        };
    }

    if (prediccion.clase === 'sana') {
        return {
            label: CLASE_LABELS.sana,
            recommendation: 'Sin signos compatibles con las clases entrenadas. Mantener vigilancia de campo.',
            classes: 'border-teal/20 bg-white text-navy',
        };
    }

    if (prediccion.clase === 'otra_enfermedad') {
        return {
            label: CLASE_LABELS.otra_enfermedad,
            recommendation: 'Posible enfermedad distinta de roya amarilla. Derivar a revisión técnica.',
            classes: 'border-gold/40 bg-white text-navy',
        };
    }

    return {
        label: CLASE_LABELS.no_concluyente,
        recommendation: `Confianza ${prediccion.confianza}% (< ${UMBRAL_CONFIANZA}%). El sistema no afirma diagnóstico.`,
        classes: 'border-sky bg-white text-navy',
    };
}
