"""Entrena MobileNetV3-Small (3 clases) y exporta public/models/modelo_roya.onnx.

Clases (orden fijo, igual que resources/js/lib/inference.js):
  0 sana | 1 roya_amarilla | 2 otra_enfermedad

Uso:
  python scripts/prepare_dataset.py            # arma storage/ml/dataset/ desde raw/
  python scripts/train_export_cnn.py
  python scripts/train_export_cnn.py --epochs 30 --version roya-mobilenetv3-small-v2

El dataset debe ser:
  storage/ml/dataset/sana/
  storage/ml/dataset/roya_amarilla/
  storage/ml/dataset/otra_enfermedad/
  storage/ml/dataset/manifest.csv   (opcional; lo genera prepare_dataset.py)

Split 70/15/15 estratificado por clase y fuente. Reporta precision/recall/F1 por clase,
matriz de confusion, recall de roya_amarilla y accuracy por fuente sobre el conjunto de
prueba, y lo guarda en storage/ml/runs/<version>/metrics.json.

Esto NO diagnostica desde el chat. El ONNX resultante lo consume Campo (onnxEngine.js).
No inventa severidad foliar. Confianza < 75 % sigue siendo no_concluyente en el cliente.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import random
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms

ROOT = Path(__file__).resolve().parents[1]
CLASES = ["sana", "roya_amarilla", "otra_enfermedad"]
INPUT_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
EXTENSIONES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
METAS = {"accuracy": 0.90, "precision": 0.88, "recall": 0.88, "f1": 0.88}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=ROOT / "storage" / "ml" / "dataset")
    parser.add_argument("--out", type=Path, default=ROOT / "public" / "models" / "modelo_roya.onnx")
    parser.add_argument("--runs", type=Path, default=ROOT / "storage" / "ml" / "runs")
    parser.add_argument("--version", default="roya-mobilenetv3-small-v1", help="Debe coincidir con MODELO_VERSION en inference.js")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--patience", type=int, default=6, help="Early stopping sobre F1 macro de validacion")
    parser.add_argument("--batch", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--workers", type=int, default=0)
    return parser.parse_args()


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)


def build_model() -> nn.Module:
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
    model.classifier[2].p = 0.3
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, len(CLASES))
    return model


def listar_muestras(data_dir: Path) -> list[dict]:
    """Lee manifest.csv si existe; si no, recorre las carpetas de clase (fuente = 'local')."""
    missing = [name for name in CLASES if not (data_dir / name).is_dir()]
    if missing:
        raise SystemExit(
            f"Faltan carpetas de clase en {data_dir}: {missing}. "
            "Ejecuta scripts/prepare_dataset.py o coloca JPG/PNG en cada carpeta."
        )

    manifest = data_dir / "manifest.csv"
    if manifest.is_file():
        with manifest.open(encoding="utf-8") as fh:
            muestras = [
                {"path": data_dir / row["archivo"], "clase": row["clase"], "fuente": row["fuente"]}
                for row in csv.DictReader(fh)
            ]
        faltan = [m for m in muestras if not m["path"].is_file()]
        if faltan:
            raise SystemExit(f"manifest.csv apunta a {len(faltan)} archivos inexistentes. Regenera el dataset.")
        return muestras

    return [
        {"path": p, "clase": clase, "fuente": "local"}
        for clase in CLASES
        for p in sorted((data_dir / clase).iterdir())
        if p.suffix.lower() in EXTENSIONES
    ]


def split_estratificado(muestras: list[dict], seed: int) -> dict[str, list[dict]]:
    """70/15/15 por cada par (clase, fuente) para que todas las fuentes aparezcan en test."""
    grupos = defaultdict(list)
    for m in muestras:
        grupos[(m["clase"], m["fuente"])].append(m)

    rng = random.Random(seed)
    split = {"train": [], "val": [], "test": []}
    for clave in sorted(grupos):
        items = sorted(grupos[clave], key=lambda m: str(m["path"]))
        rng.shuffle(items)
        n_test = max(1, round(0.15 * len(items)))
        n_val = max(1, round(0.15 * len(items)))
        split["test"] += items[:n_test]
        split["val"] += items[n_test : n_test + n_val]
        split["train"] += items[n_test + n_val :]
    return split


class HojasDataset(Dataset):
    def __init__(self, muestras: list[dict], transform):
        self.muestras = muestras
        self.transform = transform

    def __len__(self) -> int:
        return len(self.muestras)

    def __getitem__(self, i: int):
        m = self.muestras[i]
        with Image.open(m["path"]) as im:
            img = im.convert("RGB")
        return self.transform(img), CLASES.index(m["clase"])


def transforms_por_split():
    # Resize a 224x224 sin conservar aspecto: es lo que hace imageToNCHW en onnxEngine.js.
    train_tf = transforms.Compose(
        [
            transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
            transforms.ToTensor(),
            transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
        ]
    )
    eval_tf = transforms.Compose(
        [
            transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
        ]
    )
    return train_tf, eval_tf


def pesos_de_clase(muestras: list[dict]) -> torch.Tensor:
    conteo = [sum(1 for m in muestras if m["clase"] == c) for c in CLASES]
    total = sum(conteo)
    return torch.tensor([total / (len(CLASES) * max(n, 1)) for n in conteo], dtype=torch.float32)


@torch.no_grad()
def predecir(model: nn.Module, loader: DataLoader, device: torch.device) -> tuple[list[int], list[int]]:
    model.eval()
    y_true, y_pred = [], []
    for images, labels in loader:
        pred = model(images.to(device)).argmax(dim=1).cpu()
        y_true += labels.tolist()
        y_pred += pred.tolist()
    return y_true, y_pred


def metricas(y_true: list[int], y_pred: list[int]) -> dict:
    k = len(CLASES)
    matriz = [[0] * k for _ in range(k)]
    for t, p in zip(y_true, y_pred):
        matriz[t][p] += 1

    por_clase = {}
    for i, clase in enumerate(CLASES):
        tp = matriz[i][i]
        fp = sum(matriz[r][i] for r in range(k)) - tp
        fn = sum(matriz[i]) - tp
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        por_clase[clase] = {"precision": precision, "recall": recall, "f1": f1, "soporte": sum(matriz[i])}

    total = max(len(y_true), 1)
    return {
        "accuracy": sum(matriz[i][i] for i in range(k)) / total,
        "precision_macro": sum(c["precision"] for c in por_clase.values()) / k,
        "recall_macro": sum(c["recall"] for c in por_clase.values()) / k,
        "f1_macro": sum(c["f1"] for c in por_clase.values()) / k,
        "por_clase": por_clase,
        "matriz_confusion": {"filas_real_columnas_pred": CLASES, "valores": matriz},
    }


def train(model: nn.Module, loaders: dict, pesos: torch.Tensor, args, device: torch.device) -> list[dict]:
    criterion = nn.CrossEntropyLoss(weight=pesos.to(device))
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.3, patience=2)
    best_f1 = -1.0
    best_state = None
    sin_mejora = 0
    historial = []

    for epoch in range(1, args.epochs + 1):
        model.train()
        running = 0.0
        for images, labels in loaders["train"]:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            loss = criterion(model(images), labels)
            loss.backward()
            optimizer.step()
            running += loss.item() * images.size(0)

        val = metricas(*predecir(model, loaders["val"], device))
        loss_medio = running / max(len(loaders["train"].dataset), 1)
        historial.append({"epoch": epoch, "loss": loss_medio, "val_acc": val["accuracy"], "val_f1_macro": val["f1_macro"]})
        print(
            f"epoch {epoch}/{args.epochs} loss={loss_medio:.4f} "
            f"val_acc={val['accuracy']:.3f} val_f1={val['f1_macro']:.3f} "
            f"val_recall_roya={val['por_clase']['roya_amarilla']['recall']:.3f}"
        )
        scheduler.step(val["f1_macro"])

        if val["f1_macro"] > best_f1:
            best_f1 = val["f1_macro"]
            best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
            sin_mejora = 0
        else:
            sin_mejora += 1
            if sin_mejora >= args.patience:
                print(f"early stopping: {args.patience} epocas sin mejorar F1 de validacion")
                break

    if best_state:
        model.load_state_dict(best_state)
    return historial


def export_onnx(model: nn.Module, out: Path) -> None:
    model.eval()
    dummy = torch.zeros(1, 3, INPUT_SIZE, INPUT_SIZE)
    out.parent.mkdir(parents=True, exist_ok=True)
    torch.onnx.export(
        model,
        dummy,
        str(out),
        input_names=["input"],
        output_names=["output"],
        opset_version=13,
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        dynamo=False,
    )
    print(f"OK {out} ({out.stat().st_size} bytes)")


def verificar_onnx(model: nn.Module, out: Path, loader: DataLoader) -> float | None:
    """Compara logits PyTorch vs ONNX Runtime en un lote real. None si onnxruntime no esta instalado."""
    try:
        import onnxruntime as ort
    except ImportError:
        print("[aviso] onnxruntime no instalado: no se verifico equivalencia (pip install onnxruntime)")
        return None

    images, _ = next(iter(loader))
    model.eval()
    with torch.no_grad():
        esperado = model(images).numpy()
    sesion = ort.InferenceSession(str(out), providers=["CPUExecutionProvider"])
    obtenido = sesion.run(["output"], {"input": images.numpy()})[0]
    diff = float(abs(esperado - obtenido).max())
    print(f"equivalencia ONNX: max |diff logits| = {diff:.2e}")
    if diff > 1e-3:
        raise SystemExit("El ONNX exportado no reproduce los logits de PyTorch.")
    return diff


def main() -> int:
    args = parse_args()
    set_seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"device={device}")

    muestras = listar_muestras(args.data)
    if len(muestras) < 30:
        raise SystemExit(f"Dataset demasiado pequeño ({len(muestras)} fotos). Mínimo ~10 por clase.")
    split = split_estratificado(muestras, args.seed)
    for nombre, items in split.items():
        resumen = {c: sum(1 for m in items if m["clase"] == c) for c in CLASES}
        print(f"{nombre:5} n={len(items):4} {resumen}")

    train_tf, eval_tf = transforms_por_split()
    loaders = {
        "train": DataLoader(HojasDataset(split["train"], train_tf), batch_size=args.batch, shuffle=True, num_workers=args.workers),
        "val": DataLoader(HojasDataset(split["val"], eval_tf), batch_size=args.batch, shuffle=False, num_workers=args.workers),
        "test": DataLoader(HojasDataset(split["test"], eval_tf), batch_size=args.batch, shuffle=False, num_workers=args.workers),
    }
    pesos = pesos_de_clase(split["train"])
    print(f"pesos de clase {dict(zip(CLASES, [round(p, 3) for p in pesos.tolist()]))}")

    model = build_model().to(device)
    historial = train(model, loaders, pesos, args, device)
    model = model.cpu()

    y_true, y_pred = predecir(model, loaders["test"], torch.device("cpu"))
    test = metricas(y_true, y_pred)
    por_fuente = defaultdict(lambda: [0, 0])
    for m, t, p in zip(split["test"], y_true, y_pred):
        por_fuente[m["fuente"]][0] += int(t == p)
        por_fuente[m["fuente"]][1] += 1
    test["accuracy_por_fuente"] = {f: {"accuracy": ok / n, "n": n} for f, (ok, n) in sorted(por_fuente.items())}

    print("\n=== TEST ===")
    print(f"accuracy={test['accuracy']:.3f} f1_macro={test['f1_macro']:.3f}")
    for clase, c in test["por_clase"].items():
        print(f"  {clase:16} P={c['precision']:.3f} R={c['recall']:.3f} F1={c['f1']:.3f} n={c['soporte']}")
    print(f"  matriz (fila=real, col=pred) {CLASES}: {test['matriz_confusion']['valores']}")
    for fuente, f in test["accuracy_por_fuente"].items():
        print(f"  fuente {fuente:10} acc={f['accuracy']:.3f} n={f['n']}")

    cumple = {
        "accuracy": test["accuracy"] >= METAS["accuracy"],
        "precision": all(c["precision"] >= METAS["precision"] for c in test["por_clase"].values()),
        "recall": all(c["recall"] >= METAS["recall"] for c in test["por_clase"].values()),
        "f1": all(c["f1"] >= METAS["f1"] for c in test["por_clase"].values()),
    }
    print(f"  metas MVP (doc 07): {cumple}")

    export_onnx(model, args.out)
    diff = verificar_onnx(model, args.out, loaders["test"])

    run_dir = args.runs / args.version
    run_dir.mkdir(parents=True, exist_ok=True)
    manifest = args.data / "manifest.csv"
    reporte = {
        "modelo_version": args.version,
        "fecha": datetime.now(timezone.utc).isoformat(),
        "onnx": str(args.out),
        "onnx_sha256": hashlib.sha256(args.out.read_bytes()).hexdigest(),
        "onnx_max_diff": diff,
        "dataset_manifest_sha256": hashlib.sha256(manifest.read_bytes()).hexdigest() if manifest.is_file() else None,
        "clases": CLASES,
        "split": {k: len(v) for k, v in split.items()},
        "hiperparametros": {k: v for k, v in vars(args).items() if k in {"epochs", "patience", "batch", "lr", "seed"}},
        "historial": historial,
        "test": test,
        "metas": METAS,
        "cumple_metas": cumple,
    }
    (run_dir / "metrics.json").write_text(json.dumps(reporte, indent=2, ensure_ascii=False), encoding="utf-8")
    with (run_dir / "split.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["split", "archivo", "clase", "fuente"])
        for nombre, items in split.items():
            for m in items:
                writer.writerow([nombre, m["path"].relative_to(args.data).as_posix(), m["clase"], m["fuente"]])
    print(f"reporte: {run_dir / 'metrics.json'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
