import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'node_modules', 'onnxruntime-web', 'dist');
const dest = join(root, 'public', 'onnx');

if (!existsSync(dist)) {
    console.warn('onnxruntime-web no está instalado; omite copia WASM');
    process.exit(0);
}

mkdirSync(dest, { recursive: true });

const names = readdirSync(dist).filter((name) =>
    /\.(wasm|mjs)$/i.test(name) && /wasm/i.test(name),
);

if (names.length === 0) {
    throw new Error('No se encontraron artefactos WASM de onnxruntime-web');
}

for (const name of names) {
    copyFileSync(join(dist, name), join(dest, name));
}

console.log(`ORT WASM copiado: ${names.join(', ')}`);
