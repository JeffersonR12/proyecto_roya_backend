import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INPUT_SIZE, MODELO_VERSION, UMBRAL_CONFIANZA } from './inference.js';

// ONNX Runtime Web simulado: el motor real necesita WASM y un navegador.
const ort = vi.hoisted(() => ({
    env: { wasm: {} },
    Tensor: vi.fn(function Tensor(type, data, dims) {
        this.type = type;
        this.data = data;
        this.dims = dims;
    }),
    InferenceSession: { create: vi.fn() },
}));

vi.mock('onnxruntime-web/wasm', () => ort);

const PLANE = INPUT_SIZE * INPUT_SIZE;

function stubCanvas({ rgb = [255, 128, 0], context = true } = {}) {
    const data = new Uint8ClampedArray(PLANE * 4);
    for (let i = 0; i < PLANE; i += 1) {
        data.set([...rgb, 255], i * 4);
    }
    const ctx = { drawImage: vi.fn(), getImageData: vi.fn(() => ({ data })) };
    vi.stubGlobal('document', {
        createElement: vi.fn(() => ({ getContext: vi.fn(() => (context ? ctx : null)) })),
    });

    return ctx;
}

function sessionWithLogits(logits) {
    return {
        inputNames: ['input'],
        outputNames: ['output'],
        run: vi.fn(async () => ({ output: { data: Float32Array.from(logits) } })),
    };
}

// Cada prueba importa una instancia nueva del módulo (sesión y runtime en caché se reinician).
async function engine() {
    return import('./onnxEngine.js');
}

