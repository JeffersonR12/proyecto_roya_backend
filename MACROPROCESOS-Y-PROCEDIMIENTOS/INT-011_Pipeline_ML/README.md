# INT-011 Pipeline de ML — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-011-pipeline-ml`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-011-pipeline-ml)
- **Dominio funcional:** Pipeline ML
- **Responsable (Agent Coach):** Jefferson Huaman Lazaro
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-011-pipeline-ml/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-011-001 | Preparación del dataset: asignar fuentes a 3 clases, eliminar duplicados y generar manifest. | Implementado | 4 | [TRZ-011-001-dataset-limpio](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-001-dataset-limpio) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-001-dataset-limpio/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-011_Pipeline_ML/TRZ-011-001_dataset_limpio.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-011/TRZ-011-001-dataset-limpio) |
| TRZ-011-002 | División estratificada 70/15/15 con semilla fija para entrenamiento. | Implementado | 6 | [TRZ-011-002-split-estratificado](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-002-split-estratificado) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-002-split-estratificado/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-011_Pipeline_ML/TRZ-011-002_split_estratificado.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-011/TRZ-011-002-split-estratificado) |
| TRZ-011-003 | Entrenamiento de MobileNetV3-Small con pesos de clase, aumento de datos y parada anticipada. | Implementado | 5 | [TRZ-011-003-entrenamiento-transfer-learning](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-003-entrenamiento-transfer-learning) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-003-entrenamiento-transfer-learning/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-011_Pipeline_ML/TRZ-011-003_entrenamiento_transfer_learning.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-011/TRZ-011-003-entrenamiento-transfer-learning) |
| TRZ-011-004 | Evaluación del modelo por clase y fuente (precision, recall, F1, matriz de confusión). | Implementado | 4 | [TRZ-011-004-metricas-modelo](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-004-metricas-modelo) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-004-metricas-modelo/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-011_Pipeline_ML/TRZ-011-004_metricas_modelo.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-011/TRZ-011-004-metricas-modelo) |
| TRZ-011-005 | Exportación a ONNX con verificación de equivalencia y reporte SHA-256. | Implementado | 4 | [TRZ-011-005-exportacion-onnx](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-011/TRZ-011-005-exportacion-onnx) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-005-exportacion-onnx/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-011_Pipeline_ML/TRZ-011-005_exportacion_onnx.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-011/TRZ-011-005-exportacion-onnx) |

## Código de cada Misión

### TRZ-011-001 — Preparación del dataset: asignar fuentes a 3 clases, eliminar duplicados y generar manifest.

- `scripts/prepare_dataset.py` · normalizar · L64–L65 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-001-dataset-limpio/scripts/prepare_dataset.py#L64-L65)
- `scripts/prepare_dataset.py` · dhash · L68–L76 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-001-dataset-limpio/scripts/prepare_dataset.py#L68-L76)
- `scripts/prepare_dataset.py` · preparar · L79–L160 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-001-dataset-limpio/scripts/prepare_dataset.py#L79-L160)
- **Criterios en "No":** ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación?; ¿Supera pruebas?; ¿Revisión de código aprobada (VCR)?

### TRZ-011-002 — División estratificada 70/15/15 con semilla fija para entrenamiento.

- `scripts/train_export_cnn.py` · set_seed · L67–L69 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-002-split-estratificado/scripts/train_export_cnn.py#L67-L69)
- `scripts/train_export_cnn.py` · split_estratificado · L109–L128 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-002-split-estratificado/scripts/train_export_cnn.py#L109-L128)
- **Criterios en "No":** ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación?; ¿Supera análisis estático?; ¿Supera seguridad?; ¿Supera pruebas?; ¿Revisión de código aprobada (VCR)?

### TRZ-011-003 — Entrenamiento de MobileNetV3-Small con pesos de clase, aumento de datos y parada anticipada.

- `scripts/train_export_cnn.py` · build_model · L72–L77 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-003-entrenamiento-transfer-learning/scripts/train_export_cnn.py#L72-L77)
- `scripts/train_export_cnn.py` · pesos_de_clase · L169–L172 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-003-entrenamiento-transfer-learning/scripts/train_export_cnn.py#L169-L172)
- `scripts/train_export_cnn.py` · train · L213–L255 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-003-entrenamiento-transfer-learning/scripts/train_export_cnn.py#L213-L255)
- **Criterios en "No":** ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación?; ¿Funciona en su alcance?; ¿Supera pruebas?; ¿Revisión de código aprobada (VCR)?

### TRZ-011-004 — Evaluación del modelo por clase y fuente (precision, recall, F1, matriz de confusión).

- `scripts/train_export_cnn.py` · predecir · L176–L183 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-004-metricas-modelo/scripts/train_export_cnn.py#L176-L183)
- `scripts/train_export_cnn.py` · metricas · L186–L210 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-004-metricas-modelo/scripts/train_export_cnn.py#L186-L210)
- `scripts/train_export_cnn.py` · main · L296–L376 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-004-metricas-modelo/scripts/train_export_cnn.py#L296-L376)
- **Criterios en "No":** ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación?; ¿Supera pruebas?; ¿Revisión de código aprobada (VCR)?

### TRZ-011-005 — Exportación a ONNX con verificación de equivalencia y reporte SHA-256.

- `scripts/train_export_cnn.py` · export_onnx · L258–L272 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-005-exportacion-onnx/scripts/train_export_cnn.py#L258-L272)
- `scripts/train_export_cnn.py` · verificar_onnx · L275–L293 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-011/TRZ-011-005-exportacion-onnx/scripts/train_export_cnn.py#L275-L293)
- **Criterios en "No":** ¿Pruebas automatizadas ejecutadas?; ¿Evidencia de validación?; ¿Supera pruebas?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
