**DOCUMENTO TÉCNICO**
**03. Diccionario de Datos**
*Modelo lógico cloud y almacenamiento local alineados al MVP mejorado*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Objetivo
Definir de forma unívoca las entidades, atributos, dominios y relaciones del sistema. El diseño soporta trazabilidad georreferenciada, multi-tenancy, diagnóstico offline-first e idempotencia de sincronización.
# 2. Entidades principales
| Tabla | Propósito |
|---|---|
| tenants | Representa una organización o unidad lógica del SaaS. Permite aislar usuarios, parcelas y diagnósticos. |
| roles | Catálogo de perfiles funcionales. |
| usuarios | Identidad, contacto y pertenencia a un tenant. |
| parcelas | Ubicación y contexto productivo de una zona de trigo. |
| catalogo_fitosanitario | Catálogo de enfermedades, síntomas y parámetros fitosanitarios. |
| diagnosticos | Resultado de cada inferencia y evidencia asociada. |
| alertas | Eventos generados a partir de diagnósticos y reglas de severidad. |
| sync_events | Trazabilidad técnica de intentos de sincronización. |

# 3. Diccionario: tenants
| Campo | Tipo | Reglas | Descripción |
|---|---|---|---|
| id | BIGINT | PK | Identificador único. |
| nombre | VARCHAR(150) | NOT NULL | Nombre de la organización. |
| codigo | VARCHAR(50) | UNIQUE | Código interno del tenant. |
| activo | BOOLEAN | DEFAULT TRUE | Estado de operación. |
| created_at | TIMESTAMP | NOT NULL | Fecha de creación. |
| updated_at | TIMESTAMP | NULL | Última actualización. |

# 4. Diccionario: usuarios y roles
| Tabla/Campo | Tipo | Reglas | Descripción |
|---|---|---|---|
| roles.id | BIGINT | PK | Identificador. |
| roles.nombre | VARCHAR(50) | UNIQUE | admin, tecnico, agricultor. |
| roles.descripcion | VARCHAR(255) | NULL | Descripción funcional. |
| usuarios.id | BIGINT | PK | Identificador. |
| usuarios.tenant_id | BIGINT | FK tenants.id | Aislamiento lógico del usuario. |
| usuarios.rol_id | BIGINT | FK roles.id | Rol asignado. |
| usuarios.nombre | VARCHAR(120) | NOT NULL | Nombre completo. |
| usuarios.email | VARCHAR(150) | UNIQUE por tenant | Correo de acceso. |
| usuarios.password | VARCHAR(255) | NOT NULL | Hash seguro; nunca texto plano. |
| usuarios.telefono | VARCHAR(20) | NULL | Contacto. |
| usuarios.activo | BOOLEAN | DEFAULT TRUE | Estado del acceso. |

# 5. Diccionario: parcelas
| Campo | Tipo | Reglas | Descripción |
|---|---|---|---|
| id | BIGINT | PK | Identificador. |
| tenant_id | BIGINT | FK | Tenant propietario. |
| usuario_id | BIGINT | FK | Agricultor responsable. |
| nombre | VARCHAR(100) | NOT NULL | Nombre de la parcela. |
| latitud | DECIMAL(10,7) | NULL | Coordenada GPS. |
| longitud | DECIMAL(10,7) | NULL | Coordenada GPS. |
| area_hectareas | DECIMAL(8,2) | NULL | Área estimada. |
| cultivo | VARCHAR(100) | DEFAULT trigo | Cultivo de la parcela. |
| created_at | TIMESTAMP | NOT NULL | Fecha de registro. |

# 6. Diccionario: catalogo_fitosanitario
| Campo | Tipo | Reglas | Descripción |
|---|---|---|---|
| id | BIGINT | PK | Identificador. |
| nombre | VARCHAR(120) | NOT NULL | Nombre de la enfermedad/estado. |
| agente_causal | VARCHAR(180) | NULL | Agente causal conocido. |
| cultivo | VARCHAR(100) | NOT NULL | Cultivo asociado. |
| sintomas | TEXT | NULL | Síntomas de referencia. |
| recomendaciones | TEXT | NULL | Recomendaciones técnicas. |
| severidad_base | DECIMAL(5,2) | NULL | Valor de referencia. |
| umbral_alerta | DECIMAL(5,2) | NULL | Umbral para alerta. |
| imagen_referencia | VARCHAR(255) | NULL | Ruta o URI de referencia. |
| activo | BOOLEAN | DEFAULT TRUE | Disponible en el sistema. |

