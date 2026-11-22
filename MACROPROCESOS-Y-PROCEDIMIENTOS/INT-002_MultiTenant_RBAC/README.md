# INT-002 Multi-Tenant y RBAC — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-002-multitenant-rbac`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-002-multitenant-rbac)
- **Dominio funcional:** Multi-Tenant / RBAC
- **Responsable (Agent Coach):** Jhoan Sosa Porras
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-002-multitenant-rbac/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-002-001 | Gestión de organizaciones (tenants) por código único (slug) al registrar usuario. | Implementado | 4 | [TRZ-002-001-gestion-tenants](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-001-gestion-tenants) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-001-gestion-tenants/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-002_MultiTenant_RBAC/TRZ-002-001_gestion_tenants.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-002/TRZ-002-001-gestion-tenants) |
| TRZ-002-002 | Catálogo de roles (agricultor, técnico, administrador) con métodos de verificación. | Implementado | 5 | [TRZ-002-002-catalogo-roles](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-002-catalogo-roles) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-002-catalogo-roles/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-002_MultiTenant_RBAC/TRZ-002-002_catalogo_roles.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-002/TRZ-002-002-catalogo-roles) |
| TRZ-002-003 | Aislamiento de datos por tenant (filtrado automático por tenant_id). | Implementado | 4 | [TRZ-002-003-aislamiento-tenant](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-003-aislamiento-tenant) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-003-aislamiento-tenant/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-002_MultiTenant_RBAC/TRZ-002-003_aislamiento_tenant.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-002/TRZ-002-003-aislamiento-tenant) |
| TRZ-002-004 | Bloqueo de usuarios/tenants inactivos en cada petición a la API (error 403). | Implementado | 4 | [TRZ-002-004-bloqueo-inactivos](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-004-bloqueo-inactivos) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-004-bloqueo-inactivos/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-002_MultiTenant_RBAC/TRZ-002-004_bloqueo_inactivos.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-002/TRZ-002-004-bloqueo-inactivos) |
| TRZ-002-005 | Visibilidad de datos según rol: agricultor ve solo lo suyo; técnicos ven todo el tenant. | Implementado | 5 | [TRZ-002-005-visibilidad-por-rol](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-005-visibilidad-por-rol) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-002_MultiTenant_RBAC/TRZ-002-005_visibilidad_por_rol.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-002/TRZ-002-005-visibilidad-por-rol) |

## Código de cada Misión

### TRZ-002-001 — Gestión de organizaciones (tenants) por código único (slug) al registrar usuario.

- `app/Models/Tenant.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-001-gestion-tenants/app/Models/Tenant.php)
- `database/migrations/2026_10_04_180001_create_tenants_table.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-001-gestion-tenants/database/migrations/2026_10_04_180001_create_tenants_table.php)
- `app/Http/Controllers/AuthController.php` · register · L164–L200 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-001-gestion-tenants/app/Http/Controllers/AuthController.php#L164-L200)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-002-002 — Catálogo de roles (agricultor, técnico, administrador) con métodos de verificación.

- `app/Models/Role.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-002-catalogo-roles/app/Models/Role.php)
- `database/seeders/RoleSeeder.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-002-catalogo-roles/database/seeders/RoleSeeder.php)
- `app/Models/User.php` · isAdmin · L72–L75 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-002-catalogo-roles/app/Models/User.php#L72-L75)
- `app/Models/User.php` · roleName · L77–L80 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-002-catalogo-roles/app/Models/User.php#L77-L80)
- `app/Models/User.php` · isStaff · L83–L86 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-002-catalogo-roles/app/Models/User.php#L83-L86)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Se evita redundancia?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-002-003 — Aislamiento de datos por tenant (filtrado automático por tenant_id).

- `app/Models/BelongsToTenant.php` · bootBelongsToTenant · L11–L26 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-003-aislamiento-tenant/app/Models/BelongsToTenant.php#L11-L26)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-002-004 — Bloqueo de usuarios/tenants inactivos en cada petición a la API (error 403).

- `app/Http/Middleware/EnsureTenantIsActive.php` · handle · L16–L25 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-004-bloqueo-inactivos/app/Http/Middleware/EnsureTenantIsActive.php#L16-L25)
- `bootstrap/app.php` · 'tenant's*=> · L34 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-004-bloqueo-inactivos/bootstrap/app.php#L34)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-002-005 — Visibilidad de datos según rol: agricultor ve solo lo suyo; técnicos ven todo el tenant.

- `app/Http/Middleware/EnsureRole.php` · handle · L15–L24 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/app/Http/Middleware/EnsureRole.php#L15-L24)
- `app/Models/Diagnostico.php` · scopeVisiblePara · L100–L109 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/app/Models/Diagnostico.php#L100-L109)
- `routes/api.php` · role: · L30–L31 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/routes/api.php#L30-L31)
- `routes/api.php` · role: · L33–L34 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-002/TRZ-002-005-visibilidad-por-rol/routes/api.php#L33-L34)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera análisis estático?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
