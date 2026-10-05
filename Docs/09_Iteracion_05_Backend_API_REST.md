**DOCUMENTO TÉCNICO**
**09. Iteración 05 - Backend API REST**
*Laravel Core, multi-tenancy, sincronización y servicios*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Objetivo
Implementar la API REST central del sistema. Laravel actúa como Core SaaS y coordina usuarios, roles, tenants, parcelas, catálogo, diagnósticos, alertas, sincronización y acceso a históricos. FastAPI queda desacoplado como servicio especializado de IA.
# 2. Principios de diseño
- API stateless siempre que sea posible.
- RBAC y aislamiento por tenant en cada recurso.
- Validación de entrada en todos los endpoints.
- Idempotencia de sincronización basada en UUID.
- Paginación y filtros para históricos.
- Rate limiting y observabilidad.
- Respuestas JSON consistentes.
# 3. Endpoints principales
| Método | Ruta | Función | Auth |
|---|---|---|---|
| GET | /api/diagnosticos | Listado paginado y filtrable | Sí |
| POST | /api/diagnosticos | Crear diagnóstico online o sincronizado | Sí |
| GET | /api/diagnosticos/{id} | Detalle | Sí |
| PATCH | /api/diagnosticos/{id} | Corrección/validación técnica | Técnico/Admin |
| DELETE | /api/diagnosticos/{id} | Baja según política | Admin |
| POST | /api/sync/diagnosticos | Sincronización por lote | Sí |
| GET | /api/sync/status | Estado de cola/última sincronización | Sí |
| GET | /api/parcelas | Parcelas autorizadas | Sí |
| GET | /api/catalogo | Catálogo fitosanitario | Sí |
| POST | /api/alertas | Generación controlada de alerta | Sistema/roles autorizados |
| GET | /api/alertas | Consulta de alertas | Sí |
| GET | /api/admin/metrics | Métricas administrativas | Admin |

# 4. Contrato de sincronización
```json
POST /api/sync/diagnosticos
Content-Type: application/json
Authorization: Bearer <token>

{
  "items": [
    {
      "uuid_local": "550e8400-e29b-41d4-a716-446655440000",
      "parcela_id": 12,
      "clase": "roya_amarilla",
      "confianza": 94.5,
      "severidad": 23.7,
      "modelo_version": "1.0.0",
      "captured_at": "2026-10-04T10:30:00-05:00"
    }
  ]
}
```

# 5. Respuesta idempotente
```json
{
  "success": true,
  "data": {
    "processed": 1,
    "created": 1,
    "already_exists": 0,
    "failed": 0,
    "items": [
      {
        "uuid_local": "550e8400-e29b-41d4-a716-446655440000",
        "status": "confirmed"
      }
    ]
  }
}
```

# 6. Validación de negocio
| Regla | Tratamiento |
|---|---|
| confianza/severidad fuera de rango | Rechazar 422. |
| UUID repetido con mismo tenant | Responder como ya procesado; no duplicar. |
| UUID repetido con conflicto de contenido | Registrar incidente y rechazar actualización automática. |
| parcela fuera del tenant | 403/404 según política. |
| usuario sin permiso de edición | 403. |
| imagen/URI inválida | 422 y no persistir como diagnóstico válido. |
| modelo_version ausente | 422 para diagnósticos provenientes del Edge. |

# 7. Alertas tempranas
El backend debe evaluar reglas configurables de severidad. El MVP plantea alertas cuando el nivel de severidad de roya amarilla supera un umbral crítico. El umbral debe conservarse por tenant o política fitosanitaria y quedar auditado cuando cambie.
# 8. Documentación OpenAPI
- Descripción de cada endpoint, parámetros y respuestas.
- Esquemas reutilizables para User, Tenant, Parcela, Diagnóstico y Alerta.
- Ejemplos de 200, 401, 403, 404, 409 y 422.
- Autenticación documentada.
- Colección de pruebas sincronizada con la especificación.
# 9. Rate limiting y seguridad
- Límites diferenciados para login, sincronización y consultas.
- Validación MIME/tamaño para cualquier imagen subida.
- Sanitización de metadatos.
- CORS restringido al origen autorizado.
- HTTPS obligatorio en producción.
- Headers de seguridad y políticas apropiadas.
- Secretos fuera del repositorio.
# 10. Observabilidad
| Indicador | Fuente | Uso |
|---|---|---|
| request_duration_ms | Laravel middleware | Latencia de API. |
| http_5xx_total | Logs/metrics | Errores del servidor. |
| sync_items_total | Servicio de sincronización | Volumen procesado. |
| sync_failures_total | Servicio de sincronización | Calidad de entrega. |
| alerts_total | Módulo de reglas | Carga de eventos fitosanitarios. |

# 11. Pruebas de aceptación
- CRUD de diagnósticos y catálogo funcionando.
- Un usuario solo consulta datos autorizados.
- La sincronización masiva es transaccional e idempotente.
- Las alertas respetan el umbral configurado.
- Swagger/OpenAPI refleja la versión desplegada.
- Los errores 4xx/5xx generan logs suficientes para diagnóstico.
# 12. Entrega esperada de la iteración
- API Laravel versionada.
- Migraciones ejecutables.
- Documentación OpenAPI.
- Pruebas unitarias e integración.
- Colección Postman/Insomnia.
- Evidencia de sincronización offline→cloud.
- Panel mínimo de métricas técnicas.
