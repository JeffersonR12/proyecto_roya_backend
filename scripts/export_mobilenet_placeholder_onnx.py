"""MODELO PLACEHOLDER — no es el modelo entrenado; solo para validar el pipeline de inferencia Edge.

Genera public/models/modelo_roya.onnx con la MISMA arquitectura y el MISMO contrato que
exporta scripts/train_export_cnn.py, para poder probar extremo a extremo la PWA
(carga en ONNX Runtime Web, preprocesamiento, softmax, umbral, IndexedDB y sincronizacion)
mientras no se dispone del modelo entrenado con el dataset de campo.

Contrato (debe coincidir con resources/js/lib/inference.js y onnxEngine.js):
  - Arquitectura: torchvision MobileNetV3-Small, cabeza de 3 clases
    CLASES = ["sana", "roya_amarilla", "otra_enfermedad"]
    ("no_concluyente" NO es salida de la red: lo asigna applyUmbral() si confianza < 75 %).
  - Entrada:  "input"  float32 [batch, 3, 224, 224]  (NCHW, normalizado ImageNet en JS)
  - Salida:   "output" float32 [batch, 3]            (logits SIN softmax; el softmax se aplica en JS)
  - opset 13 y exportador TorchScript (dynamo=False), igual que train_export_cnn.py.
    ONNX Runtime Web 1.21 soporta opset 13 en el backend WASM.

Comportamiento deliberado: la ultima capa lineal se inicializa en cero, por lo que los logits
son siempre [0, 0, 0] -> softmax uniforme (33.33 %) -> la PWA clasifica "no_concluyente".
Asi el placeholder ejecuta el computo completo de MobileNetV3 (tamano y tiempo de inferencia
reales) pero NUNCA emite un diagnostico falso de roya amarilla.

Uso:
  python scripts/export_mobilenet_placeholder_onnx.py
  python scripts/export_mobilenet_placeholder_onnx.py --out ruta/otro.onnx
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import torch
from torch import nn
from torchvision.models import mobilenet_v3_small

ROOT = Path(__file__).resolve().parents[1]
CLASES = ["sana", "roya_amarilla", "otra_enfermedad"]
INPUT_SIZE = 224
OPSET = 13


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, default=ROOT / "public" / "models" / "modelo_roya.onnx")
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def build_placeholder(seed: int) -> nn.Module:
    torch.manual_seed(seed)
    # weights=None: no descarga pesos de internet; la red queda con inicializacion aleatoria.
    model = mobilenet_v3_small(weights=None)
    in_features = model.classifier[3].in_features
    head = nn.Linear(in_features, len(CLASES))
    nn.init.zeros_(head.weight)
    nn.init.zeros_(head.bias)
    model.classifier[3] = head
    return model.eval()


def export(model: nn.Module, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    dummy = torch.zeros(1, 3, INPUT_SIZE, INPUT_SIZE)
    with torch.no_grad():
        torch.onnx.export(
            model,
            dummy,
            str(out),
            input_names=["input"],
            output_names=["output"],
            opset_version=OPSET,
            dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
            dynamo=False,
        )


def verify(out: Path) -> None:
    """Comprueba con onnxruntime (CPU) que el contrato de entrada/salida es el esperado."""
    try:
        import numpy as np
        import onnxruntime as ort
    except ImportError:
        print("AVISO: onnxruntime/numpy no instalados; se omite la verificacion.")
        return

    session = ort.InferenceSession(str(out), providers=["CPUExecutionProvider"])
    inp = session.get_inputs()[0]
    outp = session.get_outputs()[0]
    x = np.random.default_rng(0).standard_normal((1, 3, INPUT_SIZE, INPUT_SIZE)).astype(np.float32)
    logits = session.run([outp.name], {inp.name: x})[0]

    if logits.shape != (1, len(CLASES)):
        raise SystemExit(f"ERROR: salida {logits.shape}, se esperaba (1, {len(CLASES)})")

    print(f"Verificacion onnxruntime: entrada '{inp.name}' {inp.shape} -> salida '{outp.name}' {list(logits.shape)}")
    print(f"Logits de prueba: {logits.round(4).tolist()} (esperado [[0, 0, 0]] -> no_concluyente)")


def main() -> int:
    args = parse_args()
    model = build_placeholder(args.seed)
    params = sum(p.numel() for p in model.parameters())

    export(model, args.out)
    verify(args.out)

    size = args.out.stat().st_size
    print(f"OK {args.out}")
    print(f"Parametros: {params:,} | Tamano: {size:,} bytes ({size / 1024 / 1024:.2f} MB) | opset {OPSET}")
    print()
    print("=" * 78)
    print("  ADVERTENCIA: MODELO PLACEHOLDER. NO ES EL MODELO ENTRENADO.")
    print("  Todas las predicciones seran 'no_concluyente' (33.33 %).")
    print("  Solo valida el pipeline Edge. Reemplazar con scripts/train_export_cnn.py.")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
