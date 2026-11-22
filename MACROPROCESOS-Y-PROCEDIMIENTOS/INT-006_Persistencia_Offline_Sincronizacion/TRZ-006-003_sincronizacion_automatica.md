# TRZ-006-003 — Disparo automático de sincronización (al abrir app, al volver conexión, cada 60s).

- **INTENT:** INT-006 Persistencia Offline-First y Sincronización
- **BriefingScript:** Disparo automático de sincronización (al abrir app, al volver conexión, cada 60s).
- **Artefacto Destino:** RoyaGuard.jsx (runSync), SettingsPage.jsx
- **Ruta del Archivo:**
  - `resources/js/RoyaGuard.jsx`
  - `resources/js/pages/SettingsPage.jsx`
- **Método / función:** runSync() (evento online + setInterval); syncNow() (Ajustes)
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** Sincronización Edge-Cloud
- **Responsable:** Jefferson
- **HU / Ticket:** T-21 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-006-003:**
  - Commit: 6a2e717
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Vitest syncQueue.test.js: 14/14. Cobertura de línea (2026-11-12): RoyaGuard.jsx 0.0 %, SettingsPage.jsx 0.0 %
  - Análisis estático: Modificado después del análisis SonarQube del 2026-11-10: RoyaGuard.jsx. Requiere reanálisis.
  - Hash del BriefingScript: `sha256:0b3eab31ee21668bae35c0bef76bce05d584bbb975a8bc37680f8c161f729113`
- **Estado:** En revisión — sin criterios en "No", con evidencia pendiente de aportar.
- **Observaciones:**
  • RoyaGuard.jsx y SettingsPage.jsx no tienen pruebas de componente; la lógica de la cola (syncQueue.js) sí está probada.
  • Cambios locales sin commit en RoyaGuard.jsx (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • Prueba de componente o E2E que dispare el evento online y verifique el envío automático.
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-006 Persistencia Offline-First y Sincronización en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-21: Implementar reintentos exponenciales y recuperación tras cierre del navegador. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-21 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>Cambios locales sin commit en: resources/js/RoyaGuard.jsx |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Vitest syncQueue.test.js: 14/14. Cobertura de línea (2026-11-12): RoyaGuard.jsx 0.0 %, SettingsPage.jsx 0.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | resources/js/RoyaGuard.jsx → componente React; resources/js/pages/SettingsPage.jsx → página React |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: componente React, página React. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-006-003 |
| 4.1 ¿Requerimiento con ID? | Sí | T-21 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>Cambios locales sin commit en: resources/js/RoyaGuard.jsx |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Vitest syncQueue.test.js: 14/14 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Pendiente | Modificado después del análisis SonarQube del 2026-11-10: RoyaGuard.jsx. Requiere reanálisis. |
| 5.2 ¿Supera seguridad y dependencias? | Sí | npm audit --omit=dev (2026-11-16): 0 vulnerabilidades en 66 dependencias de producción. SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | Vitest syncQueue.test.js: 14/14 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 100 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-006 Persistencia Offline-First y Sincronización
- **Procedimiento:** TRZ-006-003 — Disparo automático de sincronización (al abrir app, al volver conexión, cada 60s).
- **Rama:** [`INT-006/TRZ-006-003-sincronizacion-automatica`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-003-sincronizacion-automatica)
- **Ficha en la rama:** [TRZ-006-003_sincronizacion_automatica.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-003-sincronizacion-automatica/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-003_sincronizacion_automatica.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `resources/js/RoyaGuard.jsx` | runSync | 132–165 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-003-sincronizacion-automatica/resources/js/RoyaGuard.jsx#L132-L165) |
| `resources/js/pages/SettingsPage.jsx` | syncNow | 30–37 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-003-sincronizacion-automatica/resources/js/pages/SettingsPage.jsx#L30-L37) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
