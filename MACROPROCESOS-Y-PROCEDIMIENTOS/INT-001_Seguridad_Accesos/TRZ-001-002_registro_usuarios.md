# TRZ-001-002 — Registro de usuarios con validación de correo Gmail, celular peruano y términos.

- **INTENT:** INT-001 Seguridad y Accesos
- **BriefingScript:** Registro de usuarios con validación de correo Gmail, celular peruano y términos.
- **Artefacto Destino:** AuthController@register, RegisterRequest
- **Ruta del Archivo:**
  - `app/Http/Controllers/AuthController.php`
  - `app/Http/Requests/RegisterRequest.php`
  - `app/Support/AuthRules.php`
- **Método / función:** AuthController@register(); RegisterRequest::rules(); AuthRules::GMAIL_REGEX / PERU_PHONE_REGEX
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits)
- **Dominio Funcional:** Seguridad / Accesos
- **Responsable:** Jhoan
- **HU / Ticket:** T-04 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-001-002:**
  - Commit: 6a2e717, e855ee3
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit AuthSessionTest: 9/9; PHPUnit AuthRulesTest: 2/2; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Cypress E2E-03: 3/3 (2026-11-12). Cobertura de línea (2026-11-12): AuthController.php 85.8 %, RegisterRequest.php 100.0 %, AuthRules.php 83.3 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:3a240231aff2549bf0cf79846b5a693b1f6f8137be4d5dd7454455fee5c1f4de`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Sin observaciones adicionales.
- **Puntos de mejora:**
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-001 Seguridad y Accesos en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-04: Implementar autenticación con Sanctum o JWT según la decisión final. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-04 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit AuthSessionTest: 9/9; PHPUnit AuthRulesTest: 2/2; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Cypress E2E-03: 3/3 (2026-11-12). Cobertura de línea (2026-11-12): AuthController.php 85.8 %, RegisterRequest.php 100.0 %, AuthRules.php 83.3 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Http/Controllers/AuthController.php → controlador HTTP; app/Http/Requests/RegisterRequest.php → FormRequest (validación); app/Support/AuthRules.php → otro |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: controlador HTTP, FormRequest (validación), otro. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-001-002 |
| 4.1 ¿Requerimiento con ID? | Sí | T-04 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit AuthSessionTest: 9/9; PHPUnit AuthRulesTest: 2/2; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Cypress E2E-03: 3/3 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit AuthSessionTest: 9/9; PHPUnit AuthRulesTest: 2/2; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Cypress E2E-03: 3/3 (2026-11-12) |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 83.34 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-001 Seguridad y Accesos
- **Procedimiento:** TRZ-001-002 — Registro de usuarios con validación de correo Gmail, celular peruano y términos.
- **Rama:** [`INT-001/TRZ-001-002-registro-usuarios`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-002-registro-usuarios)
- **Ficha en la rama:** [TRZ-001-002_registro_usuarios.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-001_Seguridad_Accesos/TRZ-001-002_registro_usuarios.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `app/Http/Controllers/AuthController.php` | register | 164–200 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/app/Http/Controllers/AuthController.php#L164-L200) |
| `app/Http/Requests/RegisterRequest.php` | rules | 24–35 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/app/Http/Requests/RegisterRequest.php#L24-L35) |
| `app/Support/AuthRules.php` | GMAIL_REGEX | 9 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/app/Support/AuthRules.php#L9) |
| `app/Support/AuthRules.php` | PERU_PHONE_REGEX | 19 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/app/Support/AuthRules.php#L19) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
