# PWA offline y publicación del modelo

Fase 3 del plan V1 (T-13, T-15). Explica cómo llega el modelo a los teléfonos, cómo se actualiza la PWA y cómo probarla en modo avión.

## Cómo funciona

| Pieza | Dónde | Qué hace |
|---|---|---|
| Modelo | `public/models/modelo_roya.onnx` (versionado en git, 6.1 MB) | Pesos de la CNN. |
| Metadatos | `public/models/modelo_roya.json` | `version`, `sha256`, `bytes`, `clases`, `entrada`, `fecha`. Se genera con `npm run modelo:meta`. |
| Verificación | `resources/js/lib/modelo.js` | Antes de usar el modelo, el cliente compara versión y clases con `MODELO_VERSION`/`CLASES` y el sha256 del archivo. Si no coincide, no diagnostica. |
| WASM de ORT | `public/onnx/` (no versionado) | Lo copia `scripts/copy-ort.mjs` en `npm ci` (postinstall) y antes de `npm run build` (prebuild). |
| Service worker | `public/sw.js` | Se registra como `/sw.js?v=<build>&m=<modelo>&o=<ort>`. |
| Aviso de versión | `resources/js/components/UpdateToast.jsx` | "Hay una versión nueva — Actualizar". |

**Por qué la versión va en el query string:** `sw.js` es un archivo fijo; cada build cambia la URL con la que se registra y el navegador lo trata como un worker nuevo. Es la opción más simple: no hay que generar `sw.js` en cada build.

**Cachés del service worker:**

- `roya-app-<build>`: todo lo que emitió Vite (se lee de `/build/manifest.json`), íconos, manifest y la página `/`. Cambia en cada build.
- `roya-runtime-<modelo>-ort-<versión>`: modelo, JSON y WASM. Solo se vuelve a descargar si cambia `MODELO_VERSION` o la versión de onnxruntime-web.
- Al activarse, el worker borra las cachés `roya-*` que no son las suyas (incluida la antigua `roya-edge-v1`).

**Página offline:** `/` va primero a la red y, sin red, sale de la caché. Contiene nombre, correo y cooperativa del usuario, así que se borra al cerrar sesión o cuando el servidor redirige al login.

**Despliegues con la app abierta:** la app consulta `/build/version.json` al volver a primer plano y cada hora. Si el build desplegado es otro, registra su worker y aparece el aviso. El worker nuevo no toma el control solo: espera a que el usuario pulse **Actualizar**, porque podría estar a mitad de una captura.

**El build se corta** si faltan los WASM, el modelo o su JSON, o si el JSON no coincide con el archivo (plugin `roya-edge-assets-guard` en `vite.config.js`).

## Publicar un modelo nuevo

1. Exporta el ONNX (MobileNetV3-Small, entrada `1×3×224×224`, mismas clases y mismo orden: `sana`, `roya_amarilla`, `otra_enfermedad`) y reemplaza `public/models/modelo_roya.onnx`.
2. Cambia `MODELO_VERSION` en `resources/js/lib/inference.js` (por ejemplo `roya-mobilenetv3-small-v2`). Sin este cambio los teléfonos no descargan el modelo nuevo.
3. Si cambiaron las clases o el preprocesamiento, actualiza `CLASES` / `imageToNCHW` antes de seguir (eso ya es un cambio de código, no solo de pesos).
4. Genera los metadatos: `npm run modelo:meta`.
5. Comprueba: `npm run modelo:meta -- --check`, `php artisan test`, `npm run test:js`, `npm run build`.
6. Si el archivo supera 50 MB, pasa el modelo a Git LFS en lugar de versionarlo directo (la prueba `EdgePwaAssetsTest` falla a partir de ese tamaño).
7. Commit de `modelo_roya.onnx`, `modelo_roya.json` e `inference.js` juntos, y despliegue.
8. Los teléfonos ven "Hay una versión nueva" al abrir la app con red; al pulsar **Actualizar** descargan el modelo nuevo.

## Prueba manual en Android (modo avión)

El service worker solo se registra en el build de producción y exige HTTPS (o `localhost`).

1. `npm run build` (no uses `npm run dev`: en desarrollo no hay service worker). Si existe `public/hot`, bórralo.
2. Levanta la app: `php artisan serve --host=127.0.0.1 --port=8000`.
3. Expón HTTPS con un túnel, por ejemplo `cloudflared tunnel --url http://127.0.0.1:8000` o `ngrok http 8000`. Pon esa URL en `APP_URL` del `.env` y ejecuta `php artisan config:clear`.
4. En el teléfono (Chrome Android) abre la URL del túnel e inicia sesión.
5. Espera unos segundos con la app abierta. En `chrome://inspect` → el dispositivo → *Application → Service workers* debe verse `sw.js?v=…` como *activated*, y en *Cache storage* las dos cachés `roya-app-…` y `roya-runtime-…`.
6. Menú ⋮ → **Instalar app** (o "Agregar a pantalla principal"). Debe aparecer el ícono de RiwiScan.
7. Cierra la app, activa **modo avión** y ábrela desde el ícono.
8. Diagnostica una foto (cámara o galería). Debe salir clase, confianza y severidad, y el diagnóstico queda en la cola local.
9. Desactiva el modo avión: la cola se sincroniza con el servidor.
10. Prueba de actualización: con la app instalada, vuelve a ejecutar `npm run build` en la PC, vuelve a la app con red (sal y entra). Debe aparecer **Hay una versión nueva — Actualizar**; al pulsarlo, la app recarga.

Si el paso 8 dice que falta el modelo, revisa en *Cache storage* que `roya-runtime-…` contenga `modelo_roya.onnx?v=…` y el `.wasm`.

## Notas para el servidor (fase 4)

- Nginx debe servir `.wasm` como `application/wasm` y `.mjs` como `application/javascript`; con `mime.types` viejos hay que añadirlos.
- `sw.js` y `build/version.json` no deben cachearse en el CDN o proxy (`Cache-Control: no-cache`); `build/assets/*` sí, por largo tiempo (llevan hash).
- El despliegue puede fijar el identificador del build con `BUILD_ID=<git sha> npm run build`.
