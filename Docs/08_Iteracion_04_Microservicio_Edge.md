**DOCUMENTO TÉCNICO**
**08. Iteración 04 - Microservicio y Agente Edge**
*Inferencia local, persistencia offline y servicios de IA*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Objetivo
Implementar la capacidad Edge que permite realizar diagnóstico sin Internet. La arquitectura mejorada establece que la PWA/cliente puede ejecutar la inferencia local; FastAPI se conserva como microservicio especializado para escenarios complementarios, servicios auxiliares o procesamiento distribuido.
| Decisión de arquitectura | La ruta crítica offline no depende de FastAPI. El cliente ejecuta el modelo localmente. FastAPI complementa la solución cuando se requiera inferencia remota, administración del modelo o servicios auxiliares. |
|---|---|

# 2. Componentes
| Componente | Tecnología | Función |
|---|---|---|
| Cliente PWA | React + PWA | Captura, UI, almacenamiento y ejecución local. |
| Runtime IA | ONNX Runtime Web / TFLite según implementación | Carga y ejecuta el modelo optimizado. |
| Almacenamiento local | IndexedDB o SQLite según dispositivo | Persistir diagnósticos y cola. |
| Microservicio IA | Python 3.11 + FastAPI | Servicio desacoplado para inferencia auxiliar, pruebas o procesamiento cloud/edge. |
| Modelo | ONNX/TFLite | Artefacto versionado de IA. |
| Sincronizador | REST + cola local | Entrega diferida e idempotente. |

# 3. Estructura sugerida
```
edge/
├── app/
│   ├── api.py
│   ├── model.py
│   ├── severity.py
│   ├── storage.py
│   ├── sync.py
│   └── health.py
├── models/
│   └── modelo_roya.onnx
├── tests/
├── requirements.txt
└── Dockerfile
```

# 4. Flujo de inferencia local
1. Capturar o cargar imagen.
2. Validar tamaño y formato.
3. Redimensionar y normalizar.
4. Ejecutar inferencia en runtime local.
5. Obtener probabilidades y clase ganadora.
6. Evaluar umbral de incertidumbre.
7. Calcular severidad a partir de segmentación/metodología definida.
8. Crear UUID, guardar evidencia y metadatos localmente.
9. Mostrar resultado sin requerir Internet.
# 5. Endpoint auxiliar FastAPI
| Método | Ruta | Propósito |
|---|---|---|
| GET | /health | Verificar disponibilidad. |
| GET | /model/info | Informar versión del modelo. |
| POST | /predict | Inferencia cuando el flujo requiera servicio FastAPI. |
| POST | /validate | Validación técnica de una muestra, si se habilita. |
| POST | /sync/ack | Confirmación o soporte técnico para sincronización, si se diseña así. |

# 6. Código base de inferencia auxiliar
```python
from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io

app = FastAPI(title="Roya Edge AI")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    # Preprocesamiento + runtime ONNX/TFLite
    # outputs = session.run(...)
    return {
        "success": True,
        "data": {
            "clase": "roya_amarilla",
            "confianza": 94.5,
            "severidad": 23.7
        }
    }
```

# 7. Cálculo de severidad
La severidad debe tratarse como una métrica distinta de la confianza del modelo. Como línea base, puede utilizarse segmentación por color en HSV para zonas compatibles con lesiones amarillas/naranjas, pero esta técnica debe validarse con imágenes reales y no considerarse automáticamente equivalente a una medición agronómica validada.
```python
import cv2

def calcular_severidad(img_path):
    img = cv2.imread(img_path)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, (20, 100, 100), (35, 255, 255))
    pixeles = (mask > 0).sum()
    total = img.shape[0] * img.shape[1]
    return (pixeles / total) * 100
```

# 8. Persistencia y cola offline
- Cada registro local incluye UUID y modelo_version.
- La cola conserva orden y estado de procesamiento.
- Los reintentos no deben generar duplicados.
- Los errores permanentes quedan registrados para revisión técnica.
- El usuario puede continuar tomando muestras aunque la cola tenga elementos pendientes.
# 9. Criterios de aceptación
- El cliente realiza una inferencia sin conexión.
- El resultado local queda disponible para consulta inmediata.
- La cola persiste tras recargar/cerrar la aplicación cuando el almacenamiento elegido lo soporte.
- El servidor reconoce reintentos por UUID.
- La latencia objetivo del MVP es ≤ 3 s en el escenario de referencia.
# 10. Evidencias
- Pruebas offline con Wi-Fi/datos deshabilitados.
- Capturas de IndexedDB/SQLite.
- Logs de sincronización.
- Prueba del endpoint /health.
- Medición de latencia por dispositivo.
