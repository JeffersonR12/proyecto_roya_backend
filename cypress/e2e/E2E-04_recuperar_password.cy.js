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
