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
