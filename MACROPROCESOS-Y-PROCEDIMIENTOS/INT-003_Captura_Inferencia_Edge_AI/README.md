# INT-003 Captura e Inferencia IA — índice del macroproceso

- **Rama del macroproceso:** [`macroproceso/INT-003-captura-inferencia-edge-ai`](https://github.com/JeffersonR12/proyecto_roya_backend/tree/macroproceso/INT-003-captura-inferencia-edge-ai)
- **Dominio funcional:** Edge AI / Frontend
- **Responsable (Agent Coach):** Jefferson Huaman Lazaro
- **Misiones (procedimientos TRZ):** 5
- **Metodología:** ISAET (Docs/Software_Agentes/ISAET_Metodologia_Combinada_RiwiScan.docx). Cada Misión sigue el flujo BriefingScript → LoopScript → MRP → VCR.
- **Matriz de trazabilidad:** [Mat_Traza_RiwiScan_16_11.xlsx](https://github.com/JeffersonR12/proyecto_roya_backend/blob/macroproceso/INT-003-captura-inferencia-edge-ai/Docs/Matriz_TrazabilidadRoya/Mat_Traza_RiwiScan_16_11.xlsx)

## Misiones

| Misión | BriefingScript | Estado | Criterios en "No" | Rama | Ficha | Commit |
|---|---|---|---|---|---|---|
| TRZ-003-001 | Captura de hoja con cámara/archivo, con guía visual de luz y distancia. | Implementado | 3 | [TRZ-003-001-captura-guiada](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-001-captura-guiada) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-003_Captura_Inferencia_Edge_AI/TRZ-003-001_captura_guiada.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-003/TRZ-003-001-captura-guiada) |
| TRZ-003-002 | Preprocesamiento de imagen (redimensionar 224x224, normalizar para el modelo). | Implementado | 3 | [TRZ-003-002-preprocesamiento-imagen](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-002-preprocesamiento-imagen) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-002-preprocesamiento-imagen/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-003_Captura_Inferencia_Edge_AI/TRZ-003-002_preprocesamiento_imagen.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-003/TRZ-003-002-preprocesamiento-imagen) |
| TRZ-003-003 | Inferencia local (Edge AI) con ONNX Runtime Web, sin depender del servidor. | Implementado | 4 | [TRZ-003-003-inferencia-local-onnx](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-003-inferencia-local-onnx) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-003-inferencia-local-onnx/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-003_Captura_Inferencia_Edge_AI/TRZ-003-003_inferencia_local_onnx.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-003/TRZ-003-003-inferencia-local-onnx) |
| TRZ-003-004 | Postprocesamiento con umbral de confianza del 75%; si no se alcanza, resultado "no concluyente". | Implementado | 3 | [TRZ-003-004-umbral-confianza](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-004-umbral-confianza) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-004-umbral-confianza/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-003_Captura_Inferencia_Edge_AI/TRZ-003-004_umbral_confianza.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-003/TRZ-003-004-umbral-confianza) |
| TRZ-003-005 | Georreferenciación de la captura y generación de miniatura como evidencia. | Implementado | 3 | [TRZ-003-005-georreferenciacion-miniatura](https://github.com/JeffersonR12/proyecto_roya_backend/tree/INT-003/TRZ-003-005-georreferenciacion-miniatura) | [ficha](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-005-georreferenciacion-miniatura/MACROPROCESOS-Y-PROCEDIMIENTOS/INT-003_Captura_Inferencia_Edge_AI/TRZ-003-005_georreferenciacion_miniatura.md) | [historial](https://github.com/JeffersonR12/proyecto_roya_backend/commits/INT-003/TRZ-003-005-georreferenciacion-miniatura) |

## Código de cada Misión

### TRZ-003-001 — Captura de hoja con cámara/archivo, con guía visual de luz y distancia.

- `resources/js/components/Scanner.jsx` · Scanner · L88–L526 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/resources/js/components/Scanner.jsx#L88-L526)
- `resources/js/components/CaptureGuide.jsx` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/resources/js/components/CaptureGuide.jsx)
- `resources/js/lib/fieldFlow.js` · TIP_IDS · L214 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/resources/js/lib/fieldFlow.js#L214)
- `resources/js/lib/fieldFlow.js` · stepFor · L218–L226 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-001-captura-guiada/resources/js/lib/fieldFlow.js#L218-L226)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-003-002 — Preprocesamiento de imagen (redimensionar 224x224, normalizar para el modelo).

