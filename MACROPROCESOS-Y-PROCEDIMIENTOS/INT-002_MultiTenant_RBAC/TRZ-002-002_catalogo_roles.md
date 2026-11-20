# TRZ-002-002 — Catálogo de roles (agricultor, técnico, administrador) con métodos de verificación.

- **INTENT:** INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC)
- **BriefingScript:** Catálogo de roles (agricultor, técnico, administrador) con métodos de verificación.
- **Artefacto Destino:** Role, RoleSeeder, User::isStaff()/isAdmin()
- **Ruta del Archivo:**
  - `app/Models/Role.php`
  - `database/seeders/RoleSeeder.php`
  - `app/Models/User.php`
- **Método / función:** RoleSeeder::run(); User::roleName(), isStaff(), isAdmin()
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits)
- **Dominio Funcional:** Multi-Tenant / RBAC
- **Responsable:** Jhoan
- **HU / Ticket:** T-05 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-002-002:**
  - Commit: 6a2e717, 210a1b2
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit DomainSchemaTest: 4/4; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12). Cobertura de línea (2026-11-12): Role.php 0.0 %, User.php 73.3 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:683d832679a68654beb9137b8686d3e0c92d7bf0f9a4e4a7ae4d06f9c747c9ff`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Hallazgo de seguridad: si un usuario queda sin rol_id, roleName() recae en users.role cuyo valor por defecto es "tecnico", por lo que isStaff() devolvería true (privilegios de técnico).
- **Puntos de mejora:**
  • Eliminar la columna heredada users.role o cambiar el respaldo de roleName() a "agricultor" (mínimo privilegio) y cubrirlo con una prueba.
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC) en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-05: Implementar RBAC para agricultor, técnico y administrador. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-05 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/06_Iteracion_02_Autenticacion.md, Docs/09_Iteracion_05_Backend_API_REST.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit DomainSchemaTest: 4/4; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12). Cobertura de línea (2026-11-12): Role.php 0.0 %, User.php 73.3 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Models/Role.php → modelo Eloquent; database/seeders/RoleSeeder.php → esquema/datos (migración o seeder); app/Models/User.php → modelo Eloquent |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: modelo Eloquent, esquema/datos (migración o seeder). |
| 3.1 ¿Se evita redundancia? | No | Doble fuente de rol: columna heredada users.role (string, default "tecnico", migración 2026_09_20_000001) y FK users.rol_id. User::roleName() usa rol_id → role → "tecnico". |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-002-002 |
| 4.1 ¿Requerimiento con ID? | Sí | T-05 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit DomainSchemaTest: 4/4; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit DomainSchemaTest: 4/4; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12) |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 87.5 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 83.34 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*