beforeEach(() => {
    vi.resetModules();
    ort.env.wasm = {};
    ort.Tensor.mockClear();
    ort.InferenceSession.create.mockReset();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('imageToNCHW (preprocesado)', () => {
    it('convierte RGBA a tensor NCHW normalizado con media/desviación de ImageNet', async () => {
        const ctx = stubCanvas({ rgb: [255, 128, 0] });
        const { imageToNCHW } = await engine();

        const tensor = imageToNCHW({});

        expect(tensor).toBeInstanceOf(Float32Array);
        expect(tensor).toHaveLength(3 * PLANE);
        expect(ctx.drawImage).toHaveBeenCalledWith({}, 0, 0, INPUT_SIZE, INPUT_SIZE);
        expect(tensor[0]).toBeCloseTo((1 - 0.485) / 0.229, 5);
        expect(tensor[PLANE]).toBeCloseTo((128 / 255 - 0.456) / 0.224, 5);
        expect(tensor[2 * PLANE]).toBeCloseTo((0 - 0.406) / 0.225, 5);
    });

    it('falla con un mensaje claro si el navegador no entrega contexto 2D', async () => {
        stubCanvas({ context: false });
        const { imageToNCHW } = await engine();

        expect(() => imageToNCHW({})).toThrow('No se pudo crear el canvas de preprocesado');
    });
});

describe('loadSession', () => {
    it('configura el runtime WASM de un hilo y crea la sesión una sola vez', async () => {
        ort.InferenceSession.create.mockResolvedValue(sessionWithLogits([0, 0, 0]));
        const { loadSession } = await engine();

        const first = await loadSession();
        const second = await loadSession();

        expect(first).toBe(second);
        expect(ort.InferenceSession.create).toHaveBeenCalledTimes(1);
        expect(ort.InferenceSession.create).toHaveBeenCalledWith('/models/modelo_roya.onnx', {
            executionProviders: ['wasm'],
        });
        expect(ort.env.wasm).toMatchObject({ wasmPaths: '/onnx/', numThreads: 1, simd: true });
    });

    it('DEF-01: en el navegador apunta el runtime WASM al origen de la página, no al de Vite', async () => {
        vi.stubGlobal('location', { origin: 'http://127.0.0.1:8090' });
        ort.InferenceSession.create.mockResolvedValue(sessionWithLogits([0, 0, 0]));
        const { loadSession, wasmBaseUrl } = await engine();

        await loadSession();

        expect(ort.env.wasm.wasmPaths).toBe('http://127.0.0.1:8090/onnx/');
        expect(wasmBaseUrl('https://riwiscan.pe')).toBe('https://riwiscan.pe/onnx/');
        expect(wasmBaseUrl(null)).toBe('/onnx/');
    });

    it('no cachea un fallo: el siguiente intento vuelve a crear la sesión', async () => {
        ort.InferenceSession.create
            .mockRejectedValueOnce(new Error('red caída'))
            .mockResolvedValueOnce(sessionWithLogits([0, 0, 0]));
        const { loadSession } = await engine();

        await expect(loadSession()).rejects.toThrow('red caída');
        await expect(loadSession()).resolves.toBeDefined();
        expect(ort.InferenceSession.create).toHaveBeenCalledTimes(2);
    });
});

describe('inferImage', () => {
    it('ejecuta la CNN y devuelve la clase con mayor probabilidad sobre el umbral', async () => {
        stubCanvas();
        const session = sessionWithLogits([0.1, 6, 0.2, 99]);
        ort.InferenceSession.create.mockResolvedValue(session);
        const { inferImage } = await engine();

        const prediccion = await inferImage({});

        expect(ort.Tensor).toHaveBeenCalledWith('float32', expect.any(Float32Array), [1, 3, INPUT_SIZE, INPUT_SIZE]);
        expect(session.run).toHaveBeenCalledWith({ input: expect.any(ort.Tensor) });
        // El cuarto logit se descarta: el modelo tiene 3 clases.
        expect(Object.keys(prediccion.scores)).toEqual(['sana', 'roya_amarilla', 'otra_enfermedad']);
        expect(prediccion.clase).toBe('roya_amarilla');
        expect(prediccion.confianza).toBeGreaterThanOrEqual(UMBRAL_CONFIANZA);
        expect(prediccion.runtime).toBe('onnxruntime-web-wasm');
        expect(prediccion.modelo_version).toBe(MODELO_VERSION);
    });

    it('marca como no concluyente una predicción con confianza bajo el umbral', async () => {
        stubCanvas();
        ort.InferenceSession.create.mockResolvedValue(sessionWithLogits([0, 0, 0]));
        const { inferImage } = await engine();

        const prediccion = await inferImage({});

        expect(prediccion.clase).toBe('no_concluyente');
        expect(prediccion.confianza).toBeCloseTo(33.33, 2);
    });

    it('si falta el modelo (404) responde con el respaldo uniforme y lo marca como sin pesos', async () => {
        stubCanvas();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        ort.InferenceSession.create.mockRejectedValue(new Error('failed to load /models/modelo_roya.onnx: 404'));
        const { inferImage } = await engine();

        const prediccion = await inferImage({});

        expect(prediccion.runtime).toBe('placeholder-uniform');
        expect(prediccion.clase).toBe('no_concluyente');
        expect(prediccion.modelo_version).toBe(`${MODELO_VERSION}+sin-pesos`);
    });

    it('DEF-02: si el runtime WASM no carga, falla en vez de guardar un resultado falso', async () => {
        stubCanvas();
        ort.InferenceSession.create.mockRejectedValue(
            new Error(
                'no available backend found. ERR: [wasm] TypeError: Failed to fetch dynamically imported module: http://[::1]:5173/onnx/ort-wasm-simd-threaded.mjs',
            ),
        );
        const { inferImage, isModelMissing } = await engine();

        await expect(inferImage({})).rejects.toThrow('no available backend found');
        expect(isModelMissing(new Error('failed to fetch /models/modelo_roya.onnx (404)'))).toBe(true);
    });

    it('propaga cualquier otro error del runtime', async () => {
        stubCanvas();
        ort.InferenceSession.create.mockRejectedValue(new Error('WebAssembly: memoria insuficiente'));
        const { inferImage } = await engine();

        await expect(inferImage({})).rejects.toThrow('memoria insuficiente');
    });
});

describe('inferDataUrl', () => {
    function stubImage({ fail = false } = {}) {
        vi.stubGlobal(
            'Image',
            class {
                set src(value) {
                    this._src = value;
                    queueMicrotask(() => (fail ? this.onerror?.() : this.onload?.()));
                }
            },
        );
    }

    it('decodifica la imagen, infiere y mide la latencia', async () => {
        stubCanvas();
        stubImage();
        ort.InferenceSession.create.mockResolvedValue(sessionWithLogits([7, 0, 0]));
        const { inferDataUrl } = await engine();

        const prediccion = await inferDataUrl('data:image/jpeg;base64,AAAA');

        expect(prediccion.clase).toBe('sana');
        expect(prediccion.latency_ms).toBeTypeOf('number');
        expect(prediccion.latency_ms).toBeGreaterThanOrEqual(0);
    });

    it('rechaza una imagen que el navegador no puede decodificar', async () => {
        stubImage({ fail: true });
        const { inferDataUrl } = await engine();

        await expect(inferDataUrl('data:image/jpeg;base64,roto')).rejects.toThrow('No se pudo decodificar la imagen');
    });
});

describe('describeEngineError', () => {
    it('explica cómo activar la CNN cuando no se encuentra el modelo', async () => {
        const { describeEngineError } = await engine();

        expect(describeEngineError(new Error('HTTP 404'))).toContain('No se encontró /models/modelo_roya.onnx');
        expect(describeEngineError('Failed to fetch')).toContain('MobileNetV3-Small');
    });

    it('devuelve el detalle para cualquier otro error del runtime', async () => {
        const { describeEngineError } = await engine();

        expect(describeEngineError(new Error('tensor inválido'))).toBe('El runtime ONNX no pudo inferir: tensor inválido');
    });
});
