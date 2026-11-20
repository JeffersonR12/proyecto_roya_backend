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
