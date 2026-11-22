# TRZ-006-004 — Tolerancia a fallos en sincronización (reintentos con espera creciente, aviso de sesión).

- **INTENT:** INT-006 Persistencia Offline-First y Sincronización
- **BriefingScript:** Tolerancia a fallos en sincronización (reintentos con espera creciente, aviso de sesión).
- **Artefacto Destino:** syncQueue.js (backoff, recuperación de envíos)
- **Ruta del Archivo:**
  - `resources/js/lib/syncQueue.js`
- **Método / función:** nextRetryDelay() (backoff 5 s → 15 min), isDue(), requeuePatch(), STALE_SENDING_MS
- **Modelo IA Usado:** Claude Opus 5.5 (commits)
- **Dominio Funcional:** Sincronización Edge-Cloud
- **Responsable:** Jefferson
- **HU / Ticket:** T-21 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-006-004:**
  - Commit: 6a2e717
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Vitest syncQueue.test.js: 14/14. Cobertura de línea (2026-11-12): syncQueue.js 92.5 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:23fbc95d08e29d27a3eb94bef60520b3bc60a52e23689dff10409ece69fdc74e`
- **Estado:** En revisión — sin criterios en "No", con evidencia pendiente de aportar.
- **Observaciones:**
  • Responsable asignado por dominio (Jefferson); autoría en Git: Jhoan Sosa.
- **Puntos de mejora:**
  • Abrir PR con revisión de código y desplegar en un entorno con HTTPS para cerrar 2.3 y 4.1.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-006 Persistencia Offline-First y Sincronización en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-21: Implementar reintentos exponenciales y recuperación tras cierre del navegador. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-21 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Vitest syncQueue.test.js: 14/14. Cobertura de línea (2026-11-12): syncQueue.js 92.5 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | resources/js/lib/syncQueue.js → lógica pura del cliente (lib/) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: lógica pura del cliente (lib/). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-006-004 |
| 4.1 ¿Requerimiento con ID? | Sí | T-21 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Vitest syncQueue.test.js: 14/14 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
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
- **Procedimiento:** TRZ-006-004 — Tolerancia a fallos en sincronización (reintentos con espera creciente, aviso de sesión).
- **Rama:** [`INT-006/TRZ-006-004-recuperacion-fallos-red`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-006/TRZ-006-004-recuperacion-fallos-red)
- **Ficha en la rama:** [TRZ-006-004_recuperacion_fallos_red.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-006_Persistencia_Offline_Sincronizacion/TRZ-006-004_recuperacion_fallos_red.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `resources/js/lib/syncQueue.js` | STALE_SENDING_MS | 8 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/resources/js/lib/syncQueue.js#L8) |
| `resources/js/lib/syncQueue.js` | nextRetryDelay | 13–17 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/resources/js/lib/syncQueue.js#L13-L17) |
| `resources/js/lib/syncQueue.js` | isDue | 20–45 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/resources/js/lib/syncQueue.js#L20-L45) |
| `resources/js/lib/syncQueue.js` | requeuePatch | 125–134 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-006/TRZ-006-004-recuperacion-fallos-red/resources/js/lib/syncQueue.js#L125-L134) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
