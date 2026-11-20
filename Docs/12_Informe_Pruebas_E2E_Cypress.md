# 5. Integración y automatización de pruebas con Cypress

Las pruebas *end-to-end* (E2E) validan el sistema RiwiScan tal como lo usa una persona: un navegador real abre la PWA servida por Laravel, interactúa con la interfaz React, envía peticiones a la API y verifica las respuestas, el contenido de la pantalla y los datos guardados en el dispositivo (IndexedDB). No se usan *mocks* del backend: todas las pruebas se ejecutan sobre la aplicación en funcionamiento (`php artisan serve --port=8090`) y su base de datos MariaDB.

## 5.1 Configuración de Cypress

**Herramientas instaladas** (`package.json`, `devDependencies`):

| Paquete | Versión | Propósito |
|---|---|---|
| `cypress` | 16.2.1 | Framework E2E. Ejecuta las pruebas en Electron 146 (*headless*) o en Chrome. |
| `cypress-mochawesome-reporter` | 5.0.0 | Genera un reporte HTML con gráficos, capturas embebidas y videos. |

**Instalación (PowerShell):**

```powershell
Set-Location C:\xampp\htdocs\proyecto_roya_backend-main
npm install --save-dev cypress cypress-mochawesome-reporter
npx cypress verify
```

**Scripts agregados a `package.json`:**

```json
"test:e2e": "cypress run",
"test:e2e:open": "cypress open"
```

**Archivo `cypress.config.js`:**

```js
import { createRequire } from 'node:module';
import { defineConfig } from 'cypress';

// package.json usa "type": "module"; el plugin del reporter se publica en CommonJS.
const require = createRequire(import.meta.url);

export default defineConfig({
    e2e: {
        // Laravel servido con: php artisan serve --port=8090
        baseUrl: 'http://127.0.0.1:8090',
        specPattern: 'cypress/e2e/**/*.cy.js',
        supportFile: 'cypress/support/e2e.js',
        setupNodeEvents(on, config) {
            require('cypress-mochawesome-reporter/plugin')(on);
            return config;
        },
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    defaultCommandTimeout: 10000,
    // La primera inferencia descarga el modelo ONNX (~6 MB) y el runtime WASM.
    pageLoadTimeout: 60000,
    retries: { runMode: 0, openMode: 0 },
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
        reportDir: 'cypress/reports',
        reportPageTitle: 'RiwiScan - Pruebas E2E con Cypress',
        reportTitle: 'RiwiScan - Deteccion temprana de Roya Amarilla',
        charts: true,
        embeddedScreenshots: true,
        inlineAssets: true,
        saveAllAttempts: false,
    },
});
```

**Estructura creada.** No se modificó ningún controlador, modelo, ruta ni componente React.

```
cypress.config.js
cypress/
├── e2e/
│   ├── E2E-01_login_valido.cy.js
│   ├── E2E-02_login_invalido.cy.js
│   ├── E2E-03_registro_validacion.cy.js
│   ├── E2E-04_recuperar_password.cy.js
│   ├── E2E-05_navegacion_modulos.cy.js
│   ├── E2E-06_escaneo_onnx.cy.js
│   └── E2E-07_control_acceso_rol.cy.js
├── fixtures/
│   ├── hoja_trigo.jpg        (fotografía real de hoja de trigo, copiada de public/imagenes/trigo-hoja.jpg)
│   └── usuarios.json         (cuentas del DatabaseSeeder)
└── support/
    ├── e2e.js                (registro del reporter y capturas tipo viewport)
    └── commands.js           (comandos propios: loginAs, visitApp, leerDiagnosticosLocales, apiRequest)
```

Las carpetas de salida (`cypress/videos`, `cypress/screenshots`, `cypress/reports`) se agregaron a `.gitignore`.

**Decisiones de diseño:**

- **Selectores reales.** Se usan los `id` y textos de los componentes (`#login-email`, `#register-phone`, el botón "Acceder a mis parcelas", `nav[aria-label="Navegación principal"]`, `#historial-title`), leídos de `Login.jsx`, `Register.jsx`, `Sidebar.jsx`, `PageHeader.jsx` y `Scanner.jsx`.
- **Datos de prueba.** Se usan las cuentas de `database/seeders/DatabaseSeeder.php` (tenant `el-roble`), aisladas del tenant real del proyecto.
- **Respeto del *rate limiting*.** La ruta `POST /login` tiene `throttle:login` (5 intentos por minuto por IP). El comando `cy.loginAs()` usa `cy.session(..., { cacheAcrossSpecs: true })`, así que la suite completa hace solo 4 inicios de sesión.
- **Determinismo.** `cy.visitApp()` desactiva el onboarding, fija el idioma en español y simula la denegación de la geolocalización, de modo que el escáner guarda `latitud = null`.
- **Verificación en varias capas.** Además de la interfaz, se comprueban el código HTTP y el cuerpo JSON (`cy.intercept`), la API protegida por Sanctum (`cy.apiRequest`) y el contenido de IndexedDB (`cy.leerDiagnosticosLocales`).

