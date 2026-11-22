import { CLASES, INPUT_SIZE, MODELO_VERSION } from './inference.js';

// El ?v= hace que un modelo nuevo nunca se sirva desde la cache del modelo
// anterior. public/sw.js precachea exactamente estas mismas URLs.
const v = encodeURIComponent(MODELO_VERSION);
export const MODEL_URL = `/models/modelo_roya.onnx?v=${v}`;
export const MODEL_META_URL = `/models/modelo_roya.json?v=${v}`;

/** El modelo existe pero no es el que este cliente espera: no se usa. */
export class ModeloIncompatibleError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ModeloIncompatibleError';
    }
}

/**
 * Compara modelo_roya.json con las constantes del cliente.
 *
 * @returns {string[]} problemas encontrados (vacio si coincide)
 */
export function problemasMetadatos(meta, esperado = { version: MODELO_VERSION, clases: CLASES, inputSize: INPUT_SIZE }) {
    if (!meta || typeof meta !== 'object') {
        return ['modelo_roya.json no es válido.'];
    }

    const problemas = [];

    if (meta.version !== esperado.version) {
        problemas.push(`la versión del modelo es "${meta.version}" y la app espera "${esperado.version}"`);
    }

    if (JSON.stringify(meta.clases) !== JSON.stringify(esperado.clases)) {
        problemas.push(`las clases del modelo (${(meta.clases ?? []).join(', ')}) no son las de la app (${esperado.clases.join(', ')})`);
    }

    if (Array.isArray(meta.entrada) && meta.entrada[3] !== esperado.inputSize) {
        problemas.push(`la entrada del modelo es ${meta.entrada[3]} px y la app usa ${esperado.inputSize} px`);
    }

    return problemas;
}

export async function sha256Hex(buffer, subtle = globalThis.crypto?.subtle) {
    // crypto.subtle solo existe en contextos seguros (HTTPS o localhost).
    if (!subtle) {
        return null;
    }

    const digest = await subtle.digest('SHA-256', buffer);

    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Lanza ModeloIncompatibleError si el modelo descargado no es el declarado
 * en su JSON o el JSON no corresponde a esta version de la app.
 */
export async function verificarModelo(meta, bytes, { subtle = globalThis.crypto?.subtle } = {}) {
    const problemas = problemasMetadatos(meta);

    if (Number.isInteger(meta?.bytes) && meta.bytes !== bytes.byteLength) {
        problemas.push(`el archivo pesa ${bytes.byteLength} bytes y el JSON declara ${meta.bytes}`);
    }

    if (problemas.length === 0 && meta.sha256) {
        const hash = await sha256Hex(bytes, subtle);

        if (hash !== null && hash !== meta.sha256) {
            problemas.push('la huella sha256 del archivo no coincide con modelo_roya.json');
        }
    }

    if (problemas.length > 0) {
        throw new ModeloIncompatibleError(`El modelo descargado no es válido: ${problemas.join('; ')}.`);
    }

    return true;
}
