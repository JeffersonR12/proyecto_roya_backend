**DOCUMENTO TÉCNICO**
**02. Backlog Técnico de Implementación**
*Planificación de trabajo alineada al MVP mejorado*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Propósito
Este documento descompone el MVP mejorado en épicas, historias técnicas, tareas, dependencias y criterios de aceptación. El backlog parte del principio offline-first: la inferencia debe poder ejecutarse localmente y los datos deben sincronizarse cuando exista conectividad.
| Principio rector | Primero asegurar captura + inferencia + persistencia local; después sincronización, explotación cloud, administración, observabilidad y hardening. |
|---|---|

# 2. Épicas y resultados esperados
| ID | Épica | Resultado esperado |
|---|---|---|
| E-01 | Infraestructura y repositorio | Entorno reproducible, ramas, CI/CD, contenedores y configuración por ambiente. |
| E-02 | Identidad, RBAC y multi-tenancy | Usuarios, roles, organizaciones/tenants, políticas de acceso y auditoría. |
| E-03 | Base de datos y trazabilidad | Modelo cloud, almacenamiento local, UUID, estados de sincronización y georreferenciación. |
| E-04 | Dataset y modelo IA | Dataset versionado, entrenamiento, validación, calibración y exportación ONNX/TFLite. |
| E-05 | Inferencia Edge/PWA | Captura, preprocesamiento, inferencia offline y cálculo de severidad. |
| E-06 | Sincronización Edge-Cloud | Cola local, reintentos, idempotencia, resolución de errores y confirmación de entrega. |
| E-07 | Backend Core y servicios | API REST, catálogo, diagnósticos, alertas, FastAPI y reglas de negocio. |
| E-08 | Frontend PWA y experiencia | Flujos por rol, historial, mapas, alertas y modo offline. |
| E-09 | Calidad, seguridad y observabilidad | Pruebas, métricas, logs, health checks, OWASP, rendimiento y recuperación. |

