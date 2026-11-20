import { createRequire } from 'node:module';
import { defineConfig } from 'cypress';

// package.json usa "type": "module"; el plugin del reporter se publica en CommonJS.
const require = createRequire(import.meta.url);

export default defineConfig({
    e2e: {
        // Laravel servido con: php artisan serve --port=8090
        baseUrl: 'http://127.0.0.1:8090',
        specPattern: 'cypress/e2e/**/*.cy.js',
        supportFile: 'cypress/support/e2e.js',
        setupNodeEvents(on, config) {
            require('cypress-mochawesome-reporter/plugin')(on);
            return config;
        },
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    defaultCommandTimeout: 10000,
    // La primera inferencia descarga el modelo ONNX (~6 MB) y el runtime WASM.
    pageLoadTimeout: 60000,
    retries: { runMode: 0, openMode: 0 },
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
        reportDir: 'cypress/reports',
        reportPageTitle: 'RiwiScan - Pruebas E2E con Cypress',
        reportTitle: 'RiwiScan - Deteccion temprana de Roya Amarilla',
        charts: true,
        embeddedScreenshots: true,
        inlineAssets: true,
        saveAllAttempts: false,
    },
});
