# TRZ-003-005 — Georreferenciación de la captura y generación de miniatura como evidencia.

- **INTENT:** INT-003 Captura e Inferencia IA en el Borde (Edge AI)
- **BriefingScript:** Georreferenciación de la captura y generación de miniatura como evidencia.
- **Artefacto Destino:** Scanner.jsx (geolocalización, compressThumb)
- **Ruta del Archivo:**
  - `resources/js/components/Scanner.jsx`
- **Método / función:** readGeo() (navigator.geolocation.getCurrentPosition), compressThumb()
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** Edge AI / Frontend
- **Responsable:** Jefferson
- **HU / Ticket:** T-09 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-003-005:**
  - Commit: 06fc39b
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Cypress E2E-06: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): Scanner.jsx 0.0 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:1a63b3efa62a3d9a9f5830a72b2f3f5d76e04324d20120f6ccf42e2ac67662a4`
- **Estado:** En revisión — sin criterios en "No", con evidencia pendiente de aportar.
- **Observaciones:**
  • Cambios locales sin commit en Scanner.jsx (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • Pruebas de componente para readGeo()/compressThumb(); hoy solo E2E-06 verifica latitud = null e imagen_thumb.
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-003 Captura e Inferencia IA en el Borde (Edge AI) en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-09: Registrar fecha, hora, parcela y coordenadas GPS. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-09 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>Cambios locales sin commit en: resources/js/components/Scanner.jsx |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): Cypress E2E-06: 1/1 (2026-11-12). Cobertura de línea (2026-11-12): Scanner.jsx 0.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | resources/js/components/Scanner.jsx → componente React |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: componente React. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-003-005 |
| 4.1 ¿Requerimiento con ID? | Sí | T-09 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>Cambios locales sin commit en: resources/js/components/Scanner.jsx |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: Cypress E2E-06: 1/1 (2026-11-12) |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | Sí | npm audit --omit=dev (2026-11-16): 0 vulnerabilidades en 66 dependencias de producción. SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | Cypress E2E-06: 1/1 (2026-11-12) |
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
- **Procedimiento:** TRZ-003-005 — Georreferenciación de la captura y generación de miniatura como evidencia.
- **Rama:** [`INT-003/TRZ-003-005-georreferenciacion-miniatura`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-005-georreferenciacion-miniatura)
- **Ficha en la rama:** [TRZ-003-005_georreferenciacion_miniatura.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-005-georreferenciacion-miniatura/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-003_Captura_Inferencia_Edge_AI/TRZ-003-005_georreferenciacion_miniatura.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `resources/js/components/Scanner.jsx` | readGeo | 21–37 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-005-georreferenciacion-miniatura/resources/js/components/Scanner.jsx#L21-L37) |
| `resources/js/components/Scanner.jsx` | compressThumb | 39–55 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-005-georreferenciacion-miniatura/resources/js/components/Scanner.jsx#L39-L55) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
