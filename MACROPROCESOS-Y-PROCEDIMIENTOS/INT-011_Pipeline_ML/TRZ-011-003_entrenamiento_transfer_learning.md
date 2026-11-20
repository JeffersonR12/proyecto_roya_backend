# TRZ-011-003 — Entrenamiento de MobileNetV3-Small con pesos de clase, aumento de datos y parada anticipada.

- **INTENT:** INT-011 Pipeline de Machine Learning
- **BriefingScript:** Entrenamiento de MobileNetV3-Small con pesos de clase, aumento de datos y parada anticipada.
- **Artefacto Destino:** scripts/train_export_cnn.py (entrenamiento)
- **Ruta del Archivo:**
  - `scripts/train_export_cnn.py`
- **Método / función:** build_model() (MobileNetV3-Small, pesos ImageNet), train(), pesos_de_clase()
- **Modelo IA Usado:** Claude Opus 5.5 (commits); Claude Opus 5.5 (cambios locales sin commit)
- **Dominio Funcional:** Pipeline ML
- **Responsable:** Jefferson
- **HU / Ticket:** T-11 (Docs/02_Backlog_Tecnico.md)
- **MRP (Merge-Readiness Pack) — MRP-011-003:**
  - Commit: 06fc39b
  - PR: PENDIENTE (el repositorio no registra pull requests; solo merges directos)
  - Pruebas: Sin pruebas automatizadas
  - Análisis estático: SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto.
  - Hash del BriefingScript: `sha256:d5d9f2883312d0b1bfd7ded60fce2cb7aef7c73e7ffb6066745e931445aec472`
- **Estado:** Pendiente — hay al menos un criterio verificado en "No".
- **Observaciones:**
  • Cambios locales sin commit en train_export_cnn.py (por decisión del equipo no se suben a Git en esta entrega).
- **Puntos de mejora:**
  • Versionar metrics.json y el ONNX entrenado (por ejemplo con Git LFS o DVC) para que la evidencia sea recuperable.
  • Confirmar los cambios en un commit y abrir un PR con revisión de código.

## Verificación SASE

| Criterio | Registro | Evidencia |
|---|---|---|
| 2.1 ¿Intent identificado? | Sí | INT-011 Pipeline de Machine Learning en Docs/Macroprocesos y Procedimientos – RiwiScan.docx |
| 2.1 ¿Requerimiento asociado documentado? | Sí | T-11: Entrenar MobileNetV3-Small como línea base y comparar con alternativa si aplica. |
| 2.1 ¿Bolt derivado del requerimiento? | Sí | T-11 (Docs/02_Backlog_Tecnico.md) |
| 2.2 ¿Diseño documentado? | Sí | Diseño descrito en: Docs/11_Informe_Arquitectura_Software_y_Tecnologica.md, Docs/10_Iteracion_03_Primer_Entrenamiento_CNN.md |
| 2.2 ¿Implementación registrada en commit? | Pendiente | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>Cambios locales sin commit en: scripts/train_export_cnn.py |
| 2.2 ¿Pruebas automatizadas ejecutadas? | No | No existen pruebas automatizadas para este artefacto en el repositorio. |
| 2.3 ¿Evidencia de despliegue en producción? | Pendiente | Sin despliegue en producción: ejecución local (XAMPP + php artisan serve), Docs/11 §4.3. |
| 3.1 ¿Código en el módulo correcto? | Sí | scripts/train_export_cnn.py → script de ML (scripts/) |
| 3.1 ¿Lógica en la capa adecuada? | Sí | Responsabilidad en la capa que le corresponde: script de ML (scripts/). |
| 3.1 ¿Se evita redundancia? | Sí | No se encontraron archivos duplicados para esta responsabilidad. |
| 3.1 ¿Separación de responsabilidades? | Sí | Responsabilidad única del archivo (script o suite independiente). |
| 3.2 ¿Nombres consistentes? | Sí | PascalCase en clases y componentes, camelCase en funciones JS, snake_case en columnas y funciones Python. |
| 3.2 ¿Consistencia de archivos? | Sí | Scripts de ML agrupados en scripts/ con requirements-ml.txt. |
| 3.2 ¿Se evitan dependencias innecesarias? | Sí | torch, torchvision, onnx, onnxruntime, pillow y numpy (scripts/requirements-ml.txt), todas necesarias para el pipeline. |
| 4.1 ¿Bolt documentado con ID? | Sí | TRZ-011-003 |
| 4.1 ¿Requerimiento con ID? | Sí | T-11 (Docs/02_Backlog_Tecnico.md) |
| 4.1 ¿PR o commit asociado? | Sí | 06fc39b (2026-11-02, JeffersonR12) https://github.com/JeffersonR12/proyecto_roya_backend/commit/06fc39b75ef6bd9094e99f068d0db4b53a2711f6<br>Cambios locales sin commit en: scripts/train_export_cnn.py |
| 4.1 ¿Evidencia de validación recuperable? | No | metrics.json y los pesos no se versionan (/storage/ml y /public/models/*.onnx en .gitignore); solo existe la descripción en Docs/10. |
| 4.1 ¿Evidencia de despliegue o N.A.? | Pendiente | Sin despliegue en producción (solo entorno local). |
| 5.1 ¿Mantiene funcionamiento? | Sí | Docs/10 documenta la corrida roya-mobilenetv3-small-v1 (accuracy 0.910, F1 macro 0.910). |
| 5.1 ¿Funciona en su alcance? | Pendiente | No reproducible desde el repositorio: falta storage/ml (dataset y runs). Precision de roya 0.851 < meta 0.88 (Docs/10 §7.4). |
| 5.1 ¿Preserva funcionalidades? | Sí | Suites completas en verde el 2026-11-16: PHPUnit 81/81 (316 aserciones), Vitest 141/141. |
| 5.1 ¿Se integra sin corrección? | Sí | Sin correcciones posteriores registradas en Docs/12 y Docs/13. |
| 5.2 ¿Supera análisis estático? | Sí | SonarQube fase 2 (2026-11-10): 0 issues abiertos en estos archivos; 0 bugs y 0 code smells en el proyecto. |
| 5.2 ¿Supera seguridad y dependencias? | Pendiente | Dependencias Python sin auditar (pip-audit no ejecutado). |
| 5.2 ¿Supera pruebas? | No | Sin pruebas automatizadas. |
| 5.2 ¿Revisión de código aprobada? | Pendiente | Sin pull request con revisión aprobada: la historia solo registra merges directos ("Merge branch ..."). |

| Bloque | Resultado |
|---|---|
| 2. Marco AI-DLC | 75 |
| 3. Coherencia técnica | 100 |
| 4. Trazabilidad | 75 |
| 5. Estabilidad (promedio) | 75 |

*Generado el 2026-11-16 a partir del código. Los valores "Pendiente" deben completarse con evidencia real; ver `DECISIONES.md`.*