## 5.2 Escenarios diseñados

Datos de prueba comunes: técnico `tecnico@gmail.com` / `password`; agricultor `agricultor@gmail.com` / `password`; imagen `cypress/fixtures/hoja_trigo.jpg` (378 KB). Ejecución final del 09/11/2026 sobre el build de producción (`npm run build`).

| ID | Funcionalidad | Objetivo | Datos de prueba | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|---|
| E2E-01 | Inicio de sesión | Verificar que un usuario válido accede a la PWA y que la sesión autoriza la API REST | `tecnico@gmail.com` / `password` | 1. Abrir `/login`. 2. Ingresar correo y contraseña. 3. Pulsar "Acceder a mis parcelas". 4. Consultar `GET /api/sync/status`. | `POST /login` responde 200; redirige a `/`; se muestra "Hola, Luis" y el menú; la API responde 200 con `success: true`. | `POST /login` 200, redirección a `/`, saludo y menú visibles, `/api/sync/status` 200 con `success: true`. | Aprobado |
| E2E-02 | Inicio de sesión inválido | Verificar el rechazo de credenciales incorrectas (servidor) y de un correo con formato inválido (cliente) | a) `tecnico@gmail.com` / `ClaveIncorrecta123`. b) `tecnico@hotmail.com` / `password`. | a) Enviar credenciales erróneas. b) Enviar un correo que no es Gmail. | a) 422 con `errors.credentials` = "Las credenciales no son validas.", alerta visible, sin sesión (`GET /` → 302). b) Alerta "El correo debe tener el formato usuario@gmail.com.", campo marcado como inválido y ningún `POST /login`. | a) 422, alerta con el mensaje exacto, se mantiene en `/login`, `GET /` → 302. b) Alerta mostrada, `aria-invalid="true"`, 0 peticiones al servidor. | Aprobado |
| E2E-03 | Registro con validación | Verificar las reglas de registro del cliente (`authAlerts.js`) y del servidor (`RegisterRequest`) | Formulario completo con celular `987654321` y rol agricultor, variando: a) `@yahoo.com`, b) contraseña `abc123`, c) correo ya existente `tecnico@gmail.com` | Llenar el formulario y pulsar "Registrarme" en cada variante. | a) "El correo debe tener el formato usuario@gmail.com." sin petición. b) "La contraseña debe tener al menos 8 caracteres." sin petición. c) 422 con "Este correo ya esta registrado.". No se crea ningún usuario. | a) y b) mensajes exactos sin `POST /register`. c) 422 con `errors.email[0]` correcto; se mantiene en `/register`. | Aprobado |
| E2E-04 | Recuperación de contraseña | Verificar la solicitud del enlace de restablecimiento | a) `tecnico@gmail.com`. b) `tecnico@outlook.com`. | a) Desde `/login`, pulsar "¿Olvidaste tu contraseña?", ingresar el correo y pulsar "Enviar instrucciones". b) Enviar un correo con formato inválido. | a) Navega a `/forgot-password`; responde 200 con el mensaje neutro "Si el correo existe, te enviaremos instrucciones para restablecer la contraseña."; el correo se registra en `storage/logs/laravel.log`. b) Error de formato sin petición. | a) 200, `success: true`, mensaje exacto visible; correo con enlace `/reset-password/{token}` registrado en `laravel.log`. b) Error mostrado, 0 peticiones. | Aprobado |
| E2E-05 | Navegación entre módulos | Verificar que el menú cambia de módulo y marca el activo | Sesión de técnico | Pulsar en el menú: Historial → Alertas → Protocolo → Campo. | Cada módulo muestra su título ("Historial", "Alertas", "Protocolo de mitigación", "Hola, Luis") y su botón queda con `aria-current="page"`. | Los 4 módulos cargan con su título correcto y el estado activo cambia en cada paso. | Aprobado |
| E2E-06 | Escaneo con inferencia ONNX local | Verificar el flujo Edge completo: imagen → ONNX Runtime Web → umbral → IndexedDB | `hoja_trigo.jpg`; modelo placeholder MobileNetV3-Small (salida [0,0,0]) | 1. Pulsar "Seguir sin lote". 2. Subir la imagen con `selectFile`. 3. Esperar el resultado. 4. Leer IndexedDB `roya-edge`. | Se muestra "No pudimos ver bien la hoja" (clase no concluyente), **sin** el mensaje de respaldo "El análisis no está disponible"; IndexedDB tiene +1 registro con `clase = no_concluyente`, `confianza = 33.33`, *scores* de 3 clases, `modelo_version = roya-mobilenetv3-small-v1`, `hitl_status = pending` y un UUID v4. | Resultado mostrado y guardado; registro nuevo en IndexedDB con los valores esperados. La cola lo sincronizó (`sync_status = confirmed`) y apareció en MariaDB (`diagnosticos.id = 7`). | Aprobado (en la ejecución 1 detectó el defecto DEF-01) |
| E2E-07 | Control de acceso por rol | Verificar que la revisión técnica (HITL) solo está disponible para técnico y administrador | `agricultor@gmail.com` y `tecnico@gmail.com` | a) Con el agricultor: revisar el menú e intentar `PATCH /api/diagnosticos/{uuid}`. b) Con el técnico: abrir "Revisión técnica". | a) El menú no muestra "Revisión técnica"; la API responde 403 con "No tienes permiso para esta accion.". b) El técnico ve y abre "Revisión técnica". | a) Opción ausente; 403 con el mensaje exacto (middleware `EnsureRole`). b) Opción visible y activa; `PATCH` responde 404 (supera `EnsureRole`, no 403). | Aprobado |

