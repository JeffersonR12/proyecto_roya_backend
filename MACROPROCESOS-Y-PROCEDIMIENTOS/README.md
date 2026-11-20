# MACROPROCESOS-Y-PROCEDIMIENTOS — Trazabilidad SASE de RiwiScan

Esta carpeta contiene la trazabilidad de los **12 macroprocesos (INT-001 a INT-012)** y los **62 procedimientos (TRZ-XXX-XXX)** de RiwiScan. Cada procedimiento está vinculado con su archivo real en el código, sus pruebas, sus commits y la evidencia de calidad (MRP).

La matriz sigue la estructura de `Matriz de registro_ProyectoRoya.xlsx`: bloques 1 a 5, columnas "Registro / Evidencia" y "Resultado", y las mismas fórmulas. Se agregó una extensión propia de RiwiScan con las columnas BZ a CH.

## Estructura

```
MACROPROCESOS-Y-PROCEDIMIENTOS/
├── README.md                              ← este archivo
├── DECISIONES.md                          ← criterios, asignaciones, placeholders y discrepancias
├── RESUMEN_EJECUTIVO.md                   ← qué se hizo, qué falta y próximos pasos
├── Matriz_Trazabilidad_RiwiScan_v2.xlsx   ← matriz completa con fórmulas (hojas Matriz, Resumen, Evidencias, Leyenda)
├── Matriz_Trazabilidad_RiwiScan_v2.csv    ← misma matriz en CSV (separador ";", UTF-8 con BOM, valores ya calculados)
├── Matriz_Trazabilidad_RiwiScan_v2.md     ← vista rápida: una fila por TRZ con porcentajes y estado
├── evidencias/                            ← resultados reales usados como evidencia
│   ├── phpunit-junit_2026-11-16.xml       (81/81 pruebas)
│   ├── vitest_2026-11-16.json             (141/141 pruebas)
│   ├── cypress-resultados_2026-11-12.json (13/14; E2E-04 timeout)
│   ├── cypress-E2E-04_rerun_2026-11-16.txt (2/2)
│   ├── sonar-*-fase2_2026-11-10.json      (issues, métricas y Quality Gate)
│   ├── composer-audit_2026-11-16.json     (12 avisos en dependencias PHP)
│   └── npm-audit_2026-11-16.json          (0 vulnerabilidades en producción)
├── INT-001_Seguridad_Accesos/             TRZ-001-001 … TRZ-001-006
├── INT-002_MultiTenant_RBAC/              TRZ-002-001 … TRZ-002-005
├── INT-003_Captura_Inferencia_Edge_AI/    TRZ-003-001 … TRZ-003-005
├── INT-004_Analisis_Fitosanitario/        TRZ-004-001 … TRZ-004-005
├── INT-005_Catalogo_Protocolos/           TRZ-005-001 … TRZ-005-005
├── INT-006_Persistencia_Offline_Sincronizacion/  TRZ-006-001 … TRZ-006-006
├── INT-007_API_REST_Core/                 TRZ-007-001 … TRZ-007-005
├── INT-008_Gestion_Parcelas/              TRZ-008-001 … TRZ-008-005
├── INT-009_Alertas_Tempranas/             TRZ-009-001 … TRZ-009-005
├── INT-010_Validacion_HITL_Agente/        TRZ-010-001 … TRZ-010-005
├── INT-011_Pipeline_ML/                   TRZ-011-001 … TRZ-011-005
└── INT-012_Aseguramiento_Calidad/         TRZ-012-001 … TRZ-012-005
```

## Propósito de cada archivo

| Archivo | Para qué sirve |
|---|---|
| `TRZ-XXX-XXX_<nombre>.md` | Ficha del procedimiento: BriefingScript, artefacto, ruta, método, responsable, paquete MRP y la tabla de los 27 criterios con su evidencia |
| `Matriz_..._v2.xlsx` | Documento oficial para auditoría. Los porcentajes y el estado se calculan con fórmulas: si cambias un "Pendiente" a "Sí", el estado se recalcula solo |
| `Matriz_..._v2.csv` | Importación en otras herramientas (Google Sheets, Power BI) |
| `Matriz_..._v2.md` | Lectura rápida en GitHub o en VS Code |
| `evidencias/` | Respaldo de cada "Sí" que cita pruebas, auditorías o SonarQube |

## Cómo actualizar la matriz

1. Abre `Matriz_Trazabilidad_RiwiScan_v2.xlsx`, en la hoja **Matriz**.
2. Busca las celdas amarillas: son los criterios en "Pendiente".
3. Cambia el Registro con la lista desplegable (Sí / No / No aplica / Pendiente) y pega la evidencia real (URL del PR, del despliegue, etc.) en la columna "Evidencia".
4. Los resultados de cada bloque, el estado de la traza (columna BW) y la hoja **Resumen** se recalculan automáticamente.

## Comandos Git (no se ejecutaron)

> El equipo decidió **no subir nada a Git para el entregable final**. Por eso estos comandos solo se dejan preparados; ejecútalos cuando lo decidan.

```bash
git checkout -b MACROPROCESOS-Y-PROCEDIMIENTOS
git add MACROPROCESOS-Y-PROCEDIMIENTOS/
git commit -m "docs: agregar 62 procedimientos de trazabilidad SASE"
git push origin MACROPROCESOS-Y-PROCEDIMIENTOS
```

Antes de ejecutarlos, ten en cuenta lo siguiente:

- La rama nueva parte de `feature/jhoan-backend-roya` y **conserva los cambios locales sin commit** del proyecto (correcciones DEF-01 a DEF-03, módulo de reportes, Cypress y pruebas nuevas). Como `git add` solo incluye esta carpeta, esos cambios **no entran en el commit**, pero siguen en tu copia de trabajo.
- Comprueba con `git status` que solo se agregó `MACROPROCESOS-Y-PROCEDIMIENTOS/` antes de hacer el commit.
- Al subir la rama, abre un **pull request con revisión**. Así cierras el criterio 5.2 "¿Revisión de código aprobada?", que hoy está en "Pendiente" en las 62 filas.
