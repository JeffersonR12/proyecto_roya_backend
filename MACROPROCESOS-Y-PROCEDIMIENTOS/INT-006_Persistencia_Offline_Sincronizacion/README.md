# INT-006 Persistencia Offline — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-006-persistencia-offline-sincronizacion`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-006-persistencia-offline-sincronizacion)
- **Dominio funcional:** Sincronización Edge-Cloud
- **Responsable (Agent Coach):** Jefferson Huaman Lazaro
- **Misiones (procedimientos TRZ):** 6
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-006-persistencia-offline-sincronizacion/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-006-001 | Almacenamiento local de diagnósticos en IndexedDB (modo offline). | Implementado | 3 | [TRZ-006-001-guardado-indexeddb](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-001-guardado-indexeddb) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-001-guardado-indexeddb/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-001_guardado_indexeddb.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-006/TRZ-006-001-guardado-indexeddb) |
| TRZ-006-002 | Cola de sincronización con estados (pending, sending, confirmed, error). | Implementado | 3 | [TRZ-006-002-estados-envio](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-002-estados-envio) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-002-estados-envio/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-002_estados_envio.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-006/TRZ-006-002-estados-envio) |
| TRZ-006-003 | Disparo automático de sincronización (al abrir app, al volver conexión, cada 60s). | Implementado | 4 | [TRZ-006-003-sincronizacion-automatica](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-003-sincronizacion-automatica) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-003-sincronizacion-automatica/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-003_sincronizacion_automatica.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-006/TRZ-006-003-sincronizacion-automatica) |
| TRZ-006-004 | Tolerancia a fallos en sincronización (reintentos con espera creciente, aviso de sesión). | Implementado | 3 | [TRZ-006-004-recuperacion-fallos-red](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-004-recuperacion-fallos-red) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-004_recuperacion_fallos_red.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-006/TRZ-006-004-recuperacion-fallos-red) |
| TRZ-006-005 | Sincronización idempotente en servidor (lote transaccional, respuesta por ítem). | Implementado | 4 | [TRZ-006-005-recepcion-lotes-idempotente](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-005-recepcion-lotes-idempotente) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-005_recepcion_lotes_idempotente.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-006/TRZ-006-005-recepcion-lotes-idempotente) |
| TRZ-006-006 | Service Worker y PWA para precachear modelo ONNX y WASM sin conexión. | Implementado | 5 | [TRZ-006-006-pwa-offline](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-006-pwa-offline) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-006_pwa_offline.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-006/TRZ-006-006-pwa-offline) |

## Código de cada Misión

### TRZ-006-001 — Almacenamiento local de diagnósticos en IndexedDB (modo offline).

- `resources/js/lib/diagnosticosDb.js` · saveDiagnostico · L44–L56 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-001-guardado-indexeddb/resources/js/lib/diagnosticosDb.js#L44-L56)
- `resources/js/lib/diagnosticosDb.js` · listDiagnosticos · L58–L77 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-001-guardado-indexeddb/resources/js/lib/diagnosticosDb.js#L58-L77)
- `resources/js/lib/inference.js` · createDiagnosticoLocal · L74–L96 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-001-guardado-indexeddb/resources/js/lib/inference.js#L74-L96)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-006-002 — Cola de sincronización con estados (pending, sending, confirmed, error).

- `resources/js/lib/syncQueue.js` · successPatch · L73–L82 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-002-estados-envio/resources/js/lib/syncQueue.js#L73-L82)
- `resources/js/lib/syncQueue.js` · failurePatch · L84–L95 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-002-estados-envio/resources/js/lib/syncQueue.js#L84-L95)
- `resources/js/lib/syncQueue.js` · finalErrorPatch · L97–L105 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-002-estados-envio/resources/js/lib/syncQueue.js#L97-L105)
- `resources/js/lib/syncQueue.js` · patchForResult · L108–L122 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-002-estados-envio/resources/js/lib/syncQueue.js#L108-L122)
- `resources/js/lib/diagnosticosDb.js` · markSyncStatus · L116–L118 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-002-estados-envio/resources/js/lib/diagnosticosDb.js#L116-L118)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-006-003 — Disparo automático de sincronización (al abrir app, al volver conexión, cada 60s).

- `resources/js/RoyaGuard.jsx` · runSync · L132–L165 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-003-sincronizacion-automatica/resources/js/RoyaGuard.jsx#L132-L165)
- `resources/js/pages/SettingsPage.jsx` · syncNow · L30–L37 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-003-sincronizacion-automatica/resources/js/pages/SettingsPage.jsx#L30-L37)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera análisis estático?; ¿Revisión de código aprobada (VCR)?

### TRZ-006-004 — Tolerancia a fallos en sincronización (reintentos con espera creciente, aviso de sesión).

- `resources/js/lib/syncQueue.js` · STALE_SENDING_MS · L8 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/resources/js/lib/syncQueue.js#L8)
- `resources/js/lib/syncQueue.js` · nextRetryDelay · L13–L17 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/resources/js/lib/syncQueue.js#L13-L17)
- `resources/js/lib/syncQueue.js` · isDue · L20–L45 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/resources/js/lib/syncQueue.js#L20-L45)
- `resources/js/lib/syncQueue.js` · requeuePatch · L125–L134 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/resources/js/lib/syncQueue.js#L125-L134)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-006-005 — Sincronización idempotente en servidor (lote transaccional, respuesta por ítem).

- `app/Services/DiagnosticoSyncService.php` · sincronizar · L40–L55 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L40-L55)
- `app/Services/DiagnosticoSyncService.php` · procesar · L61–L117 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L61-L117)
- `app/Services/DiagnosticoSyncService.php` · resolverExistente · L123–L155 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L123-L155)
- `app/Services/DiagnosticoSyncService.php` · mismoContenido · L158–L167 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L158-L167)
- `app/Services/DiagnosticoSyncService.php` · resultado · L230–L247 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Services/DiagnosticoSyncService.php#L230-L247)
- `app/Models/SyncEvent.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/app/Models/SyncEvent.php)
- `database/migrations/2026_10_04_180007_create_alertas_and_sync_events_tables.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-005-recepcion-lotes-idempotente/database/migrations/2026_10_04_180007_create_alertas_and_sync_events_tables.php)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-006-006 — Service Worker y PWA para precachear modelo ONNX y WASM sin conexión.

- `public/sw.js` · precache · L72–L77 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L72-L77)
- `public/sw.js` · precacheShell · L82–L92 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L82-L92)
- `public/sw.js` · buildAssets · L94–L112 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L94-L112)
- `public/sw.js` · networkFirstShell · L114–L133 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L114-L133)
- `public/sw.js` · cacheFirstResponse · L135–L149 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/sw.js#L135-L149)
- `public/manifest.webmanifest` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/public/manifest.webmanifest)
- `resources/js/lib/pwa.js` · registerEdgeWorker · L1–L11 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-006-pwa-offline/resources/js/lib/pwa.js#L1-L11)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Se integra sin corrección?; ¿Supera análisis estático?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
