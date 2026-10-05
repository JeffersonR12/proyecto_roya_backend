**DOCUMENTO TÉCNICO**
**04. Diseño Técnico y Arquitectura Edge**
*Arquitectura lógica, física, comunicación y seguridad*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Visión general
La arquitectura mejorada organiza el sistema alrededor del principio Edge-Cloud. La inferencia principal debe poder ejecutarse localmente en el cliente, mientras que la nube concentra identidad, reglas de negocio, históricos, administración, observabilidad y coordinación entre usuarios/organizaciones.
# 2. Arquitectura por capas
| Capa | Componentes | Responsabilidad | Modo |
|---|---|---|---|
| Percepción / Cliente | Cámara, carga de archivo, React PWA | Capturar imagen, validar calidad y recopilar contexto. | Online/Offline |
| Edge / IA local | ONNX Runtime/TFLite, almacenamiento local | Preprocesar, inferir, calcular severidad y guardar evidencia. | Offline-first |
| Comunicación | REST/HTTPS, MQTT, WebSockets | Sincronizar datos, emitir eventos y proporcionar feedback. | Intermitente |
| Cloud Core | Laravel 11, RBAC, multi-tenancy | Reglas de negocio, usuarios, parcelas, diagnósticos y alertas. | Online |
| Servicios IA | FastAPI, modelos y utilidades | Gestión desacoplada de modelos e inferencia complementaria. | Online/Edge |
| Datos/Observabilidad | PostgreSQL, SQLite, Prometheus, Grafana, ELK | Persistencia, métricas, logs y monitoreo. | Persistente |

# 3. Flujo end-to-end
1. El agricultor captura o carga una imagen desde móvil o PC.
2. El cliente verifica formato, tamaño y condiciones mínimas de la imagen.
3. El runtime local ejecuta el preprocesamiento y la inferencia sin consultar la nube.
4. El sistema devuelve clase, confianza y severidad; si la confianza cae por debajo del umbral operativo, el resultado se marca como no concluyente.
5. El diagnóstico se almacena localmente con UUID, timestamp, parcela y coordenadas cuando estén disponibles.
6. La aplicación muestra el resultado inmediatamente.
7. Cuando se recupera la conectividad, una cola local transmite los registros de forma idempotente hacia Laravel.
8. La nube persiste el histórico, genera alertas, actualiza dashboards y registra la trazabilidad de sincronización.
# 4. Comunicación y responsabilidades
| Canal | Uso recomendado | Características | Manejo de fallos |
|---|---|---|---|
| REST/HTTPS | Sincronización de diagnósticos y operaciones CRUD | Seguro, transaccional, fácil de auditar. | Reintentos y backoff. |
| MQTT | Eventos y telemetría de baja latencia | Ligero y apropiado para dispositivos. | QoS y persistencia según necesidad. |
| WebSockets | Actualización interactiva del dashboard | Feedback casi en tiempo real. | Reconexión automática. |
| IndexedDB/SQLite | Outbox local | Persistencia sin Internet. | Cola durable. |

# 5. Sincronización e idempotencia
Cada diagnóstico recibe un UUID antes de abandonar el cliente. Laravel mantiene una restricción única sobre ese identificador. Si el mismo registro llega dos o más veces debido a reintentos, el servidor debe reconocerlo como ya procesado y evitar crear un duplicado.
- Estado local: pending → sending → confirmed o error.
- Reintentos automáticos con límite configurable y backoff exponencial.
- Persistencia de último error para diagnóstico técnico.
- Confirmación de recepción desde el backend antes de marcar el registro como sincronizado.
- La sincronización debe ser tolerante a cortes de red durante la transferencia.
# 6. Seguridad
- TLS/HTTPS en producción.
- Sanitización y validación de imágenes.
- RBAC por rol y aislamiento por tenant.
- Rate limiting en autenticación y endpoints sensibles.
- Gestión de secretos mediante variables de entorno o secret manager.
- Auditoría de acciones administrativas.
- Política de expiración/revocación de tokens.
# 7. Escalabilidad
- PWA desacoplada y cacheada para reducir dependencia de red.
- Laravel stateless para escalamiento horizontal.
- PostgreSQL como persistencia central de producción.
- FastAPI desacoplado para escalar capacidades de IA independientemente.
- Separación de almacenamiento de imágenes respecto de la base de datos cuando el volumen lo justifique.
# 8. Observabilidad
| Elemento | Métrica/registro | Objetivo |
|---|---|---|
| Health check | Disponibilidad de servicios | Detectar fallos rápidamente. |
| Inferencia | latencia, versión de modelo, conteo de errores | Comparar rendimiento del modelo/cliente. |
| Sincronización | pendientes, confirmados, errores, retries | Controlar calidad de entrega. |
| API | p95 de latencia, errores HTTP | Detectar degradación. |
| Infraestructura | CPU, RAM, disco, conectividad | Evitar saturación. |

# 9. Diagrama lógico
```
[Agricultor]
    |
    v
[React PWA / Cámara / Upload]
    |
    +--> [ONNX Runtime / TFLite] --> [Clasificación + Severidad]
    |                                  |
    |                                  v
    |                            [IndexedDB / SQLite]
    |                                  |
    |                     conexión disponible?
    |                         /            \
    |                       NO              SÍ
    |                       |               |
    |                   [Outbox] --REST--> [Laravel Core]
    |                                       |   \
    |                                       |    +--> [PostgreSQL]
    |                                       |    +--> [Alertas]
    |                                       |
    |                                       +--> [FastAPI / servicios IA]
    |                                       +--> [MQTT/WebSockets]
    |                                       +--> [Dashboard / Observabilidad]
```

# 10. Criterios de aceptación arquitectónicos
- El diagnóstico continúa operativo sin Internet.
- No se crean diagnósticos duplicados después de múltiples sincronizaciones.
- Un usuario no puede consultar datos fuera de su tenant.
- La versión del modelo queda asociada a cada diagnóstico.
- Los servicios exponen health checks y métricas mínimas.
