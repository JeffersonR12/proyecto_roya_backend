**DOCUMENTO TÉCNICO**
**10. Iteración 03 - Primer entrenamiento del modelo CNN**
*Dataset v1, entrenamiento, evaluación y exportación de `roya-mobilenetv3-small-v1`*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Objetivo
Registrar el primer entrenamiento reproducible del clasificador CNN definido en el documento 07: qué datos se usaron, cómo se prepararon, cómo se entrenó el modelo, qué resultados obtuvo frente a las metas del MVP y qué limitaciones quedan abiertas.

Resultado: el modelo `roya-mobilenetv3-small-v1` cumple accuracy, recall y F1 por clase. No cumple la meta de precision en `roya_amarilla` (0.851 frente a 0.88).

# 2. Resumen
| Elemento | Valor |
|---|---|
| Modelo | MobileNetV3-Small preentrenado en ImageNet, cabeza de 3 clases |
| Versión | `roya-mobilenetv3-small-v1` (igual a `MODELO_VERSION` en `resources/js/lib/inference.js`) |
| Dataset | 1405 imágenes de 2 fuentes públicas (Etiopía y John Innes Centre) |
| Split | 983 entrenamiento / 211 validación / 211 prueba (70/15/15) |
| Accuracy en prueba | **0.910** |
| F1 macro en prueba | **0.910** |
| Recall de roya amarilla | **0.940** |
| Artefacto | `public/models/modelo_roya.onnx` (6.1 MB, opset 13) |
| Equivalencia PyTorch → ONNX | Diferencia máxima de logits 1.9e-5 |

# 3. Fuentes de datos
## 3.1 Fuentes usadas
| Fuente | Origen | Clases originales | Imágenes | Encuadre |
|---|---|---|---|---|
| `etiopia` | Estudio etíope de detección de roya estriada y septoria con imágenes de granja real | `stripe_rust`, `Healthy`, `septoria` | 407 | Una hoja en primer plano, alta resolución (hasta 6000×4000) |
| `jic` | Subconjunto público del dataset del John Innes Centre (Reino Unido); el conjunto completo de 19 172 imágenes está disponible a solicitud | `yellowrust`, `healthy`, `brownrust`, `Septoria`, `Mildew` | 999 | Plano medio de cultivo, varias hojas por imagen |

Los originales se conservan sin modificar en `storage/ml/raw/<fuente>/`.

## 3.2 Fuentes evaluadas y descartadas o pendientes
| Fuente | Decisión | Motivo |
|---|---|---|
| `aadium/wheat-disease-detection` (GitHub) | No usada | No contiene roya amarilla; su carpeta `Wheat_Leaf_Rust` es roya anaranjada (*P. triticina*). Imágenes de baja resolución, de espigas, raíces y plantas completas, y 42 duplicados exactos |
| IARI, *Wheat Nitrogen Deficiency & Leaf Rust* (Kaggle, CC0) | Pendiente | Útil para `sana` y `otra_enfermedad` (roya anaranjada y deficiencia de nitrógeno). Hojas segmentadas sobre fondo negro: hay que mezclar fondos para evitar atajos |
| NWRD, NUST (segmentación) | Pendiente | Roya amarilla real con máscaras por píxel. Requiere recortar parches. Base para estimar severidad a futuro |

## 3.3 Mapeo de clases
El modelo distingue roya amarilla (*Puccinia striiformis*) de roya anaranjada o parda (*Puccinia triticina*). Esta última va siempre a `otra_enfermedad`.

| Clase del modelo | Carpetas de origen |
|---|---|
| `sana` | `etiopia/Healthy`, `jic/healthy` |
| `roya_amarilla` | `etiopia/stripe_rust`, `jic/yellowrust` |
| `otra_enfermedad` | `etiopia/septoria`, `jic/brownrust`, `jic/Septoria`, `jic/Mildew` |

# 4. Preparación del dataset
Script: `scripts/prepare_dataset.py`.

1. Mapea las carpetas de cada fuente a una clase. Ignora mayúsculas y espacios: `Septoria ` y `MIldew` se reconocen.
2. Descarta duplicados exactos (MD5) y casi idénticos (dHash) en todo el conjunto. Resultado: 1 duplicado exacto descartado (`etiopia/Healthy`).
3. Aplica la orientación EXIF, convierte a RGB y reduce el lado mayor a 640 px. El dataset pasó de varios GB a 118 MB.
4. Renombra a `<fuente>_<carpeta>_<n>.jpg` y escribe `storage/ml/dataset/manifest.csv` con clase, fuente, origen y MD5 de cada imagen.

## 4.1 Dataset resultante (v1)
| Clase | Etiopía | JIC | Total |
|---|---|---|---|
| `sana` | 101 | 107 | **208** |
| `roya_amarilla` | 208 | 238 | **446** |
| `otra_enfermedad` | 97 | 654 | **751** |
| **Total** | 406 | 999 | **1405** |

SHA-256 de `manifest.csv`: `43293df1d85307f612ac6d65f32ecbfa2717d36e76a3b72583229ebac0393647`.

