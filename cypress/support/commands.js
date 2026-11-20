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
