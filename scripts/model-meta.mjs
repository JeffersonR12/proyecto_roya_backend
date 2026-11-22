// Genera public/models/modelo_roya.json a partir del .onnx y de las
// constantes del cliente (MODELO_VERSION, CLASES, INPUT_SIZE).
// Uso: npm run modelo:meta            -> escribe el JSON
//      npm run modelo:meta -- --check -> falla si el JSON no coincide (lo usa el build)
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const MODEL_PATH = join(root, 'public', 'models', 'modelo_roya.onnx');
export const META_PATH = join(root, 'public', 'models', 'modelo_roya.json');

export async function expectedMeta() {
    const { CLASES, INPUT_SIZE, MODELO_VERSION } = await import(
        pathToFileURL(join(root, 'resources', 'js', 'lib', 'inference.js')).href
    );

    if (!existsSync(MODEL_PATH)) {
        throw new Error(`Falta ${MODEL_PATH}. Copia el ONNX exportado antes de generar sus metadatos.`);
    }

    const bytes = readFileSync(MODEL_PATH);

    return {
        version: MODELO_VERSION,
        archivo: 'modelo_roya.onnx',
        sha256: createHash('sha256').update(bytes).digest('hex'),
        bytes: statSync(MODEL_PATH).size,
        clases: CLASES,
        entrada: [1, 3, INPUT_SIZE, INPUT_SIZE],
    };
}

/**
 * Devuelve la lista de diferencias entre el JSON publicado y el modelo real.
 * La fecha no se compara: es informativa.
 */
export async function checkMeta() {
    const expected = await expectedMeta();

    if (!existsSync(META_PATH)) {
        return [`Falta ${META_PATH}. Ejecuta: npm run modelo:meta`];
    }

    const actual = JSON.parse(readFileSync(META_PATH, 'utf8'));

    return Object.keys(expected)
        .filter((key) => JSON.stringify(actual[key]) !== JSON.stringify(expected[key]))
        .map((key) => `modelo_roya.json: "${key}" no coincide (esperado ${JSON.stringify(expected[key])}).`);
}

async function main() {
    if (process.argv.includes('--check')) {
        const problems = await checkMeta();

        if (problems.length > 0) {
            console.error([...problems, 'Regenera los metadatos con: npm run modelo:meta'].join('\n'));
            process.exit(1);
        }

        console.log('modelo_roya.json coincide con el modelo.');

        return;
    }

    const meta = { ...(await expectedMeta()), fecha: new Date().toLocaleDateString('sv-SE') };
    writeFileSync(META_PATH, `${JSON.stringify(meta, null, 4)}\n`);
    console.log(`Escrito ${META_PATH} (${meta.version}, sha256 ${meta.sha256.slice(0, 12)}…)`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    await main();
}
