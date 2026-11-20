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
