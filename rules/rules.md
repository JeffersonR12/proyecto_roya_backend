# Reglas del proyecto Roya

Fuente: `Docs/01`–`Docs/09`. Toda implementación nueva debe alinear el código actual (Laravel + React en este repositorio) con esta arquitectura Edge-Cloud. Si hay conflicto entre el código legado y estas reglas, **ganan estas reglas** y el código se adapta.

## 1. Identidad y objetivo

Sistema web PWA para **detección temprana de Roya Amarilla en trigo** (Valle del Mantaro) con arquitectura **offline-first Edge-Cloud**.

- Inferencia local en el cliente sin Internet.
- Persistencia local y sincronización diferida e idempotente.
- Nube para identidad, reglas de negocio, históricos, alertas y administración.

Roles: **agricultor**, **tecnico**, **administrador**. Aislamiento por **tenant**.

## 2. Stack obligatorio

| Capa | Tecnología | Uso |
|---|---|---|
| Frontend / PWA | React CSR, Offline-First, CDN Cloudflare/AWS | UI, cámara, modo offline |
| Edge Agent | PWA/Native, ONNX Runtime o TFLite cuantizado, SQLite/IndexedDB | Inferencia y cola local |
| Backend Core SaaS | Laravel/PHP, API REST, multi-tenancy, RBAC, Sanctum/JWT | Identidad, negocio, sync |
| Microservicio IA | FastAPI/Python, WebSockets/MQTT | Inferencia cloud/auxiliar, modelos |
| Datos | PostgreSQL (prod), MySQL (alternativa), SQLite (edge) | Persistencia |
| IA / ML | PyTorch o TensorFlow → ONNX/TFLite | Entrenamiento y exportación |
| DevOps | GitHub Actions, Docker, AWS/Azure/GCP, Raspberry Pi/NVIDIA | CI/CD y despliegue |
| Observabilidad | Prometheus, Grafana, ELK, health checks | Operación |

Prohibido acoplar la inferencia crítica offline a FastAPI o a Laravel. FastAPI es **complementario**.

## 3. Principios (no negociables)

### SOLID

- Un controlador/servicio, una responsabilidad.
- Dependencias hacia contratos (FormRequest, interfaces), no hacia detalles.
- El Core Laravel no importa el runtime ONNX; el cliente Edge no contiene reglas de facturación/RBAC cloud.

### TDD e ISO 29119

- Red → green → refactor en lógica de negocio, sync e inferencia.
- Cada historia tiene pruebas: unitarias, integración y aceptación.
- Casos mínimos: login genérico 401, RBAC 403, UUID no duplica, confianza < umbral → `no_concluyente`, flujo sin red → sync.

### ISO 25010

- Funcionalidad, rendimiento (inferencia ≤ 3 s), compatibilidad, usabilidad en campo, fiabilidad offline, seguridad, mantenibilidad, portabilidad Edge/Cloud.

### ISO 27001

- Secretos solo en entorno/secret manager. Nunca en Git.
- HTTPS en producción. CSRF + rate limit por IP en auth.
- Mensajes de auth genéricos (no revelar si el email existe).
- RBAC + tenant en **cada** recurso. Sin acceso cruzado.
- Validar MIME/tamaño de imágenes. Hash de contraseñas.

### DevOps

- Ramas `main` / `dev` / `feature/*`.
- CI: lint, tests, build en cada PR.
- Docker para servicios reproducibles.
- Health checks en Laravel y FastAPI.
- Definition of Done: código revisado, tests, logs, `.env.example` actualizado, sin secretos.

## 4. Arquitectura y flujo

```
Captura PWA → ONNX/TFLite local → clase + confianza + severidad
     → UUID + IndexedDB/SQLite (pending)
     → (si hay red) REST/HTTPS → Laravel
     → PostgreSQL + alertas + dashboard
     → FastAPI solo para modelo/auxiliar
```

Canales: **REST/HTTPS** sync y CRUD; **MQTT** telemetría; **WebSockets** dashboard.

Cola local: `pending → sending → confirmed | error`. Backoff exponencial. Confirmar recepción **antes** de marcar `confirmed`.

## 5. Datos

Entidades cloud: `tenants`, `roles`, `usuarios`, `parcelas`, `catalogo_fitosanitario`, `diagnosticos`, `alertas`, `sync_events`.

Reglas:

- `diagnosticos.uuid_local` UNIQUE. Idempotencia de sync.
- `confianza` y `severidad` son **campos distintos** (0–100). No reutilizar un único `confidence` para ambas.
- Clases: `sana` | `roya_amarilla` | `otra_enfermedad` | `no_concluyente`.
- Confianza < umbral operativo (p. ej. 75 %) → `no_concluyente`.
- Guardar `modelo_version`, GPS, parcela, `captured_at`.
- Imágenes: path/URI o blob comprimido; no mezclar evidencia con el JSON de sync sin política de tamaño.
- Email único **por tenant**.
- Baja lógica o retención para evidencia auditada; no borrar en cascada diagnósticos.

Código legado (`users` + `analyses` con `confidence` e `image_base64`): migrar hacia este diccionario; no extender el modelo viejo.

## 6. API Laravel (Core)

- Stateless cuando sea posible. Prefijo `/api`.
- Middleware: `auth:sanctum` (o JWT), `tenant`, `role:*`.
- Sync masivo: `POST /api/sync/diagnosticos` por lote, transaccional.
- UUID repetido mismo tenant y mismo contenido → `already_exists`, HTTP 200, no insertar.
- UUID repetido con conflicto → rechazar y registrar incidente.
- JSON consistente: `{ success, data|errors, message }`.
- OpenAPI alineado al código.
- Rate limit diferenciado: login, sync, consultas.

## 7. Frontend / Edge

- PWA instalable, cache, funciona en PC y móvil.
- Captura cámara o archivo.
- Inferencia 100 % local en el camino crítico.
- No afirmar diagnóstico con baja confianza.
- Agricultor: solo sus parcelas/diagnósticos. Técnico: asignados. Admin: tenant.

## 8. IA / ML

- Línea base: MobileNetV3-Small, entrada 224×224×3, 3 clases.
- Dataset versionado; split 70/15/15 sin fugas de sesión.
- Metas MVP: Accuracy ≥ 90 %, Precision/Recall/F1 ≥ 88 %.
- Exportar ONNX/TFLite y validar equivalencia.
- Medir recall de **Roya Amarilla** y latencia en dispositivo objetivo.

## 9. Observabilidad

Exponer: health, latencia p95 API, errores 5xx, ítems sync (pending/confirmed/error), latencia de inferencia, versión de modelo, alertas emitidas. Prometheus + Grafana + logs ELK.

## 10. Seguridad de implementación (código actual)

Login actual: `POST /login` sesión web, email `^[a-zA-Z0-9._%+-]+@gmail\.com$`, `remember_me`, CSRF, throttle por IP. Mantener esas salvaguardas al pasar a `/api/auth/*`.

Nunca commitear `.env`, tokens ni pesos no versionados de forma insegura.

## 11. Criterios de aceptación globales

- Diagnóstico operativo **sin Internet**.
- Reintentos de sync **sin duplicados**.
- Usuario no ve datos de otro tenant.
- Inferencia Edge ≤ 3 s en el dispositivo objetivo.
- Cada diagnóstico lleva `uuid_local` y `modelo_version`.
- CI verde y health checks OK antes de merge a `main`.