## 5.3 Implementación

### `cypress/support/commands.js`

```js
// Comandos reutilizables de las pruebas E2E de RiwiScan.
// Las claves y el esquema replican el código real:
//   - resources/js/RoyaGuard.jsx      -> ONBOARDING_KEY = 'riwiscan-onboarding-v1'
//   - resources/js/lib/fieldFlow.js   -> LANG_KEY = 'riwiscan-lang'
//   - resources/js/lib/diagnosticosDb.js -> base 'roya-edge' v1, store 'diagnosticos'

const IDB_NAME = 'roya-edge';
const IDB_VERSION = 1;
const IDB_STORE = 'diagnosticos';

/**
 * Inicia sesión por la interfaz real (/login) y cachea la sesión.
 * cacheAcrossSpecs evita repetir POST /login: la ruta tiene throttle:login (5 por minuto por IP).
 */
Cypress.Commands.add('loginAs', (perfil = 'tecnico') => {
    cy.fixture('usuarios').then((usuarios) => {
        const { email, password } = usuarios[perfil];

        cy.session(
            ['login', perfil],
            () => {
                cy.visit('/login');
                cy.get('#login-email').type(email);
                cy.get('#login-password').type(password, { log: false });
                cy.contains('button', 'Acceder a mis parcelas').click();
                cy.location('pathname', { timeout: 15000 }).should('eq', '/');
            },
            {
                validate() {
                    cy.request({ url: '/', followRedirect: false }).its('status').should('eq', 200);
                },
                cacheAcrossSpecs: true,
            },
        );
    });
});

/**
 * Abre la PWA autenticada sin el onboarding, en español y con la geolocalización
 * denegada de forma determinista (el escáner guarda latitud/longitud = null).
 */
Cypress.Commands.add('visitApp', (path = '/') => {
    cy.visit(path, {
        onBeforeLoad(win) {
            win.localStorage.setItem('riwiscan-onboarding-v1', 'done');
            win.localStorage.setItem('riwiscan-lang', 'es');
            cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((_ok, fail) =>
                fail({ code: 1, message: 'Geolocalización desactivada en la prueba' }),
            );
        },
    });
    cy.get('nav[aria-label="Navegación principal"]').should('exist');
});

/** Lee todos los diagnósticos guardados por la PWA en IndexedDB. */
Cypress.Commands.add('leerDiagnosticosLocales', () =>
    cy.window({ log: false }).then(
        (win) =>
            new Cypress.Promise((resolve, reject) => {
                const request = win.indexedDB.open(IDB_NAME, IDB_VERSION);

                // Mismo esquema que diagnosticosDb.js, por si la prueba abre la base antes que la app.
                request.onupgradeneeded = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        const store = db.createObjectStore(IDB_STORE, { keyPath: 'uuid_local' });
                        store.createIndex('sync_status', 'sync_status', { unique: false });
                        store.createIndex('captured_at', 'captured_at', { unique: false });
                    }
                };
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    const db = request.result;
                    const getAll = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).getAll();
                    getAll.onsuccess = () => {
                        db.close();
                        resolve(getAll.result);
                    };
                    getAll.onerror = () => reject(getAll.error);
                };
            }),
    ),
);

/**
 * Petición a /api/* con la sesión del navegador. Sanctum solo trata la petición como
 * "stateful" si trae Referer del mismo host, y exige el token CSRF en métodos de escritura.
 */
Cypress.Commands.add('apiRequest', (method, url, body) =>
    cy.getCookie('XSRF-TOKEN').then((cookie) =>
        cy.request({
            method,
            url,
            body,
            failOnStatusCode: false,
            headers: {
                Accept: 'application/json',
                Referer: `${Cypress.config('baseUrl')}/`,
                'X-Requested-With': 'XMLHttpRequest',
                ...(cookie ? { 'X-XSRF-TOKEN': decodeURIComponent(cookie.value) } : {}),
            },
        }),
    ),
);
```

