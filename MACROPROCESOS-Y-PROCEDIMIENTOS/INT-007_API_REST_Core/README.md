# INT-007 API REST del Core — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-007-api-rest-core`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-007-api-rest-core)
- **Dominio funcional:** API / Backend
- **Responsable (Agent Coach):** Jhoan Sosa Porras
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-007-api-rest-core/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-007-001 | Endpoints de sincronización (POST hasta 50 ítems, GET status) con validación. | Implementado | 5 | [TRZ-007-001-endpoint-sincronizacion](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-001-endpoint-sincronizacion) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-007_API_REST_Core/TRZ-007-001_endpoint_sincronizacion.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-007/TRZ-007-001-endpoint-sincronizacion) |
| TRZ-007-002 | CRUD de diagnósticos con permisos por rol (técnico/admin) y endpoint de imagen. | Implementado | 4 | [TRZ-007-002-api-diagnosticos](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-002-api-diagnosticos) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-007_API_REST_Core/TRZ-007-002_api_diagnosticos.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-007/TRZ-007-002-api-diagnosticos) |
| TRZ-007-003 | Consultas de solo lectura (parcelas, alertas, catálogo) autorizadas por rol. | Implementado | 4 | [TRZ-007-003-api-consultas](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-003-api-consultas) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-003-api-consultas/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-007_API_REST_Core/TRZ-007-003_api_consultas.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-007/TRZ-007-003-api-consultas) |
| TRZ-007-004 | Formato JSON uniforme y manejo centralizado de errores (401, 403, 404, 422, 429). | Implementado | 4 | [TRZ-007-004-respuestas-uniformes](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-004-respuestas-uniformes) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-004-respuestas-uniformes/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-007_API_REST_Core/TRZ-007-004_respuestas_uniformes.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-007/TRZ-007-004-respuestas-uniformes) |
| TRZ-007-005 | Límites de uso diferenciados (sync 30/min, consultas 120/min) y health check. | Implementado | 4 | [TRZ-007-005-rate-limit-y-health](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-005-rate-limit-y-health) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-005-rate-limit-y-health/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-007_API_REST_Core/TRZ-007-005_rate_limit_y_health.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-007/TRZ-007-005-rate-limit-y-health) |

## Código de cada Misión

### TRZ-007-001 — Endpoints de sincronización (POST hasta 50 ítems, GET status) con validación.

- `app/Http/Controllers/Api/SyncController.php` · store · L18–L27 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/app/Http/Controllers/Api/SyncController.php#L18-L27)
- `app/Http/Controllers/Api/SyncController.php` · status · L30–L51 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/app/Http/Controllers/Api/SyncController.php#L30-L51)
- `app/Http/Requests/SyncDiagnosticosRequest.php` · rules · L24–L44 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/app/Http/Requests/SyncDiagnosticosRequest.php#L24-L44)
- `routes/api.php` · sync · L18–L20 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L18-L20)
- `routes/api.php` · sync · L19–L20 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L19-L20)
- `routes/api.php` · sync · L20 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L20)
- `routes/api.php` · sync · L21 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L21)
- `routes/api.php` · sync · L25–L26 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-001-endpoint-sincronizacion/routes/api.php#L25-L26)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera análisis estático?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-007-002 — CRUD de diagnósticos con permisos por rol (técnico/admin) y endpoint de imagen.

- `app/Http/Controllers/Api/DiagnosticoController.php` · index · L24–L56 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Controllers/Api/DiagnosticoController.php#L24-L56)
- `app/Http/Controllers/Api/DiagnosticoController.php` · store · L59–L77 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Controllers/Api/DiagnosticoController.php#L59-L77)
- `app/Http/Controllers/Api/DiagnosticoController.php` · show · L79–L85 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Controllers/Api/DiagnosticoController.php#L79-L85)
- `app/Http/Controllers/Api/DiagnosticoController.php` · update · L88–L99 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Controllers/Api/DiagnosticoController.php#L88-L99)
- `app/Http/Controllers/Api/DiagnosticoController.php` · destroy · L102–L107 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Controllers/Api/DiagnosticoController.php#L102-L107)
- `app/Http/Controllers/Api/DiagnosticoController.php` · imagen · L110–L123 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Controllers/Api/DiagnosticoController.php#L110-L123)
- `app/Http/Controllers/Api/DiagnosticoController.php` · visible · L125–L131 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Controllers/Api/DiagnosticoController.php#L125-L131)
- `app/Http/Resources/DiagnosticoResource.php` · toArray · L11–L45 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Resources/DiagnosticoResource.php#L11-L45)
- `app/Http/Requests/UpdateDiagnosticoRequest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-002-api-diagnosticos/app/Http/Requests/UpdateDiagnosticoRequest.php)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-007-003 — Consultas de solo lectura (parcelas, alertas, catálogo) autorizadas por rol.

- `app/Http/Controllers/Api/ConsultaController.php` · catalogo · L17–L26 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-003-api-consultas/app/Http/Controllers/Api/ConsultaController.php#L17-L26)
- `app/Http/Controllers/Api/ConsultaController.php` · parcelas · L28–L41 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-003-api-consultas/app/Http/Controllers/Api/ConsultaController.php#L28-L41)
- `app/Http/Controllers/Api/ConsultaController.php` · alertas · L43–L59 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-003-api-consultas/app/Http/Controllers/Api/ConsultaController.php#L43-L59)
- `app/Http/Controllers/Api/ConsultaController.php` · marcarAlertaLeida · L61–L73 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-003-api-consultas/app/Http/Controllers/Api/ConsultaController.php#L61-L73)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-007-004 — Formato JSON uniforme y manejo centralizado de errores (401, 403, 404, 422, 429).

- `bootstrap/app.php` · withExceptions · L37–L85 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-004-respuestas-uniformes/bootstrap/app.php#L37-L85)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-007-005 — Límites de uso diferenciados (sync 30/min, consultas 120/min) y health check.

- `app/Providers/AppServiceProvider.php` · RateLimiter 'sync' · L35–L37 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-005-rate-limit-y-health/app/Providers/AppServiceProvider.php#L35-L37)
- `app/Providers/AppServiceProvider.php` · RateLimiter 'api' · L39–L41 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-005-rate-limit-y-health/app/Providers/AppServiceProvider.php#L39-L41)
- `app/Http/Controllers/Api/HealthController.php` · __invoke · L16–L37 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-007/TRZ-007-005-rate-limit-y-health/app/Http/Controllers/Api/HealthController.php#L16-L37)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