- `resources/js/lib/onnxEngine.js` · imageToNCHW · L34–L56 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-002-preprocesamiento-imagen/resources/js/lib/onnxEngine.js#L34-L56)
- `resources/js/lib/inference.js` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-002-preprocesamiento-imagen/resources/js/lib/inference.js)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-003-003 — Inferencia local (Edge AI) con ONNX Runtime Web, sin depender del servidor.

- `resources/js/lib/onnxEngine.js` · wasmBaseUrl · L18–L20 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-003-inferencia-local-onnx/resources/js/lib/onnxEngine.js#L18-L20)
- `resources/js/lib/onnxEngine.js` · getOrt · L22–L32 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-003-inferencia-local-onnx/resources/js/lib/onnxEngine.js#L22-L32)
- `resources/js/lib/onnxEngine.js` · loadSession · L58–L73 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-003-inferencia-local-onnx/resources/js/lib/onnxEngine.js#L58-L73)
- `resources/js/lib/onnxEngine.js` · inferImage · L75–L109 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-003-inferencia-local-onnx/resources/js/lib/onnxEngine.js#L75-L109)
- `resources/js/lib/onnxEngine.js` · isModelMissing · L115–L129 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-003-inferencia-local-onnx/resources/js/lib/onnxEngine.js#L115-L129)
- `resources/js/lib/onnxEngine.js` · inferDataUrl · L131–L138 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-003-inferencia-local-onnx/resources/js/lib/onnxEngine.js#L131-L138)
- `scripts/copy-ort.mjs` · (archivo completo) · archivo completo → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-003-inferencia-local-onnx/scripts/copy-ort.mjs)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Se integra sin corrección?; ¿Revisión de código aprobada (VCR)?

### TRZ-003-004 — Postprocesamiento con umbral de confianza del 75%; si no se alcanza, resultado "no concluyente".

- `resources/js/lib/inference.js` · UMBRAL_CONFIANZA · L3 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-004-umbral-confianza/resources/js/lib/inference.js#L3)
- `resources/js/lib/inference.js` · softmax · L20–L27 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-004-umbral-confianza/resources/js/lib/inference.js#L20-L27)
- `resources/js/lib/inference.js` · applyUmbral · L33–L49 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-004-umbral-confianza/resources/js/lib/inference.js#L33-L49)
- `resources/js/lib/inference.js` · fromLogits · L51–L72 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-004-umbral-confianza/resources/js/lib/inference.js#L51-L72)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

### TRZ-003-005 — Georreferenciación de la captura y generación de miniatura como evidencia.

- `resources/js/components/Scanner.jsx` · readGeo · L21–L37 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-005-georreferenciacion-miniatura/resources/js/components/Scanner.jsx#L21-L37)
- `resources/js/components/Scanner.jsx` · compressThumb · L39–L55 → [ver código](https://github.com/JeffersonR12/proyecto_roya_backend/blob/INT-003/TRZ-003-005-georreferenciacion-miniatura/resources/js/components/Scanner.jsx#L39-L55)
- **Criterios en "No":** ¿Evidencia de despliegue?; ¿Evidencia de despliegue?; ¿Revisión de código aprobada (VCR)?

*Índice generado el 2026-11-22 a partir de la matriz vigente y de las ramas de procedimiento.*
