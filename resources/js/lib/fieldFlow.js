// Lógica de presentación del flujo de campo (lote → foto → resultado).
// Sin dependencias de React para poder probarla en vitest (environment: node).

const LANG_KEY = 'riwiscan-lang';

export const COPY = {
    es: {
        hello: (name) => `Hola, ${name}`,
        helloSub: '¿Revisamos un lote hoy?',
        worksOffline: 'Funciona sin internet',
        statTotal: 'Revisiones',
        statRoya: 'Con roya',
        statRepeat: 'Por repetir',
        finding: {
            roya: (n, lote) =>
                n === 1 ? `1 hoja con posible roya en ${lote} espera al técnico.` : `${n} hojas con posible roya en ${lote} esperan al técnico.`,
            revisada: 'Las hojas con roya ya tienen revisión del técnico.',
            repetir: (n) =>
                n === 1 ? '1 foto salió poco clara. Repítela cuando puedas.' : `${n} fotos salieron poco claras. Repítelas cuando puedas.`,
            limpio: 'Sin roya en tus revisiones. Sigue recorriendo tus lotes.',
            vacio: 'Aún no hay revisiones. Empieza por tu primer lote.',
        },
        summaryTitle: 'Tu resumen',
        recentTitle: 'Últimas revisiones',
        recentEmpty: 'Tus revisiones aparecerán aquí.',
        viewAll: 'Ver todo',
        short: { sana: 'Sana', roya: 'Posible roya', otra: 'Otra enfermedad', repetir: 'Repetir foto' },
        sync: { all: 'Todo enviado', pending: (n) => (n === 1 ? '1 por enviar' : `${n} por enviar`) },
        openCamera: 'Abrir cámara',
        dropHint: 'o arrastra una foto aquí',
        steps: ['Lote', 'Foto', 'Resultado'],
        whereTitle: '¿Dónde estás?',
        whereEmpty: 'Crea tu primer lote para empezar',
        newLote: 'Nuevo lote',
        newLotePlaceholder: 'Nombre del lote',
        createLote: 'Crear',
        skipLote: 'Seguir sin lote',
        changeLote: 'Cambiar',
        noLote: 'Sin lote',
        photoTitle: 'Toma la foto',
        tapToOpen: 'Toca aquí para abrir la cámara',
        frameHint: 'Pon una hoja dentro del marco',
        shutter: 'Tomar foto',
        upload: 'Subir una foto',
        cameraBlocked: 'No pudimos abrir la cámara. Sube una foto.',
        badFile: 'Elige una foto (JPG, PNG o WEBP).',
        analyzing: 'Revisando la hoja…',
        cancel: 'Cancelar',
        saved: 'Guardado en el teléfono',
        scanAgain: 'Escanear otra hoja',
        retake: 'Tomar otra foto',
        whatToDo: 'Ver qué hacer',
        history: 'Ver historial',
        sure: { alto: 'Muy seguro', medio: 'Bastante seguro', bajo: 'Poco seguro' },
        tipsTitle: 'Consejos para una buena foto',
        tryTip: 'Prueba esto:',
        unavailable: 'El análisis no está disponible en este equipo. Avisa al técnico.',
        analysisFailed: 'No pudimos revisar la foto. Intenta de nuevo.',
        results: {
            sana: { title: 'Hoja sana', text: 'No vemos señales de roya. Sigue revisando tu lote.' },
            roya: { title: 'Posible roya amarilla', text: 'Un técnico confirmará el resultado. Mira qué hacer ahora.' },
            otra: { title: 'Puede ser otra enfermedad', text: 'Un técnico revisará esta hoja.' },
            repetir: { title: 'No pudimos ver bien la hoja', text: 'Toma otra foto. Esto no quiere decir que haya roya.' },
        },
        tips: {
            luz: 'Luz natural',
            distancia: 'A 20–30 cm',
            una: 'Una sola hoja',
            dedos: 'Sin dedos encima',
        },
        nav: { campo: 'Campo', historial: 'Historial', alertas: 'Alertas', parcelas: 'Lotes', mas: 'Más' },
        time: {
            now: 'hace un momento',
            minutes: (n) => `hace ${n} min`,
            hours: (n) => (n === 1 ? 'hace 1 hora' : `hace ${n} horas`),
            yesterday: 'ayer',
            days: (n) => `hace ${n} días`,
        },
        alerts: {
            title: 'Alertas',
            allGood: 'Todo bien en tus lotes ✓',
            needAttention: (n) => (n === 1 ? 'Tienes 1 lote que necesita atención' : `Tienes ${n} lotes que necesitan atención`),
            onlyInfo: 'Nada urgente por ahora',
            sections: { urgente: 'Urgente', revisar: 'Para revisar', info: 'Información' },
            noLote: 'Lote sin nombre',
            royaTitle: (lote) => `Posible roya amarilla en ${lote}`,
            leaves: (n) => (n === 1 ? '1 hoja afectada' : `${n} hojas afectadas`),
            waiting: 'Esperando al técnico',
            confirmed: 'Confirmado por el técnico',
            actionProtocol: 'Ver qué hacer',
            reviewTitle: (n) => (n === 1 ? '1 hoja espera tu revisión' : `${n} hojas esperan tu revisión`),
            actionReview: 'Revisar ahora',
            sendErrorTitle: (n) => (n === 1 ? 'No pudimos enviar 1 revisión' : `No pudimos enviar ${n} revisiones`),
            sendErrorText: 'Siguen guardadas en el teléfono.',
            actionRetry: 'Reintentar',
            queuedTitle: (n) => (n === 1 ? '1 revisión guardada en el teléfono' : `${n} revisiones guardadas en el teléfono`),
            queuedText: 'Se enviarán solas cuando haya internet.',
            newBadge: 'Nuevo',
            emptyTitle: 'No hay alertas.',
            emptyText: 'Tus lotes están bien.',
            emptyAction: 'Revisar un lote',
        },
    },
    en: {
        hello: (name) => `Hi, ${name}`,
        helloSub: 'Shall we check a field today?',
        worksOffline: 'Works without internet',
        statTotal: 'Checks',
        statRoya: 'With rust',
        statRepeat: 'To retake',
        finding: {
            roya: (n, lote) =>
                n === 1 ? `1 leaf with possible rust in ${lote} awaits the technician.` : `${n} leaves with possible rust in ${lote} await the technician.`,
            revisada: 'Leaves with rust have already been reviewed.',
            repetir: (n) => (n === 1 ? '1 photo was unclear. Retake it when you can.' : `${n} photos were unclear. Retake them when you can.`),
            limpio: 'No rust in your checks. Keep walking your fields.',
            vacio: 'No checks yet. Start with your first field.',
        },
        summaryTitle: 'Your summary',
        recentTitle: 'Latest checks',
        recentEmpty: 'Your checks will show up here.',
        viewAll: 'View all',
        short: { sana: 'Healthy', roya: 'Possible rust', otra: 'Other disease', repetir: 'Retake' },
        sync: { all: 'All sent', pending: (n) => `${n} to send` },
        openCamera: 'Open camera',
        dropHint: 'or drop a photo here',
        steps: ['Field', 'Photo', 'Result'],
        whereTitle: 'Where are you?',
        whereEmpty: 'Create your first field to start',
        newLote: 'New field',
        newLotePlaceholder: 'Field name',
        createLote: 'Create',
        skipLote: 'Continue without field',
        changeLote: 'Change',
        noLote: 'No field',
        photoTitle: 'Take the photo',
        tapToOpen: 'Tap here to open the camera',
        frameHint: 'Place one leaf inside the frame',
        shutter: 'Take photo',
        upload: 'Upload a photo',
        cameraBlocked: 'We could not open the camera. Upload a photo.',
        badFile: 'Choose a photo (JPG, PNG or WEBP).',
        analyzing: 'Checking the leaf…',
        cancel: 'Cancel',
        saved: 'Saved on this phone',
        scanAgain: 'Scan another leaf',
        retake: 'Take another photo',
        whatToDo: 'See what to do',
        history: 'See history',
        sure: { alto: 'Very sure', medio: 'Fairly sure', bajo: 'Not sure' },
        tipsTitle: 'Tips for a good photo',
        tryTip: 'Try this:',
        unavailable: 'Analysis is not available on this device. Tell your technician.',
        analysisFailed: 'We could not check the photo. Try again.',
        results: {
            sana: { title: 'Healthy leaf', text: 'No signs of rust. Keep checking your field.' },
            roya: { title: 'Possible yellow rust', text: 'A technician will confirm it. See what to do now.' },
            otra: { title: 'May be another disease', text: 'A technician will review this leaf.' },
            repetir: { title: 'We could not see the leaf well', text: 'Take another photo. This does not mean there is rust.' },
        },
        tips: {
            luz: 'Daylight',
            distancia: '20–30 cm away',
            una: 'One leaf only',
            dedos: 'No fingers on it',
        },
        nav: { campo: 'Field', historial: 'History', alertas: 'Alerts', parcelas: 'Fields', mas: 'More' },
        time: {
            now: 'just now',
            minutes: (n) => `${n} min ago`,
            hours: (n) => (n === 1 ? '1 hour ago' : `${n} hours ago`),
            yesterday: 'yesterday',
            days: (n) => `${n} days ago`,
        },
        alerts: {
            title: 'Alerts',
            allGood: 'All good in your fields ✓',
            needAttention: (n) => (n === 1 ? '1 field needs attention' : `${n} fields need attention`),
            onlyInfo: 'Nothing urgent for now',
            sections: { urgente: 'Urgent', revisar: 'To review', info: 'Information' },
            noLote: 'Unnamed field',
            royaTitle: (lote) => `Possible yellow rust in ${lote}`,
            leaves: (n) => (n === 1 ? '1 affected leaf' : `${n} affected leaves`),
            waiting: 'Waiting for technician',
            confirmed: 'Confirmed by technician',
            actionProtocol: 'See what to do',
            reviewTitle: (n) => (n === 1 ? '1 leaf awaits your review' : `${n} leaves await your review`),
            actionReview: 'Review now',
            sendErrorTitle: (n) => (n === 1 ? 'We could not send 1 check' : `We could not send ${n} checks`),
            sendErrorText: 'They are still saved on this phone.',
            actionRetry: 'Retry',
            queuedTitle: (n) => (n === 1 ? '1 check saved on this phone' : `${n} checks saved on this phone`),
            queuedText: 'They will be sent automatically when online.',
            newBadge: 'New',
            emptyTitle: 'No alerts.',
            emptyText: 'Your fields are fine.',
            emptyAction: 'Check a field',
        },
    },
};

