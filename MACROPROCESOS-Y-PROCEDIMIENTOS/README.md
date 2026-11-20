# MACROPROCESOS-Y-PROCEDIMIENTOS — Trazabilidad SASE de RiwiScan

Esta carpeta contiene la trazabilidad de los **12 macroprocesos (INT-001 a INT-012)** y los **62 procedimientos (TRZ-XXX-XXX)** de RiwiScan. Cada procedimiento está vinculado con su archivo real en el código, sus pruebas, sus commits y la evidencia de calidad (MRP).

> **Matriz vigente (2026-11-20):** `Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx`. Aplica la metodología **ISAET** (Ingeniería de Software Agéntica Estructurada y Trazable), descrita en `Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx`. Su unidad de trabajo es la **Misión** (equivalente al *Bolt* de AI-DLC). Cada TRZ es una Misión: BriefingScript → LoopScript → MRP → VCR. Los registros solo admiten Sí / No / No aplica, y el estado de la Misión es Implementado / Redundante / No implementado.
>
> La matriz `Matriz_Trazabilidad_RiwiScan_v2` (xlsx, csv y md) de esta carpeta queda como **registro histórico del 2026-11-16**. Fue la fuente de evidencia, pero todavía usa "Pendiente" y el formato AI-DLC de 78 columnas.

La matriz v2 sigue la estructura de `Matriz de registro_ProyectoRoya.xlsx`: bloques 1 a 5, columnas "Registro / Evidencia" y "Resultado", y las mismas fórmulas. Se agregó una extensión propia de RiwiScan con las columnas BZ a CH.

## Estructura

```
MACROPROCESOS-Y-PROCEDIMIENTOS/
├── README.md                              ← este archivo
├── DECISIONES.md                          ← criterios, asignaciones, placeholders y discrepancias
├── RESUMEN_EJECUTIVO.md                   ← qué se hizo, qué falta y próximos pasos
├── Matriz_Trazabilidad_RiwiScan_v2.xlsx   ← matriz completa con fórmulas (hojas Matriz, Resumen, Evidencias, Leyenda)
├── Matriz_Trazabilidad_RiwiScan_v2.csv    ← misma matriz en CSV (separador ";", UTF-8 con BOM, valores ya calculados)
├── Matriz_Trazabilidad_RiwiScan_v2.md     ← vista rápida: una fila por TRZ con porcentajes y estado
├── evidencias/                            ← resultados reales usados como evidencia
│   ├── phpunit-junit_2026-11-16.xml       (81/81 pruebas)
│   ├── vitest_2026-11-16.json             (141/141 pruebas)
│   ├── cypress-resultados_2026-11-12.json (13/14; E2E-04 timeout)
│   ├── cypress-E2E-04_rerun_2026-11-16.txt (2/2)
│   ├── sonar-*-fase2_2026-11-10.json      (issues, métricas y Quality Gate)
│   ├── composer-audit_2026-11-16.json     (12 avisos en dependencias PHP)
│   └── npm-audit_2026-11-16.json          (0 vulnerabilidades en producción)
├── INT-001_Seguridad_Accesos/             TRZ-001-001 … TRZ-001-006
├── INT-002_MultiTenant_RBAC/              TRZ-002-001 … TRZ-002-005
├── INT-003_Captura_Inferencia_Edge_AI/    TRZ-003-001 … TRZ-003-005
├── INT-004_Analisis_Fitosanitario/        TRZ-004-001 … TRZ-004-005
├── INT-005_Catalogo_Protocolos/           TRZ-005-001 … TRZ-005-005
├── INT-006_Persistencia_Offline_Sincronizacion/  TRZ-006-001 … TRZ-006-006
├── INT-007_API_REST_Core/                 TRZ-007-001 … TRZ-007-005
├── INT-008_Gestion_Parcelas/              TRZ-008-001 … TRZ-008-005
├── INT-009_Alertas_Tempranas/             TRZ-009-001 … TRZ-009-005
├── INT-010_Validacion_HITL_Agente/        TRZ-010-001 … TRZ-010-005
├── INT-011_Pipeline_ML/                   TRZ-011-001 … TRZ-011-005
└── INT-012_Aseguramiento_Calidad/         TRZ-012-001 … TRZ-012-005
```

## Propósito de cada archivo

