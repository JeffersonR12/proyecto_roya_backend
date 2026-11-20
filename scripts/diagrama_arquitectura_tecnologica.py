"""
Diagrama de Arquitectura Tecnológica — RiwiScan (sistema Edge-Cloud para la
detección temprana de roya amarilla).

Genera un PNG en alta resolución (300 dpi por defecto) listo para insertar en
el informe, a partir de la arquitectura REALMENTE implementada en el
repositorio (sección 4 del informe final).

Uso:
    pip install matplotlib
    python scripts/diagrama_arquitectura_tecnologica.py
    python scripts/diagrama_arquitectura_tecnologica.py --incluir-planificado
    python scripts/diagrama_arquitectura_tecnologica.py --salida mi_figura.png --dpi 600

--incluir-planificado agrega, en una columna con borde discontinuo, los
componentes previstos en la planificación (FastAPI, Docker, hardware Edge)
que NO forman parte de la implementación actual.
"""

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # sin ventana: solo exporta el archivo
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

NOMBRE_SISTEMA = "RiwiScan"

# ----------------------------------------------------------------------------
# Paleta (azules, grises y verdes) por capa: (fondo de banda, relleno, borde)
# ----------------------------------------------------------------------------
CAPAS = {
    "cliente": ("#EEF7EE", "#D4EDD5", "#2E7D32"),
    "comunicacion": ("#F3F4F6", "#E2E6EB", "#5F6B7A"),
    "servidor": ("#EAF2FB", "#C9DFF5", "#1F4E79"),
    "datos": ("#EEF1F3", "#D3DCE1", "#37474F"),
}
TEXTO = "#1B1F24"
TEXTO_SUAVE = "#3D4651"
FLECHA = "#2B3440"
PLANIFICADO = "#8A929C"

plt.rcParams["font.family"] = ["Arial", "DejaVu Sans"]


# ----------------------------------------------------------------------------
# Utilidades de dibujo
# ----------------------------------------------------------------------------
def banda(ax, y0, y1, x1, capa, etiqueta):
    """Franja de fondo de una capa con su rótulo vertical a la izquierda."""
    fondo, _, borde = CAPAS[capa]
    ax.add_patch(FancyBboxPatch((1, y0), x1 - 1, y1 - y0,
                                boxstyle="round,pad=0,rounding_size=1.5",
                                fc=fondo, ec="none", zorder=0))
    ax.add_patch(FancyBboxPatch((1, y0), 11.5, y1 - y0,
                                boxstyle="round,pad=0,rounding_size=1.5",
                                fc=borde, ec="none", zorder=1))
    ax.text(6.75, (y0 + y1) / 2, etiqueta, rotation=90, ha="center",
            va="center", color="white", fontsize=10.5, fontweight="bold",
            linespacing=1.3, zorder=2)


def caja(ax, x0, y0, x1, y1, titulo, detalle="", capa="servidor",
         discontinua=False, contenedor=False, titulo_izq=False):
    """Bloque con título en negrita y detalle en texto normal."""
    _, relleno, borde = CAPAS[capa]
    if contenedor:
        relleno = "white"
    if discontinua:
        relleno, borde = "white", PLANIFICADO
    ax.add_patch(FancyBboxPatch((x0, y0), x1 - x0, y1 - y0,
                                boxstyle="round,pad=0,rounding_size=1.1",
                                fc=relleno, ec=borde,
                                lw=1.1 if contenedor else 1.4,
                                ls=(0, (4, 3)) if discontinua else "-",
                                zorder=3 if not contenedor else 2))
    cx = (x0 + x1) / 2
    color_titulo = TEXTO
    if discontinua:
        color_titulo = PLANIFICADO
    elif contenedor:
        color_titulo = borde
    if titulo_izq:
        ax.text(x0 + 1.5, y1 - 1.2, titulo, ha="left", va="top",
                fontsize=9.5, fontweight="bold", color=color_titulo, zorder=4)
        return
    ax.text(cx, y1 - 1.3, titulo, ha="center", va="top", fontsize=9.5,
            fontweight="bold", color=color_titulo, zorder=4)
    if detalle:
        ax.text(cx, y1 - 3.7, detalle, ha="center", va="top", fontsize=8.2,
                color=PLANIFICADO if discontinua else TEXTO_SUAVE,
                linespacing=1.35, zorder=4)


