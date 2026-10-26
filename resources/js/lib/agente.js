import { CATALOGO, protocoloPara } from './catalogo.js';
import { CLASE_LABELS, UMBRAL_CONFIANZA } from './inference.js';

export const AGENTE_VERSION = 'riwiscan-hitl-rag-v1';
export const FUENTE = 'catalogo_fitosanitario';

export const GUIA_CAPTURA = [
    'Luz natural, evita sombra fuerte y flash.',
    'Hoja entera a 20-30 cm, nitida, sin dedos tapando.',
    'Una hoja por foto. Fondo simple (suelo o carton).',
    'Si sale no_concluyente, repite. No interpretes eso como Roya.',
];

export const ETIQUETAS_HUMANAS = ['sana', 'roya_amarilla', 'otra_enfermedad', 'no_concluyente'];

const STOP = new Set([
    'el',
    'la',
    'los',
    'las',
    'de',
    'del',
    'un',
    'una',
    'que',
    'como',
    'para',
    'por',
    'con',
    'sin',
    'este',
    'esta',
    'esto',
    'hay',
    'tiene',
    'sobre',
    'cuando',
    'cual',
    'donde',
    'muy',
]);

const STAFF_ONLY = new Set(['validar', 'rechazar', 'correccion', 'resample']);

export function normalizar(texto) {
    return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function tokens(texto) {
    return normalizar(texto)
        .split(' ')
        .filter((token) => token.length > 2 && !STOP.has(token));
}

export function puedeAfirmarRoya(diagnostico) {
    if (!diagnostico) {
        return false;
    }

    return diagnostico.clase === 'roya_amarilla' && Number(diagnostico.confianza) >= UMBRAL_CONFIANZA;
}

export function sistemaAfirma(diagnostico) {
    if (!diagnostico) {
        return false;
    }

    const clase = diagnostico.clase;

    return Boolean(clase) && clase !== 'no_concluyente' && Number(diagnostico.confianza) >= UMBRAL_CONFIANZA;
}

export function detectarIntencion(pregunta) {
    const q = normalizar(pregunta);
    const compact = q.replace(/\s+/g, '');

    if (!q) {
        return 'vacio';
    }

    if (
        compact.includes('dataimage') ||
        compact.includes('base64') ||
        /analiza (la |esta )?(foto|imagen|hoja)/.test(q) ||
        /diagnostica/.test(q) ||
        /que (tiene|enfermedad hay en) (esta|la) (foto|imagen|hoja)/.test(q) ||
        /mira (esta|la) (foto|imagen)/.test(q) ||
        /clasifica (esta|la) (foto|imagen)/.test(q) ||
        /entrena(r)? (la |el )?(cnn|modelo|red)/.test(q)
    ) {
        return 'rechazo_diagnostico';
    }

    if (/fungicid|comprar producto|tienda|que producto aplico|marca comercial|agroquim|vender/.test(q)) {
        return 'rechazo_comercial';
    }

    if (/correccion|etiqueta humana|dataset|aportar/.test(q)) {
        return 'correccion';
    }

    if (/explica|resultado|confianza|tres capas|3 capas|que significa/.test(q)) {
        return 'explicar';
    }

    if (/otra (foto|muestra)|repetir|guia de captura|luz|distancia|hoja entera/.test(q)) {
        return 'nueva_muestra';
    }

    if (/tratar|protocolo|umbral|severidad foliar|practicas culturales|mitig/.test(q)) {
        return 'protocolo';
    }

    if (/hitl|validar|rechazar|revision tecnica/.test(q)) {
        return 'hitl';
    }

    return 'catalogo';
}

export function recuperarCatalogo(pregunta, diagnostico) {
    const queryTokens = tokens(pregunta);

    if (diagnostico?.clase && CATALOGO[diagnostico.clase]) {
        queryTokens.push(...tokens(diagnostico.clase), ...tokens(CATALOGO[diagnostico.clase].nombre));
    }

    const ranked = Object.entries(CATALOGO)
        .map(([clase, ficha]) => {
            const haystack = normalizar(
                [clase, ficha.codigo, ficha.nombre, ficha.agente_causal, ficha.sintomas, ficha.condiciones || '', ...(ficha.practicas || [])].join(' '),
            );
            let score = 0;

            for (const token of queryTokens) {
                if (haystack.includes(token)) {
                    score += 1;
                }
            }

            if (diagnostico?.clase === clase) {
                score += 3;
            }

            return { clase, ficha, score };
        })
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score);

    if (ranked.length === 0 && diagnostico?.clase && CATALOGO[diagnostico.clase]) {
        return [{ clase: diagnostico.clase, ficha: CATALOGO[diagnostico.clase], score: 1 }];
    }

    return ranked.slice(0, 2);
}