# 5. Partición
El split es 70/15/15, estratificado por par (clase, fuente) y con semilla 42. Así ambas fuentes están representadas en validación y en prueba. La asignación de cada imagen queda en `storage/ml/runs/roya-mobilenetv3-small-v1/split.csv`.

| Clase | Entrenamiento | Validación | Prueba |
|---|---|---|---|
| `sana` | 146 | 31 | 31 |
| `roya_amarilla` | 312 | 67 | 67 |
| `otra_enfermedad` | 525 | 113 | 113 |
| **Total** | **983** | **211** | **211** |

# 6. Entrenamiento
Script: `scripts/train_export_cnn.py`.

| Parámetro | Valor |
|---|---|
| Backbone | MobileNetV3-Small, pesos `IMAGENET1K_V1` |
| Cabeza | Clasificador original con Dropout 0.3 y `Linear(1024, 3)` |
| Entrada | 224×224×3, redimensionado sin conservar aspecto (igual que `imageToNCHW` en `onnxEngine.js`) |
| Normalización | Media y desviación de ImageNet |
| Augmentation (solo entrenamiento) | Flip horizontal y vertical, rotación ±15°, jitter de brillo, contraste y saturación |
| Pérdida | Cross Entropy con pesos de clase: sana 2.244, roya_amarilla 1.050, otra_enfermedad 0.624 |
| Optimizador | Adam, lr 0.001, `ReduceLROnPlateau` (factor 0.3, paciencia 2) |
| Épocas | Hasta 30, con early stopping (paciencia 6) sobre F1 macro de validación |
| Batch | 32 |
| Selección | Pesos con mejor F1 macro de validación (época 30, F1 0.887) |
| Hardware | CPU (unos 25 s por época) |
| Entorno | Python 3.14, torch 2.14.1, torchvision 0.29.1, onnx 1.23.2, onnxruntime 1.31.0, Pillow 12.3.0 |

## 6.1 Evolución en validación
| Época | Loss | Val accuracy | Val F1 macro | Val recall roya |
|---|---|---|---|---|
| 1 | 0.788 | 0.654 | 0.670 | 0.910 |
| 5 | 0.158 | 0.801 | 0.783 | 0.925 |
| 10 | 0.064 | 0.848 | 0.840 | 0.896 |
| 15 | 0.027 | 0.877 | 0.870 | 0.881 |
| 20 | 0.031 | 0.872 | 0.870 | 0.910 |
| 25 | 0.018 | 0.882 | 0.874 | 0.925 |
| 30 | 0.023 | 0.891 | **0.887** | 0.925 |

En las épocas 2 y 3 la accuracy de validación cayó a 0.43, mientras el recall de roya subía a 0.98: el modelo marcaba casi todo como roya. Se estabilizó desde la época 5. La loss de entrenamiento (0.02) es muy inferior a la de validación, señal de sobreajuste esperable con un dataset pequeño. El historial completo está en `metrics.json`.

# 7. Resultados en prueba
Son 211 imágenes que el modelo no vio durante el entrenamiento ni la selección.

## 7.1 Métricas por clase
| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| `sana` | 0.933 | 0.903 | 0.918 | 31 |
| `roya_amarilla` | 0.851 | 0.940 | 0.894 | 67 |
| `otra_enfermedad` | 0.944 | 0.894 | 0.918 | 113 |
| **Macro** | 0.910 | 0.912 | 0.910 | 211 |
| **Accuracy** | | | **0.910** | 211 |

## 7.2 Matriz de confusión
| Real \ Predicho | sana | roya_amarilla | otra_enfermedad |
|---|---|---|---|
| **sana** | **28** | 1 | 2 |
| **roya_amarilla** | 0 | **63** | 4 |
| **otra_enfermedad** | 2 | 10 | **101** |

- Ninguna hoja con roya amarilla se clasificó como sana.
- El error dominante son 10 casos de `otra_enfermedad` predichos como `roya_amarilla` (falsos positivos). Probablemente son roya parda y septoria de JIC, por la similitud visual entre royas.

## 7.3 Accuracy por fuente
| Fuente | Accuracy | n |
|---|---|---|
| Etiopía | 0.984 | 61 |
| JIC | 0.880 | 150 |

## 7.4 Comparación con metas del MVP (documento 07)
| Métrica | Meta | Resultado | Estado |
|---|---|---|---|
| Accuracy | ≥ 90 % | 91.0 % | ✅ Cumple |
| Precision por clase | ≥ 88 % | Mínima 85.1 % (roya_amarilla) | ❌ No cumple |
| Recall por clase | ≥ 88 % | Mínimo 89.4 % (otra_enfermedad) | ✅ Cumple |
| F1 por clase | ≥ 88 % | Mínimo 89.4 % (roya_amarilla) | ✅ Cumple |

