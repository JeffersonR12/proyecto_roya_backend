# TRZ-012-001 — Pruebas de autenticación y recuperación de contraseña (token un solo uso, revocación).

- **INTENT:** INT-012 Aseguramiento de la Calidad
- **BriefingScript:** Pruebas de autenticación y recuperación de contraseña (token un solo uso, revocación).
- **Artefacto Destino:** AuthLoginTest, AuthSessionTest, PasswordResetTest
- **Ruta del Archivo:**
  - `tests/Feature/AuthLoginTest.php`
  - `tests/Feature/AuthSessionTest.php`
  - `tests/Feature/PasswordResetTest.php`
  - `tests/Unit/AuthRulesTest.php`
- **Método / función:** Suites PHPUnit AuthLoginTest, AuthSessionTest, PasswordResetTest, AuthRulesTest
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits)
- **Dominio Funcional:** QA / Testing
- **Responsable:** Jhoan
- **HU / Ticket:** T-31 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-012-001:**
  - Commit: 6a2e717, e855ee3, b347f24
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit AuthLoginTest: 5/5; PHPUnit AuthSessionTest: 9/9; PHPUnit PasswordResetTest: 7/7; PHPUnit AuthRulesTest: 2/2
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:0e538dbaf8132c253ec078edc3265737e672b4704334b349339537757e5910ea`
- **Estado:** En revisión — sin criterios en "No", con evidencia pendiente de aportar.
- **Observaciones:**
  • Sin observaciones adicionales.
- **Puntos de mejora:**
  • Abrir PR con revisión de código y desplegar en un entorno con HTTPS para cerrar 2.3 y 4.1.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-012 Aseguramiento de la Calidad en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-31: Aplicar pruebas OWASP, rate limiting, validación de entradas y gestión segura de secretos. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-31 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/13_Informe_Calidad_SonarQube.md (suites tests/Feature), Docs/14_Informe_Final.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614<br>b347f24 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/b347f2468426d69b905f6b253eef89e5be7cca62 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit AuthLoginTest: 5/5; PHPUnit AuthSessionTest: 9/9; PHPUnit PasswordResetTest: 7/7; PHPUnit AuthRulesTest: 2/2 |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | tests/Feature/AuthLoginTest.php → suite o configuración de calidad; tests/Feature/AuthSessionTest.php → suite o configuración de calidad; tests/Feature/PasswordResetTest.php → suite o configuración de calidad; tests/Unit/AuthRulesTest.php → suite o configuración de calidad |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: suite o configuración de calidad. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Responsabilidad única del archivo (script o suite independiente). |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-012-001 |
| 4.1 ¿Requerimiento con ID? | Sí | T-31 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614<br>b347f24 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/b347f2468426d69b905f6b253eef89e5be7cca62 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit AuthLoginTest: 5/5; PHPUnit AuthSessionTest: 9/9; PHPUnit PasswordResetTest: 7/7; PHPUnit AuthRulesTest: 2/2 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No aplica | Código de pruebas: no se despliega ni expone dependencias de producción. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit AuthLoginTest: 5/5; PHPUnit AuthSessionTest: 9/9; PHPUnit PasswordResetTest: 7/7; PHPUnit AuthRulesTest: 2/2 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 100 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-012 Aseguramiento de la Calidad
- **Procedimiento:** TRZ-012-001 — Pruebas de autenticación y recuperación de contraseña (token un solo uso, revocación).
- **Rama:** [`INT-012/TRZ-012-001-pruebas-seguridad-acceso`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-001-pruebas-seguridad-acceso)
- **Ficha en la rama:** [TRZ-012-001_pruebas_seguridad_acceso.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-012_Aseguramiento_Calidad/TRZ-012-001_pruebas_seguridad_acceso.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `tests/Feature/AuthLoginTest.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/tests/Feature/AuthLoginTest.php) |
| `tests/Feature/AuthSessionTest.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/tests/Feature/AuthSessionTest.php) |
| `tests/Feature/PasswordResetTest.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/tests/Feature/PasswordResetTest.php) |
| `tests/Unit/AuthRulesTest.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/tests/Unit/AuthRulesTest.php) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
