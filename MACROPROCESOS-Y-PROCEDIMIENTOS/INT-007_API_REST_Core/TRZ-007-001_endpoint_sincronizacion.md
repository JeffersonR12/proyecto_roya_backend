# TRZ-007-001 — Endpoints de sincronización (POST hasta 50 ítems, GET status) con validación.

- **INTENT:** INT-007 API REST del Core
- **BriefingScript:** Endpoints de sincronización (POST hasta 50 ítems, GET status) con validación.
- **Artefacto Destino:** SyncController, SyncDiagnosticosRequest, routes/api.php
- **Ruta del Archivo:**
  - `app/Http/Controllers/Api/SyncController.php`
  - `app/Http/Requests/SyncDiagnosticosRequest.php`
  - `routes/api.php`
- **Método / función:** SyncController@store() (POST /api/sync/diagnosticos), @status(); SyncDiagnosticosRequest::rules()
- **Modelo IA Usado:** Claude Opus 5.5 (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** API / Backend
- **Responsable:** Jhoan
- **HU / Ticket:** T-23 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-007-001:**
  - Commit: 6a2e717
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit SyncDiagnosticosApiTest: 18/18. Cobertura de línea (2026-11-12): SyncController.php 100.0 %, SyncDiagnosticosRequest.php 100.0 %
  - Análisis estático: Modificado después del análisis SonarQube del 2026-11-10: api.php. Requiere reanálisis.
  - Hash del BriefingScript: `sha256:3d9f4da799fef7571050d82b9f3d7d5e445ec6b8575c03e0c5ddd72246d452e1`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Cambios locales sin commit en api.php (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-007 API REST del Core en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-23: Crear endpoint de sincronización masiva de registros offline. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-23 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>Cambios locales sin commit en: routes/api.php |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit SyncDiagnosticosApiTest: 18/18. Cobertura de línea (2026-11-12): SyncController.php 100.0 %, SyncDiagnosticosRequest.php 100.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Http/Controllers/Api/SyncController.php → controlador HTTP; app/Http/Requests/SyncDiagnosticosRequest.php → FormRequest (validación); routes/api.php → configuración transversal |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: controlador HTTP, FormRequest (validación), configuración transversal. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-007-001 |
| 4.1 ¿Requerimiento con ID? | Sí | T-23 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>Cambios locales sin commit en: routes/api.php |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit SyncDiagnosticosApiTest: 18/18 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Pendiente | Modificado después del análisis SonarQube del 2026-11-10: api.php. Requiere reanálisis. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit SyncDiagnosticosApiTest: 18/18 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 75 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-007 API REST del Core
- **Procedimiento:** TRZ-007-001 — Endpoints de sincronización (POST hasta 50 ítems, GET status) con validación.
- **Rama:** [`INT-007/TRZ-007-001-endpoint-sincronizacion`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-001-endpoint-sincronizacion)
- **Ficha en la rama:** [TRZ-007-001_endpoint_sincronizacion.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-007_API_REST_Core/TRZ-007-001_endpoint_sincronizacion.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `app/Http/Controllers/Api/SyncController.php` | store | 18–27 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/app/Http/Controllers/Api/SyncController.php#L18-L27) |
| `app/Http/Controllers/Api/SyncController.php` | status | 30–51 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/app/Http/Controllers/Api/SyncController.php#L30-L51) |
| `app/Http/Requests/SyncDiagnosticosRequest.php` | rules | 24–44 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/app/Http/Requests/SyncDiagnosticosRequest.php#L24-L44) |
| `routes/api.php` | sync | 18–20 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L18-L20) |
| `routes/api.php` | sync | 19–20 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L19-L20) |
| `routes/api.php` | sync | 20 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L20) |
| `routes/api.php` | sync | 21 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L21) |
| `routes/api.php` | sync | 25–26 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L25-L26) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
