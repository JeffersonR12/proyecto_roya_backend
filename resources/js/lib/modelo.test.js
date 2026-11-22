import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CLASES, MODELO_VERSION } from './inference.js';
import { MODEL_META_URL, MODEL_URL, ModeloIncompatibleError, problemasMetadatos, sha256Hex, verificarModelo } from './modelo.js';

const bytes = new TextEncoder().encode('pesos-de-prueba');
const sha = createHash('sha256').update(bytes).digest('hex');
const meta = { version: MODELO_VERSION, sha256: sha, bytes: bytes.byteLength, clases: CLASES, entrada: [1, 3, 224, 224] };

describe('verificacion del modelo', () => {
    it('versiona las URLs del modelo con MODELO_VERSION', () => {
        expect(MODEL_URL).toBe(`/models/modelo_roya.onnx?v=${encodeURIComponent(MODELO_VERSION)}`);
        expect(MODEL_META_URL).toBe(`/models/modelo_roya.json?v=${encodeURIComponent(MODELO_VERSION)}`);
    });

    it('calcula sha256 en hexadecimal', async () => {
        expect(await sha256Hex(bytes)).toBe(sha);
        expect(await sha256Hex(bytes, null)).toBeNull();
    });

    it('acepta un modelo que coincide con su JSON y con la app', async () => {
        await expect(verificarModelo(meta, bytes)).resolves.toBe(true);
    });

    it('rechaza otra version de modelo', async () => {
        await expect(verificarModelo({ ...meta, version: 'roya-otro-v9' }, bytes)).rejects.toThrow(ModeloIncompatibleError);
        expect(problemasMetadatos({ ...meta, version: 'roya-otro-v9' })[0]).toContain('roya-otro-v9');
    });

    it('rechaza clases en otro orden', () => {
        expect(problemasMetadatos({ ...meta, clases: ['roya_amarilla', 'sana', 'otra_enfermedad'] })).toHaveLength(1);
    });

    it('rechaza un archivo alterado', async () => {
        const alterado = new TextEncoder().encode('pesos-de-prueba!');

        await expect(verificarModelo({ ...meta, bytes: alterado.byteLength }, alterado)).rejects.toThrow(/sha256/);
        await expect(verificarModelo(meta, alterado)).rejects.toThrow(/bytes/);
    });

    it('sin crypto.subtle (HTTP) verifica todo menos la huella', async () => {
        await expect(verificarModelo({ ...meta, sha256: 'x' }, bytes, { subtle: null })).resolves.toBe(true);
    });

    it('el JSON publicado coincide con el modelo del repo', () => {
        const publicado = JSON.parse(readFileSync('public/models/modelo_roya.json', 'utf8'));
        const modelo = readFileSync('public/models/modelo_roya.onnx');

        expect(problemasMetadatos(publicado)).toEqual([]);
        expect(publicado.sha256).toBe(createHash('sha256').update(modelo).digest('hex'));
    });
});
