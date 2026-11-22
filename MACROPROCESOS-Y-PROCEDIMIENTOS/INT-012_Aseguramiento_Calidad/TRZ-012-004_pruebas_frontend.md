# TRZ-012-004 — Pruebas unitarias de frontend (106 casos: cola, inferencia, alertas, agente).

- **INTENT:** INT-012 Aseguramiento de la Calidad
- **BriefingScript:** Pruebas unitarias de frontend (106 casos: cola, inferencia, alertas, agente).
- **Artefacto Destino:** resources/js/lib/*.test.js (Vitest)
- **Ruta del Archivo:**
  - `vitest.config.js`
  - `resources/js/lib/agente.test.js`
  - `resources/js/lib/alertas.test.js`
  - `resources/js/lib/auth.test.js`
  - `resources/js/lib/authAlerts.test.js`
  - `resources/js/lib/catalogo.test.js`
  - `resources/js/lib/diagnosticosDb.test.js`
  - `resources/js/lib/fieldFlow.test.js`
  - `resources/js/lib/fieldOps.test.js`
  - `resources/js/lib/inference.test.js`
  - `resources/js/lib/onnxEngine.test.js`
  - `resources/js/lib/parcelasStore.test.js`
  - `resources/js/lib/pwa.test.js`
  - `resources/js/lib/reportes.test.js`
  - `resources/js/lib/risk.test.js`
  - `resources/js/lib/roles.test.js`
  - `resources/js/lib/syncQueue.test.js`
- **Método / función:** npm run test:js (Vitest, 16 archivos *.test.js)
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** QA / Testing
- **Responsable:** Jhoan
- **HU / Ticket:** T-03 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-012-004:**
  - Commit: 6a2e717, 06fc39b, e855ee3
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Vitest agente.test.js: 7/7; Vitest alertas.test.js: 13/13; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Vitest catalogo.test.js: 10/10; Vitest diagnosticosDb.test.js: 8/8; Vitest fieldFlow.test.js: 17/17; Vitest fieldOps.test.js: 5/5; Vitest inference.test.js: 13/13; Vitest onnxEngine.test.js: 14/14; Vitest parcelasStore.test.js: 8/8; Vitest pwa.test.js: 4/4; Vitest reportes.test.js: 6/6; Vitest risk.test.js: 5/5; Vitest roles.test.js: 3/3; Vitest syncQueue.test.js: 14/14
  - Análisis estático: Modificado después del análisis SonarQube del 2026-11-10: reportes.test.js. Requiere reanálisis.
  - Hash del BriefingScript: `sha256:65f24bc8b63836e0ccffeace1b933d1f54dab59d9b3b4325e263f9102a338f19`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • T-03 del backlog pide CI; las pruebas se ejecutan localmente, no hay pipeline de CI configurado.
  • Archivos sin seguimiento en Git: resources/js/lib/diagnosticosDb.test.js, resources/js/lib/onnxEngine.test.js, resources/js/lib/pwa.test.js, resources/js/lib/reportes.test.js, resources/js/lib/roles.test.js.
- **Puntos de mejora:**
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-012 Aseguramiento de la Calidad en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-03: Configurar CI con lint, pruebas unitarias y validación de build. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-03 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | No | Sin commit: resources/js/lib/diagnosticosDb.test.js, resources/js/lib/onnxEngine.test.js, resources/js/lib/pwa.test.js, resources/js/lib/reportes.test.js, resources/js/lib/roles.test.js<br>6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Vitest agente.test.js: 7/7; Vitest alertas.test.js: 13/13; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Vitest catalogo.test.js: 10/10; Vitest diagnosticosDb.test.js: 8/8; Vitest fieldFlow.test.js: 17/17; Vitest fieldOps.test.js: 5/5; Vitest inference.test.js: 13/13; Vitest onnxEngine.test.js: 14/14; Vitest parcelasStore.test.js: 8/8; Vitest pwa.test.js: 4/4; Vitest reportes.test.js: 6/6; Vitest risk.test.js: 5/5; Vitest roles.test.js: 3/3; Vitest syncQueue.test.js: 14/14 |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | vitest.config.js → suite o configuración de calidad; resources/js/lib/agente.test.js → lógica pura del cliente (lib/); resources/js/lib/alertas.test.js → lógica pura del cliente (lib/); resources/js/lib/auth.test.js → lógica pura del cliente (lib/); resources/js/lib/authAlerts.test.js → lógica pura del cliente (lib/); resources/js/lib/catalogo.test.js → lógica pura del cliente (lib/); resources/js/lib/diagnosticosDb.test.js → lógica pura del cliente (lib/); resources/js/lib/fieldFlow.test.js → lógica pura del cliente (lib/); resources/js/lib/fieldOps.test.js → lógica pura del cliente (lib/); resources/js/lib/inference.test.js → lógica pura del cliente (lib/); resources/js/lib/onnxEngine.test.js → lógica pura del cliente (lib/); resources/js/lib/parcelasStore.test.js → lógica pura del cliente (lib/); resources/js/lib/pwa.test.js → lógica pura del cliente (lib/); resources/js/lib/reportes.test.js → lógica pura del cliente (lib/); resources/js/lib/risk.test.js → lógica pura del cliente (lib/); resources/js/lib/roles.test.js → lógica pura del cliente (lib/); resources/js/lib/syncQueue.test.js → lógica pura del cliente (lib/) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: suite o configuración de calidad, lógica pura del cliente (lib/). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Responsabilidad única del archivo (script o suite independiente). |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-012-004 |
| 4.1 ¿Requerimiento con ID? | Sí | T-03 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | Sin commit: resources/js/lib/diagnosticosDb.test.js, resources/js/lib/onnxEngine.test.js, resources/js/lib/pwa.test.js, resources/js/lib/reportes.test.js, resources/js/lib/roles.test.js<br>6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Vitest agente.test.js: 7/7; Vitest alertas.test.js: 13/13; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Vitest catalogo.test.js: 10/10; Vitest diagnosticosDb.test.js: 8/8; Vitest fieldFlow.test.js: 17/17; Vitest fieldOps.test.js: 5/5; Vitest inference.test.js: 13/13; Vitest onnxEngine.test.js: 14/14; Vitest parcelasStore.test.js: 8/8; Vitest pwa.test.js: 4/4; Vitest reportes.test.js: 6/6; Vitest risk.test.js: 5/5; Vitest roles.test.js: 3/3; Vitest syncQueue.test.js: 14/14 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Pendiente | Modificado después del análisis SonarQube del 2026-11-10: reportes.test.js. Requiere reanálisis. |
| 5.2 ¿Supera seguridad y dependencias? | No aplica | Código de pruebas: no se despliega ni expone dependencias de producción. |
| 5.2 ¿Supera pruebas? | Sí | Vitest agente.test.js: 7/7; Vitest alertas.test.js: 13/13; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Vitest catalogo.test.js: 10/10; Vitest diagnosticosDb.test.js: 8/8; Vitest fieldFlow.test.js: 17/17; Vitest fieldOps.test.js: 5/5; Vitest inference.test.js: 13/13; Vitest onnxEngine.test.js: 14/14; Vitest parcelasStore.test.js: 8/8; Vitest pwa.test.js: 4/4; Vitest reportes.test.js: 6/6; Vitest risk.test.js: 5/5; Vitest roles.test.js: 3/3; Vitest syncQueue.test.js: 14/14 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 83.34 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 100 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-012 Aseguramiento de la Calidad
- **Procedimiento:** TRZ-012-004 — Pruebas unitarias de frontend (106 casos: cola, inferencia, alertas, agente).
- **Rama:** [`INT-012/TRZ-012-004-pruebas-frontend`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-004-pruebas-frontend)
- **Ficha en la rama:** [TRZ-012-004_pruebas_frontend.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-012_Aseguramiento_Calidad/TRZ-012-004_pruebas_frontend.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `vitest.config.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/vitest.config.js) |
| `resources/js/lib/agente.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/agente.test.js) |
| `resources/js/lib/alertas.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/alertas.test.js) |
| `resources/js/lib/auth.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/auth.test.js) |
| `resources/js/lib/authAlerts.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/authAlerts.test.js) |
| `resources/js/lib/catalogo.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/catalogo.test.js) |
| `resources/js/lib/diagnosticosDb.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/diagnosticosDb.test.js) |
| `resources/js/lib/fieldFlow.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/fieldFlow.test.js) |
| `resources/js/lib/fieldOps.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/fieldOps.test.js) |
| `resources/js/lib/inference.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/inference.test.js) |
| `resources/js/lib/onnxEngine.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/onnxEngine.test.js) |
| `resources/js/lib/parcelasStore.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/parcelasStore.test.js) |
| `resources/js/lib/pwa.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/pwa.test.js) |
| `resources/js/lib/reportes.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/reportes.test.js) |
| `resources/js/lib/risk.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/risk.test.js) |
| `resources/js/lib/roles.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/roles.test.js) |
| `resources/js/lib/syncQueue.test.js` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/syncQueue.test.js) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