### `cypress/support/e2e.js`

```js
import 'cypress-mochawesome-reporter/register';
import './commands';

// Capturas del área visible (1280x720): la captura de página completa compone varias
// imágenes y en Electron headless puede superar el tiempo límite.
Cypress.Screenshot.defaults({ capture: 'viewport' });
```

### `cypress/fixtures/usuarios.json`

```json
{
    "_fuente": "database/seeders/DatabaseSeeder.php (tenant el-roble). Contraseña sembrada: 'password'.",
    "admin": { "email": "admin@gmail.com", "password": "password", "nombre": "Ana" },
    "tecnico": { "email": "tecnico@gmail.com", "password": "password", "nombre": "Luis" },
    "agricultor": { "email": "agricultor@gmail.com", "password": "password", "nombre": "Maria" }
}
```

### E2E-01 · `cypress/e2e/E2E-01_login_valido.cy.js`

```js
// E2E-01 · Inicio de sesión válido
// Funcionalidad real: resources/js/pages/Login.jsx -> POST /login (AuthController@login)

describe('E2E-01 · Inicio de sesión válido', () => {
    it('autentica al técnico sembrado, redirige a Campo y habilita la API protegida', () => {
        cy.fixture('usuarios').then(({ tecnico }) => {
            cy.intercept('POST', '/login').as('login');

            cy.visit('/login', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('riwiscan-onboarding-v1', 'done');
                },
            });
            cy.contains('h1', 'Entra a tus parcelas').should('be.visible');

            cy.get('#login-email').type(tecnico.email);
            cy.get('#login-password').type(tecnico.password, { log: false });
            cy.contains('button', 'Acceder a mis parcelas').click();

            cy.wait('@login').then(({ response }) => {
                expect(response.statusCode).to.eq(200);
                expect(response.body.success).to.eq(true);
            });

            cy.location('pathname').should('eq', '/');
            cy.contains('h1', `Hola, ${tecnico.nombre}`).should('be.visible');
            cy.get('nav[aria-label="Navegación principal"]').should('be.visible');

            // La sesión también autoriza la API REST (auth:sanctum + tenant).
            cy.apiRequest('GET', '/api/sync/status').then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.success).to.eq(true);
            });

            cy.screenshot('E2E-01-login-valido');
        });
    });
});
```

### E2E-02 · `cypress/e2e/E2E-02_login_invalido.cy.js`

```js
// E2E-02 · Inicio de sesión inválido
// Funcionalidad real: Login.jsx + lib/authAlerts.js (validación cliente) y AuthController@login (servidor)

describe('E2E-02 · Inicio de sesión inválido', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('rechaza una contraseña incorrecta con el mensaje del servidor y no crea sesión', () => {
        cy.intercept('POST', '/login').as('login');

        cy.get('#login-email').type('tecnico@gmail.com');
        cy.get('#login-password').type('ClaveIncorrecta123', { log: false });
        cy.contains('button', 'Acceder a mis parcelas').click();

        cy.wait('@login').then(({ response }) => {
            expect(response.statusCode).to.eq(422);
            expect(response.body.errors.credentials[0]).to.eq('Las credenciales no son validas.');
        });

        cy.get('[role="alert"]').should('be.visible').and('contain', 'Las credenciales no son validas.');
        cy.location('pathname').should('eq', '/login');
        // Sin sesión, la ruta protegida redirige al login.
        cy.request({ url: '/', followRedirect: false }).its('status').should('eq', 302);

        cy.screenshot('E2E-02-credenciales-invalidas');
    });

    it('bloquea en el cliente un correo que no es Gmail, sin llamar al servidor', () => {
        cy.intercept('POST', '/login', cy.spy().as('postLogin'));

        cy.get('#login-email').type('tecnico@hotmail.com');
        cy.get('#login-password').type('password', { log: false });
        cy.contains('button', 'Acceder a mis parcelas').click();

        cy.get('[role="alert"]').should('contain', 'El correo debe tener el formato usuario@gmail.com.');
        cy.get('#login-email').should('have.attr', 'aria-invalid', 'true');
        cy.get('@postLogin').should('not.have.been.called');

        cy.screenshot('E2E-02-correo-no-gmail');
    });
});
```

### E2E-03 · `cypress/e2e/E2E-03_registro_validacion.cy.js`

