// E2E-06 · Escaneo de hoja con inferencia ONNX local
// Funcionalidad real: components/Scanner.jsx -> lib/onnxEngine.js (ONNX Runtime Web, WASM)
//   -> lib/inference.js (softmax + umbral 75 %) -> lib/diagnosticosDb.js (IndexedDB 'roya-edge')
// Con el modelo placeholder (scripts/export_mobilenet_placeholder_onnx.py) los logits son [0,0,0]:
// confianza 33.33 % < 75 % -> clase 'no_concluyente' -> la UI pide repetir la foto.

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('E2E-06 · Escaneo de hoja con inferencia ONNX local', () => {
    beforeEach(() => {
        cy.loginAs('tecnico');
        cy.visitApp('/');
    });

    it('analiza hoja_trigo.jpg en el navegador, muestra "No concluyente" y la guarda en IndexedDB', () => {
        cy.leerDiagnosticosLocales().then((antes) => {
            // Paso 1 del asistente: lote.
            cy.contains('button', 'Seguir sin lote').click();
            // Paso 2: foto.
            cy.contains('h2', 'Toma la foto').should('be.visible');
            cy.get('input[type="file"]').selectFile('cypress/fixtures/hoja_trigo.jpg', { force: true });

            // Paso 3: resultado de la inferencia local.
            cy.get('.field-result', { timeout: 60000 })
                .should('be.visible')
                .and('contain', 'No pudimos ver bien la hoja')
                // Este texto solo aparece si ONNX Runtime falló (runtime 'placeholder-uniform').
                .and('not.contain', 'El análisis no está disponible en este equipo');
            cy.contains('Guardado en el teléfono').should('be.visible');
            cy.screenshot('E2E-06-resultado-no-concluyente');

            cy.leerDiagnosticosLocales().then((despues) => {
                expect(despues.length, 'diagnósticos en IndexedDB').to.eq(antes.length + 1);

                const previos = new Set(antes.map((row) => row.uuid_local));
                const nuevo = despues.find((row) => !previos.has(row.uuid_local));

                expect(nuevo.uuid_local).to.match(UUID_V4);
                expect(nuevo.clase).to.eq('no_concluyente');
                expect(Number(nuevo.confianza)).to.be.closeTo(33.33, 0.01);
                expect(nuevo.scores).to.have.all.keys('sana', 'roya_amarilla', 'otra_enfermedad');
                // Si ONNX Runtime no hubiera cargado el modelo, onnxEngine.js agrega '+sin-pesos'.
                expect(nuevo.modelo_version).to.eq('roya-mobilenetv3-small-v1');
                expect(nuevo.hitl_status).to.eq('pending');
                expect(nuevo.latitud).to.eq(null);
                expect(nuevo.imagen_thumb).to.match(/^data:image\//);
                // La cola (lib/syncQueue.js) puede sincronizar en segundo plano si hay conexión:
                // pending -> sending -> confirmed. 'error' indicaría un fallo de sincronización.
                expect(['pending', 'sending', 'confirmed']).to.include(nuevo.sync_status);

                cy.log(`uuid_local=${nuevo.uuid_local} sync_status=${nuevo.sync_status}`);
            });
        });
    });
});
