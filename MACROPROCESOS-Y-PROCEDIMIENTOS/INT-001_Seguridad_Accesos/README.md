# INT-001 Seguridad y Accesos — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-001-seguridad-accesos`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-001-seguridad-accesos)
- **Dominio funcional:** Seguridad / Accesos
- **Responsable (Agent Coach):** Jhoan Sosa Porras
- **Misiones (procedimientos TRZ):** 6
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-001-seguridad-accesos/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-001-001 | Inicio de sesión seguro con validación de credenciales y opción "Recordarme". | Implementado | 4 | [TRZ-001-001-login-seguro](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-001-login-seguro) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-001-login-seguro/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-001_Seguridad_Accesos/TRZ-001-001_login_seguro.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-001/TRZ-001-001-login-seguro) |
| TRZ-001-002 | Registro de usuarios con validación de correo Gmail, celular peruano y términos. | Implementado | 4 | [TRZ-001-002-registro-usuarios](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-002-registro-usuarios) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-001_Seguridad_Accesos/TRZ-001-002_registro_usuarios.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-001/TRZ-001-002-registro-usuarios) |
| TRZ-001-003 | Protección contra fuerza bruta (límite de 5 intentos/minuto en login y recuperación). | Implementado | 4 | [TRZ-001-003-proteccion-fuerza-bruta](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-003-proteccion-fuerza-bruta) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-003-proteccion-fuerza-bruta/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-001_Seguridad_Accesos/TRZ-001-003_proteccion_fuerza_bruta.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-001/TRZ-001-003-proteccion-fuerza-bruta) |
| TRZ-001-004 | Solicitud de recuperación de contraseña con envío de correo y respuesta genérica (seguridad). | Implementado | 4 | [TRZ-001-004-solicitud-recuperacion](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-004-solicitud-recuperacion) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-004-solicitud-recuperacion/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-001_Seguridad_Accesos/TRZ-001-004_solicitud_recuperacion.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-001/TRZ-001-004-solicitud-recuperacion) |
| TRZ-001-005 | Restablecimiento de contraseña con token de un solo uso y expiración de 60 minutos. | Implementado | 4 | [TRZ-001-005-restablecer-contrasena](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-005-restablecer-contrasena) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-005-restablecer-contrasena/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-001_Seguridad_Accesos/TRZ-001-005_restablecer_contrasena.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-001/TRZ-001-005-restablecer-contrasena) |
| TRZ-001-006 | Autenticación de API con Sanctum (SPA) con CSRF y cierre de sesión seguro. | Implementado | 5 | [TRZ-001-006-autenticacion-api-sanctum](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-006-autenticacion-api-sanctum) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-006-autenticacion-api-sanctum/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-001_Seguridad_Accesos/TRZ-001-006_autenticacion_api_sanctum.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-001/TRZ-001-006-autenticacion-api-sanctum) |

## Código de cada Misión

### TRZ-001-001 — Inicio de sesión seguro con validación de credenciales y opción "Recordarme".

- `app/Http/Controllers/AuthController.php` · login · L128–L162 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-001-login-seguro/app/Http/Controllers/AuthController.php#L128-L162)
- `app/Http/Requests/LoginRequest.php` · rules · L24–L31 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-001-login-seguro/app/Http/Requests/LoginRequest.php#L24-L31)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-001-002 — Registro de usuarios con validación de correo Gmail, celular peruano y términos.

- `app/Http/Controllers/AuthController.php` · register · L164–L200 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/app/Http/Controllers/AuthController.php#L164-L200)
- `app/Http/Requests/RegisterRequest.php` · rules · L24–L35 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/app/Http/Requests/RegisterRequest.php#L24-L35)
- `app/Support/AuthRules.php` · GMAIL_REGEX · L9 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/app/Support/AuthRules.php#L9)
- `app/Support/AuthRules.php` · PERU_PHONE_REGEX · L19 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-002-registro-usuarios/app/Support/AuthRules.php#L19)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-001-003 — Protección contra fuerza bruta (límite de 5 intentos/minuto en login y recuperación).

- `app/Providers/AppServiceProvider.php` · RateLimiter 'login' · L26–L28 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-003-proteccion-fuerza-bruta/app/Providers/AppServiceProvider.php#L26-L28)
- `app/Providers/AppServiceProvider.php` · RateLimiter 'password' · L31–L33 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-003-proteccion-fuerza-bruta/app/Providers/AppServiceProvider.php#L31-L33)
- `app/Http/Controllers/AuthController.php` · ensureIsNotRateLimited · L218–L229 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-003-proteccion-fuerza-bruta/app/Http/Controllers/AuthController.php#L218-L229)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-001-004 — Solicitud de recuperación de contraseña con envío de correo y respuesta genérica (seguridad).

- `app/Http/Controllers/AuthController.php` · sendResetLink · L54–L81 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-004-solicitud-recuperacion/app/Http/Controllers/AuthController.php#L54-L81)
- `app/Notifications/ResetPasswordNotification.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-004-solicitud-recuperacion/app/Notifications/ResetPasswordNotification.php)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-001-005 — Restablecimiento de contraseña con token de un solo uso y expiración de 60 minutos.

- `app/Http/Controllers/AuthController.php` · showReset · L83–L92 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-005-restablecer-contrasena/app/Http/Controllers/AuthController.php#L83-L92)
- `app/Http/Controllers/AuthController.php` · resetPassword · L94–L126 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-005-restablecer-contrasena/app/Http/Controllers/AuthController.php#L94-L126)
- `app/Http/Requests/ResetPasswordRequest.php` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-005-restablecer-contrasena/app/Http/Requests/ResetPasswordRequest.php)
- `resources/js/pages/ResetPassword.jsx` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-005-restablecer-contrasena/resources/js/pages/ResetPassword.jsx)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

### TRZ-001-006 — Autenticación de API con Sanctum (SPA) con CSRF y cierre de sesión seguro.

- `config/sanctum.php` · 'stateful's*=> · L23–L28 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-006-autenticacion-api-sanctum/config/sanctum.php#L23-L28)
- `config/sanctum.php` · 'guard's*=> · L42 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-006-autenticacion-api-sanctum/config/sanctum.php#L42)
- `bootstrap/app.php` · statefulApi · L30 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-006-autenticacion-api-sanctum/bootstrap/app.php#L30)
- `routes/api.php` · auth:sanctum · L12–L15 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-006-autenticacion-api-sanctum/routes/api.php#L12-L15)
- `routes/api.php` · auth:sanctum · L17–L46 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-001/TRZ-001-006-autenticacion-api-sanctum/routes/api.php#L17-L46)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Supera análisis estático?; ¿Supera seguridad?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
