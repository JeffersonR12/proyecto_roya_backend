# TRZ-005-003 — Motor de protocolos que decide cuándo tratar según severidad y umbral.

- **INTENT:** INT-005 Catálogo Fitosanitario y Protocolos
- **BriefingScript:** Motor de protocolos que decide cuándo tratar según severidad y umbral.
- **Artefacto Destino:** catalogo.js (protocoloPara)
- **Ruta del Archivo:**
  - `resources/js/lib/catalogo.js`
- **Método / función:** protocoloPara({ clase, confianza, severidad, hitl_status })
- **Modelo IA Usado:** Claude Opus 5.5 (commits)
- **Dominio Funcional:** Dominio Fitosanitario / Backend
- **Responsable:** Annelise
- **HU / Ticket:** T-28 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-005-003:**
  - Commit: e855ee3
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Vitest catalogo.test.js: 10/10. Cobertura de línea (2026-11-12): catalogo.js 100.0 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:dff69b3a338ed13e74b87826602cb97154ff46453b6c93cc89c8e8cc4ab3ff0c`
- **Estado:** En revisión — sin criterios en "No", con evidencia pendiente de aportar.
- **Observaciones:**
  • Responsable asignado por dominio (Annelise); autoría en Git: JeffersonR12.
- **Puntos de mejora:**
  • Abrir PR con revisión de código y desplegar en un entorno con HTTPS para cerrar 2.3 y 4.1.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-005 Catálogo Fitosanitario y Protocolos en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-28: Implementar alertas por umbral configurable de severidad. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-28 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/03_Diccionario_de_Datos.md, Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/05_Iteracion_01_Base_de_Datos.md |
| 2.2 ¿Implementación registrada en commit? | Sí | e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Vitest catalogo.test.js: 10/10. Cobertura de línea (2026-11-12): catalogo.js 100.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | resources/js/lib/catalogo.js → lógica pura del cliente (lib/) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: lógica pura del cliente (lib/). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-005-003 |
| 4.1 ¿Requerimiento con ID? | Sí | T-28 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Vitest catalogo.test.js: 10/10 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | Sí | npm audit --omit=dev (2026-11-16): 0 vulnerabilidades en 66 dependencias de producción. SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | Vitest catalogo.test.js: 10/10 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 100 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-005 Catálogo Fitosanitario y Protocolos
- **Procedimiento:** TRZ-005-003 — Motor de protocolos que decide cuándo tratar según severidad y umbral.
- **Rama:** [`INT-005/TRZ-005-003-protocolo-por-severidad`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-003-protocolo-por-severidad)
- **Ficha en la rama:** [TRZ-005-003_protocolo_por_severidad.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-003-protocolo-por-severidad/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-005_Catalogo_Protocolos/TRZ-005-003_protocolo_por_severidad.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `resources/js/lib/catalogo.js` | protocoloPara | 66–101 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-003-protocolo-por-severidad/resources/js/lib/catalogo.js#L66-L101) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
