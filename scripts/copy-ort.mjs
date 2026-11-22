// Copia los binarios WASM de onnxruntime-web a public/onnx/ (no se versionan).
// Corre en postinstall (npm ci) y en prebuild. Si algo falta, falla con un
// mensaje claro: sin estos archivos la PWA no puede diagnosticar.
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'node_modules', 'onnxruntime-web', 'dist');
const dest = join(root, 'public', 'onnx');

/** Archivos que la PWA carga y el service worker precachea (igual que en vite.config.js). */
const REQUIRED_ORT_FILES = ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs'];

function fail(message) {
    console.error(`\n[copy-ort] ${message}\n`);
    process.exit(1);
}

if (!existsSync(dist)) {
    fail('onnxruntime-web no está instalado (falta node_modules/onnxruntime-web/dist). Ejecuta: npm ci');
}

mkdirSync(dest, { recursive: true });

const names = readdirSync(dist).filter((name) => /\.(wasm|mjs)$/i.test(name) && /wasm/i.test(name));
const missing = REQUIRED_ORT_FILES.filter((name) => !names.includes(name));

if (missing.length > 0) {
    fail(`onnxruntime-web no trae ${missing.join(', ')}. Revisa la versión instalada.`);
}

for (const name of names) {
    copyFileSync(join(dist, name), join(dest, name));
}

console.log(`ORT WASM copiado: ${names.join(', ')}`);
