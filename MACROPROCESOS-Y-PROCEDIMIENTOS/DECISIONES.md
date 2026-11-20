# DECISIONES — Matriz de trazabilidad SASE de RiwiScan (v2.0)

Fecha: 2026-11-16 · Rama analizada: `feature/jhoan-backend-roya` (HEAD `ea49e5c`).

Este documento justifica cada criterio usado para completar la matriz. La regla general fue **no inventar evidencia**. Cada "Sí" cita un archivo, un commit o un resultado verificable. Donde falta evidencia se usó "Pendiente", y donde la verificación dio resultado negativo se usó "No".

## 1. Fuentes

| Fuente | Uso |
|---|---|
| `Docs/Macroprocesos y Procedimientos – RiwiScan.docx` | Texto del BriefingScript de cada TRZ (columna C) y base de su SHA-256 |
| `Docs/Matriz_Trazabilidad_RiwiScan.xlsx` (original, **no se modificó**) | Lista de los 62 TRZ, INTENT y "Artefacto Destino" original |
| `Downloads/Matriz de registro_ProyectoRoya.xlsx` | Estructura de referencia: 78 columnas, encabezados, celdas combinadas y fórmulas |
| Código del repositorio | Rutas, métodos y hallazgos (sección 13 del prompt de contexto) |
| `git log --all` | Commits, autores, fechas y trailers `Co-Authored-By` (modelo IA) |
| `php artisan test`, `npm run test:js` (2026-11-16) | Resultados de pruebas por suite |
| Cypress (2026-11-12 y re-ejecución de E2E-04 el 2026-11-16) | Resultados E2E por spec |
| `coverage/sonar-*-fase2.json` (2026-11-10) | Issues, métricas y Quality Gate de SonarQube |
| `coverage/clover.xml`, `coverage/js/lcov.info` (2026-11-12) | Cobertura de línea por archivo |
| `composer audit`, `npm audit --omit=dev` (2026-11-16) | Seguridad de dependencias |
| `Docs/02_Backlog_Tecnico.md` | Columna HU/Ticket (T-01 a T-32) |

## 2. Asignación de dominio funcional y responsable

Se aplicó la regla del prompt, por INTENT:

| INTENT | Dominio funcional | Responsable |
|---|---|---|
| INT-001 | Seguridad / Accesos | Jhoan |
| INT-002 | Multi-Tenant / RBAC | Jhoan |
| INT-003 | Edge AI / Frontend | Jefferson |
| INT-004 | Dominio Fitosanitario / Backend | Annelise |
| INT-005 | Dominio Fitosanitario / Backend | Annelise |
| INT-006 | Sincronización Edge-Cloud | Jefferson |
| INT-007 | API / Backend | Jhoan |
| INT-008 | Gestión Agrícola | Annelise |
| INT-009 | Alertas y Monitoreo | Annelise |
| INT-010 | IA Asistida / HITL | Annelise |
| INT-011 | Pipeline ML | Jefferson |
| INT-012 | QA / Testing | Jhoan |

- **Ningún TRZ quedó ambiguo**: todos se asignaron por su INTENT, sin excepciones.
- El nombre se escribió **"Jefferson"**, como en el usuario de Git (`JeffersonR12`) y en la autoría del prompt. El prompt usaba "Jeferson".
- **Responsable ≠ autor en Git.** En 29 de los 62 TRZ, el autor de los commits es otro integrante. La responsabilidad es por dominio, no por autoría. Esa diferencia se dejó registrada en "Observaciones" para cada caso.

## 3. Criterios aplicados por columna

| Criterio | Regla |
|---|---|
| D · Modelo IA usado | Trailers `Co-Authored-By` de los commits que tocan los archivos: "Claude Opus 5.5" o "Cursor (modelo no especificado)". Si hay cambios locales sin commit, se agrega "Claude Opus 5.5 (cambios locales sin commit)", porque se hicieron en esta sesión |
| E · Fecha | Fecha del commit más reciente que toca los archivos del TRZ |
| G / K · HU y requerimiento | Tarea equivalente del backlog `Docs/02` (T-xx). INT-010 no tiene tarea de HITL ni de agente en el backlog; se cita el documento de macroprocesos |
| P · Diseño documentado | Búsqueda del nombre del artefacto, primero en `Docs/01–11` (diseño) y, si no aparece, en `Docs/12–14`. TRZ-007-004 y TRZ-012-001 se verificaron a mano (`Docs/09`, `rules.md §6`, `Docs/13`) |
| R · Commit | **Sí**: todos los archivos están confirmados y sin cambios. **Pendiente**: hay cambios locales sin commit. **No**: hay archivos sin seguimiento en Git |
| T / BQ · Pruebas | Suites asociadas, con su resultado del 2026-11-16, más la cobertura de línea del 2026-11-12 |
| W / AZ · Despliegue | **Pendiente** en las 62 filas: no hay despliegue en producción, solo el entorno local (Docs/11 §4.3) |
| AE · Redundancia | **No** en TRZ-002-002 (doble fuente de rol) y TRZ-009-005 (`Dashboard.jsx` heredado) |
| AX · Validación recuperable | **No** en INT-011, porque `metrics.json` y el ONNX entrenado no están versionados |
| BJ · Integración sin corrección | **No** en TRZ-003-003 (DEF-01, DEF-02) y TRZ-006-006 (S9383, DEF-03) |
| BM · Análisis estático | SonarQube fase 2. **Pendiente** si el archivo se modificó después del 2026-11-10. **No** en TRZ-011-002 (S2245 abierto) |
| BO · Seguridad y dependencias | Artefactos PHP: **No**, por los 12 avisos de `composer audit`. Artefactos JS: **Sí**, `npm audit` sin vulnerabilidades. Artefactos Python: **Pendiente**, sin auditar. Suites de prueba: **No aplica** |
| BS · Revisión de código | **Pendiente** en las 62 filas: la historia no tiene pull requests, solo merges directos |
| BW · Estado | Fórmula: **Pendiente** si hay algún "No"; **En revisión** si hay algún "Pendiente"; **Implementado** si todo es "Sí" o "No aplica" |