export function getLang() {
    try {
        return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'es';
    } catch {
        return 'es';
    }
}

export function copyFor(lang = 'es') {
    return COPY[lang] || COPY.es;
}

export const TIP_IDS = ['luz', 'distancia', 'una', 'dedos'];

// Paso activo: 1 = elegir lote, 2 = foto, 3 = resultado.
// `loteDecidido` es true cuando hay lote o el usuario eligió seguir sin lote.
export function stepFor({ loteDecidido, hasImage, hasResult }) {
    if (hasResult) {
        return 3;
    }
    if (hasImage || loteDecidido) {
        return 2;
    }
    return 1;
}

// Semáforo del resultado. `runtime === 'placeholder-uniform'` significa que no hubo análisis real.
export function resultTone(prediccion) {
    if (!prediccion || prediccion.runtime === 'placeholder-uniform') {
        return 'repetir';
    }
    return (
        {
            sana: 'sana',
            roya_amarilla: 'roya',
            otra_enfermedad: 'otra',
        }[prediccion.clase] || 'repetir'
    );
}

// Tono de una revisión ya guardada (fila del historial), a partir de su clase.
export function toneDeClase(clase) {
    return { sana: 'sana', roya_amarilla: 'roya', otra_enfermedad: 'otra' }[clase] || 'repetir';
}

