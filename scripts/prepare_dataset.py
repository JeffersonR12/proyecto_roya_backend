"""Arma storage/ml/dataset/ a partir de las descargas originales en storage/ml/raw/.

Cada fuente se copia tal cual a raw/<fuente>/ y aqui se mapea a las 3 clases del modelo
(mismo orden que resources/js/lib/inference.js):
  sana | roya_amarilla | otra_enfermedad

Uso:
  python scripts/prepare_dataset.py
  python scripts/prepare_dataset.py --max-side 640 --clean

Hace:
  - Mapea carpetas de cada fuente a una clase (ignora mayusculas y espacios).
  - Descarta duplicados exactos (md5) y casi identicos (dHash) en todo el conjunto.
  - Convierte a RGB y reduce el lado mayor a --max-side (la red usa 224x224).
  - Renombra a <fuente>_<carpeta>_<n>.jpg para no pisar archivos entre fuentes.
  - Escribe storage/ml/dataset/manifest.csv con fuente y origen de cada imagen,
    para que el entrenamiento estratifique y reporte metricas por fuente.

Nunca modifica raw/.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import shutil
import sys
from collections import Counter
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CLASES = ["sana", "roya_amarilla", "otra_enfermedad"]
EXTENSIONES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# fuente -> {carpeta normalizada: clase}. Carpetas no listadas se ignoran y se avisan.
FUENTES = {
    "etiopia": {
        "stripe_rust": "roya_amarilla",
        "healthy": "sana",
        "septoria": "otra_enfermedad",
    },
    "jic": {
        "yellowrust": "roya_amarilla",
        "healthy": "sana",
        "brownrust": "otra_enfermedad",
        "septoria": "otra_enfermedad",
        "mildew": "otra_enfermedad",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw", type=Path, default=ROOT / "storage" / "ml" / "raw")
    parser.add_argument("--out", type=Path, default=ROOT / "storage" / "ml" / "dataset")
    parser.add_argument("--max-side", type=int, default=640)
    parser.add_argument("--clean", action="store_true", help="Vacia las carpetas de clase antes de generar.")
    return parser.parse_args()


def normalizar(nombre: str) -> str:
    return nombre.strip().lower().replace(" ", "_")


def dhash(img: Image.Image, size: int = 8) -> int:
    gris = img.convert("L").resize((size + 1, size), Image.BILINEAR)
    px = gris.tobytes()
    bits = 0
    for fila in range(size):
        for col in range(size):
            i = fila * (size + 1) + col
            bits = (bits << 1) | (px[i] > px[i + 1])
    return bits


def preparar(args: argparse.Namespace) -> int:
    if args.clean:
        for clase in CLASES:
            shutil.rmtree(args.out / clase, ignore_errors=True)
    for clase in CLASES:
        (args.out / clase).mkdir(parents=True, exist_ok=True)

    vistos_md5: dict[str, str] = {}
    vistos_dhash: dict[int, str] = {}
    filas = []
    conteo = Counter()
    descartes = Counter()

    for fuente, mapa in FUENTES.items():
        base = args.raw / fuente
        if not base.is_dir():
            print(f"[aviso] falta {base}, se omite la fuente")
            continue

        for carpeta in sorted(p for p in base.iterdir() if p.is_dir()):
            clave = normalizar(carpeta.name)
            clase = mapa.get(clave)
            if clase is None:
                print(f"[aviso] {fuente}/{carpeta.name!r} no esta mapeada, se ignora")
                continue

            archivos = sorted(p for p in carpeta.iterdir() if p.suffix.lower() in EXTENSIONES)
            for n, origen in enumerate(archivos):
                datos = origen.read_bytes()
                md5 = hashlib.md5(datos).hexdigest()
                if md5 in vistos_md5:
                    descartes["duplicado_exacto"] += 1
                    continue

                try:
                    with Image.open(origen) as im:
                        img = ImageOps.exif_transpose(im).convert("RGB")
                except Exception as error:  # imagen corrupta
                    print(f"[aviso] no se pudo leer {origen}: {error}")
                    descartes["ilegible"] += 1
                    continue

                firma = dhash(img)
                if firma in vistos_dhash:
                    descartes["casi_identico"] += 1
                    continue

                img.thumbnail((args.max_side, args.max_side), Image.LANCZOS)
                nombre = f"{fuente}_{clave}_{n:04d}.jpg"
                destino = args.out / clase / nombre
                img.save(destino, "JPEG", quality=92)

                rel = str(origen.relative_to(args.raw)).replace("\\", "/")
                vistos_md5[md5] = rel
                vistos_dhash[firma] = rel
                conteo[(clase, fuente)] += 1
                filas.append(
                    {
                        "archivo": f"{clase}/{nombre}",
                        "clase": clase,
                        "fuente": fuente,
                        "origen": rel,
                        "md5": md5,
                    }
                )

    with (args.out / "manifest.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=["archivo", "clase", "fuente", "origen", "md5"])
        writer.writeheader()
        writer.writerows(filas)

    print("\nclase            fuente     imagenes")
    for clase in CLASES:
        total = 0
        for (c, fuente), n in sorted(conteo.items()):
            if c == clase:
                print(f"{clase:16} {fuente:10} {n}")
                total += n
        print(f"{clase:16} {'TOTAL':10} {total}")
    print(f"\ndescartadas: {dict(descartes)}")
    print(f"manifest: {args.out / 'manifest.csv'} ({len(filas)} filas)")
    return 0


if __name__ == "__main__":
    sys.exit(preparar(parse_args()))
