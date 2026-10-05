"""Exporta un ONNX de 3 logits (entrada NCHW 224) para cablear ONNX Runtime Web.

No es un modelo fitosanitario entrenado: ReduceMean + * 0 ⇒ softmax uniforme
⇒ no_concluyente (< 75 %). Reemplazar por MobileNetV3-Small exportado (Docs/07).
"""

from pathlib import Path

import numpy as np
from onnx import TensorProto, helper, numpy_helper, save

root = Path(__file__).resolve().parents[1]
out = root / "public" / "models" / "modelo_roya.onnx"
out.parent.mkdir(parents=True, exist_ok=True)

x = helper.make_tensor_value_info("input", TensorProto.FLOAT, [1, 3, 224, 224])
y = helper.make_tensor_value_info("output", TensorProto.FLOAT, [1, 3])
zero = numpy_helper.from_array(np.array(0, dtype=np.float32), name="zero")

graph = helper.make_graph(
    [
        helper.make_node("ReduceMean", ["input"], ["gap"], axes=[2, 3], keepdims=0),
        helper.make_node("Mul", ["gap", "zero"], ["output"]),
    ],
    "roya_placeholder",
    [x],
    [y],
    [zero],
)

model = helper.make_model(
    graph,
    opset_imports=[helper.make_opsetid("", 13)],
    producer_name="proyecto_roya_placeholder",
)
model.ir_version = 8
save(model, out)
print(f"OK {out}")
