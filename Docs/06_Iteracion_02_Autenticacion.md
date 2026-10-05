**DOCUMENTO TÉCNICO**
**06. Iteración 02 - Autenticación y Gestión de Usuarios**
*Identidad, roles, multi-tenancy y protección de API*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Objetivo
Implementar una capa de identidad segura para los tres perfiles del sistema y establecer el aislamiento por tenant que requiere el modelo SaaS descrito en el MVP mejorado.
# 2. Roles y permisos
| Rol | Permisos principales | Restricciones |
|---|---|---|
| Agricultor | Capturar, diagnosticar, consultar propios diagnósticos, gestionar parcelas propias, recibir alertas. | No administra usuarios ni accede a otros tenants/usuarios. |
| Técnico/Agrónomo | Consultar parcelas asignadas, validar diagnósticos, revisar mapas/historial, emitir recomendaciones. | Solo datos autorizados por tenant y asignación. |
| Administrador | Gestionar usuarios, roles, parcelas, catálogo, umbrales, métricas y auditoría. | Acceso condicionado al tenant y a políticas administrativas. |

# 3. Flujo de autenticación
1. Registro del usuario y asignación de tenant/rol mediante una operación autorizada.
2. Login con email y contraseña.
3. Servidor valida credenciales y estado activo.
4. Se emite access token con expiración definida por política.
5. Las peticiones posteriores incluyen el token.
6. Middleware resuelve usuario, rol y tenant antes de ejecutar la lógica de negocio.
7. Logout/revocación invalida la sesión según el mecanismo adoptado.
# 4. Endpoints
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | /api/auth/register | Registro controlado | No / política de invitación |
| POST | /api/auth/login | Inicio de sesión | No |
| POST | /api/auth/logout | Cierre/revocación | Sí |
| POST | /api/auth/refresh | Renovación de token | Sí |
| GET | /api/auth/me | Perfil actual | Sí |
| POST | /api/auth/forgot-password | Solicitud de recuperación | No |
| POST | /api/auth/reset-password | Restablecimiento | No |
| GET | /api/admin/usuarios | Listado administrativo | Admin |
| PATCH | /api/admin/usuarios/{id} | Actualizar usuario | Admin |
| PATCH | /api/admin/usuarios/{id}/estado | Activar/desactivar | Admin |

# 5. Ejemplo de respuesta
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "tenant_id": 10,
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "agricultor"
    },
    "token": "<access-token>"
  }
}
```

# 6. Middleware de autorización
```php
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    Route::get('/diagnosticos', [DiagnosticoController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'tenant', 'role:admin'])->group(function () {
    Route::apiResource('/admin/usuarios', UsuarioController::class);
});
```

# 7. Seguridad obligatoria
- Hash de contraseñas mediante el mecanismo seguro del framework.
- No retornar nunca la contraseña en respuestas JSON.
- Validar email, longitud y complejidad de contraseña según política.
- Rate limiting para login y recuperación.
- Protección frente a enumeración de usuarios.
- Cookies/tokens almacenados según el tipo de cliente y riesgo.
- Secretos y claves fuera del repositorio.
- Auditar acciones administrativas relevantes.
# 8. Pruebas
| Prueba | Resultado esperado |
|---|---|
| Login válido | Token emitido y datos mínimos del usuario. |
| Contraseña incorrecta | 401 sin revelar si la cuenta existe. |
| Rol incorrecto | 403. |
| Tenant incorrecto | 403/404 sin fuga de información. |
| Usuario inactivo | Acceso denegado. |
| Token expirado | 401 y flujo de renovación/reléase según política. |
| Admin modifica otro tenant | Operación bloqueada. |

# 9. Evidencias
- Colección de Postman/Insomnia.
- Capturas de respuestas 200/401/403.
- Pruebas unitarias e integración.
- Registro de auditoría de acciones administrativas.
