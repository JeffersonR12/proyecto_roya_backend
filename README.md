# Roya

PWA para **detección temprana de Roya Amarilla** en trigo (Valle del Mantaro), con arquitectura **offline-first Edge-Cloud**.

El agricultor captura o sube una hoja en campo. La clasificación corre **en el navegador** (ONNX Runtime Web). El resultado se guarda en IndexedDB aunque no haya red. Laravel es el Core SaaS (identidad, tenants, roles y persistencia cloud). FastAPI es auxiliar: **no** forma parte del camino crítico sin internet.

## Qué hace hoy

- Login / registro con email Gmail, roles `agricultor`, `tecnico` y `administrador`, aislamiento por tenant.
- Recuperación de contraseña con enlace por correo (token de un solo uso, 60 min, respuesta genérica).
- Escáner con cámara o archivo: preproceso 224×224, inferencia local, umbral de confianza.
- Persistencia Edge en IndexedDB (`pending`) con `uuid_local` y `modelo_version`.
- Sincronización Edge → Cloud automática (al abrir, al volver la red, cada 60 s y tras cada captura) con backoff exponencial.
- API REST `/api` (Sanctum): sync por lote idempotente, diagnósticos, HITL, catálogo, parcelas, alertas, health.
- Alertas tempranas en servidor (`roya_detectada` / `roya_critica` según umbral del catálogo).
- Técnico/administrador ven y validan (HITL) los diagnósticos de todo su tenant.

**Aún no está en el código:** FastAPI, MQTT/WebSockets y PostgreSQL de producción. Los pesos CNN no se versionan en Git (`.gitignore`): sin `public/models/modelo_roya.onnx` el motor no afirma clase y marca `no_concluyente`. Para generarlo: `scripts/train_export_cnn.py` (ver Docs/10 §11).

## API REST (Docs/09)

| Método | Ruta | Rol |
|---|---|---|
| POST | `/api/sync/diagnosticos` | autenticado — lote ≤ 50, idempotente por `uuid_local` |
| GET | `/api/sync/status` | autenticado |
| GET/POST | `/api/diagnosticos` | agricultor: propios · técnico/admin: tenant |
| GET | `/api/diagnosticos/{uuid}` · `/imagen` | mismo control de acceso |
| PATCH | `/api/diagnosticos/{uuid}` | técnico, administrador (HITL, etiqueta, severidad) |
| DELETE | `/api/diagnosticos/{uuid}` | administrador (baja lógica) |
| GET | `/api/catalogo` · `/api/parcelas` · `/api/alertas` | autenticado |
| GET | `/api/health` | público |

Respuesta por ítem del sync: `confirmed` (creado), `already_exists` (reintento sin duplicar), `conflict` (mismo UUID con otro contenido: se registra incidente) o `rejected` (parcela ajena, imagen inválida).

## Arquitectura

```
Captura PWA → ONNX local → clase + confianza + severidad
     → UUID + IndexedDB (pending)
     → (si hay red) REST/HTTPS → Laravel   POST /api/sync/diagnosticos
     → MySQL local / PostgreSQL cloud
     → FastAPI solo auxiliar               [pendiente]
```

Cola local: `pending → sending → confirmed | error`.

## Stack

| Capa | Tecnología |
|---|---|
| Cliente / PWA | React 19, Vite 7, Tailwind 4, Service Worker |
| Edge IA | ONNX Runtime Web (WASM), IndexedDB |
| Core | Laravel 12, PHP 8.2, sesión web |
| Datos locales | XAMPP MySQL (`proyecto_roya`) |
| Datos Edge | IndexedDB / `database/edge/schema.sqlite.sql` |
| Objetivo prod | PostgreSQL, REST/HTTPS, Sanctum o JWT |

Reglas permanentes: [`rules/rules.md`](rules/rules.md).

## Dominio

Clases: `sana` | `roya_amarilla` | `otra_enfermedad` | `no_concluyente`.