```js
// E2E-03 · Registro con validación
// Funcionalidad real: pages/Register.jsx + lib/authAlerts.js (cliente) y RegisterRequest (servidor)
// Ningún caso crea usuarios: todos terminan en un rechazo de validación.

const llenarFormulario = (datos) => {
    const form = {
        nombre: 'Prueba Cypress',
        email: 'prueba.cypress@gmail.com',
        celular: '987654321',
        organizacion: 'Comunidad Campesina de Aramachay',
        password: 'Password123',
        confirmacion: 'Password123',
        terminos: true,
        ...datos,
    };

    cy.get('#register-name').type(form.nombre);
    cy.get('#register-email').type(form.email);
    cy.get('#register-phone').type(form.celular);
    cy.get('#register-org').type(form.organizacion);
    cy.get('#register-role').select('agricultor');
    cy.get('#register-password').type(form.password, { log: false });
    cy.get('#register-password-confirm').type(form.confirmacion, { log: false });
    if (form.terminos) {
        cy.get('#register-terms').check();
    }
    cy.contains('button', 'Registrarme').click();
};

describe('E2E-03 · Registro con validación', () => {
    beforeEach(() => {
        cy.visit('/register');
        cy.contains('h1', 'Crear acceso de campo').should('be.visible');
    });

    it('rechaza un correo que no es Gmail antes de enviar al servidor', () => {
        cy.intercept('POST', '/register', cy.spy().as('postRegister'));

        llenarFormulario({ email: 'prueba.cypress@yahoo.com' });

        cy.get('[role="alert"]').should('contain', 'El correo debe tener el formato usuario@gmail.com.');
        cy.get('@postRegister').should('not.have.been.called');
        cy.screenshot('E2E-03-correo-invalido');
    });

    it('rechaza una contraseña débil (menos de 8 caracteres)', () => {
        cy.intercept('POST', '/register', cy.spy().as('postRegister'));

        llenarFormulario({ password: 'abc123', confirmacion: 'abc123' });

        cy.get('[role="alert"]').should('contain', 'La contraseña debe tener al menos 8 caracteres.');
        cy.get('@postRegister').should('not.have.been.called');
        cy.screenshot('E2E-03-password-debil');
    });

    it('el servidor rechaza un correo ya registrado (regla unique de RegisterRequest)', () => {
        cy.intercept('POST', '/register').as('register');

        llenarFormulario({ email: 'tecnico@gmail.com' });

        cy.wait('@register').then(({ response }) => {
            expect(response.statusCode).to.eq(422);
            expect(response.body.errors.email[0]).to.eq('Este correo ya esta registrado.');
        });
        cy.get('[role="alert"]').should('contain', 'Este correo ya esta registrado.');
        cy.location('pathname').should('eq', '/register');
        cy.screenshot('E2E-03-correo-duplicado');
    });
});
```

### E2E-04 · `cypress/e2e/E2E-04_recuperar_password.cy.js`

```js
// E2E-04 · Recuperación de contraseña
// Funcionalidad real: pages/ForgotPassword.jsx -> POST /forgot-password (AuthController@sendResetLink)
// Con MAIL_MAILER=log el correo con el enlace queda en storage/logs/laravel.log.

const MENSAJE_OK = 'Si el correo existe, te enviaremos instrucciones para restablecer la contraseña.';

describe('E2E-04 · Recuperación de contraseña', () => {
    it('desde el login solicita el enlace para un usuario existente y muestra la confirmación', () => {
        cy.intercept('POST', '/forgot-password').as('forgot');

        cy.visit('/login');
        cy.contains('a', '¿Olvidaste tu contraseña?').click();
        cy.location('pathname').should('eq', '/forgot-password');
        cy.contains('h1', 'Recuperar acceso').should('be.visible');

        cy.get('input[placeholder="usuario@gmail.com"]').type('tecnico@gmail.com');
        cy.contains('button', 'Enviar instrucciones').click();

        cy.wait('@forgot').then(({ response }) => {
            expect(response.statusCode).to.eq(200);
            expect(response.body.success).to.eq(true);
            expect(response.body.message).to.eq(MENSAJE_OK);
        });
        cy.get('[role="alert"]').should('be.visible').and('contain', MENSAJE_OK);

        cy.screenshot('E2E-04-enlace-enviado');
    });

    it('valida el formato del correo en el cliente sin llamar al servidor', () => {
        cy.intercept('POST', '/forgot-password', cy.spy().as('postForgot'));

        cy.visit('/forgot-password');
        cy.get('input[placeholder="usuario@gmail.com"]').type('tecnico@outlook.com');
        cy.contains('button', 'Enviar instrucciones').click();

        cy.get('[role="alert"]').should('contain', 'El correo debe tener el formato usuario@gmail.com.');
        cy.get('@postForgot').should('not.have.been.called');
        cy.screenshot('E2E-04-correo-invalido');
    });
});
```

### E2E-05 · `cypress/e2e/E2E-05_navegacion_modulos.cy.js`

