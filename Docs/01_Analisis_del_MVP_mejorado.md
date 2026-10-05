**DOCUMENTO TÉCNICO**
**01. Análisis del MVP**
*Definición funcional, usuarios, arquitectura y métricas de éxito*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Septiembre de 2026

# 1. Propósito del documento
Este documento desarrolla el componente indicado en su título a partir del contenido proporcionado para el proyecto. Se mantiene la terminología, arquitectura y objetivos del material base y se agregan consideraciones técnicas fundamentales para que el documento sea utilizable como entregable académico y guía de implementación.
# 2. Descripción del proyecto
| Elemento | Detalle |
|---|---|
| Nombre | Sistema Web para la Detección Temprana de Roya Amarilla en Cultivos de Trigo mediante Tecnología Edge Computing en el Valle del Mantaro |
| Problema | Los agricultores de zonas rurales pueden detectar la roya amarilla demasiado tarde. La ausencia de especialistas y la conectividad limitada dificultan un diagnóstico oportuno. |
| Solución | Desarrollo de una aplicación web progresiva (PWA) bajo una arquitectura Edge-Cloud con inteligencia artificial para la captura y análisis de imágenes de roya amarilla en el cultivo de trigo en computadoras y dispositivos móviles. El sistema ejecuta la clasificación fitosanitaria y la estimación de severidad localmente en el cliente de forma offline, realizando la sincronización de datos con la nube una vez restablecida la red. |
| Resultado esperado | Diagnóstico rápido en campo, almacenamiento local de evidencia y consolidación de históricos cuando vuelve la conectividad. |

# 3. Alcance funcional del MVP

- Gestión de usuarios y accesos: Registro e inicio de sesión con roles diferenciados y autenticación basada en JWT.
- Captura y carga de imágenes: Captura directa mediante la cámara del dispositivo (móvil o PC/laptop) o carga manual de archivos de imágenes de trigo.
- Inferencia local en el cliente (Edge): Ejecución del modelo CNN directamente en el navegador de manera offline, sin necesidad de conexión a Internet.
- Clasificación fitosanitaria: Diagnóstico enfocado en tres clases: Sana, Roya Amarilla y Otra Enfermedad.
- Estimación de severidad: Cálculo del porcentaje de área foliar afectada en el cultivo de trigo.
- Almacenamiento web offline: Persistencia local de registros y diagnósticos mediante tecnologías de almacenamiento en el navegador (IndexedDB / SQLite en cliente).
- Sincronización diferida: Envío automático o manual de los diagnósticos almacenados localmente hacia la nube al restablecer la conectividad a la red.
- Historial y gestión territorial: Consulta del historial de diagnósticos offline/online y visualización geográfica por parcelas de trigo.
- Alertas tempranas: Generación de notificaciones prioritarias ante detecciones de roya amarilla que superen un umbral de severidad predefinido.
- Administración del sistema: Módulo administrativo para la gestión del catálogo fitosanitario y parámetros de control.

# 4. Usuarios, necesidades y permisos
| Rol | Necesidades | Permisos principales | Flujo de uso |
|---|---|---|---|
| Agricultor | Detectar roya amarilla de forma rápida y autónoma en campo, sin dependencia de conectividad a internet. | Capturar/subir imágenes (móvil o PC), consultar diagnósticos e índice de severidad, recibir alertas de umbral y gestionar parcelas propias. | Captura → Inferencia local (Edge PWA)→ Visualización de severidad → Guardado local (IndexedDB) → Sincronización diferida al detectar red. |
| Técnico agrícola/ Agrónomo | Monitorear la propagación por zonas, validar diagnósticos complejos y dar seguimiento técnico a múltiples parcelas. | Inspeccionar parcelas asignadas, validar/corregir diagnósticos automáticos, consultar mapa topográfico/historial y emitir recomendaciones técnicas. | Consulta de mapa/historial → Filtrado por severidad/alertas → Revisión y validación de muestra→ Generación de reporte o prescripción.. |
| Administrador | Garantizar el correcto funcionamiento de la plataforma, el control de acceso y la actualización de los parámetros de IA. | Gestión global de usuarios, asignación de roles/parcelas, administración del catálogo fitosanitario, métricas del modelo e historial de sincronizaciones. | Monitoreo del dashboard global→ Gestión de usuarios/catálogos  → Ajuste de umbrales de alerta→ Auditoría de datos. |

