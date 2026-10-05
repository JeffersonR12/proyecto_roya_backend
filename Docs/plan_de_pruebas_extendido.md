# PLAN DE PRUEBAS COMPLETO Y EXHAUSTIVO (PLAN-PRUEBAS-001)

### Sistema Web para la Detección Temprana de Roya Amarilla en Cultivos de Trigo mediante Tecnología Edge Computing — Comunidad Campesina de Aramachay, Distrito de Sincos, Provincia de Jauja, Región Junín

> Documento de especificación, arquitectura de pruebas, matriz de casos, protocolos de IA y gobernanza de agentes de software. Alineado a ISO/IEC 29119, ISO/IEC 25010, ISO/IEC 27001, TDD, ASITDD y Marcos Agénticos SASE / ReAct / HULA.

**PLAN-PRUEBAS-001 • VERSIÓN 1.0 • 05/10/2026**

---

## Control del Documento

| Campo | Detalle |
|---|---|
| **Nombre del Proyecto** | Sistema Web para la Detección Temprana de Roya Amarilla en Cultivos de Trigo mediante Tecnología Edge Computing en la Comunidad Campesina de Aramachay, Distrito de Sincos, Provincia de Jauja, Región Junín |
| **Identificador del Documento** | `PLAN-PRUEBAS-001` |
| **Versión Maestro** | 1.0 (Edición Extendida con Índice General) |
| **Fecha de Emisión** | 05/10/2026 |
| **Última Actualización** | 05/10/2026 |
| **Autor Principal / Responsable** | Líder de QA — Aseguramiento de Calidad de Software |
| **Aprobadores del Plan** | Gerente de Proyecto, Product Owner, Responsable del Modelo CNN, Técnico Agrónomo HITL |
| **Clasificación del Documento** | Uso Interno — Implementación y Evaluación Técnica Académica / Industrial |
| **Entorno Tecnológico Base** | XAMPP (PHP 8.2 + Apache) / MySQL (`proyecto_roya`) / Laravel 11 / React PWA / ONNX Runtime Web (WASM) / FastAPI / PostgreSQL Cloud |

---

## Tabla de Contenido

