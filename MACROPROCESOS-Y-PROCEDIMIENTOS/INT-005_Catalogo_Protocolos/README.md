# INT-005 Catálogo Fitosanitario — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-005-catalogo-protocolos`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-005-catalogo-protocolos)
- **Dominio funcional:** Dominio Fitosanitario / Backend
- **Responsable (Agent Coach):** Annelise
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-005-catalogo-protocolos/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-005-001 | Catálogo fitosanitario con agente causal, síntomas y umbral de alerta. | Implementado | 4 | [TRZ-005-001-catalogo-fitosanitario](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-001-catalogo-fitosanitario) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-001-catalogo-fitosanitario/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-005_Catalogo_Protocolos/TRZ-005-001_catalogo_fitosanitario.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-005/TRZ-005-001-catalogo-fitosanitario) |
| TRZ-005-002 | Asociación automática de cada diagnóstico con su ficha del catálogo. | Implementado | 4 | [TRZ-005-002-vinculo-ficha-catalogo](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-002-vinculo-ficha-catalogo) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-002-vinculo-ficha-catalogo/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-005_Catalogo_Protocolos/TRZ-005-002_vinculo_ficha_catalogo.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-005/TRZ-005-002-vinculo-ficha-catalogo) |
| TRZ-005-003 | Motor de protocolos que decide cuándo tratar según severidad y umbral. | Implementado | 3 | [TRZ-005-003-protocolo-por-severidad](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-003-protocolo-por-severidad) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-003-protocolo-por-severidad/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-005_Catalogo_Protocolos/TRZ-005-003_protocolo_por_severidad.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-005/TRZ-005-003-protocolo-por-severidad) |
| TRZ-005-004 | Regla de seguridad HITL: protocolo químico solo si confianza ≥ 75% y validación técnica. | Implementado | 3 | [TRZ-005-004-bloqueo-tratamiento-sin-validacion](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-004-bloqueo-tratamiento-sin-validacion) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-004-bloqueo-tratamiento-sin-validacion/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-005_Catalogo_Protocolos/TRZ-005-004_bloqueo_tratamiento_sin_validacion.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-005/TRZ-005-004-bloqueo-tratamiento-sin-validacion) |
| TRZ-005-005 | Consulta del catálogo vía API y vista de protocolo. | Implementado | 4 | [TRZ-005-005-consulta-catalogo-protocolos](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-005-consulta-catalogo-protocolos) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-005-consulta-catalogo-protocolos/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-005_Catalogo_Protocolos/TRZ-005-005_consulta_catalogo_protocolos.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-005/TRZ-005-005-consulta-catalogo-protocolos) |

## Código de cada Misión

### TRZ-005-001 — Catálogo fitosanitario con agente causal, síntomas y umbral de alerta.

- `app/Models/CatalogoFitosanitario.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-001-catalogo-fitosanitario/app/Models/CatalogoFitosanitario.php)
- `database/migrations/2026_10_04_180005_create_catalogo_fitosanitario_table.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-001-catalogo-fitosanitario/database/migrations/2026_10_04_180005_create_catalogo_fitosanitario_table.php)
- `database/seeders/CatalogoFitosanitarioSeeder.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-001-catalogo-fitosanitario/database/seeders/CatalogoFitosanitarioSeeder.php)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-005-002 — Asociación automática de cada diagnóstico con su ficha del catálogo.

- `app/Services/DiagnosticoSyncService.php` · catalogoId · L218–L227 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-002-vinculo-ficha-catalogo/app/Services/DiagnosticoSyncService.php#L218-L227)
- `app/Models/Diagnostico.php` · CATALOGO_POR_CLASE · L35–L38 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-002-vinculo-ficha-catalogo/app/Models/Diagnostico.php#L35-L38)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-005-003 — Motor de protocolos que decide cuándo tratar según severidad y umbral.

- `resources/js/lib/catalogo.js` · protocoloPara · L66–L101 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-003-protocolo-por-severidad/resources/js/lib/catalogo.js#L66-L101)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-005-004 — Regla de seguridad HITL: protocolo químico solo si confianza ≥ 75% y validación técnica.

- `resources/js/lib/catalogo.js` · protocoloPara · L66–L101 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-004-bloqueo-tratamiento-sin-validacion/resources/js/lib/catalogo.js#L66-L101)
- `resources/js/lib/catalogo.js` · puedeActivarProtocolo · L89 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-004-bloqueo-tratamiento-sin-validacion/resources/js/lib/catalogo.js#L89)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-005-005 — Consulta del catálogo vía API y vista de protocolo.

- `app/Http/Controllers/Api/ConsultaController.php` · catalogo · L17–L26 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-005-consulta-catalogo-protocolos/app/Http/Controllers/Api/ConsultaController.php#L17-L26)
- `resources/js/pages/ProtocolPage.jsx` · ProtocolPage · L7–L82 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-005-consulta-catalogo-protocolos/resources/js/pages/ProtocolPage.jsx#L7-L82)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
