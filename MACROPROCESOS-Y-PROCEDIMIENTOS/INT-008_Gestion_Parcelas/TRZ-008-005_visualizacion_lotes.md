# TRZ-008-005 — Pantalla de gestión de parcelas y consulta API con conteo de diagnósticos.

- **INTENT:** INT-008 Gestión de Parcelas (Lotes)
- **BriefingScript:** Pantalla de gestión de parcelas y consulta API con conteo de diagnósticos.
- **Artefacto Destino:** ParcelasPage.jsx, ConsultaController@parcelas
- **Ruta del Archivo:**
  - `resources/js/pages/ParcelasPage.jsx`
  - `app/Http/Controllers/Api/ConsultaController.php`
- **Método / función:** Componente ParcelasPage; ConsultaController@parcelas() (GET /api/parcelas)
- **Modelo IA Usado:** Claude Opus 5.5 (commits)
- **Dominio Funcional:** Gestión Agrícola
- **Responsable:** Annelise
- **HU / Ticket:** T-26 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-008-005:**
  - Commit: 6a2e717, e855ee3
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit ConsultaApiTest: 7/7. Cobertura de línea (2026-11-12): ParcelasPage.jsx 0.0 %, ConsultaController.php 100.0 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:d8ae4c9eba8f3b9cf290d825461fbdbf058052b9504f47b5d8710063db8ab9ec`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Responsable asignado por dominio (Annelise); autoría en Git: JeffersonR12, Jhoan Sosa.
- **Puntos de mejora:**
  • ParcelasPage.jsx no tiene prueba de componente ni E2E; agregar un caso de navegación a Parcelas.
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-008 Gestión de Parcelas (Lotes) en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-26: Construir dashboard por rol con historial y filtros. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-26 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit ConsultaApiTest: 7/7. Cobertura de línea (2026-11-12): ParcelasPage.jsx 0.0 %, ConsultaController.php 100.0 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | resources/js/pages/ParcelasPage.jsx → página React; app/Http/Controllers/Api/ConsultaController.php → controlador HTTP |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: página React, controlador HTTP. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-008-005 |
| 4.1 ¿Requerimiento con ID? | Sí | T-26 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 6a2e717 (2026-11-06, Jhoan Sosa) https://github.com/JeffersonR12/proyecto_roya_backend/commit/6a2e717e0c1d13493537cd9cd125e54db0faed32<br>e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit ConsultaApiTest: 7/7 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit ConsultaApiTest: 7/7 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 83.34 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-008 Gestión de Parcelas (Lotes)
- **Procedimiento:** TRZ-008-005 — Pantalla de gestión de parcelas y consulta API con conteo de diagnósticos.
- **Rama:** [`INT-008/TRZ-008-005-visualizacion-lotes`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-008/TRZ-008-005-visualizacion-lotes)
- **Ficha en la rama:** [TRZ-008-005_visualizacion_lotes.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-005-visualizacion-lotes/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-008_Gestion_Parcelas/TRZ-008-005_visualizacion_lotes.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `resources/js/pages/ParcelasPage.jsx` | ParcelasPage | 5–145 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-005-visualizacion-lotes/resources/js/pages/ParcelasPage.jsx#L5-L145) |
| `app/Http/Controllers/Api/ConsultaController.php` | parcelas | 28–41 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-008/TRZ-008-005-visualizacion-lotes/app/Http/Controllers/Api/ConsultaController.php#L28-L41) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
