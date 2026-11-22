# INT-012 Aseguramiento de Calidad — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-012-aseguramiento-calidad`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-012-aseguramiento-calidad)
- **Dominio funcional:** QA / Testing
- **Responsable (Agent Coach):** Jhoan Sosa Porras
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-012-aseguramiento-calidad/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-012-001 | Pruebas de autenticación y recuperación de contraseña (token un solo uso, revocación). | Implementado | 1 | [TRZ-012-001-pruebas-seguridad-acceso](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-001-pruebas-seguridad-acceso) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-012_Aseguramiento_Calidad/TRZ-012-001_pruebas_seguridad_acceso.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-012/TRZ-012-001-pruebas-seguridad-acceso) |
| TRZ-012-002 | Pruebas de API de sincronización (18 casos: idempotencia, conflictos, RBAC). | Implementado | 1 | [TRZ-012-002-pruebas-sincronizacion](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-002-pruebas-sincronizacion) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-002-pruebas-sincronizacion/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-012_Aseguramiento_Calidad/TRZ-012-002_pruebas_sincronizacion.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-012/TRZ-012-002-pruebas-sincronizacion) |
| TRZ-012-003 | Pruebas de reglas de dominio (umbral de confianza, unicidad UUID, independencia). | Implementado | 1 | [TRZ-012-003-pruebas-dominio](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-003-pruebas-dominio) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-003-pruebas-dominio/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-012_Aseguramiento_Calidad/TRZ-012-003_pruebas_dominio.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-012/TRZ-012-003-pruebas-dominio) |
| TRZ-012-004 | Pruebas unitarias de frontend (106 casos: cola, inferencia, alertas, agente). | Implementado | 2 | [TRZ-012-004-pruebas-frontend](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-004-pruebas-frontend) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-012_Aseguramiento_Calidad/TRZ-012-004_pruebas_frontend.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-012/TRZ-012-004-pruebas-frontend) |
| TRZ-012-005 | Prueba de humo E2E en servidor real y análisis estático con SonarQube. | Implementado | 1 | [TRZ-012-005-validacion-e2e-y-estatica](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-005-validacion-e2e-y-estatica) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-005-validacion-e2e-y-estatica/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-012_Aseguramiento_Calidad/TRZ-012-005_validacion_e2e_y_estatica.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-012/TRZ-012-005-validacion-e2e-y-estatica) |

## Código de cada Misión

### TRZ-012-001 — Pruebas de autenticación y recuperación de contraseña (token un solo uso, revocación).

- `tests/Feature/AuthLoginTest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/tests/Feature/AuthLoginTest.php)
- `tests/Feature/AuthSessionTest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/tests/Feature/AuthSessionTest.php)
- `tests/Feature/PasswordResetTest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/tests/Feature/PasswordResetTest.php)
- `tests/Unit/AuthRulesTest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-001-pruebas-seguridad-acceso/tests/Unit/AuthRulesTest.php)
- **Criterios en "No":** ¿Revisión de código aprobada (VCR)?

### TRZ-012-002 — Pruebas de API de sincronización (18 casos: idempotencia, conflictos, RBAC).

- `tests/Feature/SyncDiagnosticosApiTest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-002-pruebas-sincronizacion/tests/Feature/SyncDiagnosticosApiTest.php)
- **Criterios en "No":** ¿Revisión de código aprobada (VCR)?

### TRZ-012-003 — Pruebas de reglas de dominio (umbral de confianza, unicidad UUID, independencia).

- `tests/Feature/TenantDiagnosticoTest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-003-pruebas-dominio/tests/Feature/TenantDiagnosticoTest.php)
- `tests/Feature/DomainSchemaTest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-003-pruebas-dominio/tests/Feature/DomainSchemaTest.php)
- **Criterios en "No":** ¿Revisión de código aprobada (VCR)?

### TRZ-012-004 — Pruebas unitarias de frontend (106 casos: cola, inferencia, alertas, agente).

- `vitest.config.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/vitest.config.js)
- `resources/js/lib/agente.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/agente.test.js)
- `resources/js/lib/alertas.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/alertas.test.js)
- `resources/js/lib/auth.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/auth.test.js)
- `resources/js/lib/authAlerts.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/authAlerts.test.js)
- `resources/js/lib/catalogo.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/catalogo.test.js)
- `resources/js/lib/diagnosticosDb.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/diagnosticosDb.test.js)
- `resources/js/lib/fieldFlow.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/fieldFlow.test.js)
- `resources/js/lib/fieldOps.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/fieldOps.test.js)
- `resources/js/lib/inference.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/inference.test.js)
- `resources/js/lib/onnxEngine.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/onnxEngine.test.js)
- `resources/js/lib/parcelasStore.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/parcelasStore.test.js)
- `resources/js/lib/pwa.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/pwa.test.js)
- `resources/js/lib/reportes.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/reportes.test.js)
- `resources/js/lib/risk.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/risk.test.js)
- `resources/js/lib/roles.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/roles.test.js)
- `resources/js/lib/syncQueue.test.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-004-pruebas-frontend/resources/js/lib/syncQueue.test.js)
- **Criterios en "No":** ¿Supera análisis estático?; ¿Revisión de código aprobada (VCR)?

### TRZ-012-005 — Prueba de humo E2E en servidor real y análisis estático con SonarQube.

- `cypress.config.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-005-validacion-e2e-y-estatica/cypress.config.js)
- `cypress/e2e` · (carpeta) · carpeta → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-005-validacion-e2e-y-estatica/cypress/e2e)
- `cypress/support` · (carpeta) · carpeta → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-005-validacion-e2e-y-estatica/cypress/support)
- `sonar-project.properties` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-005-validacion-e2e-y-estatica/sonar-project.properties)
- **Criterios en "No":** ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