| Archivo | Para qué sirve |
|---|---|
| `TRZ-XXX-XXX_<nombre>.md` | Ficha del procedimiento: BriefingScript, artefacto, ruta, método, responsable, paquete MRP y la tabla de los 27 criterios con su evidencia |
| `Matriz_..._v2.xlsx` | Documento oficial para auditoría. Los porcentajes y el estado se calculan con fórmulas: si cambias un "Pendiente" a "Sí", el estado se recalcula solo |
| `Matriz_..._v2.csv` | Importación en otras herramientas (Google Sheets, Power BI) |
| `Matriz_..._v2.md` | Lectura rápida en GitHub o en VS Code |
| `evidencias/` | Respaldo de cada "Sí" que cita pruebas, auditorías o SonarQube |

## Cómo actualizar la matriz

1. Abre `Matriz_Trazabilidad_RiwiScan_v2.xlsx`, en la hoja **Matriz**.
2. Busca las celdas amarillas: son los criterios en "Pendiente".
3. Cambia el Registro con la lista desplegable (Sí / No / No aplica / Pendiente) y pega la evidencia real (URL del PR, del despliegue, etc.) en la columna "Evidencia".
4. Los resultados de cada bloque, el estado de la traza (columna BW) y la hoja **Resumen** se recalculan automáticamente.

## Comandos Git (no se ejecutaron)

> El equipo decidió **no subir nada a Git para el entregable final**. Por eso estos comandos solo se dejan preparados; ejecútalos cuando lo decidan.

```bash
git checkout -b MACROPROCESOS-Y-PROCEDIMIENTOS
git add MACROPROCESOS-Y-PROCEDIMIENTOS/
git commit -m "docs: agregar 62 procedimientos de trazabilidad SASE"
git push origin MACROPROCESOS-Y-PROCEDIMIENTOS
```

Antes de ejecutarlos, ten en cuenta lo siguiente:

- La rama nueva parte de `feature/jhoan-backend-roya` y **conserva los cambios locales sin commit** del proyecto (correcciones DEF-01 a DEF-03, módulo de reportes, Cypress y pruebas nuevas). Como `git add` solo incluye esta carpeta, esos cambios **no entran en el commit**, pero siguen en tu copia de trabajo.
- Comprueba con `git status` que solo se agregó `MACROPROCESOS-Y-PROCEDIMIENTOS/` antes de hacer el commit.
- Al subir la rama, abre un **pull request con revisión**. Así cierras el criterio 5.2 "¿Revisión de código aprobada?", que hoy está en "Pendiente" en las 62 filas.

## Ramas por procedimiento en GitHub

Cada procedimiento tiene su rama `INT-XXX/TRZ-XXX-XXX-<nombre>`. Todas parten del commit base `22a0ebe` (rama `trazabilidad/base`), que integra los cambios locales. En cada rama, la ficha TRZ agrega la sección **"Código del procedimiento en GitHub"**, con enlaces al archivo y a las líneas exactas. La matriz `Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx` enlaza esas ramas en las columnas G, W, AK y AO.


### INT-001 Seguridad y Accesos

| Procedimiento | Rama |
|---|---|
| TRZ-001-001 — Inicio de sesión seguro con validación de credenciales y opción "Recordarme". | [`INT-001/TRZ-001-001-login-seguro`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-001-login-seguro) |
| TRZ-001-002 — Registro de usuarios con validación de correo Gmail, celular peruano y términos. | [`INT-001/TRZ-001-002-registro-usuarios`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-002-registro-usuarios) |
| TRZ-001-003 — Protección contra fuerza bruta (límite de 5 intentos/minuto en login y recuperación). | [`INT-001/TRZ-001-003-proteccion-fuerza-bruta`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-003-proteccion-fuerza-bruta) |
| TRZ-001-004 — Solicitud de recuperación de contraseña con envío de correo y respuesta genérica (seguridad). | [`INT-001/TRZ-001-004-solicitud-recuperacion`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-004-solicitud-recuperacion) |
| TRZ-001-005 — Restablecimiento de contraseña con token de un solo uso y expiración de 60 minutos. | [`INT-001/TRZ-001-005-restablecer-contrasena`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-005-restablecer-contrasena) |
| TRZ-001-006 — Autenticación de API con Sanctum (SPA) con CSRF y cierre de sesión seguro. | [`INT-001/TRZ-001-006-autenticacion-api-sanctum`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-001/TRZ-001-006-autenticacion-api-sanctum) |

### INT-002 Multi-Tenant y Control de Acceso por Roles (RBAC)

