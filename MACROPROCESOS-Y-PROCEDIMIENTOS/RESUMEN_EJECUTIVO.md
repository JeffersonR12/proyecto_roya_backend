# Resumen ejecutivo — Trazabilidad SASE de RiwiScan

**Fecha:** 2026-11-16 · **Alcance:** 12 macroprocesos, 62 procedimientos · **Rama:** `feature/jhoan-backend-roya`

## Qué se hizo

- **Se completó la matriz con datos reales.** Cada uno de los 62 TRZ tiene:
  - dominio funcional y responsable (Jhoan 21, Jefferson 16, Annelise 25);
  - ruta exacta del archivo y método;
  - commit con enlace a GitHub;
  - modelo de IA tomado de los commits;
  - resultado de sus pruebas y cobertura;
  - análisis estático, seguridad de dependencias y SHA-256 del BriefingScript.
- **La estructura es la de la matriz de referencia.** Tiene 78 columnas, más una extensión de 9, con las mismas fórmulas por bloque. El estado de la traza también se calcula con una fórmula. Las 62 filas se verificaron recalculando en Excel: **0 diferencias y 0 errores de fórmula**.
- **Hay 62 fichas `.md`**, una por procedimiento, organizadas en 12 carpetas por macroproceso. Además: README, DECISIONES, la matriz en `.xlsx`, `.csv` y `.md`, y una carpeta `evidencias/` con los reportes que respaldan cada "Sí".

## Resultado

| Indicador | Valor |
|---|---|
| Estado de las trazas | **0 Implementado · 18 En revisión · 44 Pendiente** |
| Marco AI-DLC (promedio) | 97,58 % |
| Coherencia técnica | 99,60 % |
| Trazabilidad | 97,98 % |
| Estabilidad funcional / técnica | 99,19 % / 75,27 % |
| Pruebas | PHPUnit 81/81 · Vitest 141/141 · Cypress 13/14 (E2E-04 pasó 2/2 al re-ejecutarlo) |

Ningún TRZ llega a "Implementado" por dos motivos que afectan a las 62 filas: **no hay despliegue en producción** y **no hay pull requests con revisión**. Esto no significa que el código esté mal. Significa que el proceso de entrega todavía no deja esa evidencia.

**33 de los 44 "Pendiente" se deben a un solo motivo:** las dependencias PHP con avisos de seguridad (`composer audit`). Ejecutar `composer update` y repetir la auditoría los movería a "En revisión".

## Qué falta (placeholders)

| Falta | Afecta a | Cómo cerrarlo |
|---|---|---|
| Actualizar dependencias PHP (12 avisos, 2 altos) | 36 TRZ | `composer update`, `composer audit` y volver a ejecutar las pruebas |
| Pull request con revisión aprobada | 62 TRZ | Subir la rama y abrir un PR revisado por otro integrante |
| Despliegue en producción (HTTPS) | 62 TRZ | Desplegar; o justificar "No aplica" si el alcance académico es solo local |
| Confirmar cambios locales en Git | 17 TRZ (15 modificados, 2 sin seguimiento) | Commit de DEF-01 a DEF-03, reportes, Cypress y pruebas nuevas |
| Reanálisis en SonarQube | 8 TRZ | `npx @sonar/scan` (archivos modificados después del 2026-11-10) |
| `metrics.json` y ONNX entrenado versionados | 5 TRZ (INT-011) | Git LFS o DVC; publicar el modelo `1cf92a1f…` |
| Pruebas del pipeline de ML | 5 TRZ (INT-011) | Pruebas de `split_estratificado`, `metricas` y `export_onnx` |
| Prompt de cada procedimiento | 62 TRZ (columna de extensión) | Archivarlo si se conserva |

## Hallazgos que conviene atender primero

1. **Seguridad (TRZ-002-002).** Un usuario sin `rol_id` sería tratado como técnico. El origen es el valor por defecto `"tecnico"` de la columna heredada `users.role`.
2. **Dependencias PHP.** Hay 2 avisos de severidad alta, en `symfony/http-foundation` y `league/commonmark`.
3. **Modelo de IA.** El ONNX publicado es un placeholder. El modelo real (Docs/10) no cumple la meta de *precision* de roya: 0.851 frente a 0.88.
4. **Código heredado.** `Dashboard.jsx`, `app.jsx` y `scan.blade.php` no se usan.

## Próximos pasos

1. `composer update` y `composer audit` (cierra el mayor bloque de "Pendiente").
2. Corregir el respaldo de `User::roleName()` y agregar su prueba.
3. Confirmar los cambios locales y abrir el PR de la rama `MACROPROCESOS-Y-PROCEDIMIENTOS` con revisión.
4. Volver a ejecutar SonarQube y Cypress completos, y regenerar el reporte HTML.
5. Actualizar la matriz: al cambiar cada "Pendiente" a "Sí" con su evidencia, el estado se recalcula solo.
