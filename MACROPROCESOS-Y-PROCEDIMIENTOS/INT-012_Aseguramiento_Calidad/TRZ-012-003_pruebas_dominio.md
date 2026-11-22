# TRZ-012-003 — Pruebas de reglas de dominio (umbral de confianza, unicidad UUID, independencia).

- **INTENT:** INT-012 Aseguramiento de la Calidad
- **BriefingScript:** Pruebas de reglas de dominio (umbral de confianza, unicidad UUID, independencia).
- **Artefacto Destino:** TenantDiagnosticoTest, DomainSchemaTest
- **Ruta del Archivo:**
  - `tests/Feature/TenantDiagnosticoTest.php`
  - `tests/Feature/DomainSchemaTest.php`
- **Método / función:** Suites PHPUnit TenantDiagnosticoTest y DomainSchemaTest
- **Modelo IA Usado:** Claude Opus 5.5, Cursor (modelo no especificado) (commits)
- **Dominio Funcional:** QA / Testing
- **Responsable:** Jhoan
- **HU / Ticket:** T-07 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-012-003:**
  - Commit: e855ee3, 210a1b2
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit DomainSchemaTest: 4/4
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:e3656fa1331174e895f64e0479d4ff7df838f5b6b923ddc48ace244085231c63`
- **Estado:** En revisión — sin criterios en "No", con evidencia pendiente de aportar.
- **Observaciones:**
  • Responsable asignado por dominio (Jhoan); autoría en Git: JeffersonR12.
- **Puntos de mejora:**
  • Abrir PR con revisión de código y desplegar en un entorno con HTTPS para cerrar 2.3 y 4.1.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-012 Aseguramiento de la Calidad en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-07: Crear migraciones y restricciones para usuarios, parcelas, diagnósticos, alertas y catálogo. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-07 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Sí | e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit DomainSchemaTest: 4/4 |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | tests/Feature/TenantDiagnosticoTest.php → suite o configuración de calidad; tests/Feature/DomainSchemaTest.php → suite o configuración de calidad |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: suite o configuración de calidad. |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Responsabilidad única del archivo (script o suite independiente). |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-012-003 |
| 4.1 ¿Requerimiento con ID? | Sí | T-07 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | e855ee3 (2026-10-25, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/e855ee303c36ce24ff866b77fb45388136371614<br>210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit DomainSchemaTest: 4/4 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No aplica | Código de pruebas: no se despliega ni expone dependencias de producción. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit TenantDiagnosticoTest: 6/6; PHPUnit DomainSchemaTest: 4/4 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 100 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-012 Aseguramiento de la Calidad
- **Procedimiento:** TRZ-012-003 — Pruebas de reglas de dominio (umbral de confianza, unicidad UUID, independencia).
- **Rama:** [`INT-012/TRZ-012-003-pruebas-dominio`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-012/TRZ-012-003-pruebas-dominio)
- **Ficha en la rama:** [TRZ-012-003_pruebas_dominio.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-003-pruebas-dominio/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-012_Aseguramiento_Calidad/TRZ-012-003_pruebas_dominio.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `tests/Feature/TenantDiagnosticoTest.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-003-pruebas-dominio/tests/Feature/TenantDiagnosticoTest.php) |
| `tests/Feature/DomainSchemaTest.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-012/TRZ-012-003-pruebas-dominio/tests/Feature/DomainSchemaTest.php) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