## 4. Placeholders y su significado

| Placeholder | Significado | Quién lo completa |
|---|---|---|
| `PR: PENDIENTE` | No existe pull request: `gh` no está instalado y la historia solo muestra "Merge branch" | Quien abra el PR al subir la rama |
| Despliegue "Pendiente" | No hay entorno de producción | El equipo, cuando despliegue (HTTPS es obligatorio para la cámara y el Service Worker) |
| Revisión de código "Pendiente" | No hay revisión aprobada registrada | El revisor del PR |
| Análisis estático "Pendiente" | El archivo cambió después del análisis del 2026-11-10 | Volver a ejecutar `npx @sonar/scan` |
| Prompt Engineering "Pendiente" | Se usó IA (trailers de commit, `.cursor/rules`), pero no se archivó el prompt de cada procedimiento | El responsable, si conserva el prompt |
| `Hash del BriefingScript` | **No es un placeholder.** Es el SHA-256 real del texto del procedimiento en el `.docx` (UTF-8, sin espacios extremos). Si alguien edita el texto, el hash deja de coincidir, y así se detecta el cambio | — |
| `MRP-XXX-XXX` | Identificador del paquete de evidencia del TRZ, con la misma numeración | — |

## 5. Discrepancias entre la matriz original y el código

1. **TRZ-009-005, `Dashboard.jsx` es código heredado.** La matriz original lo cita como artefacto de alertas.
   - En el código, `Dashboard.jsx` solo lo importa `resources/js/app.jsx`, que carga `resources/views/scan.blade.php`.
   - Ninguna ruta usa esa vista, y `vite.config.js` no compila `app.jsx`.
   - Las alertas reales se gestionan en `AlertsPage.jsx` y en el contador de `RoyaGuard.jsx`.
   - Se marcó **"¿Se evita redundancia?" = No**.
2. **TRZ-011-004 y TRZ-011-005: `metrics.json` no existe en el repositorio y el ONNX publicado es un placeholder.**
   - `/storage/ml` y `/public/models/*.onnx` están en `.gitignore`.
   - `Docs/10` documenta la corrida real:
     - accuracy 0.910, F1 macro 0.910, recall de roya 0.940;
     - precision de roya 0.851, que **no cumple la meta de 0.88**.
   - Los hashes no coinciden:
     - el ONNX publicado tiene SHA-256 `870c4230…`;
     - el entrenado según Docs/10 tiene `1cf92a1f…`.
   - Se marcó **"¿Evidencia de validación recuperable?" = No** y **"¿Funciona en su alcance?" = Pendiente**.
3. **TRZ-012-005, la "Prueba de humo E2E" fue reemplazada.**
   - Hoy se cubre con 8 specs de Cypress (14 casos) y con el análisis de SonarQube.
   - `cypress/` no tiene seguimiento en Git, así que **"¿Implementación registrada en commit?" = No**.

## 6. Hallazgos nuevos encontrados al completar la matriz

| Hallazgo | TRZ | Severidad | Acción sugerida |
|---|---|---|---|
| `User::roleName()` recae en `users.role` (default `"tecnico"`) si falta `rol_id`; un usuario sin rol tendría privilegios de técnico | TRZ-002-002 | Media (seguridad) | Eliminar la columna heredada o usar `"agricultor"` como respaldo, y agregar una prueba |
| 12 avisos de `composer audit`: `laravel/framework` < 12.71, `symfony/http-foundation` (alto), `league/commonmark` (alto), `symfony/mime`, entre otros | 36 TRZ con PHP | Alta (dependencias) | `composer update` y volver a ejecutar `composer audit` |
| E2E-04 falló por *timeout* en la corrida completa del 2026-11-12 y pasó 2/2 al re-ejecutarlo | TRZ-001-004 | Baja (inestabilidad del servidor de desarrollo) | Vigilar; si se repite, subir el *timeout* o servir con Apache |
| No hay prueba que alcance los límites `throttle:api` y `throttle:sync` | TRZ-007-005 | Baja | Agregar una prueba que espere un 429 en JSON |

## 7. Incidente durante la generación

Al re-ejecutar solo E2E-04 para confirmar su resultado, ocurrieron dos efectos:

- **El reporte HTML `cypress/reports/index.html` del 2026-11-12 se borró.** El plugin `cypress-mochawesome-reporter` limpia la carpeta de reportes al iniciar.
- **Los 8 videos de `cypress/videos/` se movieron a la Papelera.** Cypress hace esto por defecto (`trashAssetsBeforeRuns`).

Así se resolvió:

- **Videos:** se restauraron desde la Papelera a su ubicación original.
- **Reporte HTML:** no se pudo recuperar. Sus resultados (14 casos, estado y mensaje de error) ya se habían extraído y se guardaron en `evidencias/cypress-resultados_2026-11-12.json`.
- Para regenerar el HTML, ejecuta `npm run test:e2e` con el servidor en el puerto 8090.
