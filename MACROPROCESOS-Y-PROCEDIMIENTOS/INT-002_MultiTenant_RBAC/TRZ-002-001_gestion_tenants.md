# TRZ-002-001 — Gestión de organizaciones (tenants) por código único (slug) al registrar usuario.

- **INTENT:** INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC)
- **BriefingScript:** Gestión de organizaciones (tenants) por código único (slug) al registrar usuario.
- **Artefacto Destino:** Tenant (tabla tenants), AuthController@register
- **Ruta del Archivo:**
  - `app/Models/Tenant.php`
  - `database/migrations/2026_10_04_180001_create_tenants_table.php`
  - `app/Http/Controllers/AuthController.php`
- **Método / función:** AuthController@register() → Tenant::firstOrCreate() por slug de la organización
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits)
- **Dominio Funcional:** Multi-Tenant / RBAC
- **Responsable:** Jhoan
- **HU / Ticket:** T-06 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-002-001:**
  - Commit: 6a2e717, 210a1b2
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit AuthSessionTest: 9/9; PHPUnit DomainSchemaTest: 4/4. Cobertura de línea (2026-11-12): Tenant.php 50.0 %, AuthController.php 85.8 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:8a6c44c5cb07fec429cb45b9f930b6c86d61cec240d8e0f90a1bc3e99d90743a`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Sin observaciones adicionales.
- **Puntos de mejora:**
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC) en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-06: Incorporar tenant/organización y aislamiento lógico de datos. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-06 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/03_Diccionario_de_Datos.md, Docs/06_Iteracion_02_Autenticacion.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit AuthSessionTest: 9/9; PHPUnit DomainSchemaTest: 4/4. Cobertura de línea (2026-11-12): Tenant.php 50.0 %, AuthController.php 85.8 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Models/Tenant.php → modelo Eloquent; database/migrations/2026_10_04_180001_create_tenants_table.php → esquema/datos (migración o seeder); app/Http/Controllers/AuthController.php → controlador HTTP |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: modelo Eloquent, esquema/datos (migración o seeder), controlador HTTP. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-002-001 |
| 4.1 ¿Requerimiento con ID? | Sí | T-06 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit AuthSessionTest: 9/9; PHPUnit DomainSchemaTest: 4/4 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit AuthSessionTest: 9/9; PHPUnit DomainSchemaTest: 4/4 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 83.34 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC)
- **Procedimiento:** TRZ-002-001 — Gestión de organizaciones (tenants) por código único (slug) al registrar usuario.
- **Rama:** [`INT-002/TRZ-002-001-gestion-tenants`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-001-gestion-tenants)
- **Ficha en la rama:** [TRZ-002-001_gestion_tenants.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-001-gestion-tenants/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-002_MultiTenant_RBAC/TRZ-002-001_gestion_tenants.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `app/Models/Tenant.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-001-gestion-tenants/app/Models/Tenant.php) |
| `database/migrations/2026_10_04_180001_create_tenants_table.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-001-gestion-tenants/database/migrations/2026_10_04_180001_create_tenants_table.php) |
| `app/Http/Controllers/AuthController.php` | register | 164–200 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-001-gestion-tenants/app/Http/Controllers/AuthController.php#L164-L200) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
