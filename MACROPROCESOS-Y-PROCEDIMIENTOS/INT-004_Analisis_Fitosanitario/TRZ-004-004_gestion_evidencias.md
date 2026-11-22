# TRZ-004-004 — Gestión de evidencias: guardar imagen validando tipo real y tamaño máximo (2MB).

- **INTENT:** INT-004 Análisis Fitosanitario y Diagnóstico
- **BriefingScript:** Gestión de evidencias: guardar imagen validando tipo real y tamaño máximo (2MB).
- **Artefacto Destino:** EvidenciaStore
- **Ruta del Archivo:**
  - `app/Services/EvidenciaStore.php`
  - `app/Http/Controllers/Api/DiagnosticoController.php`
- **Método / función:** EvidenciaStore::guardarDataUrl() (jpeg/png/webp, máx. 2 MB, disco local); DiagnosticoController@imagen()
- **Modelo IA Usado:** Claude Opus 5.5 (commits)
- **Dominio Funcional:** Dominio Fitosanitario / Backend
- **Responsable:** Annelise
- **HU / Ticket:** T-17 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-004-004:**
  - Commit: 6a2e717
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit SyncDiagnosticosApiTest: 18/18. Cobertura de línea (2026-11-12): EvidenciaStore.php 78.6 %, DiagnosticoController.php 72.1 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:d84e49a410c91a57df509192093873f49927d32891f3325dd19d9f48b106eb05`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Responsable asignado por dominio (Annelise); autoría en Git: Jhoan Sosa.
- **Puntos de mejora:**
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-004 Análisis Fitosanitario y Diagnóstico en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-17: Calcular severidad foliar y conservar máscara/evidencia cuando sea posible. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-17 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/06_Iteracion_02_Autenticacion.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit SyncDiagnosticosApiTest: 18/18. Cobertura de línea (2026-11-12): EvidenciaStore.php 78.6 %, DiagnosticoController.php 72.1 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Services/EvidenciaStore.php → servicio de dominio; app/Http/Controllers/Api/DiagnosticoController.php → controlador HTTP |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: servicio de dominio, controlador HTTP. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-004-004 |
| 4.1 ¿Requerimiento con ID? | Sí | T-17 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit SyncDiagnosticosApiTest: 18/18 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit SyncDiagnosticosApiTest: 18/18 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 83.34 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-004 Análisis Fitosanitario y Diagnóstico
- **Procedimiento:** TRZ-004-004 — Gestión de evidencias: guardar imagen validando tipo real y tamaño máximo (2MB).
- **Rama:** [`INT-004/TRZ-004-004-gestion-evidencias`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-004-gestion-evidencias)
- **Ficha en la rama:** [TRZ-004-004_gestion_evidencias.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-004-gestion-evidencias/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-004_Analisis_Fitosanitario/TRZ-004-004_gestion_evidencias.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `app/Services/EvidenciaStore.php` | guardarDataUrl | 24–51 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-004-gestion-evidencias/app/Services/EvidenciaStore.php#L24-L51) |
| `app/Http/Controllers/Api/DiagnosticoController.php` | imagen | 110–123 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-004-gestion-evidencias/app/Http/Controllers/Api/DiagnosticoController.php#L110-L123) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
