# INT-010 Validación Humana (HITL) — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-010-validacion-hitl-agente`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-010-validacion-hitl-agente)
- **Dominio funcional:** IA Asistida / HITL
- **Responsable (Agent Coach):** Annelise
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-010-validacion-hitl-agente/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-010-001 | Revisión técnica de diagnósticos (validar, rechazar, re-muestrear) en el panel HITL. | Implementado | 3 | [TRZ-010-001-validacion-tecnico](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-001-validacion-tecnico) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-001-validacion-tecnico/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-010_Validacion_HITL_Agente/TRZ-010-001_validacion_tecnico.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-010/TRZ-010-001-validacion-tecnico) |
| TRZ-010-002 | Envío de decisión HITL: PATCH si está en nube, reencolado si está en dispositivo. | Implementado | 5 | [TRZ-010-002-registro-decision-tecnica](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-002-registro-decision-tecnica) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-002-registro-decision-tecnica/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-010_Validacion_HITL_Agente/TRZ-010-002_registro_decision_tecnica.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-010/TRZ-010-002-registro-decision-tecnica) |
| TRZ-010-003 | Registro de etiqueta humana corregida para reentrenar el modelo. | Implementado | 4 | [TRZ-010-003-correcciones-humanas](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-003-correcciones-humanas) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-003-correcciones-humanas/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-010_Validacion_HITL_Agente/TRZ-010-003_correcciones_humanas.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-010/TRZ-010-003-correcciones-humanas) |
| TRZ-010-004 | Agente conversacional RAG que responde preguntas usando el catálogo con citas. | Implementado | 3 | [TRZ-010-004-agente-rag-catalogo](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-004-agente-rag-catalogo) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-004-agente-rag-catalogo/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-010_Validacion_HITL_Agente/TRZ-010-004_agente_rag_catalogo.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-010/TRZ-010-004-agente-rag-catalogo) |
| TRZ-010-005 | Barreras del agente: no diagnostica imágenes, no recomienda productos, restringe HITL. | Implementado | 3 | [TRZ-010-005-limites-asistente](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-005-limites-asistente) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-005-limites-asistente/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-010_Validacion_HITL_Agente/TRZ-010-005_limites_asistente.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-010/TRZ-010-005-limites-asistente) |

## Código de cada Misión

### TRZ-010-001 — Revisión técnica de diagnósticos (validar, rechazar, re-muestrear) en el panel HITL.

- `resources/js/pages/HitlPage.jsx` · HitlPage · L22–L134 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-001-validacion-tecnico/resources/js/pages/HitlPage.jsx#L22-L134)
- `resources/js/lib/roles.js` · canReviewHitl · L11–L13 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-001-validacion-tecnico/resources/js/lib/roles.js#L11-L13)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-010-002 — Envío de decisión HITL: PATCH si está en nube, reencolado si está en dispositivo.

- `resources/js/RoyaGuard.jsx` · patchDiagnostico · L222–L236 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-002-registro-decision-tecnica/resources/js/RoyaGuard.jsx#L222-L236)
- `app/Http/Controllers/Api/DiagnosticoController.php` · update · L88–L99 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-002-registro-decision-tecnica/app/Http/Controllers/Api/DiagnosticoController.php#L88-L99)
- `app/Http/Requests/UpdateDiagnosticoRequest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-002-registro-decision-tecnica/app/Http/Requests/UpdateDiagnosticoRequest.php)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera análisis estático?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-010-003 — Registro de etiqueta humana corregida para reentrenar el modelo.

- `resources/js/lib/agente.js` · registrarCorreccion · L198–L215 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-003-correcciones-humanas/resources/js/lib/agente.js#L198-L215)
- `app/Models/Diagnostico.php` · etiqueta_humana · L59 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-003-correcciones-humanas/app/Models/Diagnostico.php#L59)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-010-004 — Agente conversacional RAG que responde preguntas usando el catálogo con citas.

- `resources/js/lib/agente.js` · recuperarCatalogo · L127–L161 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-004-agente-rag-catalogo/resources/js/lib/agente.js#L127-L161)
- `resources/js/lib/agente.js` · consultarAgente · L370–L420 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-004-agente-rag-catalogo/resources/js/lib/agente.js#L370-L420)
- `resources/js/lib/catalogo.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-004-agente-rag-catalogo/resources/js/lib/catalogo.js)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-010-005 — Barreras del agente: no diagnostica imágenes, no recomienda productos, restringe HITL.

- `resources/js/lib/agente.js` · STAFF_ONLY · L43 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-005-limites-asistente/resources/js/lib/agente.js#L43)
- `resources/js/lib/agente.js` · puedeAfirmarRoya · L61–L67 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-005-limites-asistente/resources/js/lib/agente.js#L61-L67)
- `resources/js/lib/agente.js` · sistemaAfirma · L69–L77 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-005-limites-asistente/resources/js/lib/agente.js#L69-L77)
- `resources/js/lib/agente.js` · detectarIntencion · L79–L125 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-005-limites-asistente/resources/js/lib/agente.js#L79-L125)
- `resources/js/components/AgentePanel.jsx` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-010/TRZ-010-005-limites-asistente/resources/js/components/AgentePanel.jsx)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