| Procedimiento | Rama |
|---|---|
| TRZ-002-001 — Gestión de organizaciones (tenants) por código único (slug) al registrar usuario. | [`INT-002/TRZ-002-001-gestion-tenants`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-001-gestion-tenants) |
| TRZ-002-002 — Catálogo de roles (agricultor, técnico, administrador) con métodos de verificación. | [`INT-002/TRZ-002-002-catalogo-roles`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-002-catalogo-roles) |
| TRZ-002-003 — Aislamiento de datos por tenant (filtrado automático por tenant_id). | [`INT-002/TRZ-002-003-aislamiento-tenant`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-003-aislamiento-tenant) |
| TRZ-002-004 — Bloqueo de usuarios/tenants inactivos en cada petición a la API (error 403). | [`INT-002/TRZ-002-004-bloqueo-inactivos`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-004-bloqueo-inactivos) |
| TRZ-002-005 — Visibilidad de datos según rol: agricultor ve solo lo suyo; técnicos ven todo el tenant. | [`INT-002/TRZ-002-005-visibilidad-por-rol`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-002/TRZ-002-005-visibilidad-por-rol) |

### INT-003 Captura e Inferencia IA en el Borde (Edge AI)

| Procedimiento | Rama |
|---|---|
| TRZ-003-001 — Captura de hoja con cámara/archivo, con guía visual de luz y distancia. | [`INT-003/TRZ-003-001-captura-guiada`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-001-captura-guiada) |
| TRZ-003-002 — Preprocesamiento de imagen (redimensionar 224x224, normalizar para el modelo). | [`INT-003/TRZ-003-002-preprocesamiento-imagen`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-002-preprocesamiento-imagen) |
| TRZ-003-003 — Inferencia local (Edge AI) con ONNX Runtime Web, sin depender del servidor. | [`INT-003/TRZ-003-003-inferencia-local-onnx`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-003-inferencia-local-onnx) |
| TRZ-003-004 — Postprocesamiento con umbral de confianza del 75%; si no se alcanza, resultado "no concluyente". | [`INT-003/TRZ-003-004-umbral-confianza`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-004-umbral-confianza) |
| TRZ-003-005 — Georreferenciación de la captura y generación de miniatura como evidencia. | [`INT-003/TRZ-003-005-georreferenciacion-miniatura`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-005-georreferenciacion-miniatura) |

### INT-004 Análisis Fitosanitario y Diagnóstico

| Procedimiento | Rama |
|---|---|
| TRZ-004-001 — Modelo de dominio Diagnóstico con 4 clases y regla de "no concluyente" si confianza < 75%. | [`INT-004/TRZ-004-001-regla-no-concluyente`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-001-regla-no-concluyente) |
| TRZ-004-002 — Trazabilidad del diagnóstico: UUID único, versión de modelo, coordenadas y scores. | [`INT-004/TRZ-004-002-trazabilidad-diagnostico`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-002-trazabilidad-diagnostico) |
| TRZ-004-003 — Separación entre confianza (modelo) y severidad (foliar en campo), dos métricas que nunca se mezclan. | [`INT-004/TRZ-004-003-confianza-vs-severidad`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-003-confianza-vs-severidad) |
| TRZ-004-004 — Gestión de evidencias: guardar imagen validando tipo real y tamaño máximo (2MB). | [`INT-004/TRZ-004-004-gestion-evidencias`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-004-gestion-evidencias) |
| TRZ-004-005 — Baja lógica de diagnósticos (SoftDeletes) para auditoría y clasificación de riesgo. | [`INT-004/TRZ-004-005-baja-logica-riesgo`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-004/TRZ-004-005-baja-logica-riesgo) |

### INT-005 Catálogo Fitosanitario y Protocolos

| Procedimiento | Rama |
|---|---|
| TRZ-005-001 — Catálogo fitosanitario con agente causal, síntomas y umbral de alerta. | [`INT-005/TRZ-005-001-catalogo-fitosanitario`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-001-catalogo-fitosanitario) |
| TRZ-005-002 — Asociación automática de cada diagnóstico con su ficha del catálogo. | [`INT-005/TRZ-005-002-vinculo-ficha-catalogo`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-002-vinculo-ficha-catalogo) |
| TRZ-005-003 — Motor de protocolos que decide cuándo tratar según severidad y umbral. | [`INT-005/TRZ-005-003-protocolo-por-severidad`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-003-protocolo-por-severidad) |
| TRZ-005-004 — Regla de seguridad HITL: protocolo químico solo si confianza ≥ 75% y validación técnica. | [`INT-005/TRZ-005-004-bloqueo-tratamiento-sin-validacion`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-004-bloqueo-tratamiento-sin-validacion) |
| TRZ-005-005 — Consulta del catálogo vía API y vista de protocolo. | [`INT-005/TRZ-005-005-consulta-catalogo-protocolos`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-005-consulta-catalogo-protocolos) |

