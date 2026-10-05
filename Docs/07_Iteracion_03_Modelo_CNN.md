**DOCUMENTO TÉCNICO**
**07. Iteración 03 - Dataset y Entrenamiento del Modelo CNN**
*Preparación de datos, entrenamiento, evaluación y exportación*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Objetivo
Construir una primera versión reproducible del modelo CNN para clasificar hojas de trigo en Sana, Roya Amarilla y Otra Enfermedad, y dejarla preparada para inferencia local en formato optimizado.
# 2. Clases objetivo
| Clase | Etiqueta técnica | Descripción |
|---|---|---|
| 0 | sana | Hoja sin signos compatibles con las clases de enfermedad consideradas. |
| 1 | roya_amarilla | Signos compatibles con roya amarilla. |
| 2 | otra_enfermedad | Enfermedad diferente de roya amarilla o muestra no incluida en las otras clases. |

# 3. Diseño del dataset
- Objetivo inicial: al menos 1000 imágenes por clase como punto de partida, sujeto a disponibilidad y calidad.
- Separación por conjuntos: 70 % entrenamiento, 15 % validación y 15 % prueba.
- Evitar que imágenes prácticamente idénticas de una misma sesión aparezcan en train y test.
- Documentar fuente, licencia, fecha, dispositivo y contexto de captura cuando sea posible.
- Mantener una versión del dataset para cada experimento.
# 4. Preprocesamiento y aumento
- Redimensionamiento a 224x224 para la línea base MobileNetV3-Small.
- Normalización compatible con pesos preentrenados.
- Data augmentation: rotación moderada, flip, brillo, zoom y pequeñas variaciones que representen condiciones de campo.
- Evitar transformaciones que creen síntomas irreales y perjudiquen la validez agronómica.
# 5. Arquitectura del modelo
| Elemento | Configuración inicial |
|---|---|
| Backbone | MobileNetV3-Small preentrenado. |
| Transfer learning | Pesos iniciales de ImageNet. |
| Entrada | 224 x 224 x 3. |
| Cabeza | Global Average Pooling + Dropout 0.3 + clasificación de 3 clases. |
| Optimizador | Adam, lr inicial 0.001; ajustar mediante validación. |
| Loss | Cross Entropy. |
| Épocas | Hasta 30 con Early Stopping. |
| Exportación | ONNX y/o TFLite según runtime final. |

# 6. Script base
```python
import torch
import torch.nn as nn
from torchvision import models, transforms

model = models.mobilenet_v3_small(weights='IMAGENET1K_V1')
model.classifier[3] = nn.Linear(model.classifier[3].in_features, 3)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])
```

# 7. Métricas y protocolo de evaluación
| Métrica | Meta inicial | Interpretación |
|---|---|---|
| Accuracy | ≥ 90 % | Rendimiento global sobre el conjunto de evaluación. |
| Precision | ≥ 88 % | Proporción de predicciones positivas correctas. |
| Recall | ≥ 88 % | Capacidad para detectar muestras de la clase. |
| F1-Score | ≥ 88 % | Balance entre precision y recall. |

Estas metas son criterios de aceptación propuestos para el MVP; no representan resultados experimentales ya obtenidos.
# 8. Evaluaciones adicionales fundamentales
- Matriz de confusión por clase.
- Recall específico de Roya Amarilla, por tratarse de la clase crítica.
- Curvas de entrenamiento de loss y accuracy.
- Prueba con imágenes capturadas en condiciones reales y no solo dataset público.
- Análisis de falsos positivos y falsos negativos.
- Calibración/umbral de incertidumbre para el estado “Resultado no concluyente”.
- Medición de latencia y memoria en el dispositivo objetivo.
# 9. Exportación y trazabilidad
```json
torch.onnx.export(
    model,
    dummy_input,
    "modelo_roya.onnx",
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}}
)
```

# 10. Criterios de aceptación
- Modelo evaluado con conjunto de prueba independiente.
- Métricas reportadas por clase y globalmente.
- Archivo exportado funciona con el runtime objetivo.
- Versión del modelo y versión del dataset quedan registradas.
- La inferencia del modelo no modifica la semántica de las clases.
