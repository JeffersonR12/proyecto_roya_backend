# INT-008 Gestión de Parcelas — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-008-gestion-parcelas`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-008-gestion-parcelas)
- **Dominio funcional:** Gestión Agrícola
- **Responsable (Agent Coach):** Annelise
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-008-gestion-parcelas/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-008-001 | Tabla de parcelas con tenant, usuario, coordenadas, área y cultivo. | Implementado | 4 | [TRZ-008-001-registro-lotes](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-001-registro-lotes) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-001-registro-lotes/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-008_Gestion_Parcelas/TRZ-008-001_registro_lotes.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-008/TRZ-008-001-registro-lotes) |
| TRZ-008-002 | Gestión de lotes en cliente (crear, actualizar, eliminar) recordando el último usado. | Implementado | 3 | [TRZ-008-002-lotes-en-dispositivo](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-002-lotes-en-dispositivo) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-002-lotes-en-dispositivo/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-008_Gestion_Parcelas/TRZ-008-002_lotes_en_dispositivo.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-008/TRZ-008-002-lotes-en-dispositivo) |
| TRZ-008-003 | Alta automática de parcela en la nube al sincronizar (firstOrCreate por tenant). | Implementado | 4 | [TRZ-008-003-creacion-lotes-nube](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-003-creacion-lotes-nube) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-003-creacion-lotes-nube/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-008_Gestion_Parcelas/TRZ-008-003_creacion_lotes_nube.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-008/TRZ-008-003-creacion-lotes-nube) |
| TRZ-008-004 | Validación de parcela: rechazar parcelas de otro tenant; agricultor solo usa las suyas. | Implementado | 4 | [TRZ-008-004-bloqueo-parcelas-ajenas](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-004-bloqueo-parcelas-ajenas) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-004-bloqueo-parcelas-ajenas/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-008_Gestion_Parcelas/TRZ-008-004_bloqueo_parcelas_ajenas.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-008/TRZ-008-004-bloqueo-parcelas-ajenas) |
| TRZ-008-005 | Pantalla de gestión de parcelas y consulta API con conteo de diagnósticos. | Implementado | 4 | [TRZ-008-005-visualizacion-lotes](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-005-visualizacion-lotes) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-005-visualizacion-lotes/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-008_Gestion_Parcelas/TRZ-008-005_visualizacion_lotes.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-008/TRZ-008-005-visualizacion-lotes) |

## Código de cada Misión

### TRZ-008-001 — Tabla de parcelas con tenant, usuario, coordenadas, área y cultivo.

- `app/Models/Parcela.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-001-registro-lotes/app/Models/Parcela.php)
- `database/migrations/2026_10_04_180004_create_parcelas_table.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-001-registro-lotes/database/migrations/2026_10_04_180004_create_parcelas_table.php)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-008-002 — Gestión de lotes en cliente (crear, actualizar, eliminar) recordando el último usado.

- `resources/js/lib/parcelasStore.js` · listParcelas · L13–L16 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-002-lotes-en-dispositivo/resources/js/lib/parcelasStore.js#L13-L16)
- `resources/js/lib/parcelasStore.js` · upsertParcela · L23–L48 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-002-lotes-en-dispositivo/resources/js/lib/parcelasStore.js#L23-L48)
- `resources/js/lib/parcelasStore.js` · removeParcela · L50–L52 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-002-lotes-en-dispositivo/resources/js/lib/parcelasStore.js#L50-L52)
- `resources/js/lib/parcelasStore.js` · getLastLote · L54–L60 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-002-lotes-en-dispositivo/resources/js/lib/parcelasStore.js#L54-L60)
- `resources/js/lib/parcelasStore.js` · setLastLote · L62–L68 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-002-lotes-en-dispositivo/resources/js/lib/parcelasStore.js#L62-L68)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-008-003 — Alta automática de parcela en la nube al sincronizar (firstOrCreate por tenant).

- `app/Services/DiagnosticoSyncService.php` · resolverParcela · L182–L204 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-003-creacion-lotes-nube/app/Services/DiagnosticoSyncService.php#L182-L204)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-008-004 — Validación de parcela: rechazar parcelas de otro tenant; agricultor solo usa las suyas.

- `app/Services/DiagnosticoSyncService.php` · resolverParcela · L182–L204 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-004-bloqueo-parcelas-ajenas/app/Services/DiagnosticoSyncService.php#L182-L204)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-008-005 — Pantalla de gestión de parcelas y consulta API con conteo de diagnósticos.

- `resources/js/pages/ParcelasPage.jsx` · ParcelasPage · L5–L145 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-005-visualizacion-lotes/resources/js/pages/ParcelasPage.jsx#L5-L145)
- `app/Http/Controllers/Api/ConsultaController.php` · parcelas · L28–L41 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-005-visualizacion-lotes/app/Http/Controllers/Api/ConsultaController.php#L28-L41)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
