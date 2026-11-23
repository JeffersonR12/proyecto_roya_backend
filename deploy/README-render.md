# Despliegue V1 de prueba en Render (gratis, sin tarjeta)

Tres servicios gratuitos, todos con cuenta de Google o GitHub:

| Pieza | Servicio | Para qué |
|---|---|---|
| App (Nginx + PHP + cola) | **Render** | Corre el `Dockerfile` del repo y da HTTPS en `https://roya-app.onrender.com` |
| Base de datos | **TiDB Cloud Starter** | Compatible con MySQL; guarda usuarios, diagnósticos, sesiones y la cola |
| Fotos de diagnóstico | **Supabase Storage** | Bucket privado compatible con S3 (el disco de Render se borra al reiniciar) |

> Límites del plan gratis: Render se duerme tras 15 min sin visitas (la primera visita tarda ~1 min en despertarlo); Supabase pausa el proyecto si pasa 7 días sin uso (se reactiva desde su panel); no hay copias de seguridad automáticas. Sirve para piloto, no para producción real.

Usa la **misma región** en los tres (recomendado: **Oregon / US West**) para que la app y la base estén cerca.

---

## 1. Base de datos — TiDB Cloud

1. Entra en **tidbcloud.com** → *Sign up* con Google o GitHub.
2. **Create Cluster** → plan **Starter** (gratis) → proveedor AWS, región **Oregon (us-west-2)** → *Create*.
3. Abre el cluster → **SQL Editor** y ejecuta:
   ```sql
   CREATE DATABASE roya;
   ```
4. Botón **Connect** → *Generate Password*. Copia y guarda:
   - **Host** (ej. `gateway01.us-west-2.prod.aws.tidbcloud.com`) → `DB_HOST`
   - **Port**: `4000`
   - **User** (ej. `3xYz1abc.root`) → `DB_USERNAME`
   - **Password** → `DB_PASSWORD` (solo se muestra una vez)

## 2. Fotos — Supabase Storage

1. Entra en **supabase.com** → *Start your project* con GitHub → **New project**, región **West US (Oregon)**. La contraseña de base de datos que pide no se usa aquí, pero guárdala.
2. Menú **Storage** → **New bucket** → nombre `diagnosticos` → **Public bucket: desactivado** (privado) → *Create*.
3. **Project Settings → Storage → S3 Connection**:
   - Activa *Enable connection via S3 protocol*.
   - Copia **Endpoint** (`https://<ref>.supabase.co/storage/v1/s3`) → `AWS_ENDPOINT`
   - Copia **Region** (ej. `us-west-2`) → `AWS_DEFAULT_REGION`
   - **New access key** → copia **Access key ID** → `AWS_ACCESS_KEY_ID` y **Secret access key** → `AWS_SECRET_ACCESS_KEY` (solo se muestra una vez).

## 3. Clave de la app (en tu PC)

```powershell
php artisan key:generate --show --no-ansi
```
Copia la salida completa, incluido `base64:` → `APP_KEY`. No la cambies después: invalida sesiones y datos cifrados.

## 4. App — Render

> Requisito: `Dockerfile`, `docker/` y `render.yaml` deben estar en `main` en GitHub.

1. Entra en **render.com** → *Get Started* con **GitHub** y autoriza el acceso al repo `proyecto_roya_backend`.
2. **New → Blueprint** → elige el repo → Render lee `render.yaml` y propone el servicio `roya-app`.
3. Te pide los valores marcados como secretos. Rellena:

   | Variable | Valor |
   |---|---|
   | `APP_KEY` | la del paso 3 |
   | `APP_URL` | `https://roya-app.onrender.com` (si Render asigna otro nombre, corrígelo luego) |
   | `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` | paso 1 |
   | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_ENDPOINT` | paso 2 |
   | `MAIL_USERNAME` | tu Gmail |
   | `MAIL_PASSWORD` | contraseña de aplicación de Gmail (myaccount.google.com/apppasswords) |
   | `MAIL_FROM_ADDRESS` | el mismo Gmail |

4. **Apply**. El primer build tarda 5–10 min (*Logs* para seguirlo). Al arrancar, el contenedor aplica las migraciones y carga roles y catálogo solo.
5. Cuando diga **Live**, copia la URL real arriba a la izquierda. Si no es `roya-app.onrender.com`, ve a **Environment** → cambia `APP_URL` → *Save, rebuild and deploy*.

## 5. Crear el primer administrador (desde tu PC)

El plan gratis de Render no tiene consola, así que el comando se corre en tu PC contra la base de TiDB.

1. En la raíz del repo crea **`.env.production`** (está en `.gitignore`, nunca se sube):
   ```env
   APP_ENV=production
   APP_KEY=la-misma-del-paso-3
   APP_URL=https://roya-app.onrender.com

   DB_CONNECTION=mysql
   DB_HOST=gateway01.us-west-2.prod.aws.tidbcloud.com
   DB_PORT=4000
   DB_DATABASE=roya
   DB_USERNAME=xxxx.root
   DB_PASSWORD=CAMBIAR_ESTO
   MYSQL_ATTR_SSL_CA=C:\xampp\php\extras\ssl\cacert.pem
   DB_INIT_COMMAND="SET SESSION innodb_lock_wait_timeout=5"

   MAIL_MAILER=smtp
   MAIL_SCHEME=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=tu@gmail.com
   MAIL_PASSWORD=CAMBIAR_ESTO
   MAIL_FROM_ADDRESS=tu@gmail.com
   MAIL_FROM_NAME=RiwiScan
   ```
2. Ejecuta:
   ```powershell
   php artisan roya:crear-admin tu@gmail.com --tenant="Nombre de la cooperativa" --nombre="Tu nombre" --env=production
   ```
   Te llega un correo con el enlace para definir la contraseña y el comando muestra el **código de invitación** de la cooperativa (los agricultores y técnicos lo usan al registrarse).

## 6. Verificación

```powershell
curl.exe -I https://roya-app.onrender.com/up      # HTTP/1.1 200 OK
curl.exe -I http://roya-app.onrender.com/up       # 301 hacia https
```
En el teléfono: abre la URL → candado válido → inicia sesión → instala la PWA → haz un diagnóstico con red → otro en modo avión → vuelve a tener red y comprueba que se sincroniza y que la foto se ve en Historial (en Supabase aparece en `diagnosticos/<tenant>/`).

## Actualizar

Cada `git push` a `main` despliega solo (`autoDeploy`). Las migraciones nuevas se aplican al arrancar.

## Problemas comunes

| Síntoma | Causa probable |
|---|---|
| Build falla en `npm run build` con "La PWA no puede diagnosticar" | falta `public/models/modelo_roya.onnx` o su JSON en el repo |
| Deploy en bucle, log "Falta APP_KEY" | `APP_KEY` vacía en Environment |
| `SQLSTATE[HY000] [2002]` o error SSL | `DB_HOST`/`DB_PORT` mal copiados; el puerto de TiDB es 4000 |
| `Unknown system variable` | falta `DB_INIT_COMMAND` en Environment |
| Error 500 al ver una foto | revisa `AWS_*`; el bucket debe llamarse `diagnosticos` y `AWS_USE_PATH_STYLE_ENDPOINT=true` |
| Login devuelve 403 | `TRUSTED_PROXIES` no es `*`: Laravel no ve que la petición vino por HTTPS |
| La app tarda ~1 min en abrir | estaba dormida (plan gratis); es normal |
