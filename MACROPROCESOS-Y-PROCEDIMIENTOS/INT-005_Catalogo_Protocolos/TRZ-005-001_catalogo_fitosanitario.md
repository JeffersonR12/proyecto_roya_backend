# TRZ-005-001 — Catálogo fitosanitario con agente causal, síntomas y umbral de alerta.

- **INTENT:** INT-005 Catálogo Fitosanitario y Protocolos
- **BriefingScript:** Catálogo fitosanitario con agente causal, síntomas y umbral de alerta.
- **Artefacto Destino:** catalogo_fitosanitario, CatalogoFitosanitarioSeeder
- **Ruta del Archivo:**
  - `app/Models/CatalogoFitosanitario.php`
  - `database/migrations/2026_10_04_180005_create_catalogo_fitosanitario_table.php`
  - `database/seeders/CatalogoFitosanitarioSeeder.php`
- **Método / función:** CatalogoFitosanitarioSeeder::run() (PHY-000 a PHY-005 con umbral_alerta)
- **Modelo IA Usado:** Cursor (modelo no especificado) (commits)
- **Dominio Funcional:** Dominio Fitosanitario / Backend
- **Responsable:** Annelise
- **HU / Ticket:** T-07 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-005-001:**
  - Commit: 210a1b2
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: PHPUnit DomainSchemaTest: 4/4; PHPUnit ConsultaApiTest: 7/7. Cobertura de línea (2026-11-12): CatalogoFitosanitario.php 83.3 %
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:55e1d1a2c05e235650f1d6c5d5b03cd0ac4b94d41bb069532c91b87aed7e63a5`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Responsable asignado por dominio (Annelise); autoría en Git: JeffersonR12.
- **Puntos de mejora:**
  • composer update laravel/framework symfony/* league/commonmark y volver a ejecutar composer audit.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-005 Catálogo Fitosanitario y Protocolos en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-07: Crear migraciones y restricciones para usuarios, parcelas, diagnósticos, alertas y catálogo. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-07 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | Sí | Ejecutadas el 2026-11-16 (PHPUnit 81/81, Vitest 141/141): PHPUnit DomainSchemaTest: 4/4; PHPUnit ConsultaApiTest: 7/7. Cobertura de línea (2026-11-12): CatalogoFitosanitario.php 83.3 % |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | app/Models/CatalogoFitosanitario.php → modelo Eloquent; database/migrations/2026_10_04_180005_create_catalogo_fitosanitario_table.php → esquema/datos (migración o seeder); database/seeders/CatalogoFitosanitarioSeeder.php → esquema/datos (migración o seeder) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: modelo Eloquent, esquema/datos (migración o seeder). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Validación, reglas de dominio, persistencia y presentación están en archivos distintos. |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Ubicación según PSR-4 (app/) y la estructura resources/js/{components,pages,lib} del proyecto. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | Solo dependencias declaradas en composer.json / package.json; ninguna nueva para este artefacto. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-005-001 |
| 4.1 ¿Requerimiento con ID? | Sí | T-07 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 210a1b2 (2026-10-05, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/210a1b266faef85bd67390369f3a232373308ee7 |
| 4.1 ¿Evidencia de validación recuperable? | Sí | MACROPROCESOS-Y-PROCEDIMIENTOS/evidencias/ (phpunit-junit, vitest.json, cypress-resultados). |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Pruebas asociadas en verde: PHPUnit DomainSchemaTest: 4/4; PHPUnit ConsultaApiTest: 7/7 |
| 5.1 ¿Funciona en su alcance? | Sí | Cumple el BriefingScript; verificado por las pruebas indicadas. |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | No | composer audit (2026-11-16): 12 avisos en dependencias del framework (laravel/framework < 12.71, symfony/http-foundation [alto], league/commonmark [alto], symfony/mime, etc.). SonarQube: 0 hotspots. |
| 5.2 ¿Supera pruebas? | Sí | PHPUnit DomainSchemaTest: 4/4; PHPUnit ConsultaApiTest: 7/7 |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 100 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 100 |
| 5. Estabilidad (promedio) | 83.34 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-005 Catálogo Fitosanitario y Protocolos
- **Procedimiento:** TRZ-005-001 — Catálogo fitosanitario con agente causal, síntomas y umbral de alerta.
- **Rama:** [`INT-005/TRZ-005-001-catalogo-fitosanitario`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-005/TRZ-005-001-catalogo-fitosanitario)
- **Ficha en la rama:** [TRZ-005-001_catalogo_fitosanitario.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-001-catalogo-fitosanitario/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-005_Catalogo_Protocolos/TRZ-005-001_catalogo_fitosanitario.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `app/Models/CatalogoFitosanitario.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-001-catalogo-fitosanitario/app/Models/CatalogoFitosanitario.php) |
| `database/migrations/2026_10_04_180005_create_catalogo_fitosanitario_table.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-001-catalogo-fitosanitario/database/migrations/2026_10_04_180005_create_catalogo_fitosanitario_table.php) |
| `database/seeders/CatalogoFitosanitarioSeeder.php` | (archivo completo) | archivo completo | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-005/TRZ-005-001-catalogo-fitosanitario/database/seeders/CatalogoFitosanitarioSeeder.php) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