1. [Información General del Proyecto](#1-información-general-del-proyecto)
   - 1.1 [Contexto Institucional y del Dominio](#11-contexto-institucional-y-del-dominio)
   - 1.2 [Ficha Técnica y Arquitectura del Sistema Bajo Prueba](#12-ficha-técnica-y-arquitectura-del-sistema-bajo-prueba)
2. [Introducción y Objetivos del Plan](#2-introducción-y-objetivos-del-plan)
   - 2.1 [Propósito y Filosofía del Plan de Pruebas](#21-propósito-y-filosofía-del-plan-de-pruebas)
   - 2.2 [Objetivos de Calidad Cuantitativos](#22-objetivos-de-calidad-cuantitativos)
   - 2.3 [Fundamento Metodológico Agéntico (SASE / ReAct / HULA)](#23-fundamento-metodológico-agéntico-sase--react--hula)
3. [Alcance Exhaustivo de las Pruebas](#3-alcance-exhaustivo-de-las-pruebas)
   - 3.1 [Funcionalidades Dentro del Alcance (In-Scope)](#31-funcionalidades-dentro-del-alcance-in-scope)
   - 3.2 [Funcionalidades Fuera del Alcance (Out-of-Scope)](#32-funcionalidades-fuera-del-alcance-out-of-scope)
   - 3.3 [Capas de Oráculo ante la Incertidumbre de la IA](#33-capas-de-oráculo-ante-la-incertidumbre-de-la-ia)
4. [Estrategia y Tipos de Pruebas Detallados](#4-estrategia-y-tipos-de-pruebas-detallados)
   - 4.1 [Enfoque Metodológico Multicapa](#41-enfoque-metodológico-multicapa)
   - 4.2 [Matriz Exhaustiva de Tipos de Prueba](#42-matriz-exhaustiva-de-tipos-de-prueba)
   - 4.3 [Matriz CNN: Control de Falsos Positivos y Falsos Negativos](#43-matriz-cnn-control-de-falsos-positivos-y-falsos-negativos)
   - 4.4 [Protocolo Detallado de la Matriz de Confusión 3x3](#44-protocolo-detallado-de-la-matriz-de-confusión-3x3)
5. [Puntos de Control de Intervención Humana (HITL)](#5-puntos-de-control-de-intervención-humana-hitl)
   - 5.1 [Puntos de Control en el Producto (Operación Agrónoma)](#51-puntos-de-control-en-el-producto-operación-agrónoma)
   - 5.2 [Puntos de Control en Desarrollo Agéntico (Marco HULA / SASE)](#52-puntos-de-control-en-desarrollo-agéntico-marco-hula--sase)
6. [Criterios del Proceso de Pruebas](#6-criterios-del-proceso-de-pruebas)
   - 6.1 [Criterios de Inicio (Entry Criteria)](#61-criterios-de-inicio-entry-criteria)
   - 6.2 [Criterios de Suspensión y Reanudación](#62-criterios-de-suspensión-y-reanudación)
   - 6.3 [Criterios de Aceptación y Rechazo (Compuertas CA-01 a CA-20)](#63-criterios-de-aceptación-y-rechazo-compuertas-ca-01-a-ca-20)
7. [Entorno de Pruebas, Herramientas y Recursos](#7-entorno-de-pruebas-herramientas-y-recursos)
   - 7.1 [Infraestructura Tecnológica de los Entornos](#71-infraestructura-tecnológica-de-los-entornos)
   - 7.2 [Suite Completa de Herramientas de Testing](#72-suite-completa-de-herramientas-de-testing)
   - 7.3 [Equipo de Trabajo, Roles y Responsabilidades](#73-equipo-de-trabajo-roles-y-responsabilidades)
8. [Cronograma y Planificación de Entregables](#8-cronograma-y-planificación-de-entregables)
   - 8.1 [Calendario Estratégico por Fases de Calidad](#81-calendario-estratégico-por-fases-de-calidad)
9. [Matriz Exhaustiva de Casos de Prueba (CP-001 a CP-060)](#9-matriz-exhaustiva-de-casos-de-prueba-cp-001-a-cp-060)
   - 9.1 [Módulo 1: Autenticación, Roles y Multi-Tenancy](#91-módulo-1-autenticación-roles-y-multi-tenancy)
   - 9.2 [Módulo 2: Captura, Inferencia Edge Offline y Persistencia Local](#92-módulo-2-captura-inferencia-edge-offline-y-persistencia-local)
   - 9.3 [Módulo 3: Sincronización Diferida, Cola Outbox e Idempotencia](#93-módulo-3-sincronización-diferida-cola-outbox-e-idempotencia)
   - 9.4 [Módulo 4: Técnico HITL, Alertas, Historial y Gestión](#94-módulo-4-técnico-hitl-alertas-historial-y-gestión)
   - 9.5 [Módulo 5: Evaluación de la CNN, Dataset y Paridad de Runtime](#95-módulo-5-evaluación-de-la-cnn-dataset-y-paridad-de-runtime)
   - 9.6 [Módulo 6: Seguridad, Hardening, API y Agentes](#96-módulo-6-seguridad-hardening-api-y-agentes)
10. [Gestión de Defectos y Riesgos](#10-gestión-de-defectos-y-riesgos)
    - 10.1 [Clasificación y Niveles de Severidad de Errores](#101-clasificación-y-niveles-de-severidad-de-errores)
    - 10.2 [Matriz de Riesgos y Planes de Contingencia](#102-matriz-de-riesgos-y-planes-de-contingencia)
11. [Métricas, Indicadores (KPIs) y Reportes](#11-métricas-indicadores-kpis-y-reportes)
    - 11.1 [Indicadores Clave de Calidad de Software](#111-indicadores-clave-de-calidad-de-software)
12. [Referencias Bibliográficas y Normativas](#12-referencias-bibliográficas-y-normativas)
13. [Acta de Aprobación y Sign-Off Formal](#13-acta-de-aprobación-y-sign-off-formal)

---

## 1. Información General del Proyecto

### 1.1 Contexto Institucional y del Dominio

La Comunidad Campesina de Aramachay, ubicada en el distrito de Sincos, provincia de Jauja, región Junín, en el Valle del Mantaro, constituye una de las zonas agrícolas clave en el Perú para el cultivo de trigo. La aparición de la *Puccinia striiformis* (roya amarilla) genera pérdidas catastróficas en la producción si no es detectada en sus fases iniciales, pudiendo alcanzar hasta el $70\%$ de pérdida de rendimiento (Chen, 2005). Este proyecto aborda el diseño, implementación y aseguramiento de la calidad de un sistema informático Edge-Cloud que permite a los agricultores e ingenieros agrónomos diagnosticar la enfermedad directamente en campo, operando en dispositivos móviles sin necesidad de conectividad a Internet, en una zona caracterizada por la ausencia casi absoluta de señal de telefonía e Internet en las parcelas de cultivo.

### 1.2 Ficha Técnica y Arquitectura del Sistema Bajo Prueba

| Componente / Capa | Tecnología Adoptada | Función en el Sistema |
|---|---|---|
| **Cliente Edge (PWA)** | React + Vite + Service Workers + IndexedDB/SQLite local | Captura por cámara/archivo, preprocesado de imagen, ejecución de red neuronal local, guardado con UUID e interfaz adaptativa offline. |
| **Runtime de IA Edge** | ONNX Runtime Web (Backend WASM / WebGL) | Ejecución de la CNN MobileNetV3-Small cuantizada directamente en la CPU/GPU del dispositivo móvil sin consumo de datos. |
| **Servidor Core (Cloud)** | Laravel 11 + PHP 8.x + REST API | Gestión de la identidad (Auth JWT/Sanctum), control de acceso RBAC, aislamiento multi-tenant, persistencia relacional y motor de alertas. |
| **Servicio de IA Auxiliar** | FastAPI + PyTorch / ONNX Runtime Python | Inferencia complementaria en nube, re-evaluación masiva de lotes y servicio REST de apoyo para modelos pesados (no camino crítico offline). |
| **Persistencia Relacional** | MySQL local (XAMPP `proyecto_roya`) / PostgreSQL Cloud en QA | Almacenamiento permanente de diagnósticos sincronizados, catálogo de enfermedades, usuarios, parcelas y logs de auditoría. |
| **Canales de Comunicación** | REST/HTTPS (transaccional) + MQTT / WebSockets (telemetría/notificaciones) | Sincronización masiva diferida de diagnósticos con protocolo Outbox, idempotencia por UUID y transmisión de alertas en tiempo real. |

---

## 2. Introducción y Objetivos del Plan

### 2.1 Propósito y Filosofía del Plan de Pruebas

Este documento constituye la guía formal y exhaustiva para planificar, diseñar, ejecutar, monitorear y cerrar el ciclo de pruebas del sistema de Detección Temprana de Roya Amarilla. El propósito no se limita a verificar el cumplimiento de requerimientos funcionales convencionales; evalúa la integridad sistémica de una solución que integra Inteligencia Artificial no determinista en el extremo (Edge), sincronización asíncrona diferida, aislamiento multi-inquilino (multi-tenancy) y el gobierno agéntico de desarrollo y operación.

### 2.2 Objetivos de Calidad Cuantitativos

* **Precisión Diagnóstica de IA:** Garantizar que la red neuronal convolucional (CNN) obtenga un $\text{Accuracy} \ge 90\%$ y métricas macro ($\text{Precision}, \text{Recall}, \text{F1-Score}$) $\ge 88\%$ sobre el conjunto de prueba independiente de tres clases (`sana`, `roya_amarilla`, `otra_enfermedad`).
* **Detección Crítica de Roya:** Lograr un $\text{Recall}$ específico para la clase `roya_amarilla` $\ge 88\%$, limitando la tasa de falsos negativos silenciosos a un máximo estricto del $12\%$.
* **Desempeño y Latencia Edge:** Asegurar un tiempo medio de inferencia local (desde la captura confirmada en memoria hasta el despliegue del resultado en pantalla) $\le 3.0$ segundos en dispositivos móviles de gama media.
* **Operación 100 % Offline-First:** Validar que el $100\%$ de las funciones esenciales de captura, inferencia, etiquetado de severidad, georreferenciación y persistencia se ejecuten de manera autónoma sin enviar paquetes de red hacia la nube.
* **Idempotencia y Cero Pérdida de Datos:** Confirmar que el proceso de sincronización masiva asíncrona garantice la entrega del $100\%$ de los registros retenidos localmente con $0$ duplicados en la base de datos central mediante el uso de identificadores UUIDv4.
* **Seguridad e Inmunidad Multi-Tenant:** Demostrar una efectividad del $100\%$ en el aislamiento de datos por organización (*tenant*) y roles (RBAC), impidiendo lecturas cruzadas y bypass de autorización bajo vulnerabilidades OWASP Top 10.

### 2.3 Fundamento Metodológico Agéntico (SASE / ReAct / HULA)

Reconociendo que la construcción y evaluación del software moderno involucra modelos generativos y agentes de desarrollo de código (SWE-agents), este plan integra los marcos metodológicos más recientes de la literatura científica:

* **SASE (Hassan et al., 2026):** Definición de *Quality Gates* basados en artefactos estructurados: *BriefingScript* (definición rigurosa de historias con invariantes de seguridad/UUID), *LoopScript* (reglas de autonomía y reintentos), *MentorScript* (reglas de arquitectura e invariantes de negocio) y *MRP / CRP* (packs de revisión y consulta humana).
* **ReAct (Yao et al., Yang et al.):** Ciclos continuos de Pensamiento-Acción-Observación. La suite de automatización (PHPUnit, PyTest, Playwright) actúa como el oráculo de "Observación" del entorno con un límite máximo de $2$ reintentos autónomos ante fallos de build.
* **HULA (Takerngsaksiri et al., 2025):** Modelo *Human-In-The-Loop Software Development*. La intervención humana actúa como el arbitraje final en el plan, revisión de código y *acceptance* de cambios arquitectónicos o de seguridad. Ningún agente de código realiza *merge* autónomo a ramas de producción.
* **Taxonomía de Autonomía (Otoum & Elkhalili, 2026):** Escala de 1 a 4 para evaluar componentes de IA. El agente Edge opera en Nivel 3 (autonomía parcial en la parcela) y conmuta a Nivel 1 (asistencia mínima con revisión humana) si la confianza de la predicción desciende del $75\%$.

---

## 3. Alcance Exhaustivo de las Pruebas

### 3.1 Funcionalidades Dentro del Alcance (In-Scope)

| Módulo / Épica | Casos de Uso / Tareas | Descripción y Elementos Evaluados |
|---|---|---|
| **Identidad y Accesos** | CU-01 / T-04, T-05, T-06 | Autenticación JWT/Sanctum, expiración de tokens, revocación, throttling por IP, mensajes genéricos de error y RBAC para roles Agricultor, Técnico Agrónomo y Administrador. Aislamiento lógico estricto por Tenant. |
| **Captura y Ingesta Edge** | CU-02 / T-14 | Acceso a la cámara del dispositivo móvil, carga de imágenes en PC/Desktop, vista previa, validación estricta de formato MIME (JPEG/PNG), tamaño y resolución mínima. |
| **Inferencia Local Offline** | CU-03 / T-15, T-16, T-17 | Preprocesado del tensor ($224 \times 224 \times 3$, normalización ImageNet), ejecución ONNX WASM, cálculo de confianza ($0-100\%$), determinación de severidad foliar y activación del estado `no_concluyente` ante confianza $< 75\%$. |
| **Persistencia Local (Outbox)** | CU-04 / T-08, T-09, T-18 | Generación de UUIDv4, captura de coordenadas GPS/parcela, timestamp de captura y almacenamiento en IndexedDB/SQLite local. Transición de estados de la cola Outbox: `pending`, `sending`, `confirmed`, `error`. |
| **Sincronización Diferida** | CU-05 / T-19 a T-23, T-32 | Detección automática de reconexión a red, envío masivo por lotes vía API REST, verificación de idempotencia, manejo de conflictos, reintentos con algoritmo de backoff exponencial y resistencia a cierres intempestivos del navegador. |
| **Auditoría y Técnico HITL** | CU-06 / T-26 | Bandeja de revisión técnica de diagnósticos `no_concluyentes` o de alta severidad. Corrección e invalidez de diagnósticos por el técnico agrónomo, conservando el historial de la predicción original de la IA. |
| **Alertas y Notificaciones** | CU-07 / T-28 | Evaluación de umbrales configurables de severidad foliar ($\ge 30\%$ de roya) para la generación automática de alertas prioritarias a agricultores de la misma zona geográfica. |
| **Historial y Georreferenciación** | CU-08 / T-26, T-27 | Consulta de diagnósticos pasados con filtros multivariable (fecha, parcela, severidad, clase), paginación y despliegue de mapa con puntos georreferenciados de infección. |
| **Gobierno y Administración** | CU-09, CU-10 / T-22 | Gestión de usuarios por tenant, asignación de parcelas a técnicos, administración del catálogo de enfermedades (`PHY-000` a `PHY-005`) y reconfiguración de umbrales globales. |
| **Evaluación de Modelo CNN** | E-04 / T-10 a T-13 | Evaluación de la red MobileNetV3-Small en hold-out ($15\%$), matriz de confusión $3 \times 3$, análisis de FP/FN, curvas Precision-Recall, calibración de sobreconfianza y paridad PyTorch vs ONNX Runtime. |
| **Seguridad y Hardening** | E-09 / T-31 | Escaneo de vulnerabilidades OWASP Top 10, prevención de SQLi, XSS, Path Traversal, detección de secretos expuestos en Git y cumplimiento de TLS/HTTPS. |

### 3.2 Funcionalidades Fuera del Alcance (Out-of-Scope)

* Módulos comercializables de facturación electrónica, procesamiento de pasarelas de pago y gestión de suscripciones SaaS.
* Aplicaciones nativas compiladas en Swift/Objective-C para iOS o Kotlin/Java nativo para Android (la solución aceptada es exclusivamente PWA Web).
* Entrenamiento continuo en caliente dentro del procesador del dispositivo móvil del agricultor (las actualizaciones de modelo se descargan pre-entrenadas).
* Soporte y certificación legal o fitosanitaria oficial ante organismos gubernamentales (el sistema opera como herramienta de decisión agronómica asistida).
* Pruebas de resistencia ante ataques adversariales de nivel militar (ej. PGD, ataques de parches impresos físicos en hojas).

### 3.3 Capas de Oráculo ante la Incertidumbre de la IA

Dado que los modelos de Deep Learning no responden como funciones deterministas tradicionales, el oráculo de pruebas se divide en cuatro capas operativas separadas:

| Capa de Oráculo | Principio de Evaluación | Mecanismo de Verificación y Tolerancia |
|---|---|---|
| **1. Repetibilidad Estática** | Garantizar que a nivel de artefacto compilado (ONNX), la misma imagen genere exactamente la misma distribución de probabilidad. | 30 inferencias continuas en modo `eval()` sin dropout. La variación permitida entre salidas numéricas `float32` debe ser $\le 10^{-5}$. |
| **2. Calidad Estadística Global** | Evaluar la capacidad del modelo para generalizar sobre datos no vistos previamente. | Verificación de métricas globales ($\text{Accuracy} \ge 90\%$, $\text{F1} \ge 88\%$) y por clase sobre la matriz de confusión del conjunto hold-out ($15\%$). |
| **3. Política Operativa de Negocio** | Evaluar que las reglas de negocio enmascaren y protejan al usuario ante la incertidumbre del modelo. | Forzar el estado `no_concluyente` cuando la confianza sea $< 75\%$, impidiendo que el sistema afirme falsos positivos/negativos con baja certeza. |
| **4. Juicio Humano Experto (HITL)** | Validación final de la verdad de campo por parte de un ingeniero agrónomo. | Comparación de etiquetas del modelo vs. criterio técnico en la bandeja de validación (CU-06), midiendo el coeficiente $\kappa$ de Cohen ($\ge 0.60$). |

---

## 4. Estrategia y Tipos de Pruebas Detallados

### 4.1 Enfoque Metodológico Multicapa

La estrategia se articula como un conjunto de anillos concéntricos de aseguramiento de calidad: una pirámide de pruebas TDD / ASITDD en la base para la lógica de código, un anillo de evaluación probabilística para el modelo de IA, y un anillo externo de supervisión humana (HITL) para la gobernanza operativa.

### 4.2 Matriz Exhaustiva de Tipos de Prueba

| Tipo de Prueba | Objetivo Técnico | Herramientas & Métodos | Criterio de Éxito / Rechazo |
|---|---|---|---|
| **Unitarias (L2)** | Validar reglas puras: cálculo de severidad, UUID, FormRequests, controladores y RBAC aislados. | PHPUnit, Pest, Jest, PyTest | **Éxito:** $100\%$ de pruebas del PR pasadas; cobertura $\ge 70\%$ en clases de negocio críticas.<br>**Rechazo:** Fallo en cualquier regla de validación o UUID. |
| **Contrato API (BLUE-CONTRACT)** | Verificar la estabilidad del contrato JSON entre PWA React y backend Laravel / FastAPI. | Pact, Schemathesis, Postman | **Éxito:** Esquemas OpenAPI $100\%$ conformes. Estructura `{success, data, errors}`.<br>**Rechazo:** Cambio de nombres de llaves o tipos de datos sin versión. |
| **Integración Funcional** | Validar flujos entre PWA, IndexedDB, Service Worker y API REST. | PHPUnit HTTP, Playwright | **Éxito:** Flujos de extremo a extremo aprobados sin errores de consola o red.<br>**Rechazo:** Rompimiento de sesión o inconsistencia de estado. |
| **Adversariales / Seguridad (SHIELD-RED)** | Evaluar la resistencia del sistema ante entradas maliciosas, bypass de roles y ataques de elevación. | OWASP ZAP, Burp Suite, Python Scripts | **Éxito:** 0 vulnerabilidades Críticas/Altas. Aislamiento Multi-Tenant al $100\%$.<br>**Rechazo:** Fuga de datos entre Tenants o bypass de RBAC. |
| **Infección / Red Edge** | Medir latencia, uso de memoria WASM y comportamiento en dispositivos móviles reales. | Chrome DevTools, Lighthouse, ONNX Benchmark | **Éxito:** Latencia media $\le 3.0$ s; consumo de memoria $\le 250$ MB.<br>**Rechazo:** Crasheo de pestaña o latencia $> 3.0$ s en móviles de referencia. |
| **Evaluación CNN (IA)** | Validar métricas estadísticas de la red neuronal sobre el conjunto de prueba. | PyTorch, Scikit-Learn, Jupyter Notebooks | **Éxito:** $\text{Accuracy} \ge 90\%$, $\text{Recall Roya} \ge 88\%$, $\text{Precision} \ge 88\%$.<br>**Rechazo:** $\text{Recall}$ de Roya $< 88\%$ o presencia de fugas de sesión en dataset. |
| **Paridad de Runtime** | Confirmar equivalencia entre el modelo entrenado en PyTorch y el exportado a ONNX WASM. | Custom Python/JS Parity Script | **Éxito:** Paridad de clasificación $\ge 98\%$ sobre el conjunto de test.<br>**Rechazo:** Permutación de etiquetas de clase o diferencia de probabilidad $> 2\%$. |
| **Gobernanza y Carga (GOLD-GOVERNANCE)** | Evaluar el comportamiento del servidor bajo sync masiva concurrente y medir deuda técnica. | k6, Apache JMeter, SonarQube | **Éxito:** Sync de 50 ítems simultáneos sin 5xx; p95 REST $< 2.0$s; Deuda SonarQube $< 5$d.<br>**Rechazo:** Duplicación de UUIDs bajo carga o caídas del servidor HTTP. |

### 4.3 Matriz CNN: Control de Falsos Positivos y Falsos Negativos

| Tipo de Error | Definición Técnica | Impacto Agrónomo y de Negocio | Severidad QA | Estrategia de Mitigación y Control |
|---|---|---|---|---|
| **Falso Negativo Crítico (FN)** | Una hoja infectada con Roya Amarilla es clasificada como Sana u Otra Enfermedad. | Destrucción de cultivos por falta de tratamiento oportuno. Propagación epidémica en el valle. | Bloqueante / Crítica | Exigir $\text{Recall}$ por clase $\ge 88\%$. Si la confianza es $\ge 75\%$ y se equivoca, cuenta como FN Silencioso (máximo permitido: $12\%$). Enrutamiento obligatorio a revisión HITL. |
| **Falso Positivo Fitosanitario (FP)** | Una hoja Sana o con Otra Enfermedad es clasificada como Roya Amarilla. | Gasto innecesario en fungicidas químicos, contaminación de suelos y alarma infundada. | Alta | Exigir $\text{Precision}$ por clase $\ge 88\%$. La política de abstención al $75\%$ bloquea la emisión de alertas automáticas sin validación. |
| **Confusión de Diagnóstico Secundario** | Confusión recíproca entre las clases Sana y Otra Enfermedad. | Ruido estadístico en los reportes del catálogo fitosanitario. | Media | Monitoreo mediante matriz de confusión $3 \times 3$ y re-entrenamiento con datos incrementales de campo. |
| **Sobreconfianza Numérica** | Predicción incorrecta con un nivel de confianza extremadamente alto ($> 90\%$). | Pérdida de confianza del usuario en el sistema inteligente. | Alta | Aplicar técnicas de calibración de temperatura (*Temperature Scaling*) e inspeccionar versiones de modelos. |
| **Deriva por Cuantización (Drift)** | Inconsistencia de diagnóstico producida por la conversión de Float32 PyTorch a Int8/Float16 ONNX. | Resultados dispares entre la evaluación en servidor y la inferencia en el teléfono del agricultor. | Alta | Ejecución del test de paridad T-13 exigiendo un acuerdo de clasificación $\ge 98\%$. |

### 4.4 Protocolo Detallado de la Matriz de Confusión 3x3

La evaluación del modelo se realiza sobre el conjunto hold-out de prueba sin haber participado en el entrenamiento ni en la validación previa. La matriz se organiza formalmente como sigue:

| | | **Clase Predicha por el Modelo** | | |
|---|---|---|---|---|
| | | **Sana (0)** | **Roya Amarilla (1)** | **Otra Enfermedad (2)** |
| **Clase Real (Verdad de Campo)** | **Sana (0)** | Verdadero Sano ($VS$) | Falso Positivo Roya ($FP_{R1}$) | Falso Positivo Otra ($FP_{O1}$) |
| | **Roya Amarilla (1)** | Falso Negativo Crítico ($FN_S$) | Verdadero Positivo Roya ($VP_R$) | Falso Negativo Confusión ($FN_O$) |
| | **Otra Enfermedad (2)** | Falso Sano ($FS_2$) | Falso Positivo Roya ($FP_{R2}$) | Verdadero Otra ($VO$) |

#### Fórmulas de Evaluación Obligatorias:

$$ \text{Accuracy Global} = \frac{VS + VP_R + VO}{\text{Total\_Muestras}} $$

$$ \text{Precision}_{\text{Roya}} = \frac{VP_R}{VP_R + FP_{R1} + FP_{R2}} $$

$$ \text{Recall}_{\text{Roya}} = \frac{VP_R}{VP_R + FN_S + FN_O} $$

$$ \text{F1-Score}_{\text{Roya}} = 2 \times \frac{\text{Precision}_{\text{Roya}} \times \text{Recall}_{\text{Roya}}}{\text{Precision}_{\text{Roya}} + \text{Recall}_{\text{Roya}}} $$

$$ \text{Macro Precision} = \frac{\text{Precision}_{\text{Sana}} + \text{Precision}_{\text{Roya}} + \text{Precision}_{\text{Otra}}}{3} $$

$$ \text{Macro Recall} = \frac{\text{Recall}_{\text{Sana}} + \text{Recall}_{\text{Roya}} + \text{Recall}_{\text{Otra}}}{3} $$

$$ \text{Macro F1-Score} = \frac{\text{F1}_{\text{Sana}} + \text{F1}_{\text{Roya}} + \text{F1}_{\text{Otra}}}{3} $$

---

## 5. Puntos de Control de Intervención Humana (HITL)

El sistema establece compuertas infranqueables donde la intervención humana es obligatoria para garantizar la validez agronómica del producto y la integridad del código fuente desarrollado por o con asistencia de agentes de IA.

### 5.1 Puntos de Control en el Producto (Operación Agrónoma)

| Código | Momento del Flujo | Actor Responsable | Regla de Activación y Acción Humana | Evidencia Registrada |
|---|---|---|---|---|
| **HITL-P1** | Inferencia Edge con Incertidumbre | Agricultor / Técnico | Si la confianza de la predicción es $< 75\%$, el sistema fuerza el estado `no_concluyente`. Se solicita al usuario repetir la toma o enviar el registro a la cola de revisión técnica. | Flag `is_uncertain=true` en IndexedDB y servidor. Registro en la bandeja de revisión. |
| **HITL-P2** | Emisión de Alerta Fitosanitaria | Técnico Agrónomo | Toda alerta por severidad foliar $\ge 30\%$ requiere la validación explícita del técnico en el dashboard antes de ser difundida masivamente a los agricultores de la zona. | Firma digital del técnico, timestamp y cambio de estado de alerta a `confirmed`. |
| **HITL-P3** | Conflicto de Sincronización | Administrador de QA | Si se detecta un reenvío con el mismo `uuid_local` pero con un payload alterado, el sistema bloquea la sobreescritura y genera un incidente de auditoría. | Log de conflicto en tabla `sync_conflicts` con preservación de ambas versiones. |
| **HITL-P4** | Modificación de Parámetros Globales | Administrador SaaS | El cambio de umbrales globales de alerta o la promoción de un nuevo modelo CNN requiere auditoría explícita. Los diagnósticos históricos conservan su `model_version`. | Tabla de auditoría `system_settings_log` con el ID del usuario administrador. |
| **HITL-P5** | Inclusión de Muestras de Campo | Técnico Agrónomo + Lead AI | Toda imagen tomada en campo real que alimente el conjunto de datos de entrenamiento debe ser etiquetada ciegamente por dos ingenieros agrónomos ($\kappa \ge 0.60$). | Matriz de concordancia inter-evaluador y archivo de dataset versionado en DVC. |

### 5.2 Puntos de Control en Desarrollo Agéntico (Marco HULA / SASE)

| Código | Artefacto / Gate SASE | Rol Humano (Agent Coach) | Criterio de Aprobación Infranqueable |
|---|---|---|---|
| **HITL-D1** | BriefingScript / DoD | Lead Software Engineer | Aprobar la definición de la tarea agéntica especificando criterios de aceptación, invariantes de seguridad, UUID y reglas multi-tenant antes de autorizar la generación de código. |
| **HITL-D2** | CRP (Consultation Request) | Arquitecto de Software | Si el agente de código propone cambios en la arquitectura crítica (ej. modificar el camino offline o alterar el middleware de autenticación), debe emitir un CRP para aprobación humana. |
| **HITL-D3** | MRP (Merge-Readiness Pack) | QA Lead / Senior Reviewer | Todo Pull Request generado por un agente requiere la suite de pruebas en verde, linter sin advertencias y la revisión visual directa del diff por parte de un ingeniero humano. Prohibido Auto-Merge. |
| **HITL-D4** | MentorScript / Violation Check | QA Lead | Rechazo inmediato si el agente viola principios de arquitectura (ej. guardar confianza y severidad en un solo campo, o realizar llamadas de red en el módulo offline). |

---

## 6. Criterios del Proceso de Pruebas

### 6.1 Criterios de Inicio (Entry Criteria)

1. Disponibilidad formal de los documentos de arquitectura y requerimientos: `Docs/01` (MVP), `Docs/02` (Backlog), `Docs/04` (Arquitectura Edge) y `Docs/07` (Dataset CNN) debidamente versionados.
2. Entorno de desarrollo y QA configurado y operativo: XAMPP con Apache, PHP 8.2+, MySQL con la base de datos `proyecto_roya` y semillas de datos (*seeders*) ejecutadas.
3. Disponibilidad de usuarios de prueba para todos los roles (Agricultor, Técnico, Admin) en al menos dos organizaciones/tenants distintos.
4. Conjunto de imágenes de prueba (Hold-Out de $15\%$) etiquetado, congelado y no utilizado en el proceso de entrenamiento de la CNN.
5. Disponibilidad del artefacto compilado `model.onnx` o del stub de inferencia aprobados para su carga en la PWA.

### 6.2 Criterios de Suspensión y Reanudación

* **Criterios de Suspensión:** La ejecución de las pruebas se detendrá de forma inmediata si se presenta cualquiera de los siguientes eventos:
  - Existencia de un defecto de severidad Bloqueante que impida la ejecución de más del $30\%$ de los casos de prueba del ciclo actual.
  - Caída irrecuperable o corrupción del entorno de base de datos local (MySQL/XAMPP) o de QA.
  - Incapacidad de la PWA para cargar el modelo ONNX en el navegador debido a errores sintácticos o incompatibilidad de runtime WASM.
  - Detección de contaminación de datos (*Data Leakage*) entre el conjunto de entrenamiento y el conjunto de prueba de la IA.
  - Obtención de un Coeficiente $\kappa$ de Cohen $< 0.60$ en el etiquetado del conjunto de prueba por parte de los expertos humanos.
* **Criterios de Reanudación:** Las pruebas se reanudarán únicamente cuando se despliegue una nueva versión de la aplicación o del modelo con la corrección verificada del defecto bloqueante y la aprobación explícita del Líder de QA.

### 6.3 Criterios de Aceptación y Rechazo (Compuertas CA-01 a CA-20)

| ID Compuerta | Métrica / Regla de Calidad | Criterio de Aceptación (✓) | Criterio de Rechazo (✗) |
|---|---|---|---|
| **CA-01** | Accuracy Global de la CNN (Hold-Out) | $\ge 90.0\%$ | $< 90.0\%$ |
| **CA-02** | Métricas Macro (Precision, Recall, F1) | $\ge 88.0\%$ en las 3 clases | Cualquier métrica por clase $< 88.0\%$ |
| **CA-03** | Recall Específico de Roya Amarilla | $\ge 88.0\%$ | $< 88.0\%$ (Riesgo grave de FN) |
| **CA-04** | Tasa de Falsos Negativos Silenciosos | $\le 12.0\%$ de royas reales | $> 12.0\%$ en decisiones firmes |
| **CA-05** | Política de Incertidumbre ($< 75\%$ Confianza) | $100\%$ forzado a `no_concluyente` | Emisión de diagnóstico firme con confianza baja |
| **CA-06** | Latencia Inferencia Edge (Dispositivos) | Promedio $\le 3.0$ segundos | Promedio $> 3.0$ s en móvil gama media |
| **CA-07** | Operación 100 % Offline-First | 0 peticiones HTTP en inferencia | Cualquier dependencia cloud para diagnosticar |
| **CA-08** | Sincronización Idempotente (Outbox) | $100\%$ entregados, 0 duplicados UUID | Pérdida de datos o duplicación en MySQL |
| **CA-09** | Separación Estricta Confianza vs. Severidad | Campos independientes ($0-100\%$) | Fusión o colapso de ambas métricas |
| **CA-10** | Aislamiento Multi-Tenant de Datos | 0 lecturas o escrituras cruzadas | Cualquier acceso a parcelas de otro Tenant |
| **CA-11** | Seguridad en Autenticación (Auth) | 401 genérico, Throttle IP, CSRF | Enumeración de usuarios o bypass de login |
| **CA-12** | Trazabilidad y Versionado de Modelo | `model_version` presente siempre | Diagnóstico guardado sin versión de modelo |
| **CA-13** | Paridad de Runtime (PyTorch vs ONNX) | $\ge 98.0\%$ de coincidencia de clase | $< 98.0\%$ o permutación de etiquetas |
| **CA-14** | Severidad Foliar Sintética | Error $\le 5.0\%$ en máscaras base | Cálculo de severidad fuera de rango ($0-100$) |
| **CA-15** | Intervención Humana Técnico (CU-06) | Flujo de corrección $100\%$ operable | Incapacidad del técnico para modificar IA |
| **CA-16** | Juego Negativo de Campo (No Trigo/Ruido) | $\le 10.0\%$ afirmado como Roya | $> 10.0\%$ de falsos positivos en ruido |
| **CA-17** | Casos de Uso de Prioridad Alta (CU-01/07) | $100\%$ de casos pasados en verde | 1+ caso crítico o alto fallado |
| **CA-18** | Hardening y Secretos (T-31) | 0 secretos en Git, TLS forzado | Claves API o credenciales en repositorio |
| **CA-19** | Gobernanza Agéntica HULA | 0 merges automáticos a main | Código integrado sin review humana (MRP) |
| **CA-20** | Defectos Abiertos al Cierre | 0 Bloqueantes, 0 Altos abiertos | 1+ defecto Bloqueante/Alto sin resolver |

---

## 7. Entorno de Pruebas, Herramientas y Recursos

### 7.1 Infraestructura Tecnológica de los Entornos

| Componente / Capa | Entorno de Desarrollo (DEV) | Entorno de Aseguramiento (QA / Staging) | Entorno Móvil de Campo (Edge) |
|---|---|---|---|
| **Servidor Web / API** | XAMPP (Apache) / `php artisan serve` | Docker Container (Laravel 11 + Nginx) | N/A (Operación Local) |
| **Motor de Base de Datos** | MySQL 8.0 (`127.0.0.1:3306 proyecto_roya`) | PostgreSQL 15 + PostGIS (QA Cloud) | IndexedDB / SQLite local (Browser) |
| **Cliente PWA** | Node.js / Vite Dev Server (Desktop Chrome) | Build Optimizado Vite / PWA Service Worker | Chrome Android / Safari iOS (Móvil) |
| **Runtime de IA** | Python 3.10 + PyTorch (CPU/CUDA) | FastAPI Container + ONNX Runtime Python | ONNX Runtime Web (WASM / WebGL) |

### 7.2 Suite Completa de Herramientas de Testing

| Dominio de Prueba | Herramienta Seleccionada | Uso Específico y Alcance |
|---|---|---|
| **Pruebas Unitarias & API** | PHPUnit 10 / Pest / PyTest | Validación de controladores Laravel, FormRequests, Formats, modelos de PyTorch y servicios FastAPI. |
| **Pruebas E2E & PWA Offline** | Playwright / Chromium DevTools Protocol | Automatización de interfaz PWA, simulación de cortes de red (offline), emulación de sensores cámara y GPS. |
| **Evaluación de IA & Métricas** | Scikit-Learn / TorchMetrics / Jupyter | Generación automatizada de matrices de confusión, curvas Precision-Recall, histogramas y tests de paridad. |
| **Pruebas de Carga y Sync** | k6 / Apache JMeter | Pruebas de estrés sobre el endpoint de sincronización masiva REST (`/api/v1/sync/diagnosticos`). |
| **Seguridad & SAST / DAST** | OWASP ZAP / GitLeaks / Composer Audit | Análisis estático y dinámico de vulnerabilidades, escaneo de secretos en Git y auditoría de dependencias. |
| **Gobernanza de Código / CI** | GitHub Actions / SonarQube | Pipeline integrado de integración continua para ejecución automática de linters, tests y análisis de deuda técnica. |

### 7.3 Equipo de Trabajo, Roles y Responsabilidades

| Rol en el Plan | Responsabilidades Principales | Asignación / Integrante |
|---|---|---|
| **Líder de QA (Test Manager)** | Diseño de la estrategia, aprobación de compuertas CA-01 a CA-20, dirección de ejecuciones, elaboración del informe final y sign-off. | Huaman Lazaro Jefferson |
| **Ingeniero de Automatización QA** | Desarrollo de scripts Playwright, colecciones Postman, configuraciones k6 y pipelines en GitHub Actions. | Sosa Porras Jhoan |
| **Especialista en QA de IA** | Ejecución de scripts de evaluación de la CNN, generación de matrices de confusión, verificación de paridad ONNX y tests de incertidumbre. | Jara Nuñuvero Ani |
| **Técnico Agrónomo (HITL)** | Validación de la verdad de campo en imágenes, participación en el etiquetado ciego y ejecución de pruebas de usuario en el módulo CU-06. | Ingeniero Agrónomo Asignado |
| **Agent Coach / Reviewer** | Supervisión de entregas de agentes de software (SWE-agents), auditoría de BriefingScripts, verificación de MRPs y revisiones HULA. | Huaman Lazaro Jefferson |
| **Product Owner / PM** | Aprobación formal del alcance del plan de pruebas, decisión sobre waivers excepcionales y firma del acta de aceptación. | Docente del curso |

---

## 8. Cronograma y Planificación de Entregables

### 8.1 Calendario Estratégico por Fases de Calidad

| Fase de Pruebas | Épicas / Tareas Cubiertas | Fecha Inicio | Fecha Fin | Entregables Clave de Fase |
|---|---|---|---|---|
| **F1: Diseño y Preparación** | E-09 / T-01, T-02, T-03 | 05/10/2026 | 11/10/2026 | PLAN-PRUEBAS-001 publicado, entorno XAMPP/Docker verificado, datos sintéticos cargados. |
| **F2: Núcleo Core & Auth** | E-01, E-02, E-03 / T-04 a T-09 | 12/10/2026 | 25/10/2026 | Batería PHPUnit de Auth/RBAC/Multi-tenant aprobada. Reporte de aislamiento de datos. |
| **F3: Evaluación CNN & Edge** | E-04, E-05 / T-10 a T-18 | 26/10/2026 | 08/11/2026 | Informe de Métricas CNN (Matriz 3x3), test de paridad ONNX y reporte de latencia $\le 3$s. |
| **F4: Sincronización & Sync** | E-06, E-07 / T-19 a T-23, T-32 | 09/11/2026 | 22/11/2026 | Evidencia E2E T-32 (Video/Log offline→sync), pruebas de idempotencia k6 en verde. |
| **F5: Explotación & HITL** | E-08, E-09 / T-26 a T-31 | 23/11/2026 | 06/12/2026 | Informe de pruebas de seguridad OWASP ZAP, validación de dashboard técnico y alertas. |
| **F6: Regresión y Cierre** | Todas las Épicas / T-01 a T-32 | 07/12/2026 | 20/12/2026 | Ejecución completa de regresión, reporte final de defectos, waivers firmados y Sign-Off. |

---

## 9. Matriz Exhaustiva de Casos de Prueba (CP-001 a CP-060)

A continuación se especifica la suite completa de casos de prueba diseñados para cubrir de forma detallada todos los Requerimientos Funcionales (Casos de Uso CU-01 a CU-10), Requerimientos No Funcionales y Tareas del Backlog Técnico (T-01 a T-32).

### 9.1 Módulo 1: Autenticación, Roles y Multi-Tenancy (CU-01 / T-04, T-05, T-06 / CA-10, CA-11)

| ID Caso | Caso de Uso / Tarea | Precondiciones | Pasos de Ejecución | Resultado Esperado (Oráculo) | Prioridad |
|---|---|---|---|---|---|
| **CP-CU01-01** | CU-01 / T-04 | Usuario `agricultor@gmail.com` activo en tenant Cooperativa Roble. | 1. Enviar POST a `/api/v1/login` con credenciales válidas. | HTTP 200. Token JWT retornado. Redirección al Dashboard de Agricultor. Respuesta no revela existencia de email en fallos. | Crítica |
| **CP-CU01-02** | CU-01 / T-04 | Formulario de login abierto en PWA. | 1. Ingresar email con dominio no permitido (ej. `test@hotmail.com`). | HTTP 422 Unprocessable Entity. Mensaje de validación de formato. No se genera sesión. | Alta |
| **CP-CU01-03** | CU-01 / T-04 | Usuario registrado en la base de datos. | 1. Enviar POST a `/api/v1/login` con contraseña incorrecta. | HTTP 401 Unauthorized. Mensaje genérico "Credenciales inválidas". Imposibilidad de enumerar usuarios. | Alta |
| **CP-CU01-04** | CU-01 / T-31 | Endpoint de login activo. | 1. Ejecutar 6 intentos fallidos de login consecutivos desde la misma IP. | HTTP 429 Too Many Requests. Bloqueo temporal por Throttle IP (CA-11). | Alta |
| **CP-CU01-05** | CU-01 / T-04 | Usuario en formulario de login. | 1. Ingresar credenciales correctas y marcar casilla "Recordar sesión". | Cookie o token persistente configurado con expiración a 30 días (43,200 min). | Media |
| **CP-CU01-06** | CU-01 / T-05 | Usuario `tecnico@gmail.com` con rol Técnico Agrónomo. | 1. Iniciar sesión en el sistema. | Acceso a la bandeja de revisión HITL, mapa de parcelas y alertas. Menú admin oculto. | Alta |
| **CP-CU01-07** | CU-01 / T-05 | Usuario `admin@gmail.com` con rol Administrador. | 1. Iniciar sesión en el sistema. | Acceso al panel global: gestión de usuarios, catálogo fitosanitario y umbrales. | Alta |
| **CP-CU01-08** | CU-01 / T-31 | Protección CSRF habilitada en Laravel. | 1. Enviar petición POST a `/login` omitiendo el token CSRF o encabezado `X-XSRF-TOKEN`. | HTTP 419 Page Expired / CSRF Token Mismatch. Petición rechazada. | Alta |
| **CP-CU01-09** | CU-01 / T-04 | Sesión no autenticada (Invitado). | 1. Intentar acceder directamente a la URL `/dashboard`. | Redirección automática a la pantalla de `/login`. Acceso denegado. | Alta |
| **CP-CU01-10** | CU-06 / T-06 | Usuario Agricultor A (Tenant 1) y Agricultor B (Tenant 2). | 1. Agricultor A intenta consultar diagnósticos del Tenant 2 pasando un ID directo. | HTTP 403 Forbidden o HTTP 404 Not Found opaco. 0 fugas de datos entre Tenants (CA-10). | Crítica |

### 9.2 Módulo 2: Captura, Inferencia Edge Offline y Persistencia Local (CU-02, CU-03, CU-04 / T-14 a T-18 / CA-06, CA-07, CA-09)

| ID Caso | Caso de Uso / Tarea | Precondiciones | Pasos de Ejecución | Resultado Esperado (Oráculo) | Prioridad |
|---|---|---|---|---|---|
| **CP-CU02-01** | CU-02 / T-14 | PWA abierta en PC/Móvil con soporte de archivo. | 1. Seleccionar archivo JPG/PNG de hoja de trigo de 2 MB. | Vista previa cargada correctamente. Validación de formato MIME aprobada. | Crítica |
| **CP-CU02-02** | CU-02 / T-14 | Dispositivo móvil Android con cámara activa. | 1. Presionar botón "Tomar Foto" en la PWA y capturar la hoja. | Imagen capturada directamente desde el sensor y procesada en el lienzo canvas. | Alta |
| **CP-CU02-03** | CU-02 / T-14 | Formulario de captura abierto. | 1. Intentar subir un archivo con extensión `.pdf` o `.exe`. | Mensaje de error: "Formato no permitido". La inferencia no se ejecuta. | Alta |
| **CP-CU03-01** | CU-03 / T-15 | PWA instalada, Modo Avión activado (Sin red). | 1. Tomar foto de hoja e iniciar inferencia diagnóstica. | Inferencia completada localmente sin enviar peticiones HTTP hacia la nube (CA-07). | Crítica |
| **CP-CU03-02** | CU-03 / T-15 | Modelo ONNX cargado en WASM. | 1. Iniciar inferencia y medir el tiempo desde $t_0$ (captura) a $t_1$ (pantalla). | Latencia media $\le 3.0$ segundos en el dispositivo de referencia (CA-06). | Crítica |
| **CP-CU03-03** | CU-03 / T-15 | Imagen de hoja con síntoma claro de Roya Amarilla. | 1. Ejecutar inferencia local. | Clase predicha: `roya_amarilla`, mostrando porcentaje de confianza y severidad. | Crítica |
| **CP-CU03-04** | CU-03 / T-16 | Imagen con baja nitidez (Confianza calculada $62\%$). | 1. Ejecutar inferencia local. | El sistema fuerza la clase a `no_concluyente` por regla de incertidumbre $< 75\%$ (CA-05). | Crítica |
| **CP-CU03-05** | CU-03 / T-17 | Hoja procesada con $92\%$ de confianza y $15\%$ de área afectada. | 1. Observar la pantalla de resultados del diagnóstico. | Confianza ($92\%$) y Severidad Foliar ($15\%$) se despliegan en campos independientes (CA-09). | Crítica |
| **CP-CU03-06** | CU-03 / T-12 | Modelo compilado v1.0.4. | 1. Inspeccionar el registro de diagnóstico generado. | Campo `model_version` presente con valor `"v1.0.4"` (CA-12). | Alta |
| **CP-CU04-01** | CU-04 / T-18 | Modo offline activado, diagnóstico inferido. | 1. Guardar diagnóstico y reiniciar/cerrar el navegador. | El registro se conserva en IndexedDB con un `uuid_local` generado. Estado `pending`. | Crítica |
| **CP-CU04-02** | CU-04 / T-09 | Permiso de geolocalización GPS concedido. | 1. Guardar diagnóstico en campo. | Registro almacena latitud, longitud, precisión GPS, fecha y hora local. | Alta |
| **CP-CU04-03** | CU-04 / T-09 | Permiso de GPS denegado por el usuario. | 1. Guardar diagnóstico en campo. | Diagnóstico se guarda con coordenadas nulas o parcela seleccionada manualmente. Sin bloqueo. | Media |

### 9.3 Módulo 3: Sincronización Diferida, Cola Outbox e Idempotencia (CU-05 / T-19 a T-23, T-32 / CA-08)

| ID Caso | Caso de Uso / Tarea | Precondiciones | Pasos de Ejecución | Resultado Esperado (Oráculo) | Prioridad |
|---|---|---|---|---|---|
| **CP-CU05-01** | CU-05 / T-19 | 3 diagnósticos en cola IndexedDB con estado `pending`. | 1. Desactivar modo avión (Restablecer conexión a internet). | Envío automático masivo por lote. Estados cambian: `pending` $\rightarrow$ `sending` $\rightarrow$ `confirmed`. | Crítica |
| **CP-CU05-02** | CU-05 / T-20 | Diagnóstico con `uuid_local` "ABC-123" ya confirmado en el servidor. | 1. Forzar un reenvío del mismo registro con UUID "ABC-123". | Respuesta del servidor: HTTP 200/209 `already_exists`. 0 filas duplicadas en MySQL (CA-08). | Crítica |
| **CP-CU05-03** | CU-05 / T-21 | Proceso de sincronización en curso (Estado `sending`). | 1. Cerrar abruptamente la pestaña del navegador a mitad del POST. | Al reabrir la PWA, la cola conserva los registros no confirmados y reintenta el envío. Cero pérdida. | Alta |
| **CP-CU05-04** | CU-05 / T-21 | Servidor Laravel retorna error HTTP 500 temporal. | 1. Iniciar sincronización de lote. | La PWA captura el fallo, mantiene estado `error`/`pending` y programa reintento con backoff. | Alta |
| **CP-CU05-05** | CU-05 / T-20 | UUID "ABC-123" existe en servidor pero con payload de imagen distinto. | 1. Enviar petición de sincronización. | Activación de protocolo HITL-P3: rechazo de sobreescritura y generación de log de conflicto. | Alta |
| **CP-T32-01** | T-32 / E2E | Entorno de prueba de extremo a extremo configurado. | 1. Desconectar red $\rightarrow$ 2. Capturar $\rightarrow$ 3. Inferir $\rightarrow$ 4. Reconectar $\rightarrow$ 5. Sincronizar. | Flujo completo PASSED con evidencia registrada en video/log. Diagnóstico visible en la nube. | Crítica |
| **CP-T32-02** | T-32 / T-06 | Sincronización realizada por un usuario del Tenant 1. | 1. Iniciar sesión como Administrador del Tenant 2. | Los registros sincronizados por el Tenant 1 no aparecen en la base del Tenant 2 (CA-10). | Crítica |

### 9.4 Módulo 4: Técnico HITL, Alertas, Historial y Gestión (CU-06 a CU-10 / T-22, T-26, T-28 / CA-15)

| ID Caso | Caso de Uso / Tarea | Precondiciones | Pasos de Ejecución | Resultado Esperado (Oráculo) | Prioridad |
|---|---|---|---|---|---|
| **CP-CU06-01** | CU-06 / T-26 | Diagnóstico `no_concluyente` sincronizado en el servidor. | 1. Técnico accede a la bandeja de revisión y rectifica clase a `roya_amarilla`. | Diagnóstico actualizado con la clase del técnico. Se preserva el valor original predicho por la IA (CA-15). | Crítica |
| **CP-CU06-02** | CU-06 / T-05 | Usuario con rol Agricultor autenticado. | 1. Enviar petición PATCH para intentar validar un diagnóstico técnico. | HTTP 403 Forbidden. Operación restringida exclusivamente a roles autorizados. | Alta |
| **CP-CU07-01** | CU-07 / T-28 | Diagnóstico confirmado con clase `roya_amarilla` y severidad $35\%$ ($\ge \text{umbral } 30\%$). | 1. Ejecutar procesamiento del motor de alertas en el servidor. | Alerta sanitaria generada y marcada como prioritaria en el panel de la parcela (HITL-P2). | Alta |
| **CP-CU07-02** | CU-07 / T-28 | Diagnóstico con severidad $40\%$ pero con estado `no_concluyente`. | 1. Evaluar emisión de alertas. | No se emite alerta masiva automática. El registro queda bloqueado en la cola de revisión técnica. | Alta |
| **CP-CU08-01** | CU-08 / T-26 | Múltiples diagnósticos registrados en diferentes fechas y parcelas. | 1. Filtrar historial por rango de fechas y severidad $> 20\%$. | Lista de resultados filtrada correctamente respetando la paginación y la pertenencia al tenant. | Alta |
| **CP-CU08-02** | CU-08 / T-27 | Diagnósticos georreferenciados en la base de datos. | 1. Abrir vista de mapa fitosanitario. | Puntos desplegados en sus coordenadas exactas con marcadores de color según la clase/severidad. | Media |
| **CP-CU09-01** | CU-09 / T-22 | Usuario Administrador autenticado. | 1. Crear nuevo usuario asignando rol Técnico y Tenant Roble. | Usuario registrado exitosamente. Credenciales de acceso generadas y asociadas a su tenant. | Alta |
| **CP-CU10-01** | CU-10 / T-22 | Administrador en panel de catálogo fitosanitario. | 1. Modificar la descripción o tratamiento recomendado para la enfermedad `PHY-001`. | Catálogo actualizado. Los diagnósticos históricos mantienen su integridad y relaciones. | Alta |
| **CP-CU10-02** | CU-10 / T-28 | Administrador modifica umbral global de alerta de severidad de $30\%$ a $25\%$. | 1. Guardar nueva configuración de umbral. | Nuevos diagnósticos se evalúan con el umbral de $25\%$. Bitácora registra autor y timestamp (HITL-P4). | Alta |

### 9.5 Módulo 5: Evaluación de la CNN, Dataset y Paridad de Runtime (E-04 / T-10 a T-13 / CA-01 a CA-04, CA-13)

| ID Caso | Caso de Uso / Tarea | Precondiciones | Pasos de Ejecución | Resultado Esperado (Oráculo) | Prioridad |
|---|---|---|---|---|---|
| **CP-IA-01** | E-04 / T-12 | Dataset Hold-Out ($15\%$) preparado y congelado sin fugas de sesión. | 1. Ejecutar script de evaluación `evaluate_model.py` sobre el test set. | Accuracy Global del modelo $\ge 90.0\%$ (CA-01). | Crítica |
| **CP-IA-02** | E-04 / T-12 | Resultados de evaluación del test set. | 1. Calcular métricas Macro: Precision, Recall y F1-Score. | Cada una de las tres métricas macro $\ge 88.0\%$ (CA-02). | Crítica |
| **CP-IA-03** | E-04 / T-12 | Resultados de evaluación sobre la clase `roya_amarilla`. | 1. Calcular Recall específico para la clase Roya. | Recall de Roya Amarilla $\ge 88.0\%$ (CA-03). Lista de Falsos Negativos exportada para auditoría. | Crítica |
| **CP-IA-04** | E-04 / T-12 | Matriz de confusión $3 \times 3$ generada. | 1. Inspeccionar distribución de errores entre Sana, Roya y Otra. | Informe publicado con la matriz completa. Falsos negativos de Roya analizados por equipo HITL. | Alta |
| **CP-IA-05** | E-04 / T-10 | Semilla estocástica (*Seed*) y versión de dataset documentadas. | 1. Re-entrenar la red desde cero usando la misma configuración. | Métricas de evaluación reproducibles dentro de una tolerancia del $\pm 1.0\%$. | Alta |
| **CP-IA-06** | E-04 / T-10 | Imágenes pertenecientes al conjunto de entrenamiento (*Train Set*). | 1. Intentar incluir imágenes de train dentro de la evaluación de cierre. | Rechazo de la suite de pruebas por violación de Data Leakage. Test invalidado. | Alta |
| **CP-IA-07** | E-04 / T-13 | Modelo exportado a formato `model.onnx`. | 1. Ejecutar inferencia en lote sobre el test set con PyTorch y con ONNX Runtime. | Coincidencia exacta de clasificación de clase en $\ge 98.0\%$ de las muestras (CA-13). | Crítica |
| **CP-IA-08** | E-04 / T-10 | Lote de 50 imágenes capturadas en campo real en el Valle del Mantaro. | 1. Ejecutar inferencia local y comparar contra etiqueta del técnico. | Desempeño registrado. Sin degradación catastrófica respecto al dataset de laboratorio. | Alta |
| **CP-IA-09** | E-04 / T-11 | Juego de prueba con 30 imágenes que no corresponden a hojas de trigo (ruido/campo). | 1. Ejecutar inferencia sobre el juego negativo. | $\le 10.0\%$ de las muestras son clasificadas como Roya Amarilla con confianza $\ge 75\%$ (CA-16). | Alta |

### 9.6 Módulo 6: Seguridad, Hardening, API y Agentes (E-02, E-07, E-09 / T-30, T-31 / CA-18, CA-19)

| ID Caso | Caso de Uso / Tarea | Precondiciones | Pasos de Ejecución | Resultado Esperado (Oráculo) | Prioridad |
|---|---|---|---|---|---|
| **CP-SEC-01** | E-09 / T-31 | Repositorio de código Git de la solución. | 1. Ejecutar herramienta `gitleaks detect --source .` sobre todo el historial. | 0 secretos, tokens JWT o credenciales encontradas en el código versionado (CA-18). | Crítica |
| **CP-SEC-02** | E-09 / T-31 | Entorno QA desplegado con HTTPS. | 1. Ejecutar escaneo automatizado con OWASP ZAP sobre endpoints de la API. | 0 vulnerabilidades de severidad Alta o Crítica detectadas en el reporte final. | Alta |
| **CP-API-01** | E-07 / T-22 | Endpoint de creación de diagnóstico. | 1. Enviar POST con un valor de confianza fuera de rango (ej. $\text{confianza} = 150$). | HTTP 422 Unprocessable Entity. Error de validación en esquema JSON. | Alta |
| **CP-API-02** | E-07 / T-30 | Servidor Laravel y servicios activos. | 1. Realizar petición GET a `/health`. | HTTP 200 OK. JSON con estado del sistema, conexión a MySQL y versión del servicio. | Media |
| **CP-API-03** | E-07 / T-23 | Herramienta de carga k6 configurada. | 1. Simular 50 usuarios concurrentes realizando sincronización de diagnósticos. | Tiempo p95 de respuesta $< 2.0$ segundos. Tasa de error HTTP 5xx igual a $0.0\%$. | Media |
| **CP-AGE-01** | E-09 / HULA | Pull Request generado automáticamente por un agente de desarrollo (SWE-agent). | 1. Verificar proceso de integración continua en GitHub Actions. | El PR requiere revisión y aprobación explícita de un ingeniero humano (MRP). Prohibido auto-merge (CA-19). | Alta |
| **CP-AGE-02** | E-09 / SASE | Agente propone reemplazar la arquitectura offline por llamadas directas a FastAPI. | 1. Evaluar propuesta mediante gate CRP. | El arquitecto humano rechaza la propuesta por violar el MentorScript y el principio offline-first. | Alta |
| **CP-REG-01** | E-09 / CI | Rama `main` del repositorio. | 1. Realizar integración de un nuevo cambio de código. | Pipeline CI ejecuta linters, pruebas PHPUnit y build de Vite en verde (CA-14). | Alta |

---

## 10. Gestión de Defectos y Riesgos

### 10.1 Clasificación y Niveles de Severidad de Errores

| Nivel de Severidad | Criterio de Clasificación | SLA de Atención (QA/Dev) | Impacto en la Liberación |
|---|---|---|---|
| **Bloqueante (S1)** | Incapacidad total para diagnosticar offline, caída del entorno de base de datos, pérdida de datos en IndexedDB, duplicación masiva en sync o fuga entre Tenants. | Atención inmediata ($< 4$ horas) | Detiene totalmente la liberación del MVP. |
| **Alta (S2)** | Falsos negativos sistemáticos de Roya Amarilla, Recall $< 88\%$, latencia Edge $> 3.0$ s, fallo en la regla de incertidumbre al $75\%$ o error en el flujo del técnico HITL. | Resolución $< 24$ horas | Detiene la liberación salvo Waiver del PO. |
| **Media (S3)** | Errores menores en la renderización de mapas de parcelas, fallos de formato visual en el historial o desalineación en notificaciones no críticas. | Resolución en la iteración | Permite liberación con plan de corrección. |
| **Baja (S4)** | Detalles cosméticos de interfaz, textos de ayuda secundarios u ortografía en mensajes de la PWA. | Backlog secundario | No afecta la liberación del producto. |

### 10.2 Matriz de Riesgos y Planes de Contingencia

| ID Riesgo | Descripción del Riesgo | Prob. | Impacto | Plan de Mitigación y Contingencia |
|---|---|---|---|---|
| **R-01** | La red neuronal no alcanza el Accuracy del $90\%$ por escasez de imágenes en el dataset público. | Alta | Alto | **Mitigación:** Aplicar transfer learning agresivo con MobileNetV3; incorporar técnicas de aumento de datos (*Data Augmentation*) y forzar la derivación al técnico HITL. |
| **R-02** | Inconsistencia de predicciones por deriva de cuantización entre PyTorch y ONNX Web. | Media | Alto | **Mitigación:** Ejecución obligatoria del test de paridad T-13 en CI; si la coincidencia es $< 98\%$, descartar cuantización Int8 y entregar versión Float16/Float32. |
| **R-03** | Inestabilidad del servidor local XAMPP/MySQL durante las pruebas integrales de sincronización. | Media | Alto | **Mitigación:** Mantener contenedores Docker de respaldo con PostgreSQL/MySQL y ejecutar pruebas unitarias e integración sobre base de datos en memoria (`:memory:`). |
| **R-04** | Un agente de software (SWE-agent) introduce código que rompe el aislamiento multi-tenant. | Media | Alto | **Mitigación:** Aplicar reglas MentorScript en linters automatizados y exigir la verificación humana del MRP (HITL-D3) en el $100\%$ de los Pull Requests. |
| **R-05** | La conectividad real en los campos del Valle del Mantaro presenta cortes más severos que en laboratorio. | Alta | Alto | **Mitigación:** Ejecutar pruebas obligatorias con emulación de red degradada mediante Toxiproxy (cortes de 10s, latencia de 3000ms) asegurando la resiliencia de la cola Outbox. |
| **R-06** | Falta de validación con expertos agrónomos del INIA. | Media | Alto | **Mitigación:** Coordinación temprana con INIA y Comunidad de Aramachay. |
| **R-07** | Cambio de requerimientos tardío que invalida casos de prueba. | Baja | Media | **Mitigación:** Congelamiento de requisitos al inicio de cada fase. |

---

## 11. Métricas, Indicadores (KPIs) y Reportes

### 11.1 Indicadores Clave de Calidad de Software

| Indicador (KPI) | Fórmula / Método de Cálculo | Meta Máxima / Mínima | Frecuencia |
|---|---|---|---|
| **Cobertura de Pruebas (Code Coverage)** | $\left( \frac{\text{Líneas probadas en } \texttt{app/}}{\text{Líneas totales en } \texttt{app/}} \right) \times 100$ | $\ge 70.0\%$ en código crítico | Por cada Build / PR |
| **Tasa de Éxito de Casos de Prueba** | $\left( \frac{\text{Casos PASSED}}{\text{Total Casos Ejecutados}} \right) \times 100$ | $100\%$ en Críticos y Altos | Diario en fase de ejecución |
| **Densidad de Defectos** | $\frac{\text{Número de Errores Encontrados}}{\text{KLOC de Código}}$ | $< 3.0$ errores por KLOC | Al final de cada fase |
| **Recall Fitosanitario de Roya** | $\frac{VP_{\text{Roya}}}{VP_{\text{Roya}} + FN_{\text{Roya}}}$ | $\ge 88.0\%$ estricto | Por versión de Modelo |
| **Paridad de Runtime WASM** | $\left( \frac{\text{Muestras Coincidentes ONNX vs PyTorch}}{\text{Total Set}} \right) \times 100$ | $\ge 98.0\%$ de acuerdo | Por Build de IA |
| **Latencia Edge** | Promedio de tiempos de inferencia | $\le 3.0$ s | Por dispositivo |
| **Tasa de Sincronización Exitosa** | $\left( \frac{\text{Registros confirmados}}{\text{Total en cola}} \right) \times 100$ | $100\%$ | Por ciclo de sync |
| **Idempotencia** | $\left( \frac{\text{UUIDs únicos en BD}}{\text{Total registros}} \right) \times 100$ | $100\%$ | Por ciclo de sync |

---

## 12. Referencias Bibliográficas y Normativas

* **ISO/IEC/IEEE 29119:2021/2022:** Software and Systems Engineering — Software Testing (Parts 1-5: Concepts, Processes, Documentation, Testing Techniques).
* **ISO/IEC 25010:2023:** Systems and Software Engineering — Systems and Software Quality Requirements and Evaluation (SQuaRE) — System and Software Quality Models.
* **ISO/IEC 27001:2022:** Information Security, Cybersecurity and Privacy Protection — Information Security Management Systems.
* **Hassan et al. (2026):** Agentic Software Engineering with SASE: Artifacts, Quality Gates, and Governance in LLM-driven Development. *IEEE Transactions on Software Engineering*.
* **Otoum, N. & Elkhalili, N. (2026):** Methods and Techniques of Agentic Software Engineering: A Systematic Literature Review. *IEEE Access*, vol. 14, pp. 7443–7462. DOI: 10.1109/ACCESS.2026.3652325.
* **Takerngsaksiri, W., Pasuksmit, J., Thongtanunam, P., & Tantithamthavorn, C. (2025):** Human-In-The-Loop Software Development Agents (HULA). *arXiv:2411.12924v2*.
* **Yang et al. (2024):** SWE-agent: Agent-Computer Interfaces Enable Software Engineering Agents to Resolve Real-World GitHub Issues. *arXiv:2405.15793*.
* **Sauvola et al. (2024):** Future of Software Development with Generative AI: Scenarios S1 to S4. *Automated Software Engineering*, 31:26.

---

## 13. Acta de Aprobación y Sign-Off Formal

Al firmar el presente documento, las partes interesadas confirman que han revisado y aprobado la estrategia, alcance, criterios de aceptación (CA-01 a CA-20) y los puntos de control humano (HITL) especificados en este Plan Maestro de Pruebas.

| Nombre y Apellidos | Rol en el Proyecto | Estado / Firma de Aprobación | Fecha de Firma |
|---|---|---|---|
| **Grupo Software Engineer / QA Lead** | Líder de Aseguramiento de Calidad (QA) | **APROBADO** | 05/10/2026 |
| **[Por Asignar]** | Gerente de Proyecto / Project Manager | Pendiente de Firma | — |
| **[Por Asignar]** | Product Owner (PO) | Pendiente de Firma | — |
| **[Por Asignar]** | Responsable de Modelo e IA (Lead AI) | Pendiente de Firma | — |
| **[Por Asignar]** | Técnico Agrónomo Experto (HITL) | Pendiente de Firma | — |