# TRZ-003-003 — Inferencia local (Edge AI) con ONNX Runtime Web, sin depender del servidor.

- **INTENT:** INT-003 Captura e Inferencia IA en el Borde (Edge AI)
- **BriefingScript:** Inferencia local (Edge AI) con ONNX Runtime Web, sin depender del servidor.
- **Artefacto Destino:** onnxEngine.js (ONNX Runtime Web, WASM)
- **Ruta del Archivo:**
  - `resources/js/lib/onnxEngine.js`
  - `scripts/copy-ort.mjs`
- **Método / función:** getOrt(), wasmBaseUrl(), loadSession(), inferImage(), inferDataUrl(), isModelMissing()
- **Modelo IA Usado:** Cursor (modelo no especificado) (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** Edge AI / Frontend
- **Responsable:** Jefferson
- **HU / Ticket:** T-15 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-003-003:**
  - Commit: 210a1b2
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Vitest onnxEngine.test.js: 14/14; Cypress E2E-06: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): onnxEngine.js 99.2 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:c12da2cdadb2d89c63b6a9663237fe2ffa0906e6c34e56ebc82295e58fc15c7f`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • El modelo publicado public/models/modelo_roya.onnx (SHA-256 870c4230…) es un placeholder; el modelo entrenado documentado en Docs/10 tiene SHA-256 1cf92a1f… y no está versionado (.gitignore).
  • Cambios locales sin commit en onnxEngine.js (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • Publicar el modelo entrenado (SHA-256 1cf92a1f…) en public/models para que la inferencia sea representativa.
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-003 Captura e Inferencia IA en el Borde (Edge AI) en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-15: Implementar inferencia local con runtime optimizado. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-15 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/10_Iteracion_03_Primer_Entrenamiento_CNN.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7<br>Cambios locales sin commit en: resources/js/lib/onnxEngine.js |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Vitest onnxEngine.test.js: 14/14; Cypress E2E-06: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): onnxEngine.js 99.2 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | resources/js/lib/onnxEngine.js → lógica pura del cliente (lib/); scripts/copy-ort.mjs → script de ML (scripts/) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: lógica pura del cliente (lib/), script de ML (scripts/). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-003-003 |
| 4.1 ¿Requerimiento con ID? | Sí | T-15 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7<br>Cambios locales sin commit en: resources/js/lib/onnxEngine.js |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Vitest onnxEngine.test.js: 14/14; Cypress E2E-06: 1/1 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | No | Requirió correcciones detectadas en pruebas: DEF-01 (wasmPaths relativo bajo Vite dev → wasmBaseUrl absoluto) y DEF-02 (isModelMissing ocultaba errores del runtime). Docs/13 §6.4. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | Sí | npm audit --omit=dev (2026-11-16): 0 vulnerabilidades en 66 dependencias de producción. SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | Vitest onnxEngine.test.js: 14/14; Cypress E2E-06: 1/1 (2026-11-12) |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 87.5 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*