### INT-006 Persistencia Offline-First y Sincronización

| Procedimiento | Rama |
|---|---|
| TRZ-006-001 — Almacenamiento local de diagnósticos en IndexedDB (modo offline). | [`INT-006/TRZ-006-001-guardado-indexeddb`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-001-guardado-indexeddb) |
| TRZ-006-002 — Cola de sincronización con estados (pending, sending, confirmed, error). | [`INT-006/TRZ-006-002-estados-envio`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-002-estados-envio) |
| TRZ-006-003 — Disparo automático de sincronización (al abrir app, al volver conexión, cada 60s). | [`INT-006/TRZ-006-003-sincronizacion-automatica`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-003-sincronizacion-automatica) |
| TRZ-006-004 — Tolerancia a fallos en sincronización (reintentos con espera creciente, aviso de sesión). | [`INT-006/TRZ-006-004-recuperacion-fallos-red`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-004-recuperacion-fallos-red) |
| TRZ-006-005 — Sincronización idempotente en servidor (lote transaccional, respuesta por ítem). | [`INT-006/TRZ-006-005-recepcion-lotes-idempotente`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-005-recepcion-lotes-idempotente) |
| TRZ-006-006 — Service Worker y PWA para precachear modelo ONNX y WASM sin conexión. | [`INT-006/TRZ-006-006-pwa-offline`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-006-pwa-offline) |

### INT-007 API REST del Core

| Procedimiento | Rama |
|---|---|
| TRZ-007-001 — Endpoints de sincronización (POST hasta 50 ítems, GET status) con validación. | [`INT-007/TRZ-007-001-endpoint-sincronizacion`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-001-endpoint-sincronizacion) |
| TRZ-007-002 — CRUD de diagnósticos con permisos por rol (técnico/admin) y endpoint de imagen. | [`INT-007/TRZ-007-002-api-diagnosticos`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-002-api-diagnosticos) |
| TRZ-007-003 — Consultas de solo lectura (parcelas, alertas, catálogo) autorizadas por rol. | [`INT-007/TRZ-007-003-api-consultas`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-003-api-consultas) |
| TRZ-007-004 — Formato JSON uniforme y manejo centralizado de errores (401, 403, 404, 422, 429). | [`INT-007/TRZ-007-004-respuestas-uniformes`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-004-respuestas-uniformes) |
| TRZ-007-005 — Límites de uso diferenciados (sync 30/min, consultas 120/min) y health check. | [`INT-007/TRZ-007-005-rate-limit-y-health`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-007/TRZ-007-005-rate-limit-y-health) |

### INT-008 Gestión de Parcelas (Lotes)

| Procedimiento | Rama |
|---|---|
| TRZ-008-001 — Tabla de parcelas con tenant, usuario, coordenadas, área y cultivo. | [`INT-008/TRZ-008-001-registro-lotes`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-001-registro-lotes) |
| TRZ-008-002 — Gestión de lotes en cliente (crear, actualizar, eliminar) recordando el último usado. | [`INT-008/TRZ-008-002-lotes-en-dispositivo`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-002-lotes-en-dispositivo) |
| TRZ-008-003 — Alta automática de parcela en la nube al sincronizar (firstOrCreate por tenant). | [`INT-008/TRZ-008-003-creacion-lotes-nube`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-003-creacion-lotes-nube) |
| TRZ-008-004 — Validación de parcela: rechazar parcelas de otro tenant; agricultor solo usa las suyas. | [`INT-008/TRZ-008-004-bloqueo-parcelas-ajenas`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-004-bloqueo-parcelas-ajenas) |
| TRZ-008-005 — Pantalla de gestión de parcelas y consulta API con conteo de diagnósticos. | [`INT-008/TRZ-008-005-visualizacion-lotes`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-005-visualizacion-lotes) |

### INT-009 Alertas Tempranas y Monitoreo

| Procedimiento | Rama |
|---|---|
| TRZ-009-001 — Motor de alertas (roya detectada / roya crítica) según severidad y umbral. | [`INT-009/TRZ-009-001-alerta-roya`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-001-alerta-roya) |
| TRZ-009-002 — Ciclo de vida de la alerta: una por diagnóstico, se actualiza o descarta según validación. | [`INT-009/TRZ-009-002-ciclo-vida-alertas`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-002-ciclo-vida-alertas) |
| TRZ-009-003 — Alertas en cliente: roya por lote, revisiones HITL pendientes y envíos fallidos. | [`INT-009/TRZ-009-003-avisos-en-app`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-003-avisos-en-app) |
| TRZ-009-004 — Garantía de no falsos positivos: nunca alertar si el resultado es no concluyente. | [`INT-009/TRZ-009-004-sin-falsas-alarmas`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-004-sin-falsas-alarmas) |
| TRZ-009-005 — Consulta GET /api/alertas, marcado como leída (PATCH /api/alertas/{id}/leida), paneles Dashboard, History y AlertsPage. | [`INT-009/TRZ-009-005-gestion-alertas-paneles`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-005-gestion-alertas-paneles) |