# 5. Casos de uso principales
| ID | Caso de Uso | Actores | Descripción |
|---|---|---|---|
| CU-01 | Autenticación y control de acceso | Todos | El usuario inicia sesión mediante JWT y el sistema le asigna la interfaz y permisos según su rol (Agricultor, Técnico, Administrador). |
| CU-02 | Captura o carga de imagen foliar | Agricultor | Captura una fotografía del trigo con la cámara del dispositivo (PC o móvil) o selecciona un archivo de imagen almacenado. |
| CU-03 | Diagnóstico e inferencia Edge (Offline/Online) | Agricultor | El modelo CNN cargado en el navegador analiza la imagen localmente, clasificando el estado (Sana, Roya Amarilla, Otra Enfermedad) y calculando la severidad (área foliar afectada) sin depender de internet. |
| CU-04 | Almacenamiento local de diagnósticos | Agricultor | El sistema guarda automáticamente el diagnóstico, la imagen reducida y la geolocalización/parcela en la base de datos local del navegador (IndexedDB). |
| CU-05 | Sincronización diferida de datos | Agricultor / Sistema | Al detectar conexión a red, el sistema sincroniza automáticamente (o bajo demanda) los registros locales con la plataforma en la nube. |
| CU-06 | Supervisión y validación técnica | Técnico Agrónomo | Revisa los diagnósticos e historial de las parcelas asignadas, pudiendo validar o ajustar la evaluación generada por la IA. |
| CU-07 | Generación y consulta de alertas tempranas | Técnico / Agricultor | El sistema emite alertas prioritarias cuando el nivel de severidad de roya amarilla detectado supera el umbral crítico configurado. |
| CU-08 | Consulta de historial y mapa de parcelas | Técnico / Administrador | Visualización del histórico de diagnósticos, gráficos de evolución temporal y mapa de distribución de la enfermedad por parcelas de trigo. |
| CU-09 | Gestión de usuarios y asignaciones | Administrador | Alta, baja, modificación de usuarios y asignación de parcelas de trigo a técnicos y agricultores. |
| CU-10 | Gestión de catálogo y umbrales fitosanitarios | Administrador | Administración de la información de enfermedades, recomendaciones técnicas y configuración de los umbrales de severidad para alertas. |

# 6. Stack tecnológico del MVP
| Componente | Tecnología base | Responsabilidad |
|---|---|---|
| Frontend / Cliente (Edge) | React (CSR) + PWA + CDN (Cloudflare / AWS CloudFront) | Interfaz gráfica ejecutable en navegador (PC/Móvil), captura con cámara, soporte offline (Offline-first) y consumo de la API. |
| Agente Edge / Celular | PWA / Native App (Edge Agent) + ONNX Runtime (TFLite / Mobile Optimized) + SQLite | Inferencia local optimizada mediante cuantización en el dispositivo (Edge AI Model), persistencia temporal y sincronización. |
| Backend Core (SaaS Cloud) | Laravel 11 (PHP) + Sanctum / JWT + RBAC | API RESTful central, gestión de usuarios, roles, reglas de negocio, multi-tenancy, facturación y suscripciones. |
| Backend Servicios / Microservicios | Python 3.11 + FastAPI | Servicio dedicado para gestión de modelos de IA, inferencia complementaria en nube/edge y APIs de servicios auxiliares. |
| Bases de Datos | PostgreSQL (Producción Cloud) / MySQL (Alternativa Cloud) / SQLite (Local Edge) | Almacenamiento relacional persistente en la nube y almacenamiento ligero local en el dispositivo Edge. |
| Entrenamiento y Optimización de IA | Python (Jupyter) + PyTorch / TensorFlow + ONNX | Pipeline de entrenamiento, validación (Accuracy, Precision, F1-Score) y exportación/optimización de modelos a formato ONNX/TFLite. |
| Comunicación y Sincronización | MQTT + WebSockets + REST/HTTPS | Telemetría en tiempo real, transferencia de datos entre Cloud y Edge, y sincronización diferida. |
| CI/CD y DevOps | GitHub + GitHub Actions + Docker + Docker Registry | Automatización de pruebas unitarias/integración, contenerización de servicios y registro de imágenes de despliegue. |
| Infraestructura y Despliegue | AWS / Azure / GCP (Cloud) + Docker Compose / NVIDIA (Edge) | Alojamiento de servicios Laravel/FastAPI en la nube y despliegue modular de servicios en los nodos Edge. |
| Monitoreo y Observabilidad | Prometheus + Grafana + ELK Stack + Health Checks | Recolección de métricas, tableros de rendimiento, centralización de logs y verificación del estado operativo de los servicios. |

