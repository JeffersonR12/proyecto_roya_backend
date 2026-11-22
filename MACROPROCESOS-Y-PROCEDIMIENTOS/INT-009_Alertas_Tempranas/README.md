# INT-009 Alertas Tempranas — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-009-alertas-tempranas`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-009-alertas-tempranas)
- **Dominio funcional:** Alertas y Monitoreo
- **Responsable (Agent Coach):** Annelise
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-009-alertas-tempranas/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-009-001 | Motor de alertas (roya detectada / roya crítica) según severidad y umbral. | Implementado | 4 | [TRZ-009-001-alerta-roya](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-001-alerta-roya) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-001-alerta-roya/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-009_Alertas_Tempranas/TRZ-009-001_alerta_roya.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-009/TRZ-009-001-alerta-roya) |
| TRZ-009-002 | Ciclo de vida de la alerta: una por diagnóstico, se actualiza o descarta según validación. | Implementado | 4 | [TRZ-009-002-ciclo-vida-alertas](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-002-ciclo-vida-alertas) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-002-ciclo-vida-alertas/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-009_Alertas_Tempranas/TRZ-009-002_ciclo_vida_alertas.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-009/TRZ-009-002-ciclo-vida-alertas) |
| TRZ-009-003 | Alertas en cliente: roya por lote, revisiones HITL pendientes y envíos fallidos. | Implementado | 4 | [TRZ-009-003-avisos-en-app](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-003-avisos-en-app) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-009_Alertas_Tempranas/TRZ-009-003_avisos_en_app.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-009/TRZ-009-003-avisos-en-app) |
| TRZ-009-004 | Garantía de no falsos positivos: nunca alertar si el resultado es no concluyente. | Implementado | 4 | [TRZ-009-004-sin-falsas-alarmas](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-004-sin-falsas-alarmas) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-004-sin-falsas-alarmas/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-009_Alertas_Tempranas/TRZ-009-004_sin_falsas_alarmas.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-009/TRZ-009-004-sin-falsas-alarmas) |
| TRZ-009-005 | Consulta GET /api/alertas, marcado como leída (PATCH /api/alertas/{id}/leida), paneles Dashboard, History y AlertsPage. | Implementado | 5 | [TRZ-009-005-gestion-alertas-paneles](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-005-gestion-alertas-paneles) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-005-gestion-alertas-paneles/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-009_Alertas_Tempranas/TRZ-009-005_gestion_alertas_paneles.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-009/TRZ-009-005-gestion-alertas-paneles) |

## Código de cada Misión

### TRZ-009-001 — Motor de alertas (roya detectada / roya crítica) según severidad y umbral.

- `app/Services/AlertaService.php` · tipoPara · L56–L72 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-001-alerta-roya/app/Services/AlertaService.php#L56-L72)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-009-002 — Ciclo de vida de la alerta: una por diagnóstico, se actualiza o descarta según validación.

- `app/Services/AlertaService.php` · evaluar · L18–L54 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-002-ciclo-vida-alertas/app/Services/AlertaService.php#L18-L54)
- `app/Http/Controllers/Api/DiagnosticoController.php` · update · L88–L99 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-002-ciclo-vida-alertas/app/Http/Controllers/Api/DiagnosticoController.php#L88-L99)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-009-003 — Alertas en cliente: roya por lote, revisiones HITL pendientes y envíos fallidos.

- `resources/js/lib/alertas.js` · tiempoRelativo · L19–L41 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/lib/alertas.js#L19-L41)
- `resources/js/lib/alertas.js` · buildAlertas · L47–L138 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/lib/alertas.js#L47-L138)
- `resources/js/lib/alertas.js` · contarAlertas · L141–L143 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/lib/alertas.js#L141-L143)
- `resources/js/RoyaGuard.jsx` · contarAlertas · L100 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/RoyaGuard.jsx#L100)
- `resources/js/RoyaGuard.jsx` · contarAlertas · L101 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/RoyaGuard.jsx#L101)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera análisis estático?; ¿Revisión de código aprobada (VCR)?

### TRZ-009-004 — Garantía de no falsos positivos: nunca alertar si el resultado es no concluyente.

- `resources/js/lib/alertas.js` · neverAlertsRoyaIfInconclusive · L145–L147 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-004-sin-falsas-alarmas/resources/js/lib/alertas.js#L145-L147)
- `app/Services/AlertaService.php` · tipoPara · L56–L72 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-004-sin-falsas-alarmas/app/Services/AlertaService.php#L56-L72)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-009-005 — Consulta GET /api/alertas, marcado como leída (PATCH /api/alertas/{id}/leida), paneles Dashboard, History y AlertsPage.

- `app/Http/Controllers/Api/ConsultaController.php` · alertas · L43–L59 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-005-gestion-alertas-paneles/app/Http/Controllers/Api/ConsultaController.php#L43-L59)
- `app/Http/Controllers/Api/ConsultaController.php` · marcarAlertaLeida · L61–L73 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-005-gestion-alertas-paneles/app/Http/Controllers/Api/ConsultaController.php#L61-L73)
- `resources/js/pages/AlertsPage.jsx` · AlertsPage · L59–L110 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-005-gestion-alertas-paneles/resources/js/pages/AlertsPage.jsx#L59-L110)
- `resources/js/components/Dashboard.jsx` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-005-gestion-alertas-paneles/resources/js/components/Dashboard.jsx)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Se evita redundancia?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