function citasDe(docs) {
    return docs.map((doc) => ({
        codigo: doc.ficha.codigo,
        nombre: doc.ficha.nombre,
        clase: doc.clase,
    }));
}

function base(partial) {
    return {
        citas: [],
        acciones: [],
        afirma_roya: false,
        fuente: FUENTE,
        no_analiza_foto: true,
        version: AGENTE_VERSION,
        ...partial,
    };
}

function filtrarAcciones(acciones, staff) {
    if (staff) {
        return acciones;
    }

    return acciones.filter((accion) => !STAFF_ONLY.has(accion.id));
}

function capasTexto(diagnostico) {
    const label = CLASE_LABELS[diagnostico.clase] || diagnostico.clase;
    const sev = diagnostico.severidad == null || diagnostico.severidad === '' ? 'N/D (la estima el tecnico en campo)' : `${diagnostico.severidad}%`;

    return `Capa 1 clase: ${label}. Capa 2 confianza: ${diagnostico.confianza}% (umbral ${UMBRAL_CONFIANZA}%). Capa 3 severidad foliar: ${sev}. Confianza y severidad no se mezclan.`;
}

export function registrarCorreccion({ diagnostico, etiqueta_humana }) {
    if (!diagnostico?.uuid_local) {
        throw new Error('diagnostico requerido');
    }

    if (!ETIQUETAS_HUMANAS.includes(etiqueta_humana)) {
        throw new Error('etiqueta_humana invalida');
    }

    return {
        uuid_local: diagnostico.uuid_local,
        etiqueta_modelo: diagnostico.clase,
        etiqueta_humana,
        destino: 'cola_laboratorio',
        entrena_en_dispositivo: false,
        aviso: 'La etiqueta queda en cola local para reentrenar el modelo en laboratorio. No entrena la CNN en el celular.',
    };
}

function explicar(diagnostico, docs) {
    if (!diagnostico) {
        return base({
            texto: 'Selecciona un caso de la bandeja HITL. Explico el resultado del ONNX (clase, confianza, severidad) y cito el catalogo. No analizo la foto.',
            intencion: 'explicar',
            acciones: [{ id: 'hitl', label: 'Abrir bandeja HITL' }],
        });
    }

    const ficha = CATALOGO[diagnostico.clase] || CATALOGO.no_concluyente;
    const afirma = puedeAfirmarRoya(diagnostico);
    const partes = [capasTexto(diagnostico)];

    if (!sistemaAfirma(diagnostico) || diagnostico.clase === 'no_concluyente') {
        partes.push('El sistema no afirma diagnostico. No interpretar esto como Roya Amarilla.');
        partes.push(`Catalogo ${ficha.codigo}: ${ficha.practicas[0]} ${ficha.practicas[1] || ''}`);
    } else if (afirma) {
        partes.push(`El modelo afirma ${CLASE_LABELS.roya_amarilla} (${ficha.codigo}, ${ficha.agente_causal}). El tecnico valida HITL antes de cualquier medida quimica.`);
        partes.push('La decision de tratar usa severidad foliar de campo, no la confianza del CNN.');
    } else {
        partes.push(`Catalogo ${ficha.codigo}: ${ficha.sintomas}`);
        partes.push(ficha.practicas[0]);
    }

    const acciones = [];

    if (diagnostico.clase === 'no_concluyente') {
        acciones.push({ id: 'resample', label: 'Pedir nueva muestra' });
        acciones.push({ id: 'guia', label: 'Ver guia de captura' });
    } else {
        acciones.push({ id: 'protocolo', label: 'Ver protocolo' });
        acciones.push({ id: 'validar', label: 'Validar HITL' });
    }

    return base({
        texto: partes.join(' '),
        citas: citasDe(docs.length ? docs : [{ clase: diagnostico.clase, ficha }]),
        acciones,
        intencion: 'explicar',
        afirma_roya: afirma,
    });
}

