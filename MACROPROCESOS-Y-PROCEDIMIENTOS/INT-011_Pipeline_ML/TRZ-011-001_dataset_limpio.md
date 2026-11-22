# TRZ-011-001 — Preparación del dataset: asignar fuentes a 3 clases, eliminar duplicados y generar manifest.

- **INTENT:** INT-011 Pipeline de Machine Learning
- **BriefingScript:** Preparación del dataset: asignar fuentes a 3 clases, eliminar duplicados y generar manifest.
- **Artefacto Destino:** scripts/prepare_dataset.py
- **Ruta del Archivo:**
  - `scripts/prepare_dataset.py`
- **Método / función:** preparar(), dhash() (deduplicación), normalizar()
- **Modelo IA Usado:** Claude Opus 5.5 (commits)
- **Dominio Funcional:** Pipeline ML
- **Responsable:** Jefferson
- **HU / Ticket:** T-10 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-011-001:**
  - Commit: 06fc39b
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Sin pruebas automatizadas
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:f65d804d3da742f306ca79f3a15ac04e4cc02009e306d168d892882430040fab`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Sin observaciones adicionales.
- **Puntos de mejora:**
  • Versionar metrics.json y el ONNX entrenado (por ejemplo con Git LFS o DVC) para que la evidencia sea recuperable.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-011 Pipeline de Machine Learning en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-10: Versionar dataset y documentar origen/licencia de las imágenes. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-10 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/10_Iteracion_03_Primer_Entrenamiento_CNN.md |
| 2.2 ¿Implementación registrada en commit? | Sí | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6 |
| 2.2 ¿Pruebas automatizadas ejecutadas? | No | No existen pruebas automatizadas para este artefacto en el repositorio. |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | scripts/prepare_dataset.py → script de ML (scripts/) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: script de ML (scripts/). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Responsabilidad única del archivo (script o suite independiente). |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Scripts de ML agrupados en scripts/ con requirements-ml.txt. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | torch, torchvision, onnx, onnxruntime, pillow y numpy (scripts/requirements-ml.txt), todas necesarias para el pipeline. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-011-001 |
| 4.1 ¿Requerimiento con ID? | Sí | T-10 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6 |
| 4.1 ¿Evidencia de validación recuperable? | No | metrics.json y los pesos no se versionan (/storage/ml y /public/models/*.onnx en .gitignore); solo existe la descripción en Docs/10. |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Docs/10 documenta la corrida roya-mobilenetv3-small-v1 (accuracy 0.910, F1 macro 0.910). |
| 5.1 ¿Funciona en su alcance? | Pendiente | No reproducible desde el repositorio: falta storage/ml (dataset y runs). |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | Pendiente | Dependencias Python sin auditar (pip-audit no ejecutado). |
| 5.2 ¿Supera pruebas? | No | Sin pruebas automatizadas. |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 83.34 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 75 |
| 5. Estabilidad (promedio) | 75 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*

## Código del procedimiento en GitHub

- **Macroproceso:** INT-011 Pipeline de Machine Learning
- **Procedimiento:** TRZ-011-001 — Preparación del dataset: asignar fuentes a 3 clases, eliminar duplicados y generar manifest.
- **Rama:** [`INT-011/TRZ-011-001-dataset-limpio`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-001-dataset-limpio)
- **Ficha en la rama:** [TRZ-011-001_dataset_limpio.md](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-001-dataset-limpio/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-011_Pipeline_ML/TRZ-011-001_dataset_limpio.md)

| Archivo | Elemento | Líneas | Enlace |
|---|---|---|---|
| `scripts/prepare_dataset.py` | normalizar | 64–65 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-001-dataset-limpio/scripts/prepare_dataset.py#L64-L65) |
| `scripts/prepare_dataset.py` | dhash | 68–76 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-001-dataset-limpio/scripts/prepare_dataset.py#L68-L76) |
| `scripts/prepare_dataset.py` | preparar | 79–160 | [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-001-dataset-limpio/scripts/prepare_dataset.py#L79-L160) |

*Las líneas corresponden al commit base `22a0ebe` (rama `trazabilidad/base`), del que parte esta rama.*
