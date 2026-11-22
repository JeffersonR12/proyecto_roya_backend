# TRZ-002-005 — Visibilidad de datos según rol: agricultor ve solo lo suyo; técnicos ven todo el tenant.

- **INTENT:** INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC)
- **BriefingScript:** Visibilidad de datos según rol: agricultor ve solo lo suyo; técnicos ven todo el tenant.
- **Artefacto Destino:** EnsureRole (middleware role:*), Diagnostico::scopeVisiblePara()
- **Ruta del Archivo:**
  - `app/Http/Middleware/EnsureRole.php`
  - `app/Models/Diagnostico.php`
  - `routes/api.php`
- **Método / función:** EnsureRole::handle() (role:tecnico,administrador); Diagnostico::scopeVisiblePara()
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** Multi-Tenant / RBAC
- **Responsable:** Jhoan
- **HU / Ticket:** T-05 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-002-005:**
  - Commit: 6a2e717
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit ConsultaApiTest: 7/7; PHPUnit ReportApiTest: 11/11; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12). Cobertura de línea (2026-11-12): EnsureRole.php 100.0 %, Diagnostico.php 92.3 %
  - Análisis estático: Modificado después del análisis SonarQube del 2026-11-10: api.php. Requiere reanálisis.
  - Hash del BriefingScript: `sha256:24e7bad955cf7a72682ac3f988b941a895ea425639bd0f47364cb53da2b6ec22`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Cambios locales sin commit en api.php (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC) en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-05: Implementar RBAC para agricultor, técnico y administrador. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-05 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/06_Iteracion_02_Autenticacion.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>Cambios locales sin commit en: routes/api.php |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit ConsultaApiTest: 7/7; PHPUnit ReportApiTest: 11/11; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12). Cobertura de línea (2026-11-12): EnsureRole.php 100.0 %, Diagnostico.php 92.3 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Http/Middleware/EnsureRole.php → middleware; app/Models/Diagnostico.php → modelo Eloquent; routes/api.php → configuración transversal |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: middleware, modelo Eloquent, configuración transversal. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-002-005 |
| 4.1 ¿Requerimiento con ID? | Sí | T-05 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>Cambios locales sin commit en: routes/api.php |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit ConsultaApiTest: 7/7; PHPUnit ReportApiTest: 11/11; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Pendiente | Modificado después del análisis SonarQube del 2026-11-10: api.php. Requiere reanálisis. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit ConsultaApiTest: 7/7; PHPUnit ReportApiTest: 11/11; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12) |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 75 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC)
- **Procedimiento:** TRZ-002-005 — Visibilidad de datos según rol: agricultor ve solo lo suyo; técnicos ven todo el tenant.
- **Rama:** [`INT-002/TRZ-002-005-visibilidad-por-rol`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-005-visibilidad-por-rol)
- **Ficha en la rama:** [TRZ-002-005_visibilidad_por_rol.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-002_MultiTenant_RBAC/TRZ-002-005_visibilidad_por_rol.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `app/Http/Middleware/EnsureRole.php` | handle | 15–24 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/app/Http/Middleware/EnsureRole.php#L15-L24) |
| `app/Models/Diagnostico.php` | scopeVisiblePara | 100–109 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/app/Models/Diagnostico.php#L100-L109) |
| `routes/api.php` | role: | 30–31 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/routes/api.php#L30-L31) |
| `routes/api.php` | role: | 33–34 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/routes/api.php#L33-L34) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
