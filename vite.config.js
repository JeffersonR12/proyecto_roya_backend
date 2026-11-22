import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { checkMeta } from './scripts/model-meta.mjs';
import { MODELO_VERSION } from './resources/js/lib/inference.js';

// onnxruntime-web no exporta su package.json; se lee del disco.
const ORT_VERSION = JSON.parse(readFileSync('node_modules/onnxruntime-web/package.json', 'utf8')).version;

// Identificador del build: el despliegue puede fijarlo (BUILD_ID=<git sha>);
// si no, cada build recibe uno nuevo y los telefonos ven "Hay una version nueva".
const BUILD_ID = process.env.BUILD_ID || new Date().toISOString().replace(/\D/g, '').slice(0, 14);

const REQUIRED_EDGE_FILES = [
    'public/onnx/ort-wasm-simd-threaded.wasm',
    'public/onnx/ort-wasm-simd-threaded.mjs',
    'public/models/modelo_roya.onnx',
    'public/models/modelo_roya.json',
];

/**
 * Corta el build si la PWA no podria diagnosticar sin red: faltan los
 * binarios de ORT, el modelo, o su JSON no coincide con el modelo real.
 */
function edgeAssetsGuard() {
    return {
        name: 'roya-edge-assets-guard',
        apply: 'build',
        async buildStart() {
            const missing = REQUIRED_EDGE_FILES.filter((file) => !existsSync(file));
            const problems = missing.map((file) => `Falta ${file}.`);

            if (!missing.includes('public/models/modelo_roya.onnx')) {
                problems.push(...(await checkMeta()));
            }

            if (problems.length > 0) {
                this.error(
                    [
                        'La PWA no puede diagnosticar sin red con este build:',
                        ...problems.map((problem) => `  - ${problem}`),
                        'Binarios ORT: npm run copy:ort. Metadatos del modelo: npm run modelo:meta.',
                    ].join('\n'),
                );
            }
        },
        // public/build/version.json: lo consulta resources/js/lib/pwa.js para detectar despliegues.
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: 'version.json',
                source: `${JSON.stringify({ build: BUILD_ID, modelo: MODELO_VERSION, ort: ORT_VERSION })}\n`,
            });
        },
    };
}

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
        edgeAssetsGuard(),
    ],
    define: {
        __BUILD_ID__: JSON.stringify(BUILD_ID),
        __ORT_VERSION__: JSON.stringify(ORT_VERSION),
    },
    optimizeDeps: {
        exclude: ['onnxruntime-web'],
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
