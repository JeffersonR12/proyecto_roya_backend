import {
    CLASES,
    IMAGENET_MEAN,
    IMAGENET_STD,
    INPUT_SIZE,
    MODELO_VERSION,
    fromLogits,
} from './inference.js';
import { MODEL_META_URL, MODEL_URL, ModeloIncompatibleError, verificarModelo } from './modelo.js';

let sessionPromise = null;
let ortModule = null;

async function getOrt() {
    if (!ortModule) {
        const loaded = await import('onnxruntime-web/wasm');
        ortModule = loaded.env ? loaded : loaded.default;
        ortModule.env.wasm.wasmPaths = '/onnx/';
        ortModule.env.wasm.numThreads = 1;
        ortModule.env.wasm.simd = true;
    }

    return ortModule;
}

export function imageToNCHW(imageEl) {
    const canvas = document.createElement('canvas');
    canvas.width = INPUT_SIZE;
    canvas.height = INPUT_SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
        throw new Error('No se pudo crear el canvas de preprocesado');
    }

    ctx.drawImage(imageEl, 0, 0, INPUT_SIZE, INPUT_SIZE);
    const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
    const plane = INPUT_SIZE * INPUT_SIZE;
    const tensor = new Float32Array(3 * plane);

    for (let i = 0; i < plane; i += 1) {
        tensor[i] = (data[i * 4] / 255 - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
        tensor[plane + i] = (data[i * 4 + 1] / 255 - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
        tensor[plane * 2 + i] = (data[i * 4 + 2] / 255 - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
    }

    return tensor;
}

async function fetchModelo() {
    const [metaResponse, modelResponse] = await Promise.all([fetch(MODEL_META_URL), fetch(MODEL_URL)]);

    if (!modelResponse.ok) {
        // Conserva "404" en el mensaje: isModelMissing lo usa para el modo sin pesos.
        throw new Error(`${modelResponse.status} al descargar ${MODEL_URL}`);
    }

    if (!metaResponse.ok) {
        throw new ModeloIncompatibleError('Falta modelo_roya.json en el servidor: no se puede verificar el modelo.');
    }

    const meta = await metaResponse.json();
    const bytes = new Uint8Array(await modelResponse.arrayBuffer());
    await verificarModelo(meta, bytes);

    return bytes;
}

export async function loadSession() {
    if (!sessionPromise) {
        sessionPromise = Promise.all([getOrt(), fetchModelo()])
            .then(([ort, bytes]) =>
                ort.InferenceSession.create(bytes, {
                    executionProviders: ['wasm'],
                }),
            )
            .catch((error) => {
                sessionPromise = null;
                throw error;
            });
    }

    return sessionPromise;
}

export async function inferImage(imageEl) {
    try {
        const ort = await getOrt();
        const session = await loadSession();
        const inputName = session.inputNames[0];
        const outputName = session.outputNames[0];
        const tensor = imageToNCHW(imageEl);
        const feeds = {
            [inputName]: new ort.Tensor('float32', tensor, [1, 3, INPUT_SIZE, INPUT_SIZE]),
        };
        const outputs = await session.run(feeds);
        const logits = Array.from(outputs[outputName].data).slice(0, CLASES.length);
        const prediccion = fromLogits(logits);

        return {
            ...prediccion,
            modelo_version: MODELO_VERSION,
            runtime: 'onnxruntime-web-wasm',
            latency_ms: null,
        };
    } catch (error) {
        if (!isModelMissing(error)) {
            throw error;
        }

        return {
            ...fromLogits([0, 0, 0]),
            modelo_version: `${MODELO_VERSION}+sin-pesos`,
            runtime: 'placeholder-uniform',
            latency_ms: null,
        };
    }
}

function isModelMissing(error) {
    if (error instanceof ModeloIncompatibleError) {
        return false;
    }

    const message = String(error?.message || error).toLowerCase();

    return (
        message.includes('404') ||
        message.includes('failed to fetch') ||
        message.includes('not found') ||
        message.includes('no found') ||
        message.includes('failed to load')
    );
}

export async function inferDataUrl(dataUrl) {
    const image = await loadImage(dataUrl);
    const started = performance.now();
    const prediccion = await inferImage(image);
    prediccion.latency_ms = Math.round(performance.now() - started);

    return prediccion;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
        image.src = src;
    });
}

export function describeEngineError(error) {
    const message = String(error?.message || error);

    if (error instanceof ModeloIncompatibleError) {
        return `${message} Recarga la app con internet para descargar el modelo correcto.`;
    }

    if (message.includes('404') || message.toLowerCase().includes('fetch') || message.toLowerCase().includes('failed to fetch')) {
        return 'No se encontró /models/modelo_roya.onnx. Coloca el ONNX exportado (MobileNetV3-Small, 3 clases) para activar la CNN.';
    }

    return `El runtime ONNX no pudo inferir: ${message}`;
}
