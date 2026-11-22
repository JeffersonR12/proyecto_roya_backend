# TRZ-009-003 — Alertas en cliente: roya por lote, revisiones HITL pendientes y envíos fallidos.

- **INTENT:** INT-009 Alertas Tempranas y Monitoreo
- **BriefingScript:** Alertas en cliente: roya por lote, revisiones HITL pendientes y envíos fallidos.
- **Artefacto Destino:** alertas.js (buildAlertas)
- **Ruta del Archivo:**
  - `resources/js/lib/alertas.js`
  - `resources/js/RoyaGuard.jsx`
- **Método / función:** buildAlertas(), contarAlertas(), tiempoRelativo()
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** Alertas y Monitoreo
- **Responsable:** Annelise
- **HU / Ticket:** T-26 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-009-003:**
  - Commit: 6a2e717, 06fc39b
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Vitest alertas.test.js: 13/13; Cypress E2E-05: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): alertas.js 100.0 %, RoyaGuard.jsx 0.0 %
  - Análisis estático: Modificado después del análisis SonarQube del 2026-11-10: RoyaGuard.jsx. Requiere reanálisis.
  - Hash del BriefingScript: `sha256:6a08fb97a131e583ceca8eca1f8119e3cb7b006d3842f929cd1879c367c41ba0`
- **Estado:** En revisión — sin criterios en "No", con evidencia pendiente de aportar.
- **Observaciones:**
  • Responsable asignado por dominio (Annelise); autoría en Git: JeffersonR12, Jhoan Sosa.
  • Cambios locales sin commit en RoyaGuard.jsx (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-009 Alertas Tempranas y Monitoreo en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-26: Construir dashboard por rol con historial y filtros. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-26 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/03_Diccionario_de_Datos.md, Docs/09_Iteracion_05_Backend_API_REST.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>Cambios locales sin commit en: resources/js/RoyaGuard.jsx |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Vitest alertas.test.js: 13/13; Cypress E2E-05: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): alertas.js 100.0 %, RoyaGuard.jsx 0.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | resources/js/lib/alertas.js → lógica pura del cliente (lib/); resources/js/RoyaGuard.jsx → componente React |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: lógica pura del cliente (lib/), componente React. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-009-003 |
| 4.1 ¿Requerimiento con ID? | Sí | T-26 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>Cambios locales sin commit en: resources/js/RoyaGuard.jsx |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Vitest alertas.test.js: 13/13; Cypress E2E-05: 1/1 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Pendiente | Modificado después del análisis SonarQube del 2026-11-10: RoyaGuard.jsx. Requiere reanálisis. |
| 5.2 ¿Supera seguridad y dependencias? | Sí | npm audit --omit=dev (2026-11-16): 0 vulnerabilidades en 66 dependencias de producción. SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | Vitest alertas.test.js: 13/13; Cypress E2E-05: 1/1 (2026-11-12) |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 100 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-009 Alertas Tempranas y Monitoreo
- **Procedimiento:** TRZ-009-003 — Alertas en cliente: roya por lote, revisiones HITL pendientes y envíos fallidos.
- **Rama:** [`INT-009/TRZ-009-003-avisos-en-app`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-009/TRZ-009-003-avisos-en-app)
- **Ficha en la rama:** [TRZ-009-003_avisos_en_app.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-009_Alertas_Tempranas/TRZ-009-003_avisos_en_app.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `resources/js/lib/alertas.js` | tiempoRelativo | 19–41 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/lib/alertas.js#L19-L41) |
| `resources/js/lib/alertas.js` | buildAlertas | 47–138 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/lib/alertas.js#L47-L138) |
| `resources/js/lib/alertas.js` | contarAlertas | 141–143 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/lib/alertas.js#L141-L143) |
| `resources/js/RoyaGuard.jsx` | contarAlertas | 100 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/RoyaGuard.jsx#L100) |
| `resources/js/RoyaGuard.jsx` | contarAlertas | 101 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-009/TRZ-009-003-avisos-en-app/resources/js/RoyaGuard.jsx#L101) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
