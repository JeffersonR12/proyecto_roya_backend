# TRZ-009-005 — Consulta GET /api/alertas, marcado como leída (PATCH /api/alertas/{id}/leida), paneles Dashboard, History y AlertsPage.

- **INTENT:** INT-009 Alertas Tempranas y Monitoreo
- **BriefingScript:** Consulta GET /api/alertas, marcado como leída (PATCH /api/alertas/{id}/leida), paneles Dashboard, History y AlertsPage.
- **Artefacto Destino:** ConsultaController@alertas, AlertsPage.jsx, Dashboard.jsx
- **Ruta del Archivo:**
  - `app/Http/Controllers/Api/ConsultaController.php`
  - `resources/js/pages/AlertsPage.jsx`
  - `resources/js/components/Dashboard.jsx`
- **Método / función:** ConsultaController@alertas(), @marcarAlertaLeida(); componente AlertsPage
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits)
- **Dominio Funcional:** Alertas y Monitoreo
- **Responsable:** Annelise
- **HU / Ticket:** T-26 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-009-005:**
  - Commit: 6a2e717, 06fc39b, e855ee3
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit ConsultaApiTest: 7/7; Cypress E2E-05: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): ConsultaController.php 100.0 %, AlertsPage.jsx 0.0 %, Dashboard.jsx 0.0 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:e9da46b345f867a8bb839d232a77d5f7b99af0c943e9f36de53ca806f2326aeb`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • DISCREPANCIA 1: la matriz original cita Dashboard.jsx, pero es código heredado. Las alertas reales se gestionan en AlertsPage.jsx y en el contador de RoyaGuard.jsx.
  • Responsable asignado por dominio (Annelise); autoría en Git: JeffersonR12, Jhoan Sosa.
- **Puntos de mejora:**
  • Retirar resources/js/app.jsx, Dashboard.jsx, History.jsx y scan.blade.php, o documentarlos como legado; actualizar el artefacto destino en la matriz.
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-009 Alertas Tempranas y Monitoreo en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-26: Construir dashboard por rol con historial y filtros. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-26 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/02_Backlog_Tecnico.md, Docs/04_Diseño_Tecnico_Arquitectura_Edge.md, Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit ConsultaApiTest: 7/7; Cypress E2E-05: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): ConsultaController.php 100.0 %, AlertsPage.jsx 0.0 %, Dashboard.jsx 0.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Http/Controllers/Api/ConsultaController.php → controlador HTTP; resources/js/pages/AlertsPage.jsx → página React; resources/js/components/Dashboard.jsx → componente React |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: controlador HTTP, página React, componente React. |
| 3.1 ¿Se evita redundancia? | No | Dashboard.jsx solo lo importa resources/js/app.jsx, cargado por resources/views/scan.blade.php; ninguna ruta usa esa vista y vite.config.js no compila app.jsx. Código heredado que no llega al usuario. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-009-005 |
| 4.1 ¿Requerimiento con ID? | Sí | T-26 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit ConsultaApiTest: 7/7; Cypress E2E-05: 1/1 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit ConsultaApiTest: 7/7; Cypress E2E-05: 1/1 (2026-11-12) |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 87.5 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 83.34 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*
