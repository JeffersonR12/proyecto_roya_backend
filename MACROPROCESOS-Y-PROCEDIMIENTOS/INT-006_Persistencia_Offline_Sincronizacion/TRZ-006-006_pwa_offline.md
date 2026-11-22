# TRZ-006-006 — Service Worker y PWA para precachear modelo ONNX y WASM sin conexión.

- **INTENT:** INT-006 Persistencia Offline-First y Sincronización
- **BriefingScript:** Service Worker y PWA para precachear modelo ONNX y WASM sin conexión.
- **Artefacto Destino:** public/sw.js, manifest.webmanifest
- **Ruta del Archivo:**
  - `public/sw.js`
  - `public/manifest.webmanifest`
  - `resources/js/lib/pwa.js`
- **Método / función:** registerEdgeWorker(); sw.js: precache(), buildAssets(), precacheShell(), networkFirstShell(), cacheFirstResponse()
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** Sincronización Edge-Cloud
- **Responsable:** Jefferson
- **HU / Ticket:** T-32 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-006-006:**
  - Commit: 06fc39b, e855ee3, 210a1b2
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit EdgePwaAssetsTest: 2/2; Vitest pwa.test.js: 4/4. Cobertura de línea (2026-11-12): pwa.js 100.0 %
  - Análisis estático: Modificado después del análisis SonarQube del 2026-11-10: sw.js. Requiere reanálisis.
  - Hash del BriefingScript: `sha256:a5dca4d3d1036943de504d20a3583ba2fc2c631e462bfa3eecb44b2e9d496b88`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • El flujo offline completo (servidor apagado → recarga → inferencia) se verificó el 2026-11-16 con un script de navegador fuera del repositorio; no es una prueba automatizada versionada.
  • Cambios locales sin commit en sw.js (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • Versionar una prueba E2E offline (Cypress con CDP Network.emulateNetworkConditions o Playwright) y reanalizar sw.js en SonarQube.
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-006 Persistencia Offline-First y Sincronización en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-32: Ejecutar prueba integral de recuperación: sin red → diagnóstico → reconexión → sincronización. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-32 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/10_Iteracion_03_Primer_Entrenamiento_CNN.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7<br>Cambios locales sin commit en: public/sw.js |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit EdgePwaAssetsTest: 2/2; Vitest pwa.test.js: 4/4. Cobertura de línea (2026-11-12): pwa.js 100.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | public/sw.js → recurso PWA (public/); public/manifest.webmanifest → recurso PWA (public/); resources/js/lib/pwa.js → lógica pura del cliente (lib/) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: recurso PWA (public/), lógica pura del cliente (lib/). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-006-006 |
| 4.1 ¿Requerimiento con ID? | Sí | T-32 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7<br>Cambios locales sin commit en: public/sw.js |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit EdgePwaAssetsTest: 2/2; Vitest pwa.test.js: 4/4 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | No | Requirió correcciones: bug javascript:S9383 de SonarQube fase 1 (promesa sin controlar en caches.put) y DEF-03 del 2026-11-16 (el HTML de la SPA no se cacheaba y la app no abría sin red). |
| 5.2 ¿Supera análisis estático? | Pendiente | Modificado después del análisis SonarQube del 2026-11-10: sw.js. Requiere reanálisis. |
| 5.2 ¿Supera seguridad y dependencias? | Sí | npm audit --omit=dev (2026-11-16): 0 vulnerabilidades en 66 dependencias de producción. SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit EdgePwaAssetsTest: 2/2; Vitest pwa.test.js: 4/4 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 87.5 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-006 Persistencia Offline-First y Sincronización
- **Procedimiento:** TRZ-006-006 — Service Worker y PWA para precachear modelo ONNX y WASM sin conexión.
- **Rama:** [`INT-006/TRZ-006-006-pwa-offline`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-006-pwa-offline)
- **Ficha en la rama:** [TRZ-006-006_pwa_offline.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-006_pwa_offline.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `public/sw.js` | precache | 72–77 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L72-L77) |
| `public/sw.js` | precacheShell | 82–92 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L82-L92) |
| `public/sw.js` | buildAssets | 94–112 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L94-L112) |
| `public/sw.js` | networkFirstShell | 114–133 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L114-L133) |
| `public/sw.js` | cacheFirstResponse | 135–149 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L135-L149) |
| `public/manifest.webmanifest` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/manifest.webmanifest) |
| `resources/js/lib/pwa.js` | registerEdgeWorker | 1–11 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/resources/js/lib/pwa.js#L1-L11) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