# 7. Componentes de la arquitectura del sistema

- Interfaz de Usuario (React):
Patrón: Frontend Desacoplado / Arquitectura basada en Componentes.
Descripción: Interfaz gráfica desarrollada en React desacoplada del backend. Permite la captura de imágenes de roya amarilla en trigo, la interacción con el usuario y la comunicación con los servicios mediante peticiones HTTP (REST API).
- Comunicación Cloud-Edge:
Patrón: Arquitectura Dirigida por Eventos / Sincronización Asíncrona.
Descripción: Canal de transporte híbrido basado en MQTT / WebSockets y REST API. Los dispositivos publican eventos en tiempo real (ej. ¡Anomalía detectada!) hacia la nube y gestionan la sincronización asíncrona de diagnósticos almacenados localmente al recuperar la conectividad.
- Inferencia de IA (FastAPI):
Patrón: Edge AI / Inferencia Ligera / Arquitectura de Microservicios.
Descripción: Microservicio especializado desarrollado en FastAPI orientado a procesar el modelo de Inteligencia Artificial. Realiza la clasificación del estado fitosanitario y la estimación de severidad foliar de manera local o distribuida.
- Plataforma Core (Laravel):
Patrón: API RESTful Centralizada / Arquitectura MVC, Hexagonal o Monolito Modular.
 Descripción: Servidor backend central basado en Laravel que gestiona las reglas de negocio, la autenticación, la comunicación vía REST API y la persistencia en la base de datos centralizada.
# 8. Métricas de éxito del MVP
| Métrica | Meta | Cómo verificar |
|---|---|---|
| Accuracy del modelo (IA) | ≥ 90 % en validación | Evaluación estadística sobre un conjunto de datos de prueba/validación independiente mediante Precision, Recall y F1-Score. |
| Latencia de inferencia Edge | ≤ 3 s | Medición del tiempo promedio desde la captura de la imagen hasta el despliegue del resultado en el microservicio FastAPI. |
| Operación offline | 100 % de inferencia local | Pruebas funcionales de captura, inferencia de roya amarilla y almacenamiento sin conexión a Internet. |
| Sincronización diferida | 100 % de entrega sin duplicados | Verificación del reenvío asíncrono mediante REST/MQTT desde la cola local hacia Laravel al restablecerse la conexión de red. |

# 9. Consideraciones fundamentales añadidas
# Identificador Único Universal (UUID): Asignación de un UUID único a cada diagnóstico desde el cliente, garantizando la idempotencia y evitando registros duplicados durante la sincronización con Laravel.
# Separación de métricas: Diferenciación entre la confianza del modelo de IA, que representa la certeza del algoritmo, y la severidad de la enfermedad, que representa el porcentaje de daño detectado en la hoja de trigo.
# Trazabilidad georreferenciada: Registro automático de la fecha, hora, parcela y coordenadas GPS correspondientes a cada evaluación realizada en campo.
# Umbral de incertidumbre: Definición del estado «Resultado no concluyente» cuando la confianza del modelo sea inferior al umbral operativo establecido, por ejemplo, < 75 %.
# Auditoría e inspección: Almacenamiento de la imagen original comprimida y, opcionalmente, de la máscara procesada para facilitar la validación posterior por parte del técnico agrónomo.
# Seguridad: Gestión de credenciales, claves de API y tokens mediante variables de entorno, manteniéndolos aislados de los repositorios de código.
# Fuente base y alcance
Fuente base: Análisis del MVP - Detección de Fitopatologías, contenida en el archivo proporcionado. Las ampliaciones marcadas como “Consideración fundamental” son recomendaciones de diseño e implementación añadidas para completar el documento, no resultados experimentales.