def flecha(ax, origen, destino, texto="", lado="right", discontinua=False,
           desplazamiento=1.0):
    """Flecha de flujo de datos con rótulo opcional junto a su punto medio."""
    ax.annotate("", xy=destino, xytext=origen, zorder=5,
                arrowprops={"arrowstyle": "-|>", "color": FLECHA, "lw": 1.3,
                            "mutation_scale": 13, "shrinkA": 0, "shrinkB": 0,
                            "ls": (0, (4, 3)) if discontinua else "-"})
    if texto:
        mx = (origen[0] + destino[0]) / 2
        my = (origen[1] + destino[1]) / 2
        vertical = abs(origen[0] - destino[0]) < abs(origen[1] - destino[1])
        if vertical:
            dx = desplazamiento if lado == "right" else -desplazamiento
            ax.text(mx + dx, my, texto, ha="left" if lado == "right" else "right",
                    va="center", fontsize=7.6, color=FLECHA, style="italic",
                    linespacing=1.25, zorder=6)
        else:
            ax.text(mx, my + 0.9, texto, ha="center", va="bottom", fontsize=7.6,
                    color=FLECHA, style="italic", linespacing=1.25, zorder=6)


# ----------------------------------------------------------------------------
# Diagrama
# ----------------------------------------------------------------------------
def dibujar(incluir_planificado: bool):
    ancho = 192 if incluir_planificado else 160
    fig, ax = plt.subplots(figsize=(ancho / 10, 11.4))
    ax.set_xlim(0, ancho)
    ax.set_ylim(-4, 110)
    ax.axis("off")
    fig.patch.set_facecolor("white")

    ax.text(80, 107.5,
            f"Arquitectura tecnológica de {NOMBRE_SISTEMA}",
            ha="center", va="center", fontsize=15, fontweight="bold", color=TEXTO)
    ax.text(80, 104.3,
            "Sistema Edge-Cloud para la detección temprana de roya amarilla en trigo "
            "(inferencia en el navegador, sincronización diferida)",
            ha="center", va="center", fontsize=10, color=TEXTO_SUAVE)

    x_fin = 158
    # ---------------- Bandas de capa ----------------
    banda(ax, 73, 101, x_fin, "cliente", "Capa de cliente\n(Edge / usuario)")
    banda(ax, 57, 71, x_fin, "comunicacion", "Capa de\ncomunicación")
    banda(ax, 21, 55, x_fin, "servidor", "Capa de servidor\n(Core / Cloud)")
    banda(ax, 1, 19, x_fin, "datos", "Capa de\ndatos")

    # ---------------- Capa de cliente ----------------
    caja(ax, 15, 76, 37, 94, "Usuario en campo",
         "Agricultor · Técnico\nAdministrador\n\nCámara y GPS\ndel dispositivo",
         "cliente")
    caja(ax, 41, 74, 156.5, 98.5,
         "Navegador Chrome / Edge  ·  PWA instalable (HTTPS o localhost)",
         capa="cliente", contenedor=True, titulo_izq=True)
    caja(ax, 44, 76, 67, 94, "Interfaz PWA",
         "React 19 · Vite 7\nTailwind CSS 4\n\nEscáner · HITL\nAlertas · Reportes",
         "cliente")
    caja(ax, 74, 76, 97, 94, "Inferencia local",
         "ONNX Runtime Web 1.21\n(WebAssembly)\n\nmodelo_roya.onnx\nsoftmax + umbral",
         "cliente")
    caja(ax, 104, 76, 127, 94, "Almacenamiento local",
         "IndexedDB «roya-edge»\n\nDiagnósticos:\npending · synced · error",
         "cliente")
    caja(ax, 132, 76, 155, 94, "Modo sin conexión",
         "Service Worker\n+ Cache API\n\nCachea /build, /onnx\ny /models",
         "cliente")

    flecha(ax, (37, 85), (44, 85), "foto")
    flecha(ax, (67, 85), (74, 85), "tensor")
    flecha(ax, (97, 85), (104, 85), "resultado")

    # ---------------- Capa de comunicación ----------------
    caja(ax, 15, 60, 37, 69, "SMTP (externo)",
         "Correo de recuperación\nde contraseña", "comunicacion")
    caja(ax, 44, 60, 97, 69, "REST / JSON sobre HTTP(S) · Axios",
         "Cookie de sesión Sanctum + token CSRF\n"
         "Consultas, revisión HITL y reportes", "comunicacion")
    caja(ax, 104, 60, 155, 69, "Sincronización diferida (offline-first)",
         "Evento «online» + reintento periódico con backoff\n"
         "Lotes HTTP: no se usa MQTT ni WebSockets", "comunicacion")

    flecha(ax, (52, 76), (52, 69), "petición", lado="left")
    flecha(ax, (59, 69), (59, 76), "JSON")
    flecha(ax, (112, 76), (112, 69), "lote JSON + imagen base64", lado="left")
    flecha(ax, (120, 69), (120, 76), "estado por ítem")

    # ---------------- Capa de servidor ----------------
    caja(ax, 15, 22, 156.5, 52.5,
         "Servidor de aplicaciones  ·  Apache (XAMPP) / php artisan serve  ·  "
         "Laravel 12 sobre PHP 8.4",
         capa="servidor", contenedor=True, titulo_izq=True)
    caja(ax, 18, 43, 153.5, 48.3,
         "Rutas /api/* y web  ·  Middleware: auth:sanctum · tenant · throttle · EnsureRole",
         capa="servidor")
    caja(ax, 18, 32.5, 51, 40.5, "Autenticación",
         "Login · Registro\nRecuperación de contraseña", "servidor")
    caja(ax, 54, 32.5, 86, 40.5, "Diagnósticos y consultas",
         "DiagnosticoController (HITL)\nConsultaController", "servidor")
    caja(ax, 89, 32.5, 120, 40.5, "Reportes",
         "ReportController\n/reports/summary · /export", "servidor")
    caja(ax, 123, 32.5, 153.5, 40.5, "Sincronización",
         "SyncController\nSyncDiagnosticosRequest", "servidor")
    caja(ax, 18, 24, 153.5, 30,
         "Servicios de dominio: DiagnosticoSyncService · EvidenciaStore · "
         "AlertaService · ReporteService  ·  Eloquent ORM",
         capa="servidor")

    flecha(ax, (62, 60), (62, 52.5), "petición", lado="left")
    flecha(ax, (70, 52.5), (70, 60), "JSON")
    flecha(ax, (128, 60), (128, 52.5), "POST /api/sync/diagnosticos", lado="left")
    flecha(ax, (135, 52.5), (135, 60), "confirmed · conflict ·\nalready_exists · rejected")
    flecha(ax, (26, 52.5), (26, 60), "enlace\nfirmado")

    # ---------------- Capa de datos ----------------
    caja(ax, 18, 3, 62, 14.5, "MariaDB 10.4.32 (compatible con MySQL)",
         "XAMPP · 127.0.0.1:3307 · base proyecto_roya\nEntorno real de trabajo / producción",
         "datos")
    caja(ax, 68, 3, 107, 14.5, "SQLite",
         "Conexión por defecto (.env.example)\nPHPUnit en memoria", "datos")
    caja(ax, 113, 3, 153.5, 14.5, "storage/app (disco local)",
         "Evidencias fotográficas\n(base64 decodificado → archivo)", "datos")

    flecha(ax, (40, 24), (40, 14.5), "Eloquent: INSERT · SELECT · UPDATE")
    flecha(ax, (87.5, 24), (87.5, 14.5), "solo pruebas", discontinua=True)
    flecha(ax, (133, 24), (133, 14.5), "EvidenciaStore guarda la imagen")

    # ---------------- Componentes planificados (opcional) ----------------
    if incluir_planificado:
        ax.text(175.5, 101.5, "Planificado\n(no implementado)", ha="center",
                va="bottom", fontsize=9.5, fontweight="bold", color=PLANIFICADO)
        caja(ax, 162, 78, 189, 94, "Hardware Edge",
             "Raspberry Pi /\nJetson Nano\n\nNodo local de\ninferencia", discontinua=True)
        caja(ax, 162, 37, 189, 52.5, "Microservicio IA",
             "Python + FastAPI\nPOST /predict\n\nInferencia remota\nauxiliar", discontinua=True)
        caja(ax, 162, 22, 189, 33, "Contenedores",
             "Docker /\nDocker Compose", discontinua=True)

    # ---------------- Nota al pie ----------------
    ax.text(1, -2.2,
            "Líneas continuas: flujo de ejecución de la aplicación.  Líneas discontinuas: "
            "uso exclusivo en pruebas automatizadas.  El diagnóstico se calcula en el "
            "navegador; el servidor solo valida, persiste y consolida.",
            ha="left", va="center", fontsize=8, color=TEXTO_SUAVE, style="italic")
    return fig


def main():
    raiz = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--salida", type=Path,
                        default=raiz / "Docs" / "figuras" / "Figura09_arquitectura_tecnologica.png")
    parser.add_argument("--dpi", type=int, default=300)
    parser.add_argument("--incluir-planificado", action="store_true",
                        help="Agrega FastAPI, Docker y hardware Edge como componentes planificados.")
    args = parser.parse_args()

    args.salida.parent.mkdir(parents=True, exist_ok=True)
    fig = dibujar(args.incluir_planificado)
    fig.savefig(args.salida, dpi=args.dpi, bbox_inches="tight", pad_inches=0.25,
                facecolor="white")
    plt.close(fig)
    print(f"Diagrama generado: {args.salida}")


if __name__ == "__main__":
    main()
