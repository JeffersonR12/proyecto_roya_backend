# TRZ-012-005 — Prueba de humo E2E en servidor real y análisis estático con SonarQube.

- **INTENT:** INT-012 Aseguramiento de la Calidad
- **BriefingScript:** Prueba de humo E2E en servidor real y análisis estático con SonarQube.
- **Artefacto Destino:** Prueba de humo E2E, sonar-project.properties
- **Ruta del Archivo:**
  - `cypress.config.js`
  - `cypress/e2e`
  - `cypress/support`
  - `sonar-project.properties`
- **Método / función:** npx cypress run (8 specs, 14 casos); npx @sonar/scan (sonar-project.properties)
- **Modelo IA Usado:** Claude Opus 5.5 (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** QA / Testing
- **Responsable:** Jhoan
- **HU / Ticket:** T-32 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-012-005:**
  - Commit: 06fc39b
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Cypress E2E-01: 1/1 (2026-11-12); Cypress E2E-02: 2/2 (2026-11-12); Cypress E2E-03: 3/3 (2026-11-12); Cypress E2E-04: 1/2 (2026-11-12); 2/2 aprobados en re-ejecución aislada del 2026-11-16; Cypress E2E-05: 1/1 (2026-11-12); Cypress E2E-06: 1/1 (2026-11-12); Cypress E2E-07: 2/2 (2026-11-12); Cypress E2E-08: 2/2 (2026-11-12)
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:818987b1fb3eee538c18f72cddddf3cd4109a45d63f2dbdc1e4c73d99da3d8f6`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • DISCREPANCIA 3: la matriz original cita una "Prueba de humo E2E"; hoy la cubren 8 escenarios Cypress (14 casos) y el análisis SonarQube.
  • El reporte HTML cypress/reports/index.html del 2026-11-12 se perdió el 2026-11-16 al re-ejecutar E2E-04 (el plugin limpia la carpeta). Sus resultados se conservan en evidencias/cypress-resultados_2026-11-12.json; los videos se restauraron desde la Papelera.
  • Responsable asignado por dominio (Jhoan); autoría en Git: JeffersonR12.
  • Cambios locales sin commit en sonar-project.properties (por decisión del equipo no se suben a Git en esta entrega).
  • Archivos sin seguimiento en Git: cypress.config.js, cypress/e2e, cypress/support.
- **Puntos de mejora:**
  • Regenerar el reporte HTML con npm run test:e2e y confirmar cypress/ en Git.
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-012 Aseguramiento de la Calidad en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-32: Ejecutar prueba integral de recuperación: sin red → diagnóstico → reconexión → sincronización. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-32 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | No | Sin commit: cypress.config.js, cypress/e2e, cypress/support<br>06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Cypress E2E-01: 1/1 (2026-11-12); Cypress E2E-02: 2/2 (2026-11-12); Cypress E2E-03: 3/3 (2026-11-12); Cypress E2E-04: 1/2 (2026-11-12); 2/2 aprobados en re-ejecución aislada del 2026-11-16; Cypress E2E-05: 1/1 (2026-11-12); Cypress E2E-06: 1/1 (2026-11-12); Cypress E2E-07: 2/2 (2026-11-12); Cypress E2E-08: 2/2 (2026-11-12) |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | cypress.config.js → suite o configuración de calidad; cypress/e2e → suite o configuración de calidad; cypress/support → suite o configuración de calidad; sonar-project.properties → suite o configuración de calidad |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: suite o configuración de calidad. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Responsabilidad única del archivo (script o suite independiente). |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-012-005 |
| 4.1 ¿Requerimiento con ID? | Sí | T-32 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | Sin commit: cypress.config.js, cypress/e2e, cypress/support<br>06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Cypress E2E-01: 1/1 (2026-11-12); Cypress E2E-02: 2/2 (2026-11-12); Cypress E2E-03: 3/3 (2026-11-12); Cypress E2E-04: 1/2 (2026-11-12); 2/2 aprobados en re-ejecución aislada del 2026-11-16; Cypress E2E-05: 1/1 (2026-11-12); Cypress E2E-06: 1/1 (2026-11-12); Cypress E2E-07: 2/2 (2026-11-12); Cypress E2E-08: 2/2 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No aplica | Código de pruebas: no se despliega ni expone dependencias de producción. |
| 5.2 ¿Supera pruebas? | Sí | Cypress E2E-01: 1/1 (2026-11-12); Cypress E2E-02: 2/2 (2026-11-12); Cypress E2E-03: 3/3 (2026-11-12); Cypress E2E-04: 1/2 (2026-11-12); 2/2 aprobados en re-ejecución aislada del 2026-11-16; Cypress E2E-05: 1/1 (2026-11-12); Cypress E2E-06: 1/1 (2026-11-12); Cypress E2E-07: 2/2 (2026-11-12); Cypress E2E-08: 2/2 (2026-11-12) |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 83.34 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 100 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*
