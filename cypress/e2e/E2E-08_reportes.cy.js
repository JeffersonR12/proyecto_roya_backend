// E2E-08 · Módulo de reportes (Actividad 5)
// Funcionalidad real: /reports -> pages/ReportsPage.jsx -> GET /api/reports/summary y /export
//   (Api\ReportController + App\Services\ReporteService sobre la tabla diagnosticos).
// Requiere: php artisan db:seed (cuentas) y php artisan db:seed --class=DiagnosticoDemoSeeder (40 demo).

const menu = () => cy.get('nav[aria-label="Navegación principal"]');

describe('E2E-08 · Módulo de reportes', () => {
    beforeEach(() => {
        cy.loginAs('tecnico');
    });

    it('muestra los indicadores que calcula la API y grafica los datos de demostración', () => {
        cy.intercept('GET', '/api/reports/summary*').as('summary');
        cy.visitApp('/reports');

        cy.get('#reportes-title').should('have.text', 'Reportes');
        menu().contains('button', 'Reportes').should('have.attr', 'aria-current', 'page');

        // Por defecto solo datos de campo.
        cy.wait('@summary').then(({ request, response }) => {
            expect(request.url).to.include('origen=campo');
            expect(response.statusCode).to.eq(200);
        });

        cy.get('#reporte-origen').select('demo');
        cy.wait('@summary').then(({ request, response }) => {
            expect(request.url).to.include('origen=demo');
            const { indicadores, serie_mensual: serie } = response.body.data;

            expect(indicadores.total_diagnosticos).to.eq(40);
            expect(Object.values(indicadores.por_clase).reduce((a, b) => a + b, 0)).to.eq(40);
            expect(indicadores.porcentaje_roya).to.be.within(0, 100);
            expect(serie).to.have.length.of.at.least(6);

            // Las tarjetas muestran exactamente lo que calculó el backend.
            cy.contains('Diagnósticos registrados').parent().should('contain', '40');
            cy.contains('Incidencia de Roya Amarilla').parent().should('contain', String(indicadores.porcentaje_roya));
            cy.contains('Confianza promedio del modelo').parent().should('contain', String(indicadores.confianza_promedio));
        });

        cy.contains('Incluye datos sintéticos de demostración').should('be.visible');
        cy.get('.recharts-bar-rectangle').should('have.length', 4);
        cy.get('.recharts-line-curve').should('have.length', 2);
        cy.screenshot('E2E-08-reportes-demo');
        cy.get('#grafico-clases').scrollIntoView({ offset: { top: -24, left: 0 } });
        cy.screenshot('E2E-08-graficos');
    });

    it('valida el rango de fechas y exporta el CSV filtrado', () => {
        cy.visitApp('/reports');

        cy.get('#reporte-desde').type('2026-11-10');
        cy.get('#reporte-hasta').type('2026-11-01');
        cy.get('[role="alert"]').should('contain', 'La fecha final no puede ser anterior a la inicial.');
        cy.get('#reporte-hasta').should('have.attr', 'aria-invalid', 'true');
        cy.screenshot('E2E-08-rango-invalido');

        cy.apiRequest('GET', '/api/reports/export?origen=demo').then((res) => {
            expect(res.status).to.eq(200);
            expect(res.headers['content-type']).to.include('text/csv');
            const lineas = res.body.trim().split('\n');
            expect(lineas[0]).to.include('uuid_local;fecha_captura;clase;confianza');
            expect(lineas).to.have.length(41); // cabecera + 40 diagnósticos demo
        });
    });
});
