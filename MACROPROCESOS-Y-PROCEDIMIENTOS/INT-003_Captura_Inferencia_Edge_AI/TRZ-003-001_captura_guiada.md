# TRZ-003-001 — Captura de hoja con cámara/archivo, con guía visual de luz y distancia.

- **INTENT:** INT-003 Captura e Inferencia IA en el Borde (Edge AI)
- **BriefingScript:** Captura de hoja con cámara/archivo, con guía visual de luz y distancia.
- **Artefacto Destino:** Scanner.jsx, CaptureGuide.jsx
- **Ruta del Archivo:**
  - `resources/js/components/Scanner.jsx`
  - `resources/js/components/CaptureGuide.jsx`
  - `resources/js/lib/fieldFlow.js`
- **Método / función:** Componente Scanner; CaptureGuide / TipIcon; fieldFlow.stepFor(), TIP_IDS
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** Edge AI / Frontend
- **Responsable:** Jefferson
- **HU / Ticket:** T-14 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-003-001:**
  - Commit: 06fc39b
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Vitest fieldFlow.test.js: 17/17; Cypress E2E-06: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): Scanner.jsx 0.0 %, CaptureGuide.jsx 0.0 %, fieldFlow.js 97.9 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:45185d81c132f9cc5ce4c6bf596cfc9838f2f397610d0e3bb8a626c042dcdefa`
- **Estado:** En revisión — sin criterios en "No", con evidencia pendiente de aportar.
- **Observaciones:**
  • Scanner.jsx no tiene pruebas unitarias de componente; se valida con Cypress E2E-06. En la fase 1 de SonarQube se corrigió el code smell javascript:S9379 (autoFocus).
  • Cambios locales sin commit en Scanner.jsx (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • Pruebas de componente con React Testing Library para Scanner.jsx (cobertura de código nuevo exigida por la Quality Gate).
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-003 Captura e Inferencia IA en el Borde (Edge AI) en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-14: Implementar captura/carga de imágenes en PWA. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-14 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>Cambios locales sin commit en: resources/js/components/Scanner.jsx |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Vitest fieldFlow.test.js: 17/17; Cypress E2E-06: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): Scanner.jsx 0.0 %, CaptureGuide.jsx 0.0 %, fieldFlow.js 97.9 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | resources/js/components/Scanner.jsx → componente React; resources/js/components/CaptureGuide.jsx → componente React; resources/js/lib/fieldFlow.js → lógica pura del cliente (lib/) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: componente React, lógica pura del cliente (lib/). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-003-001 |
| 4.1 ¿Requerimiento con ID? | Sí | T-14 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>Cambios locales sin commit en: resources/js/components/Scanner.jsx |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Vitest fieldFlow.test.js: 17/17; Cypress E2E-06: 1/1 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | Sí | npm audit --omit=dev (2026-11-16): 0 vulnerabilidades en 66 dependencias de producción. SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | Vitest fieldFlow.test.js: 17/17; Cypress E2E-06: 1/1 (2026-11-12) |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 100 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-003 Captura e Inferencia IA en el Borde (Edge AI)
- **Procedimiento:** TRZ-003-001 — Captura de hoja con cámara/archivo, con guía visual de luz y distancia.
- **Rama:** [`INT-003/TRZ-003-001-captura-guiada`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-001-captura-guiada)
- **Ficha en la rama:** [TRZ-003-001_captura_guiada.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-003_Captura_Inferencia_Edge_AI/TRZ-003-001_captura_guiada.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `resources/js/components/Scanner.jsx` | Scanner | 88–526 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/resources/js/components/Scanner.jsx#L88-L526) |
| `resources/js/components/CaptureGuide.jsx` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/resources/js/components/CaptureGuide.jsx) |
| `resources/js/lib/fieldFlow.js` | TIP_IDS | 214 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/resources/js/lib/fieldFlow.js#L214) |
| `resources/js/lib/fieldFlow.js` | stepFor | 218–226 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/resources/js/lib/fieldFlow.js#L218-L226) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