- `confianza` y `severidad` son campos distintos (0–100). No se mezclan.
- Confianza &lt; 75 % → `no_concluyente`. No se afirma diagnóstico débil.
- Todo diagnóstico Edge lleva `uuid_local` y `modelo_version`.
- Roles y datos se aíslan por tenant. Sin acceso cruzado.

## Requisitos

- PHP 8.2+, Composer, Node.js 20+
- XAMPP (Apache opcional, **MySQL en el puerto 3306**)
- Cuenta Gmail para login/registro (restricción del MVP)

## Arranque local (XAMPP)

1. En el panel de XAMPP, inicia **MySQL**. Si falla, no debe quedar un `mysqld.exe` colgado; el proceso del servidor es `mysqld.exe`, no `mysql.exe` ni `sqlservr.exe` (SQL Server).
2. Crea la base `proyecto_roya` (usuario `root`, sin contraseña por defecto de XAMPP).
3. Configura el entorno:

```bash
cp .env.example .env
php artisan key:generate
```

En `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=proyecto_roya
DB_USERNAME=root
DB_PASSWORD=
```

4. Instala dependencias, migraciones y frontend:

```bash
composer install
npm install
npm run copy:ort
php artisan migrate
php artisan db:seed
```

5. Dos terminales:

```bash
php artisan serve
npm run dev
```

Abre [http://127.0.0.1:8000](http://127.0.0.1:8000).

Para PWA (service worker) usa `npm run build` y sirve la app sin el HMR de Vite.

### Usuarios demo (solo QA local)

| Email | Rol | Contraseña |
|---|---|---|
| `admin@gmail.com` | administrador | `password` |
| `tecnico@gmail.com` | tecnico | `password` |
| `agricultor@gmail.com` | agricultor | `password` |

Tenant: Cooperativa El Roble. Parcela: Lote Valle Norte.

### Modelo ONNX

Coloca el MobileNetV3-Small de 3 clases en:

```text
public/models/modelo_roya.onnx
```

Entrada esperada: `1×3×224×224`, normalización ImageNet, salida de 3 logits (`sana`, `roya_amarilla`, `otra_enfermedad`).

## Pruebas

```bash
php artisan test
npm run test:js
```

- PHPUnit: esquema de dominio, PWA assets, auth de invitados.
- Vitest: umbral 75 %, clases, UUID y cola `pending`.

Plan de pruebas: [`Docs/PLAN-PRUEBAS-001-Roya.docx`](Docs/PLAN-PRUEBAS-001-Roya.docx).

## Documentación

| Doc | Contenido |
|---|---|
| [01 Análisis MVP](Docs/01_Analisis_del_MVP_mejorado.md) | Alcance, CU-01–CU-10, métricas |
| [02 Backlog](Docs/02_Backlog_Tecnico.md) | Épicas E-01–E-09, T-01–T-32 |
| [03 Diccionario](Docs/03_Diccionario_de_Datos.md) | Entidades y campos |
| [04 Arquitectura Edge](Docs/04_Diseño_Tecnico_Arquitectura_Edge.md) | Canales REST / MQTT / WS |
| [05–09 Iteraciones](Docs/) | BD, auth, CNN, FastAPI, API REST |

## Estructura

```text
app/Models/            Tenant, Role, User, Parcela, Diagnostico, Alerta, SyncEvent
database/migrations/   Esquema cloud (convive con tablas Laravel de auth)
database/edge/         Esquema SQLite de referencia para el Edge
resources/js/          React: login, escáner, dashboard, ONNX, IndexedDB
public/sw.js           Service Worker (cache de /onnx y /models)
public/models/         Pesos ONNX (no versionar el .onnx grande)
Docs/                  Entregables técnicos y plan de pruebas
rules/rules.md         Constitución del producto
```

## Ramas

`main` · `qa/jefferson-huaman` · `documentacion/jeff` · `dev` / `feature/*` según el backlog.

## Licencia

El esqueleto Laravel se distribuye bajo [MIT](https://opensource.org/licenses/MIT). El contenido de dominio Roya es del proyecto académico/implementación.