```js
// E2E-05 · Navegación entre módulos
// Funcionalidad real: RoyaGuard.jsx (modo activo) + components/Sidebar.jsx + PageHeader.jsx

const menu = () => cy.get('nav[aria-label="Navegación principal"]');

const irA = (modulo) => {
    menu().contains('button', modulo).click();
    menu().contains('button', modulo).should('have.attr', 'aria-current', 'page');
};

describe('E2E-05 · Navegación entre módulos', () => {
    beforeEach(() => {
        cy.loginAs('tecnico');
        cy.visitApp('/');
    });

    it('recorre Campo → Historial → Alertas → Protocolo → Campo', () => {
        cy.contains('h1', 'Hola, Luis').should('be.visible');
        menu().contains('button', 'Campo').should('have.attr', 'aria-current', 'page');

        irA('Historial');
        cy.get('#historial-title').should('have.text', 'Historial');
        cy.screenshot('E2E-05-historial');

        irA('Alertas');
        cy.contains('h1', 'Alertas').should('be.visible');
        cy.screenshot('E2E-05-alertas');

        irA('Protocolo');
        cy.get('#protocolo-title').should('have.text', 'Protocolo de mitigación');
        cy.screenshot('E2E-05-protocolo');

        irA('Campo');
        cy.contains('h1', 'Hola, Luis').should('be.visible');
        cy.location('pathname').should('eq', '/');
    });
});
```

### E2E-06 · `cypress/e2e/E2E-06_escaneo_onnx.cy.js`

```js
// E2E-06 · Escaneo de hoja con inferencia ONNX local
// Funcionalidad real: components/Scanner.jsx -> lib/onnxEngine.js (ONNX Runtime Web, WASM)
//   -> lib/inference.js (softmax + umbral 75 %) -> lib/diagnosticosDb.js (IndexedDB 'roya-edge')
// Con el modelo placeholder (scripts/export_mobilenet_placeholder_onnx.py) los logits son [0,0,0]:
// confianza 33.33 % < 75 % -> clase 'no_concluyente' -> la UI pide repetir la foto.

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('E2E-06 · Escaneo de hoja con inferencia ONNX local', () => {
    beforeEach(() => {
        cy.loginAs('tecnico');
        cy.visitApp('/');
    });

    it('analiza hoja_trigo.jpg en el navegador, muestra "No concluyente" y la guarda en IndexedDB', () => {
        cy.leerDiagnosticosLocales().then((antes) => {
            // Paso 1 del asistente: lote.
            cy.contains('button', 'Seguir sin lote').click();
            // Paso 2: foto.
            cy.contains('h2', 'Toma la foto').should('be.visible');
            cy.get('input[type="file"]').selectFile('cypress/fixtures/hoja_trigo.jpg', { force: true });

            // Paso 3: resultado de la inferencia local.
            cy.get('.field-result', { timeout: 60000 })
                .should('be.visible')
                .and('contain', 'No pudimos ver bien la hoja')
                // Este texto solo aparece si ONNX Runtime falló (runtime 'placeholder-uniform').
                .and('not.contain', 'El análisis no está disponible en este equipo');
            cy.contains('Guardado en el teléfono').should('be.visible');
            cy.screenshot('E2E-06-resultado-no-concluyente');

            cy.leerDiagnosticosLocales().then((despues) => {
                expect(despues.length, 'diagnósticos en IndexedDB').to.eq(antes.length + 1);

                const previos = new Set(antes.map((row) => row.uuid_local));
                const nuevo = despues.find((row) => !previos.has(row.uuid_local));

                expect(nuevo.uuid_local).to.match(UUID_V4);
                expect(nuevo.clase).to.eq('no_concluyente');
                expect(Number(nuevo.confianza)).to.be.closeTo(33.33, 0.01);
                expect(nuevo.scores).to.have.all.keys('sana', 'roya_amarilla', 'otra_enfermedad');
                // Si ONNX Runtime no hubiera cargado el modelo, onnxEngine.js agrega '+sin-pesos'.
                expect(nuevo.modelo_version).to.eq('roya-mobilenetv3-small-v1');
                expect(nuevo.hitl_status).to.eq('pending');
                expect(nuevo.latitud).to.eq(null);
                expect(nuevo.imagen_thumb).to.match(/^data:image\//);
                // La cola (lib/syncQueue.js) puede sincronizar en segundo plano si hay conexión:
                // pending -> sending -> confirmed. 'error' indicaría un fallo de sincronización.
                expect(['pending', 'sending', 'confirmed']).to.include(nuevo.sync_status);

                cy.log(`uuid_local=${nuevo.uuid_local} sync_status=${nuevo.sync_status}`);
            });
        });
    });
});
```

### E2E-07 · `cypress/e2e/E2E-07_control_acceso_rol.cy.js`

