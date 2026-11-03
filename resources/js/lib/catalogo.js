import { UMBRAL_CONFIANZA } from './inference.js';

export const CATALOGO = {
    sana: {
        codigo: 'PHY-000',
        nombre: 'Sana',
        agente_causal: 'Estado sin enfermedad detectada',
        sintomas: 'Hoja sin signos compatibles con las clases consideradas.',
        practicas: [
            'Mantener vigilancia semanal del lote.',
            'Evitar riego excesivo en hojas al atardecer.',
            'No aplicar fungicida preventivo solo por la foto.',
        ],
        umbral_alerta: 10,
        se_afirma: true,
    },
    roya_amarilla: {
        codigo: 'PHY-001',
        nombre: 'Roya Amarilla',
        agente_causal: 'Puccinia striiformis',
        sintomas:
            'Pustulas amarillo-anaranjadas y pulverulentas en estrias lineales paralelas a las nervaduras. Inicio: una linea de 2-4 cm en hojas medias. Ataque severo: hoja casi toda amarilla. No confundir con roya anaranjada (Puccinia triticina): pustulas redondeadas, dispersas, sin estrias.',
        condiciones:
            'Clima fresco (10-15 C) con agua libre sobre la hoja; la infeccion ocurre sobre todo de noche. Ciclos cada 10-12 dias; puede destruir la hoja en 12-15 dias.',
        practicas: [
            'Aislar el lote y marcar plantas afectadas.',
            'El tecnico estima severidad foliar en campo (no usar la confianza del modelo).',
            'Validar HITL en menos de 48 h: tratar 10 dias tarde cuesta 12-15 % de rendimiento; 20 dias, hasta 25 %.',
            'Evitar exceso de nitrogeno: prolonga la suculencia del tejido y favorece la enfermedad.',
            'Cuarentena relativa: no mezclar semilla ni restos con lotes sanos.',
            'Para la siguiente siembra, preferir variedades resistentes.',
            'Solo tras validacion HITL se define si hay umbral de tratamiento.',
        ],
        fuente: 'INIA Carillanca (Chile), Informativo ago. 2007: Andrade y Contreras, "Roya amarilla o polvillo estriado del trigo".',
        umbral_alerta: 30,
        se_afirma: true,
    },
    otra_enfermedad: {
        codigo: 'PHY-002',
        nombre: 'Otra enfermedad',
        agente_causal: 'No determinado por el modelo de 3 clases',
        sintomas: 'Signos distintos a roya amarilla, por ejemplo roya anaranjada: pustulas redondeadas y dispersas, sin estrias.',
        practicas: [
            'No tratar como Roya Amarilla.',
            'Derivar al tecnico para identificacion.',
            'Repetir captura si la hoja no estaba completa o con mala luz.',
        ],
        umbral_alerta: 30,
        se_afirma: true,
    },
    no_concluyente: {
        codigo: 'PHY-NC',
        nombre: 'No concluyente',
        agente_causal: 'El sistema no afirma diagnostico',
        sintomas: 'Confianza por debajo del umbral operativo.',
        practicas: [
            'No aplicar producto.',
            'Repetir foto: luz de dia, hoja entera, fondo simple, 20-30 cm.',
            'Si se repite, el tecnico revisa en campo (HITL).',
        ],
        umbral_alerta: null,
        se_afirma: false,
    },
};

export function protocoloPara({ clase, confianza, severidad, hitl_status }) {
    const ficha = CATALOGO[clase] || CATALOGO.no_concluyente;
    const sev = severidad == null || severidad === '' ? null : Number(severidad);
    const conf = Number(confianza);
    const afirmado = Boolean(ficha.se_afirma) && Number.isFinite(conf) && conf >= UMBRAL_CONFIANZA && clase !== 'no_concluyente';

    let cuandoTratar =
        'La decision de tratar se basa en severidad foliar de campo, no en la confianza del CNN.';

    if (!afirmado || clase === 'no_concluyente') {
        cuandoTratar =
            'El sistema no afirma diagnostico. No aplicar producto ni interpretar esto como Roya Amarilla.';
    } else if (clase === 'sana') {
        cuandoTratar = 'Sin umbral de tratamiento. Mantener practicas culturales de vigilancia.';
    } else if (sev == null) {
        cuandoTratar =
            `Clase afirmada, pero la severidad foliar no viene del modelo. El tecnico debe estimar cobertura foliar antes de tratar (umbral ${ficha.umbral_alerta}%).`;
    } else if (Number(sev) < Number(ficha.umbral_alerta)) {
        cuandoTratar = `Severidad foliar ${sev}% por debajo del umbral ${ficha.umbral_alerta}%. Priorizar practicas culturales; no aplicar quimico aun.`;
    } else {
        cuandoTratar = `Severidad foliar ${sev}% alcanza el umbral ${ficha.umbral_alerta}%. El tecnico valida HITL antes de aplicar el protocolo.`;
    }

    const puedeActivarProtocolo = afirmado && hitl_status === 'validated' && clase === 'roya_amarilla';

    return {
        ficha,
        cuandoTratar,
        afirmado,
        puedeActivarProtocolo,
        avisoHitl:
            clase === 'roya_amarilla' && hitl_status !== 'validated'
                ? 'El tecnico debe validar (HITL) antes de aplicar cualquier medida quimica.'
                : null,
    };
}