function nuevaMuestra(diagnostico, docs) {
    const texto = [
        'Para bajar no_concluyente: ' + GUIA_CAPTURA.join(' '),
        diagnostico?.clase === 'no_concluyente' || !sistemaAfirma(diagnostico)
            ? 'El sistema no afirma diagnostico. Pide otra foto; no trates ni alertes Roya.'
            : 'Si la foto es dudosa, el tecnico puede pedir nueva muestra sin cambiar la clase del ONNX.',
    ].join(' ');

    return base({
        texto,
        citas: citasDe(docs),
        acciones: [
            { id: 'resample', label: 'Pedir nueva muestra' },
            { id: 'guia', label: 'Ver guia de captura' },
            { id: 'campo', label: 'Ir a Campo (ONNX)' },
        ],
        intencion: 'nueva_muestra',
        afirma_roya: puedeAfirmarRoya(diagnostico),
    });
}

function protocolo(diagnostico, docs) {
    const clase = diagnostico?.clase || docs[0]?.clase || 'roya_amarilla';
    const proto = protocoloPara({
        clase,
        confianza: diagnostico?.confianza ?? (clase === 'no_concluyente' ? 40 : 80),
        severidad: diagnostico?.severidad ?? null,
        hitl_status: diagnostico?.hitl_status || 'pending',
    });
    const practicas = proto.ficha.practicas.join(' ');

    return base({
        texto: `${proto.ficha.codigo} ${proto.ficha.nombre}. ${proto.cuandoTratar} Practicas: ${practicas}${proto.avisoHitl ? ` ${proto.avisoHitl}` : ''} El CNN no vende fungicidas.`,
        citas: citasDe(docs.length ? docs : [{ clase: proto.ficha === CATALOGO[clase] ? clase : docs[0]?.clase, ficha: proto.ficha }].filter((d) => d.ficha)),
        acciones: [
            { id: 'protocolo', label: 'Ver protocolo' },
            { id: 'validar', label: 'Validar HITL' },
        ],
        intencion: 'protocolo',
        afirma_roya: puedeAfirmarRoya(diagnostico),
    });
}

function hitl(diagnostico, docs, staff) {
    const partes = [
        'HITL: el tecnico explica el resultado, pide otra foto o cita el catalogo. No reemplaza al ONNX ni entrena la CNN en el celular.',
    ];

    if (diagnostico) {
        partes.push(capasTexto(diagnostico));
        if (!sistemaAfirma(diagnostico)) {
            partes.push('El sistema no afirma diagnostico. Prioriza pedir nueva muestra.');
        }
    }

    const acciones = staff
        ? [
              { id: 'validar', label: 'Validar' },
              { id: 'rechazar', label: 'Rechazar' },
              { id: 'resample', label: 'Pedir nueva muestra' },
              { id: 'correccion', label: 'Aportar correccion' },
          ]
        : [{ id: 'protocolo', label: 'Ver protocolo' }];

    return base({
        texto: partes.join(' '),
        citas: citasDe(docs),
        acciones,
        intencion: 'hitl',
        afirma_roya: puedeAfirmarRoya(diagnostico),
    });
}