```js
// E2E-07 · Control de acceso por rol (HITL solo para técnico/administrador)
// Funcionalidad real: Sidebar.jsx (staff), routes/api.php -> PATCH /api/diagnosticos/{uuid}
//   con middleware role:tecnico,administrador (app/Http/Middleware/EnsureRole.php)

const menu = () => cy.get('nav[aria-label="Navegación principal"]');
const UUID_CUALQUIERA = '00000000-0000-4000-8000-000000000000';

describe('E2E-07 · Control de acceso por rol', () => {
    it('el agricultor no ve "Revisión técnica" y la API le responde 403', () => {
        cy.loginAs('agricultor');
        cy.visitApp('/');

        cy.contains('h1', 'Hola, Maria').should('be.visible');
        menu().contains('button', 'Protocolo').should('be.visible');
        menu().should('not.contain', 'Revisión técnica');

        // El middleware de rol se evalúa antes de buscar el diagnóstico.
        cy.apiRequest('PATCH', `/api/diagnosticos/${UUID_CUALQUIERA}`, { hitl_status: 'validated' }).then((res) => {
            expect(res.status).to.eq(403);
            expect(res.body.message).to.eq('No tienes permiso para esta accion.');
        });

        cy.screenshot('E2E-07-agricultor-sin-hitl');
    });

    it('el técnico sí ve "Revisión técnica" y el middleware de rol lo deja pasar', () => {
        cy.loginAs('tecnico');
        cy.visitApp('/');

        menu().contains('button', 'Revisión técnica').should('be.visible').click();
        menu().contains('button', 'Revisión técnica').should('have.attr', 'aria-current', 'page');

        // Pasa EnsureRole (no 403) y llega al controlador: el uuid no existe, por eso 404.
        cy.apiRequest('PATCH', `/api/diagnosticos/${UUID_CUALQUIERA}`, { hitl_status: 'validated' }).then((res) => {
            expect(res.status).to.eq(404);
        });

        cy.screenshot('E2E-07-tecnico-con-hitl');
    });
});
```

## 5.4 Ejecución y resultados

### Procedimiento de ejecución

```powershell
# 0. (Una sola vez) Cuentas de prueba del seeder: tenant 'el-roble', contraseña 'password'
php artisan db:seed

# 1. Compilar el frontend. Las pruebas se ejecutan sobre el build de producción (ver DEF-01).
npm run build
#    Si "npm run dev" está abierto, detenerlo con Ctrl+C: Vite elimina public/hot al cerrarse.

# 2. Servidor (MySQL de XAMPP encendido)
php artisan serve --port=8090

# 3. En otra terminal: ejecutar la suite completa en modo headless
npm run test:e2e
#    Alternativas: npm run test:e2e:open (modo interactivo) | npx cypress run --browser chrome

# 4. Abrir el reporte HTML
Start-Process .\cypress\reports\index.html
```

### Historial de ejecuciones

Las tres ejecuciones son del 09/11/2026, con Cypress 16.2.1 y Electron 146 *headless*.

| Ejecución | Entorno | Casos | Aprobados | Fallidos | Causa de los fallos | Acción |
|---|---|---|---|---|---|---|
| 1 | `npm run dev` (Vite en :5173) | 12 | 11 | 1 (E2E-06) | **Defecto real DEF-01**: ONNX Runtime no encontró su WASM y la app pasó a su modo de respaldo. | Diagnóstico de la causa raíz; pruebas sobre el build de producción. |
| 2 | `npm run build` | 12 | 10 | 2 | E2E-06: la aserción no consideraba el estado real `confirmed` de la cola (error del diseño de la prueba). E2E-07: la captura `fullPage` superó 30 s. | Se corrigió la aserción según `syncQueue.js` y se configuraron capturas `viewport`. |
| **3 (final)** | `npm run build` | **12** | **12** | **0** | — | — |

### Resumen final

| Indicador | Valor |
|---|---|
| Escenarios (archivos `.cy.js`) | 7 |
| Casos de prueba ejecutados (`it`) | 12 |
| Aprobados | 12 |
| Fallidos | 0 |
| % de aprobación | **100 %** (ejecución final); 91,7 % en la ejecución 1, antes de aislar DEF-01 |
| Duración total | 37 s |
| Evidencias | 14 capturas PNG, 7 videos MP4, reporte HTML (`cypress/reports/index.html`) |
| Defectos encontrados | 2 en el producto (DEF-01 y DEF-02) y 3 observaciones de entorno |
| Regresión | PHPUnit 63/63 (237 aserciones) y Vitest 106/106 siguen en verde después de integrar Cypress |

### Defectos y observaciones encontrados