// El hallazgo que encabeza la pantalla de campo: lo que más necesita atención en los datos.
// Roya sin revisar manda; luego fotos por repetir; luego el estado tranquilo.
export function hallazgoCampo(rows = []) {
    if (rows.length === 0) {
        return { tipo: 'vacio' };
    }

    const roya = rows.filter((row) => row.clase === 'roya_amarilla');
    const sinRevisar = roya.filter((row) => ['pending', 'resample'].includes(row.hitl_status));
    if (sinRevisar.length > 0) {
        const ultima = sinRevisar.reduce(
            (best, row) => (String(row.created_at) > String(best.created_at) ? row : best),
            sinRevisar[0],
        );
        const lote = ultima.location || '';
        return { tipo: 'roya', lote, n: sinRevisar.filter((row) => (row.location || '') === lote).length };
    }

    const repetir = rows.filter((row) => toneDeClase(row.clase) === 'repetir').length;
    if (repetir > 0) {
        return { tipo: 'repetir', n: repetir };
    }

    return { tipo: roya.length > 0 ? 'revisada' : 'limpio' };
}

export const TONE_STYLE = {
    sana: { color: 'teal', icon: '✓' },
    roya: { color: 'rose', icon: '!' },
    otra: { color: 'gold', icon: '?' },
    repetir: { color: 'slate', icon: '↻' },
};

// Confianza como palabra, nunca como porcentaje.
export function seguridad(confianza) {
    const value = Number(confianza) || 0;
    if (value >= 90) {
        return 'alto';
    }
    if (value >= 75) {
        return 'medio';
    }
    return 'bajo';
}

// Consejo a mostrar cuando la foto no sirvió; rota para no repetir siempre el mismo.
export function consejoPara(intentosFallidos = 0) {
    return TIP_IDS[Math.abs(intentosFallidos) % TIP_IDS.length];
}