# 8. Exportación y trazabilidad
| Elemento | Valor |
|---|---|
| Archivo | `public/models/modelo_roya.onnx` |
| Tamaño | 6 098 112 bytes |
| Exportador | `torch.onnx.export` (TorchScript, `dynamo=False`), opset 13, eje de batch dinámico |
| Entrada / salida | `input` [N, 3, 224, 224] / `output` [N, 3] logits |
| SHA-256 | `1cf92a1f852907c3e43e77f171b95fe7f7c81cace9855ef0c63c4724c13feebc` |
| Verificación | ONNX Runtime frente a PyTorch sobre un lote de prueba: diferencia máxima de 1.9e-5 en logits |
| Reporte | `storage/ml/runs/roya-mobilenetv3-small-v1/metrics.json` |
| Fecha | 2026-10-26 03:45 UTC |

El cliente aplica softmax y el umbral operativo: una confianza menor a 75 % se registra como `no_concluyente`. El modelo no estima severidad; ese campo sigue siendo responsabilidad del técnico en campo.

Ni los pesos ni el dataset se versionan en Git (`.gitignore`: `/public/models/*.onnx`, `/storage/ml`). La trazabilidad se apoya en los hashes de esta sección y de la sección 4.1.

# 9. Limitaciones y riesgos
1. **Sin imágenes del Valle del Mantaro.** Todas las imágenes son de Etiopía y del Reino Unido. El rendimiento en campo local no está medido.
2. **Conjunto de prueba pequeño.** Con 31 imágenes sanas y 67 de roya, una sola imagen mueve las métricas de esas clases en 1.5–3 puntos. Los resultados son indicativos.
3. **Posible fuga entre conjuntos en la fuente Etiopía.** El split es por imagen, no por sesión o planta. Puede haber fotos de la misma hoja en entrenamiento y en prueba, lo que explicaría el 0.984. La cifra de JIC (0.880) es la referencia más realista.
4. **Sesgo de fondo.** Casi todas las imágenes de `etiopia/septoria` están tomadas sobre un pantalón jean azul. El modelo podría asociar ese fondo con `otra_enfermedad`.
5. **Diferencia de encuadre.** JIC muestra varias hojas por imagen, mientras la app pide una hoja a 20–30 cm.
6. **Desbalance.** `sana` (208) tiene menos de un tercio de `otra_enfermedad` (751). Se compensa con pesos de clase, no con más datos.
7. **Sobreajuste.** Loss final de entrenamiento 0.02 frente a una validación estable en 0.87–0.89.
8. **Latencia sin medir.** No se midió la latencia en el dispositivo objetivo. La meta es ≤ 3 s.

# 10. Próximos pasos
| Prioridad | Acción | Efecto esperado |
|---|---|---|
| Alta | Capturar un conjunto de prueba propio del Valle del Mantaro (≥ 50 por clase, etiquetado por un agrónomo) | Medir el rendimiento real en campo |
| Alta | Medir la latencia de inferencia en navegador y en el móvil objetivo | Validar la meta de ≤ 3 s |
| Media | Integrar IARI: roya anaranjada en `otra_enfermedad`, controles en `sana`, deficiencia de nitrógeno en `otra_enfermedad` | Más casos difíciles; subir la precision de roya y balancear `sana` |
| Media | Integrar recortes de NWRD guiados por máscara en `roya_amarilla` | Más roya amarilla en campo real |
| Media | Solicitar el dataset completo de JIC (19 172 imágenes) | Superar la meta de 1000 imágenes por clase |
| Media | Calibrar el umbral de 75 % con la curva confianza–error en validación | Ajustar cuándo el resultado debe ser `no_concluyente` |
| Baja | Split por sesión o planta cuando haya metadatos | Eliminar la fuga en la evaluación |

# 11. Reproducción
```bash
# 1. Copiar las fuentes originales (sin renombrar carpetas)
#    storage/ml/raw/etiopia/{stripe_rust,septoria,Healthy}
#    storage/ml/raw/jic/{yellowrust,healthy,brownrust,Septoria ,MIldew}

# 2. Generar el dataset
python scripts/prepare_dataset.py --clean

# 3. Entrenar, evaluar y exportar
pip install torch torchvision onnx onnxruntime pillow
python scripts/train_export_cnn.py --version roya-mobilenetv3-small-v1
```

Al publicar un modelo nuevo:
1. Usar un `--version` nuevo y actualizar `MODELO_VERSION` en `resources/js/lib/inference.js`.
2. Cambiar `CACHE` en `public/sw.js` para que el service worker descargue el modelo nuevo.
3. Registrar el entrenamiento en un documento como este.

# 12. Criterios de aceptación (documento 07)
| Criterio | Estado |
|---|---|
| Modelo evaluado con conjunto de prueba independiente | ✅ 211 imágenes, estratificadas por clase y fuente |
| Métricas reportadas por clase y globalmente | ✅ Sección 7 |
| Archivo exportado funciona con el runtime objetivo | ✅ Verificado con ONNX Runtime (CPU). ⏳ Falta la prueba de latencia en navegador y móvil |
| Versión del modelo y del dataset registradas | ✅ Secciones 4.1 y 8 |
| La inferencia no modifica la semántica de las clases | ✅ Orden `sana`, `roya_amarilla`, `otra_enfermedad`, igual que `inference.js` |