### INT-010 Validación Humana (HITL) y Agente Asistente

| Procedimiento | Rama |
|---|---|
| TRZ-010-001 — Revisión técnica de diagnósticos (validar, rechazar, re-muestrear) en el panel HITL. | [`INT-010/TRZ-010-001-validacion-tecnico`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-001-validacion-tecnico) |
| TRZ-010-002 — Envío de decisión HITL: PATCH si está en nube, reencolado si está en dispositivo. | [`INT-010/TRZ-010-002-registro-decision-tecnica`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-002-registro-decision-tecnica) |
| TRZ-010-003 — Registro de etiqueta humana corregida para reentrenar el modelo. | [`INT-010/TRZ-010-003-correcciones-humanas`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-003-correcciones-humanas) |
| TRZ-010-004 — Agente conversacional RAG que responde preguntas usando el catálogo con citas. | [`INT-010/TRZ-010-004-agente-rag-catalogo`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-004-agente-rag-catalogo) |
| TRZ-010-005 — Barreras del agente: no diagnostica imágenes, no recomienda productos, restringe HITL. | [`INT-010/TRZ-010-005-limites-asistente`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-010/TRZ-010-005-limites-asistente) |

### INT-011 Pipeline de Machine Learning

| Procedimiento | Rama |
|---|---|
| TRZ-011-001 — Preparación del dataset: asignar fuentes a 3 clases, eliminar duplicados y generar manifest. | [`INT-011/TRZ-011-001-dataset-limpio`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-001-dataset-limpio) |
| TRZ-011-002 — División estratificada 70/15/15 con semilla fija para entrenamiento. | [`INT-011/TRZ-011-002-split-estratificado`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-002-split-estratificado) |
| TRZ-011-003 — Entrenamiento de MobileNetV3-Small con pesos de clase, aumento de datos y parada anticipada. | [`INT-011/TRZ-011-003-entrenamiento-transfer-learning`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-003-entrenamiento-transfer-learning) |
| TRZ-011-004 — Evaluación del modelo por clase y fuente (precision, recall, F1, matriz de confusión). | [`INT-011/TRZ-011-004-metricas-modelo`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-004-metricas-modelo) |
| TRZ-011-005 — Exportación a ONNX con verificación de equivalencia y reporte SHA-256. | [`INT-011/TRZ-011-005-exportacion-onnx`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-005-exportacion-onnx) |

### INT-012 Aseguramiento de la Calidad

| Procedimiento | Rama |
|---|---|
| TRZ-012-001 — Pruebas de autenticación y recuperación de contraseña (token un solo uso, revocación). | [`INT-012/TRZ-012-001-pruebas-seguridad-acceso`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-001-pruebas-seguridad-acceso) |
| TRZ-012-002 — Pruebas de API de sincronización (18 casos: idempotencia, conflictos, RBAC). | [`INT-012/TRZ-012-002-pruebas-sincronizacion`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-002-pruebas-sincronizacion) |
| TRZ-012-003 — Pruebas de reglas de dominio (umbral de confianza, unicidad UUID, independencia). | [`INT-012/TRZ-012-003-pruebas-dominio`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-003-pruebas-dominio) |
| TRZ-012-004 — Pruebas unitarias de frontend (106 casos: cola, inferencia, alertas, agente). | [`INT-012/TRZ-012-004-pruebas-frontend`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-004-pruebas-frontend) |
| TRZ-012-005 — Prueba de humo E2E en servidor real y análisis estático con SonarQube. | [`INT-012/TRZ-012-005-validacion-e2e-y-estatica`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-005-validacion-e2e-y-estatica) |

### Publicar las ramas (no se ejecutó)

Las ramas se crearon solo en local. Los enlaces funcionarán cuando se publiquen:

```bash
git push origin trazabilidad/base
git push origin 'refs/heads/INT-0*:refs/heads/INT-0*'
```

En la matriz vigente, el criterio "¿Implementación registrada en commit?" ya figura como "Sí" en las 62 Misiones, porque el código está confirmado en el commit base `22a0ebe`. Los enlaces de commit y de rama empiezan a funcionar en GitHub cuando se hace el push.
