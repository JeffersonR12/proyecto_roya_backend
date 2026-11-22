# TRZ-006-005 — Sincronización idempotente en servidor (lote transaccional, respuesta por ítem).

- **INTENT:** INT-006 Persistencia Offline-First y Sincronización
- **BriefingScript:** Sincronización idempotente en servidor (lote transaccional, respuesta por ítem).
- **Artefacto Destino:** DiagnosticoSyncService, SyncEvent (sync_events)
- **Ruta del Archivo:**
  - `app/Services/DiagnosticoSyncService.php`
  - `app/Models/SyncEvent.php`
  - `database/migrations/2026_10_04_180007_create_alertas_and_sync_events_tables.php`
- **Método / función:** sincronizar(), procesar(), resolverExistente(), mismoContenido(), resultado() (registra SyncEvent)
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits)
- **Dominio Funcional:** Sincronización Edge-Cloud
- **Responsable:** Jefferson
- **HU / Ticket:** T-20 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-006-005:**
  - Commit: 6a2e717, 210a1b2
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit SyncDiagnosticosApiTest: 18/18. Cobertura de línea (2026-11-12): DiagnosticoSyncService.php 99.1 %, SyncEvent.php 75.0 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:c97179a397a62ac2f9a580c8efbc5496c0770481c68c1d75e39ef1f5a3414341`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Sin observaciones adicionales.
- **Puntos de mejora:**
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-006 Persistencia Offline-First y Sincronización en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-20: Aplicar idempotencia mediante UUID y respuesta de confirmación. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-20 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit SyncDiagnosticosApiTest: 18/18. Cobertura de línea (2026-11-12): DiagnosticoSyncService.php 99.1 %, SyncEvent.php 75.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Services/DiagnosticoSyncService.php → servicio de dominio; app/Models/SyncEvent.php → modelo Eloquent; database/migrations/2026_10_04_180007_create_alertas_and_sync_events_tables.php → esquema/datos (migración o seeder) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: servicio de dominio, modelo Eloquent, esquema/datos (migración o seeder). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-006-005 |
| 4.1 ¿Requerimiento con ID? | Sí | T-20 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
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

- **Macroproceso:** INT-006 Persistencia Offline-First y Sincronización
- **Procedimiento:** TRZ-006-005 — Sincronización idempotente en servidor (lote transaccional, respuesta por ítem).
- **Rama:** [`INT-006/TRZ-006-005-recepcion-lotes-idempotente`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-005-recepcion-lotes-idempotente)
- **Ficha en la rama:** [TRZ-006-005_recepcion_lotes_idempotente.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-005_recepcion_lotes_idempotente.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `app/Services/DiagnosticoSyncService.php` | sincronizar | 40–55 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L40-L55) |
| `app/Services/DiagnosticoSyncService.php` | procesar | 61–117 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L61-L117) |
| `app/Services/DiagnosticoSyncService.php` | resolverExistente | 123–155 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L123-L155) |
| `app/Services/DiagnosticoSyncService.php` | mismoContenido | 158–167 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L158-L167) |
| `app/Services/DiagnosticoSyncService.php` | resultado | 230–247 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L230-L247) |
| `app/Models/SyncEvent.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Models/SyncEvent.php) |
| `database/migrations/2026_10_04_180007_create_alertas_and_sync_events_tables.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/database/migrations/2026_10_04_180007_create_alertas_and_sync_events_tables.php) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