# 7. Diccionario: diagnosticos
| Campo | Tipo | Reglas | Descripción |
|---|---|---|---|
| id | BIGINT | PK | Identificador cloud. |
| uuid_local | CHAR(36) | UNIQUE, NOT NULL | UUID generado antes de sincronizar. |
| tenant_id | BIGINT | FK | Tenant propietario. |
| usuario_id | BIGINT | FK | Usuario que captura. |
| parcela_id | BIGINT | FK NULL | Parcela asociada. |
| catalogo_id | BIGINT | FK | Clase/entidad diagnosticada. |
| clase | VARCHAR(50) | NOT NULL | sana, roya_amarilla, otra, no_concluyente. |
| confianza | DECIMAL(5,2) | 0-100 | Confianza del modelo. |
| severidad | DECIMAL(5,2) | 0-100 NULL | Porcentaje de área foliar afectada. |
| latitud | DECIMAL(10,7) | NULL | GPS de captura. |
| longitud | DECIMAL(10,7) | NULL | GPS de captura. |
| imagen_path | VARCHAR(255) | NOT NULL | Evidencia original/comprimida. |
| mascara_path | VARCHAR(255) | NULL | Evidencia de segmentación. |
| modelo_version | VARCHAR(50) | NOT NULL | Versión del modelo usado. |
| captured_at | TIMESTAMP | NOT NULL | Fecha/hora de captura. |
| synced_at | TIMESTAMP | NULL | Fecha/hora de sincronización. |
| sync_status | VARCHAR(20) | NOT NULL | pending, sent, confirmed, error. |

# 8. Diccionario: alertas y sincronización
| Tabla/Campo | Tipo | Reglas | Descripción |
|---|---|---|---|
| alertas.id | BIGINT | PK | Identificador. |
| alertas.diagnostico_id | BIGINT | FK | Diagnóstico que origina la alerta. |
| alertas.usuario_id | BIGINT | FK | Destinatario. |
| alertas.tipo | VARCHAR(30) | NOT NULL | Severidad/operativa. |
| alertas.mensaje | TEXT | NOT NULL | Contenido. |
| alertas.leida | BOOLEAN | DEFAULT FALSE | Estado de lectura. |
| sync_events.id | BIGINT | PK | Identificador del evento. |
| sync_events.uuid_local | CHAR(36) | INDEX | Referencia al diagnóstico. |
| sync_events.estado | VARCHAR(20) | NOT NULL | Estado del proceso. |
| sync_events.intentos | INT | DEFAULT 0 | Contador de reintentos. |
| sync_events.ultimo_error | TEXT | NULL | Detalle del último fallo. |
| sync_events.created_at | TIMESTAMP | NOT NULL | Fecha del evento. |

# 9. Almacenamiento local Edge/PWA
| Campo | Tipo | Descripción |
|---|---|---|
| uuid_local | TEXT UNIQUE | Identificador idempotente. |
| image_blob | BLOB/TEXT | Imagen reducida o referencia local. |
| clase | TEXT | Resultado de clasificación. |
| confianza | REAL | Confianza del modelo. |
| severidad | REAL | Porcentaje afectado. |
| parcela_id_local | TEXT NULL | Referencia local a parcela. |
| latitud/longitud | REAL NULL | Georreferenciación. |
| modelo_version | TEXT | Versión del modelo. |
| sync_status | TEXT | pending/sending/confirmed/error. |
| retry_count | INTEGER | Número de reintentos. |
| created_at | TEXT | Marca temporal local. |

# 10. Relaciones y reglas
- Un tenant tiene muchos usuarios, parcelas, diagnósticos y alertas.
- Un usuario pertenece a un tenant y posee un rol.
- Una parcela puede asociarse a múltiples diagnósticos a lo largo del tiempo.
- Un diagnóstico puede originar cero o más alertas.
- El UUID local es único y constituye la clave de idempotencia durante la sincronización.
- Confianza y severidad son métricas independientes y no deben almacenarse en un único campo.
# 11. Reglas de integridad
- No permitir confianza o severidad fuera de 0-100.
- No permitir diagnósticos sin tenant.
- Impedir acceso cruzado entre tenants mediante políticas de autorización.
- Conservar modelo_version para reproducibilidad del resultado.
- No eliminar físicamente evidencia crítica si existe una necesidad de auditoría; preferir baja lógica o política de retención.
