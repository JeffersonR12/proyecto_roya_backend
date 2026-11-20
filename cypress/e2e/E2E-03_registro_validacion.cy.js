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