function correccion(diagnostico, docs) {
    return base({
        texto: diagnostico
            ? `Etiqueta humana para ${diagnostico.uuid_local || 'el caso'}: se guarda en cola de laboratorio (dataset versionado). No hay boton de entrenar CNN en la PWA.`
            : 'Aportar correccion guarda una etiqueta humana en cola local para reentrenar en laboratorio. No diagnostica ni entrena en el celular.',
        citas: citasDe(docs),
        acciones: [{ id: 'correccion', label: 'Aportar correccion' }],
        intencion: 'correccion',
        afirma_roya: puedeAfirmarRoya(diagnostico),
    });
}

function catalogo(docs, diagnostico) {
    if (!docs.length) {
        return base({
            texto: 'No hay ficha del catalogo para esa consulta. Prueba con Roya Amarilla, sana, otra enfermedad o no concluyente. No analizo fotos.',
            intencion: 'catalogo',
            acciones: [{ id: 'protocolo', label: 'Ver protocolo' }],
        });
    }

    const top = docs[0].ficha;
    const afirma = puedeAfirmarRoya(diagnostico);
    const extra =
        diagnostico && !sistemaAfirma(diagnostico)
            ? ' El sistema no afirma diagnostico en el caso seleccionado; esta ficha es consulta, no un hallazgo de la foto.'
            : '';

    return base({
        texto: `${top.codigo} ${top.nombre}. Agente causal: ${top.agente_causal}. Sintomas: ${top.sintomas}. Practicas: ${top.practicas.join(' ')}.${extra}`,
        citas: citasDe(docs),
        acciones: [{ id: 'protocolo', label: 'Ver protocolo' }],
        intencion: 'catalogo',
        afirma_roya: afirma,
    });
}

export function consultarAgente({ pregunta, diagnostico = null, rol = 'agricultor' } = {}) {
    const staff = rol === 'tecnico' || rol === 'administrador';
    const intencion = detectarIntencion(pregunta);
    const docs = recuperarCatalogo(pregunta, diagnostico);

    let respuesta;

    if (intencion === 'vacio') {
        respuesta = base({
            texto: 'Escribe una consulta sobre el catalogo (sintomas, umbral, captura) o selecciona un caso HITL. No analizo la foto.',
            intencion,
        });
    } else if (intencion === 'rechazo_diagnostico') {
        respuesta = base({
            texto: 'No diagnostico fotos ni reemplazo al ONNX. Captura en Campo: el modelo local da clase, confianza y severidad. Aqui cito el catalogo y ayudo al tecnico HITL.',
            intencion,
            acciones: [
                { id: 'campo', label: 'Ir a Campo (ONNX)' },
                { id: 'guia', label: 'Ver guia de captura' },
            ],
        });
    } else if (intencion === 'rechazo_comercial') {
        respuesta = base({
            texto: 'El CNN no vende fungicidas. El protocolo usa practicas culturales y umbral de severidad foliar, no la confianza del modelo. El tecnico valida HITL antes de aplicar cualquier medida quimica.',
            intencion,
            citas: citasDe(docs.length ? docs : recuperarCatalogo('roya amarilla', diagnostico)),
            acciones: [{ id: 'protocolo', label: 'Ver protocolo' }],
        });
    } else if (intencion === 'explicar') {
        respuesta = explicar(diagnostico, docs);
    } else if (intencion === 'nueva_muestra') {
        respuesta = nuevaMuestra(diagnostico, docs);
    } else if (intencion === 'protocolo') {
        respuesta = protocolo(diagnostico, docs);
    } else if (intencion === 'hitl') {
        respuesta = hitl(diagnostico, docs, staff);
    } else if (intencion === 'correccion') {
        respuesta = correccion(diagnostico, docs);
    } else {
        respuesta = catalogo(docs, diagnostico);
    }

    respuesta.acciones = filtrarAcciones(respuesta.acciones, staff);
    respuesta.afirma_roya = puedeAfirmarRoya(diagnostico);

    if (!respuesta.afirma_roya && /hay roya/i.test(respuesta.texto)) {
        respuesta.texto = respuesta.texto.replace(/hay roya( amarilla)?/gi, 'posible hallazgo no afirmado');
    }

    return respuesta;
}
