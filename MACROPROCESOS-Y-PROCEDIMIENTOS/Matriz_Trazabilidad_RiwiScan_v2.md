# Matriz de Trazabilidad SASE — RiwiScan (v2.0)

Generada el 2026-11-16 con evidencia del repositorio (rama `feature/jhoan-backend-roya`). La versión completa, con las 78 columnas de la matriz de referencia, las evidencias por criterio y las fórmulas, está en `Matriz_Trazabilidad_RiwiScan_v2.xlsx`.

**Estados:** En revisión: 18 · Pendiente: 44 · Total: 62

| TRZ | INT | Dominio | Responsable | Commit | Pruebas | % AI-DLC | % Coherencia | % Trazabilidad | % Estabilidad | Criterios en "No" | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TRZ-001-001 | INT-001 | Seguridad / Accesos | Jhoan | 6a2e717, d363c8d | PHPUnit AuthLoginTest: 5/5; PHPUnit AuthSessionTest: 9/9; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Cypress E2E-01: 1/1 (2026-11-12); Cypress… | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-001-002 | INT-001 | Seguridad / Accesos | Jhoan | 6a2e717, e855ee3 | PHPUnit AuthSessionTest: 9/9; PHPUnit AuthRulesTest: 2/2; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Cypress E2E-03: 3/3 (2026-11-12) | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-001-003 | INT-001 | Seguridad / Accesos | Jhoan | 6a2e717 | PHPUnit AuthLoginTest: 5/5 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-001-004 | INT-001 | Seguridad / Accesos | Jhoan | 6a2e717 | PHPUnit PasswordResetTest: 7/7; PHPUnit AuthSessionTest: 9/9; Cypress E2E-04: 1/2 (2026-11-12); 2/2 aprobados en re-ejecución aislada del 2026-11-16 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-001-005 | INT-001 | Seguridad / Accesos | Jhoan | 6a2e717 | PHPUnit PasswordResetTest: 7/7 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-001-006 | INT-001 | Seguridad / Accesos | Jhoan | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit AuthSessionTest: 9/9; Cypress E2E-01: 1/1 (2026-11-12) | 100 | 100 | 100 | 75 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-002-001 | INT-002 | Multi-Tenant / RBAC | Jhoan | 6a2e717, 210a1b2 | PHPUnit AuthSessionTest: 9/9; PHPUnit DomainSchemaTest: 4/4 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-002-002 | INT-002 | Multi-Tenant / RBAC | Jhoan | 6a2e717, 210a1b2 | PHPUnit DomainSchemaTest: 4/4; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12) | 100 | 87.5 | 100 | 83.34 | ¿Se evita redundancia?; ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-002-003 | INT-002 | Multi-Tenant / RBAC | Jhoan | 210a1b2 | PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-002-004 | INT-002 | Multi-Tenant / RBAC | Jhoan | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit ConsultaApiTest: 7/7 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-002-005 | INT-002 | Multi-Tenant / RBAC | Jhoan | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit ConsultaApiTest: 7/7; PHPUnit ReportApiTest: 11/11; Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12) | 100 | 100 | 100 | 75 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-003-001 | INT-003 | Edge AI / Frontend | Jefferson | 06fc39b | Vitest fieldFlow.test.js: 17/17; Cypress E2E-06: 1/1 (2026-11-12) | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-003-002 | INT-003 | Edge AI / Frontend | Jefferson | e855ee3, 210a1b2 | Vitest onnxEngine.test.js: 14/14; Cypress E2E-06: 1/1 (2026-11-12) | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-003-003 | INT-003 | Edge AI / Frontend | Jefferson | 210a1b2 | Vitest onnxEngine.test.js: 14/14; Cypress E2E-06: 1/1 (2026-11-12) | 100 | 100 | 100 | 87.5 | ¿Se integra sin corrección? | Pendiente |
| TRZ-003-004 | INT-003 | Edge AI / Frontend | Jefferson | e855ee3 | Vitest inference.test.js: 13/13; Vitest onnxEngine.test.js: 14/14; Cypress E2E-06: 1/1 (2026-11-12) | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-003-005 | INT-003 | Edge AI / Frontend | Jefferson | 06fc39b | Cypress E2E-06: 1/1 (2026-11-12) | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-004-001 | INT-004 | Dominio Fitosanitario / Backend | Annelise | 6a2e717 | PHPUnit DomainSchemaTest: 4/4; PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-004-002 | INT-004 | Dominio Fitosanitario / Backend | Annelise | 6a2e717, 210a1b2 | PHPUnit DomainSchemaTest: 4/4; PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-004-003 | INT-004 | Dominio Fitosanitario / Backend | Annelise | 6a2e717, e855ee3 | PHPUnit TenantDiagnosticoTest: 6/6; Vitest risk.test.js: 5/5 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-004-004 | INT-004 | Dominio Fitosanitario / Backend | Annelise | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-004-005 | INT-004 | Dominio Fitosanitario / Backend | Annelise | 6a2e717, e855ee3 | PHPUnit SyncDiagnosticosApiTest: 18/18; Vitest risk.test.js: 5/5 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-005-001 | INT-005 | Dominio Fitosanitario / Backend | Annelise | 210a1b2 | PHPUnit DomainSchemaTest: 4/4; PHPUnit ConsultaApiTest: 7/7 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-005-002 | INT-005 | Dominio Fitosanitario / Backend | Annelise | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-005-003 | INT-005 | Dominio Fitosanitario / Backend | Annelise | e855ee3 | Vitest catalogo.test.js: 10/10 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-005-004 | INT-005 | Dominio Fitosanitario / Backend | Annelise | e855ee3 | Vitest catalogo.test.js: 10/10 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-005-005 | INT-005 | Dominio Fitosanitario / Backend | Annelise | 6a2e717, e855ee3 | PHPUnit ConsultaApiTest: 7/7; Cypress E2E-05: 1/1 (2026-11-12) | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-006-001 | INT-006 | Sincronización Edge-Cloud | Jefferson | e855ee3 | Vitest diagnosticosDb.test.js: 8/8; Vitest inference.test.js: 13/13; Cypress E2E-06: 1/1 (2026-11-12) | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-006-002 | INT-006 | Sincronización Edge-Cloud | Jefferson | 6a2e717, e855ee3 | Vitest syncQueue.test.js: 14/14; Vitest diagnosticosDb.test.js: 8/8 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-006-003 | INT-006 | Sincronización Edge-Cloud | Jefferson | 6a2e717 | Vitest syncQueue.test.js: 14/14 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-006-004 | INT-006 | Sincronización Edge-Cloud | Jefferson | 6a2e717 | Vitest syncQueue.test.js: 14/14 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-006-005 | INT-006 | Sincronización Edge-Cloud | Jefferson | 6a2e717, 210a1b2 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-006-006 | INT-006 | Sincronización Edge-Cloud | Jefferson | 06fc39b, e855ee3, 210a1b2 | PHPUnit EdgePwaAssetsTest: 2/2; Vitest pwa.test.js: 4/4 | 100 | 100 | 100 | 87.5 | ¿Se integra sin corrección? | Pendiente |
| TRZ-007-001 | INT-007 | API / Backend | Jhoan | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 75 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-007-002 | INT-007 | API / Backend | Jhoan | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18; Cypress E2E-07: 2/2 (2026-11-12) | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-007-003 | INT-007 | API / Backend | Jhoan | 6a2e717 | PHPUnit ConsultaApiTest: 7/7 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-007-004 | INT-007 | API / Backend | Jhoan | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit ConsultaApiTest: 7/7; PHPUnit ReportApiTest: 11/11; PHPUnit AuthLoginTest: 5/5 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-007-005 | INT-007 | API / Backend | Jhoan | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-008-001 | INT-008 | Gestión Agrícola | Annelise | 210a1b2 | PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit ConsultaApiTest: 7/7 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-008-002 | INT-008 | Gestión Agrícola | Annelise | e855ee3 | Vitest parcelasStore.test.js: 8/8 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-008-003 | INT-008 | Gestión Agrícola | Annelise | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-008-004 | INT-008 | Gestión Agrícola | Annelise | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-008-005 | INT-008 | Gestión Agrícola | Annelise | 6a2e717, e855ee3 | PHPUnit ConsultaApiTest: 7/7 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-009-001 | INT-009 | Alertas y Monitoreo | Annelise | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-009-002 | INT-009 | Alertas y Monitoreo | Annelise | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18; PHPUnit ConsultaApiTest: 7/7 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-009-003 | INT-009 | Alertas y Monitoreo | Annelise | 6a2e717, 06fc39b | Vitest alertas.test.js: 13/13; Cypress E2E-05: 1/1 (2026-11-12) | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-009-004 | INT-009 | Alertas y Monitoreo | Annelise | 6a2e717, 06fc39b | PHPUnit SyncDiagnosticosApiTest: 18/18; Vitest alertas.test.js: 13/13 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-009-005 | INT-009 | Alertas y Monitoreo | Annelise | 6a2e717, 06fc39b, e855ee3 | PHPUnit ConsultaApiTest: 7/7; Cypress E2E-05: 1/1 (2026-11-12) | 100 | 87.5 | 100 | 83.34 | ¿Se evita redundancia?; ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-010-001 | INT-010 | IA Asistida / HITL | Annelise | e855ee3 | Vitest roles.test.js: 3/3; Cypress E2E-07: 2/2 (2026-11-12) | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-010-002 | INT-010 | IA Asistida / HITL | Annelise | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18; Cypress E2E-07: 2/2 (2026-11-12) | 100 | 100 | 100 | 75 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-010-003 | INT-010 | IA Asistida / HITL | Annelise | 6a2e717, e855ee3 | PHPUnit SyncDiagnosticosApiTest: 18/18; Vitest agente.test.js: 7/7 | 100 | 100 | 100 | 83.34 | ¿Supera seguridad y dependencias? | Pendiente |
| TRZ-010-004 | INT-010 | IA Asistida / HITL | Annelise | e855ee3 | Vitest agente.test.js: 7/7; Vitest catalogo.test.js: 10/10 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-010-005 | INT-010 | IA Asistida / HITL | Annelise | e855ee3 | Vitest agente.test.js: 7/7 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-011-001 | INT-011 | Pipeline ML | Jefferson | 06fc39b | Sin pruebas automatizadas | 83.34 | 100 | 75 | 75 | ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación recuperable?; ¿Supera pruebas? | Pendiente |
| TRZ-011-002 | INT-011 | Pipeline ML | Jefferson | 06fc39b | Sin pruebas automatizadas | 75 | 100 | 75 | 50 | ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación recuperable?; ¿Supera análisis estático?; ¿Supera seguridad y dependencias?; ¿Supera pruebas? | Pendiente |
| TRZ-011-003 | INT-011 | Pipeline ML | Jefferson | 06fc39b | Sin pruebas automatizadas | 75 | 100 | 75 | 75 | ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación recuperable?; ¿Supera pruebas? | Pendiente |
| TRZ-011-004 | INT-011 | Pipeline ML | Jefferson | 06fc39b | Sin pruebas automatizadas | 75 | 100 | 75 | 75 | ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación recuperable?; ¿Supera pruebas? | Pendiente |
| TRZ-011-005 | INT-011 | Pipeline ML | Jefferson | 06fc39b | Sin pruebas automatizadas | 75 | 100 | 75 | 75 | ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación recuperable?; ¿Supera pruebas? | Pendiente |
| TRZ-012-001 | INT-012 | QA / Testing | Jhoan | 6a2e717, e855ee3, b347f24 | PHPUnit AuthLoginTest: 5/5; PHPUnit AuthSessionTest: 9/9; PHPUnit PasswordResetTest: 7/7; PHPUnit AuthRulesTest: 2/2 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-012-002 | INT-012 | QA / Testing | Jhoan | 6a2e717 | PHPUnit SyncDiagnosticosApiTest: 18/18 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-012-003 | INT-012 | QA / Testing | Jhoan | e855ee3, 210a1b2 | PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit DomainSchemaTest: 4/4 | 100 | 100 | 100 | 100 | — | En revisión |
| TRZ-012-004 | INT-012 | QA / Testing | Jhoan | 6a2e717, 06fc39b, e855ee3 | Vitest agente.test.js: 7/7; Vitest alertas.test.js: 13/13; Vitest auth.test.js: 6/6; Vitest authAlerts.test.js: 8/8; Vitest catalogo.test.js: 10/10; Vitest d… | 83.34 | 100 | 100 | 100 | ¿Implementación registrada en commit? | Pendiente |
| TRZ-012-005 | INT-012 | QA / Testing | Jhoan | 06fc39b | Cypress E2E-01: 1/1 (2026-11-12); Cypress E2E-02: 2/2 (2026-11-12); Cypress E2E-03: 3/3 (2026-11-12); Cypress E2E-04: 1/2 (2026-11-12); 2/2 aprobados en re-e… | 83.34 | 100 | 100 | 100 | ¿Implementación registrada en commit? | Pendiente |

## Leyenda

- **Pendiente:** al menos un criterio tiene Registro "No" (hallazgo verificado).
- **En revisión:** ningún "No", pero hay criterios "Pendiente" (falta evidencia que debe aportar el equipo: PR, revisión, despliegue).
- **Implementado:** todos los criterios en "Sí" o "No aplica".
- Los porcentajes cuentan solo "Sí" y "No", igual que las fórmulas de la matriz de referencia.