# 3. Backlog detallado
| ID | Épica | Tarea | Prioridad | Criterio resumido |
|---|---|---|---|---|
| T-01 | E-01 | Configurar repositorio Git y estrategia main/dev/feature. | Alta | Repositorio funcional y reglas de merge. |
| T-02 | E-01 | Crear Docker Compose para servicios de desarrollo y pruebas. | Alta | Ambientes reproducibles. |
| T-03 | E-01 | Configurar CI con lint, pruebas unitarias y validación de build. | Media | Pipeline ejecutable en cada pull request. |
| T-04 | E-02 | Implementar autenticación con Sanctum o JWT según la decisión final. | Alta | Login, expiración y revocación correctamente gestionados. |
| T-05 | E-02 | Implementar RBAC para agricultor, técnico y administrador. | Alta | Endpoints protegidos por rol. |
| T-06 | E-02 | Incorporar tenant/organización y aislamiento lógico de datos. | Alta | Un usuario no accede a datos de otro tenant. |
| T-07 | E-03 | Crear migraciones y restricciones para usuarios, parcelas, diagnósticos, alertas y catálogo. | Alta | Esquema consistente y referencial. |
| T-08 | E-03 | Generar UUID local e índice único para diagnósticos. | Alta | Sin duplicados durante reintentos. |
| T-09 | E-03 | Registrar fecha, hora, parcela y coordenadas GPS. | Alta | Trazabilidad georreferenciada. |
| T-10 | E-04 | Versionar dataset y documentar origen/licencia de las imágenes. | Alta | Dataset reproducible y auditable. |
| T-11 | E-04 | Entrenar MobileNetV3-Small como línea base y comparar con alternativa si aplica. | Alta | Modelo elegido con evidencia de métricas. |
| T-12 | E-04 | Evaluar Accuracy, Precision, Recall y F1 por clase. | Alta | Informe de evaluación disponible. |
| T-13 | E-04 | Exportar modelo a ONNX/TFLite y validar equivalencia. | Alta | Modelo ejecutable en cliente/Edge. |
| T-14 | E-05 | Implementar captura/carga de imágenes en PWA. | Alta | Funciona desde PC y móvil. |
| T-15 | E-05 | Implementar inferencia local con runtime optimizado. | Alta | Diagnóstico sin Internet. |
| T-16 | E-05 | Implementar estado Resultado no concluyente para baja confianza. | Alta | El sistema evita afirmar diagnósticos con confianza insuficiente. |
| T-17 | E-05 | Calcular severidad foliar y conservar máscara/evidencia cuando sea posible. | Alta | Severidad separada de la confianza. |
| T-18 | E-06 | Guardar diagnósticos en IndexedDB/SQLite local. | Alta | No se pierde información sin red. |
| T-19 | E-06 | Construir cola Outbox con estados pendiente/enviando/confirmado/error. | Alta | Sincronización observable. |
| T-20 | E-06 | Aplicar idempotencia mediante UUID y respuesta de confirmación. | Alta | 100% sin duplicados en pruebas. |
| T-21 | E-06 | Implementar reintentos exponenciales y recuperación tras cierre del navegador. | Media | La cola sobrevive reinicios. |
| T-22 | E-07 | Crear CRUD de diagnósticos, parcelas, catálogo y alertas. | Alta | API documentada. |
| T-23 | E-07 | Crear endpoint de sincronización masiva de registros offline. | Alta | Recepción segura y transaccional. |
| T-24 | E-07 | Crear servicio FastAPI para modelos y operaciones auxiliares de IA. | Media | Servicio desacoplado y testeable. |
| T-25 | E-07 | Integrar MQTT/WebSockets para eventos y REST/HTTPS para sincronización. | Media | Canales definidos según tipo de comunicación. |
| T-26 | E-08 | Construir dashboard por rol con historial y filtros. | Alta | Visibilidad de diagnósticos. |
| T-27 | E-08 | Implementar mapa por parcela y distribución temporal. | Media | Análisis geográfico disponible. |
| T-28 | E-08 | Implementar alertas por umbral configurable de severidad. | Alta | Alertas reproducibles y auditables. |
| T-29 | E-09 | Medir latencia de inferencia, precisión, sincronización y operación offline. | Alta | Métricas con protocolo definido. |
| T-30 | E-09 | Implementar Prometheus/Grafana, logs centralizados y health checks. | Media | Observabilidad básica. |
| T-31 | E-09 | Aplicar pruebas OWASP, rate limiting, validación de entradas y gestión segura de secretos. | Alta | Checklist de seguridad cumplido. |
| T-32 | E-09 | Ejecutar prueba integral de recuperación: sin red → diagnóstico → reconexión → sincronización. | Alta | Flujo end-to-end validado. |

# 4. Dependencias críticas
1. El esquema de datos y el UUID deben definirse antes de implementar la sincronización.
2. La estrategia de inferencia y el formato del modelo deben cerrarse antes de implementar el cliente Edge.
3. RBAC y multi-tenancy deben estar implementados antes de abrir endpoints de administración y explotación de datos.
4. La cola Outbox debe estar operativa antes de declarar la funcionalidad offline como terminada.
5. Las métricas deben definirse antes de ejecutar las pruebas de aceptación para evitar resultados no comparables.
# 5. Definition of Done transversal
- Código revisado y versionado con descripción de cambios.
- Pruebas automatizadas mínimas asociadas a la funcionalidad.
- Logs y manejo de errores adecuados al nivel de criticidad.
- Documentación de configuración y variables de entorno actualizada.
- No se almacenan secretos dentro del repositorio.
- La funcionalidad es reproducible en ambiente de desarrollo mediante Docker cuando corresponda.
# 6. Evidencias de avance
- Capturas de GitHub Actions y ramas.
- Capturas de base de datos y migraciones.
- Matriz de métricas del modelo.
- Videos/capturas del modo offline.
- Pruebas de sincronización y ausencia de duplicados.
- Dashboard con logs y health checks.