| ID | Severidad | Descripción | Evidencia | Recomendación |
|---|---|---|---|---|
| **DEF-01** | Alta | En modo desarrollo (`npm run dev`), `onnxEngine.js` define `wasmPaths = '/onnx/'` como ruta relativa. Como el módulo lo sirve Vite (`[::1]:5173`), ONNX Runtime pide `http://[::1]:5173/onnx/ort-wasm-simd-threaded.mjs`, que no existe (`Failed to fetch dynamically imported module`). **El escáner nunca ejecuta la CNN** y guarda un resultado uniforme. | Captura de la ejecución 1; en MariaDB, los diagnósticos `id 4` (06/11) e `id 5` tienen `modelo_version = roya-mobilenetv3-small-v1+sin-pesos`, mientras que los `id 6` y `7` (build) no. **Corregido** (sección 6.4.2): `wasmPaths` usa una URL absoluta al origen de la página. E2E-06 aprobado en modo `npm run dev`. |
| **DEF-02** | Media | `isModelMissing()` trata cualquier error que contenga "failed to fetch" o "not found" como "falta el modelo", así que un error de carga del runtime queda oculto y se presenta como un resultado válido "no concluyente". | Mismo caso que DEF-01: la app no registró ningún error en consola. **Corregido** (sección 6.4.2): los errores de carga del runtime se propagan y el escáner muestra un error en lugar de un resultado falso. |
| OBS-01 | Entorno | Si la variable `ELECTRON_RUN_AS_NODE=1` está activa (la definen los procesos lanzados por extensiones de VS Code), Cypress falla con `bad option: --smoke-test`. | Salida de `npx cypress verify`. | Ejecutar `Remove-Item Env:ELECTRON_RUN_AS_NODE` antes de `npm run test:e2e`, o usar una terminal normal. |
| OBS-02 | Diseño | `throttle:login` permite 5 `POST /login` por minuto por IP. | `AppServiceProvider.php` | La suite usa `cy.session` (4 inicios de sesión por ejecución). Esperar 60 s entre ejecuciones seguidas. |
| OBS-03 | Herramienta | Cypress 16 marca Electron como navegador obsoleto. | Aviso en la salida de `cypress run`. | Para la evidencia final, ejecutar `npx cypress run --browser chrome`. |

### Interpretación

La suite cubre los flujos críticos del sistema: acceso, registro, recuperación de contraseña, navegación, el **flujo Edge de diagnóstico** (inferencia local ONNX → umbral de confianza → persistencia offline → sincronización) y la **seguridad por rol** del módulo HITL. Las pruebas verifican tanto la interfaz como el contrato con el backend (códigos HTTP y mensajes exactos de los *Form Requests*), la API protegida por Sanctum y los datos persistidos en IndexedDB y MariaDB.

El hallazgo más relevante es **DEF-01**. Una prueba que solo verificara la interfaz habría dado el escaneo por bueno, porque la pantalla muestra un resultado y "Guardado en el teléfono". La aserción sobre la ausencia del mensaje de respaldo y sobre `modelo_version` reveló que, en modo desarrollo, la red neuronal no se ejecutaba. Para el problema de la roya amarilla esto es crítico: un diagnóstico que parece válido sin haber pasado por el modelo es justo el tipo de falso negativo silencioso que el sistema debe evitar.

## 5.5 Evidencias

| N.º | Evidencia | Ubicación / cómo obtenerla |
|---|---|---|
| C1 | Instalación y verificación de Cypress | Captura de `npx cypress verify` y `npx cypress --version` |
| C2 | Configuración | Captura de `cypress.config.js` y de los scripts de `package.json` |
| C3 | Estructura de la suite | Explorador de VS Code con `cypress/` desplegado |
| C4 | Ejecución final en consola | Captura de la tabla "Run Finished" con "All specs passed! 12/12" |
| C5 | Reporte HTML | `cypress/reports/index.html` (gráfico de resultados y detalle por caso) |
| C6 | Capturas automáticas por escenario | `cypress/screenshots/<spec>/E2E-0X-*.png` (14 imágenes 1280x720) |
| C7 | Videos de ejecución | `cypress/videos/E2E-0X_*.cy.js.mp4` (7 videos) |
| C8 | DEF-01: captura del fallo en la ejecución 1 | Captura del caso E2E-06 fallido con el mensaje "El análisis no está disponible en este equipo" |
| C9 | DEF-01: evidencia en la BD | phpMyAdmin → `diagnosticos` con la columna `modelo_version` (`+sin-pesos` frente a la versión normal) |
| C10 | E2E-06: sincronización real | phpMyAdmin → `diagnosticos` con el registro nuevo (`tecnico@gmail.com`, `sync_status = confirmed`) |
| C11 | E2E-04: correo de recuperación | `storage/logs/laravel.log` con el enlace `/reset-password/{token}` |
| C12 | No regresión | Capturas de `php artisan test` (63 aprobados) y `npm run test:js` (106 aprobados) |
