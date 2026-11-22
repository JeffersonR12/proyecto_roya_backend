# INT-004 Análisis Fitosanitario — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-004-analisis-fitosanitario`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-004-analisis-fitosanitario)
- **Dominio funcional:** Dominio Fitosanitario / Backend
- **Responsable (Agent Coach):** Annelise
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-004-analisis-fitosanitario/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-004-001 | Modelo de dominio Diagnóstico con 4 clases y regla de "no concluyente" si confianza < 75%. | Implementado | 4 | [TRZ-004-001-regla-no-concluyente](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-001-regla-no-concluyente) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-001-regla-no-concluyente/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-004_Analisis_Fitosanitario/TRZ-004-001_regla_no_concluyente.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-004/TRZ-004-001-regla-no-concluyente) |
| TRZ-004-002 | Trazabilidad del diagnóstico: UUID único, versión de modelo, coordenadas y scores. | Implementado | 4 | [TRZ-004-002-trazabilidad-diagnostico](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-002-trazabilidad-diagnostico) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-002-trazabilidad-diagnostico/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-004_Analisis_Fitosanitario/TRZ-004-002_trazabilidad_diagnostico.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-004/TRZ-004-002-trazabilidad-diagnostico) |
| TRZ-004-003 | Separación entre confianza (modelo) y severidad (foliar en campo), dos métricas que nunca se mezclan. | Implementado | 4 | [TRZ-004-003-confianza-vs-severidad](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-003-confianza-vs-severidad) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-003-confianza-vs-severidad/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-004_Analisis_Fitosanitario/TRZ-004-003_confianza_vs_severidad.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-004/TRZ-004-003-confianza-vs-severidad) |
| TRZ-004-004 | Gestión de evidencias: guardar imagen validando tipo real y tamaño máximo (2MB). | Implementado | 4 | [TRZ-004-004-gestion-evidencias](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-004-gestion-evidencias) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-004-gestion-evidencias/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-004_Analisis_Fitosanitario/TRZ-004-004_gestion_evidencias.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-004/TRZ-004-004-gestion-evidencias) |
| TRZ-004-005 | Baja lógica de diagnósticos (SoftDeletes) para auditoría y clasificación de riesgo. | Implementado | 4 | [TRZ-004-005-baja-logica-riesgo](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-005-baja-logica-riesgo) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-005-baja-logica-riesgo/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-004_Analisis_Fitosanitario/TRZ-004-005_baja_logica_riesgo.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-004/TRZ-004-005-baja-logica-riesgo) |

## Código de cada Misión

### TRZ-004-001 — Modelo de dominio Diagnóstico con 4 clases y regla de "no concluyente" si confianza < 75%.

- `app/Models/Diagnostico.php` · booted · L75–L84 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-001-regla-no-concluyente/app/Models/Diagnostico.php#L75-L84)
- `app/Models/Diagnostico.php` · claseEfectiva · L87–L94 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-001-regla-no-concluyente/app/Models/Diagnostico.php#L87-L94)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-004-002 — Trazabilidad del diagnóstico: UUID único, versión de modelo, coordenadas y scores.

- `app/Models/Diagnostico.php` · protected $fillable · L40–L60 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-002-trazabilidad-diagnostico/app/Models/Diagnostico.php#L40-L60)
- `app/Models/Diagnostico.php` · function casts · L62–L73 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-002-trazabilidad-diagnostico/app/Models/Diagnostico.php#L62-L73)
- `database/migrations/2026_10_04_180006_create_diagnosticos_table.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-002-trazabilidad-diagnostico/database/migrations/2026_10_04_180006_create_diagnosticos_table.php)
- `database/migrations/2026_11_06_000001_add_sync_and_hitl_fields_to_diagnosticos_table.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-002-trazabilidad-diagnostico/database/migrations/2026_11_06_000001_add_sync_and_hitl_fields_to_diagnosticos_table.php)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-004-003 — Separación entre confianza (modelo) y severidad (foliar en campo), dos métricas que nunca se mezclan.

- `app/Models/Diagnostico.php` · protected $fillable · L40–L60 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-003-confianza-vs-severidad/app/Models/Diagnostico.php#L40-L60)
- `app/Models/Diagnostico.php` · function casts · L62–L73 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-003-confianza-vs-severidad/app/Models/Diagnostico.php#L62-L73)
- `resources/js/lib/risk.js` · getRiskLevel · L5–L19 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-003-confianza-vs-severidad/resources/js/lib/risk.js#L5-L19)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-004-004 — Gestión de evidencias: guardar imagen validando tipo real y tamaño máximo (2MB).

- `app/Services/EvidenciaStore.php` · guardarDataUrl · L24–L51 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-004-gestion-evidencias/app/Services/EvidenciaStore.php#L24-L51)
- `app/Http/Controllers/Api/DiagnosticoController.php` · imagen · L110–L123 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-004-gestion-evidencias/app/Http/Controllers/Api/DiagnosticoController.php#L110-L123)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-004-005 — Baja lógica de diagnósticos (SoftDeletes) para auditoría y clasificación de riesgo.

- `app/Models/Diagnostico.php` · SoftDeletes · L10 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-005-baja-logica-riesgo/app/Models/Diagnostico.php#L10)
- `app/Models/Diagnostico.php` · SoftDeletes · L15 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-005-baja-logica-riesgo/app/Models/Diagnostico.php#L15)
- `app/Http/Controllers/Api/DiagnosticoController.php` · destroy · L102–L107 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-005-baja-logica-riesgo/app/Http/Controllers/Api/DiagnosticoController.php#L102-L107)
- `resources/js/lib/risk.js` · getRiskLevel · L5–L19 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-005-baja-logica-riesgo/resources/js/lib/risk.js#L5-L19)
- `resources/js/lib/risk.js` · getRiskMeta · L21–L59 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-004/TRZ-004-005-baja-logica-riesgo/resources/js/lib/risk.js#L21-L59)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
