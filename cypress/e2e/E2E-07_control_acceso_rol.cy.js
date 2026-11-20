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
