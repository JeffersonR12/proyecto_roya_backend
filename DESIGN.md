---
version: 1.0
name: RiwiScan-design-system
description: PWA de campo para detección temprana de Roya Amarilla en trigo (Valle del Mantaro). Superficies claras, sidebar verde musgo, acentos esmeralda y oro de cosecha. Tipografía Plus Jakarta Sans. Offline-first, no estética “AI purple”.
source_catalog: https://github.com/VoltAgent/awesome-design-md
---

# DESIGN.md — RiwiScan

Fuente de verdad visual del proyecto. Los agentes de código deben leer este archivo antes de generar o rediseñar UI.

Catálogo de referencia (no copiar otra marca): `.cursor/awesome-design-md/design-md/` — [awesome-design-md](https://github.com/VoltAgent/awesome-design-md).

## 1. Visual Theme & Atmosphere

Campo profesional, no vitrina de agroquímicos. Luz de día, confianza agronómica, densidad media.

- **Auth / intro:** split verde musgo (mensaje) + panel blanco (formulario).
- **App autenticada:** frame claro `#d8f3fa`, sidebar `#14532D` redondeada, tarjetas blancas.
- **Ánimo:** temprano, preciso, usable con guantes y sol. No cinema-dark, no neon, no fintech púrpura.

## 2. Color Palette & Roles

| Token | Hex | Rol |
|---|---|---|
| primary / moss | `#14532D` | Sidebar, marca, botones fuertes, nav activa invertida |
| secondary / teal | `#10B981` | Acento vivo, estados OK, chips activos, links de acción |
| tertiary / gold | `#F59E0B` | CTA de campo, alertas de atención, “Nueva captura” |
| neutral / ink | `#0F172A` | Texto principal |
| sky | `#F8FAFC` | Fondos de inputs y bloques suaves |
| paper | `#FFFFFF` | Superficie de tarjetas y formularios |
| sand | `#ECFDF5` | Resalte sano / éxito suave |
| copper | `#F43F5E` | Error, rechazo HITL, destructivo |
| frame | `#D8F3FA` | Fondo del shell autenticado |

Contraste texto sobre primary y over-teal: blanco. Texto sobre gold: ink `#0F172A`. Mínimo 4.5:1 en cuerpo.

## 3. Typography Rules

Familia única: **Plus Jakarta Sans** (400 / 500 / 600 / 700 / 800).

| Uso | Tamaño | Peso | Notas |
|---|---|---|---|
| Hero intro | clamp 2.15–3.35rem | 800 | Título de cosecha, no display serif |
| H1 app | 1.875–2.25rem | 800 | Una línea de acción (“Mira la hoja”) |
| H2 | 1.25–1.5rem | 800 | |
| Cuerpo | 0.875–1rem | 400–500 | leading 1.6–1.75 |
| Label / kicker | 0.75rem | 700 | tracking amplio, teal |
| Nav sidebar | 0.95rem | 700 | |

No Fira Code, no Geist, no Inter como reemplazo de marca.

## 4. Component Stylings

- **Botones:** `rounded-full`. Primario teal o primary; CTA campo gold; peligro rose. `cursor-pointer`. Hover 150–300 ms.
- **Nav:** ítem inactivo blanco/92; activo fondo blanco + texto `#14532D`.
- **Cards:** `rounded-3xl`, fondo paper, padding amplio, sin borde duro.
- **Inputs:** fondo sky, pill o rounded-2xl, sin chrome de navegador pesado.
- **Chips:** pill sky; seleccionado teal/blanco.
- **Iconos:** SVG (no emoji). Logo `/imagenes/riwiscan-logo.png`.
- **Alertas:** campana + badge gold con conteo. Brotes solo si el modelo afirma Roya.

## 5. Layout Principles

- Auth: dos columnas en desktop; apilado en móvil.
- App: sidebar ~16.75rem + panel scroll. Overlay menú en `< md`.
- Espaciado 8px (gap 2–8). Radios 1.1rem nav, 1.75–2rem shell.
- Campo: guía de captura + escáner lado a lado en xl.

## 6. Depth & Elevation

Sombras suaves verdosas (`rgba(20, 83, 45, 0.12)`), no sombras negras duras. Sidebar sólida, no glass excesivo sobre contenido de campo.

## 7. Do's and Don'ts

**Do**

- Español de campo (sin pretender satélite ni 96 % inventado).
- Resultado en 3 capas: clase, confianza, severidad.
- Si confianza &lt; 75 %: “el sistema no afirma diagnóstico”.
- HITL: validar / rechazar / nueva muestra. Protocolo por severidad foliar.

**Don't**

- No copiar Stripe, Linear, Nike ni “AI purple/pink gradients”.
- No chatbot que diagnostique la foto.
- No tienda de fungicidas ni botón “entrenar CNN” en el celular.
- No mezclar confianza del modelo con severidad foliar.

## 8. Responsive Behavior

375 / 768 / 1024 / 1440. Touch targets ≥ 44px. Sidebar colapsa a overlay. Intro split solo desde md/lg.

## 9. Agent Prompt Guide

Colores rápidos: moss `#14532D`, teal `#10B981`, gold `#F59E0B`, ink `#0F172A`.

Al generar UI: leer este `DESIGN.md`, luego `.cursor/skills/ui-ux-pro-max/SKILL.md`. El catálogo `.cursor/awesome-design-md/design-md/` es inspiración de estructura, no de marca. Stack: React + Tailwind v4 + Laravel Blade + PWA.
