# Operación de la V1 en Render: monitoreo, logs y copias de seguridad

Complementa [README-render.md](README-render.md). Todo es gratis y sin tarjeta.

| Qué | Dónde | Aviso si falla |
|---|---|---|
| Monitoreo | UptimeRobot → `https://roya-app.onrender.com/health` cada 5 min | Correo de UptimeRobot |
| Logs | Render → `roya-app` → **Logs** (7 días) | Render avisa por correo si falla un deploy |
| Copias de la base | GitHub Actions → workflow **Backup base de datos**, cada día a las 03:00 (Perú) | Correo de GitHub si el job falla |

---

## 1. Monitoreo

### Qué comprueba `/health`

```json
{"status":"ok","checks":{"database":"ok","storage":"ok","fotos":"ok","cola":"ok","modelo":"ok"}}
```

| Check | Falla cuando |
|---|---|
| `database` | TiDB no responde o las credenciales cambiaron |
| `storage` | el contenedor no puede escribir en `storage/` |
| `fotos` | no se puede escribir en el bucket de Supabase (claves, bucket o proyecto pausado) |
| `cola` | hubo algún trabajo fallido en las últimas 24 h (`failed_jobs`) |
| `modelo` | falta `public/models/modelo_roya.onnx` en la imagen |

Responde **200** si todo está bien y **503** si algo falla. Solo dice `ok`/`fail`; el detalle del error queda en los logs de Render. Está limitado a 60 peticiones por minuto y no abre sesión.

`/up` sigue existiendo y es el que usa Render para saber si el contenedor arrancó. No cambiarlo por `/health`: si TiDB cae un momento, Render reiniciaría la app sin necesidad.

### Configurar UptimeRobot

1. Crea una cuenta en **uptimerobot.com** (plan Free).
2. **New monitor** → tipo **HTTP(s)**.
   - URL: `https://roya-app.onrender.com/health`
   - Intervalo: **5 minutes**
   - Alert contacts: tu correo
3. **Create monitor**.

Efecto secundario útil: al consultar cada 5 minutos, Render **no duerme la app** y desaparece el arranque lento de ~50 s. Render da 750 horas gratis al mes por cuenta; un servicio encendido todo el mes usa ~744, así que alcanza **solo para este servicio**.

### Si llega una alerta

1. Abre `https://roya-app.onrender.com/health` y mira qué check está en `fail`.
2. Render → `roya-app` → **Logs**, busca `production.ERROR` cerca de la hora de la alerta.
3. Causas típicas:
   - `fotos`: el proyecto de Supabase se pausó por inactividad → Supabase → **Restore project**.
   - `database`: TiDB cambió la contraseña o el cluster está en mantenimiento → revisa `DB_*` en Render → Environment.
   - `cola`: un correo no salió (contraseña de aplicación de Gmail revocada). El check vuelve a `ok` solo 24 h después del último fallo.

## 2. Logs

- La app escribe en `stderr` (`LOG_CHANNEL=stderr`, nivel `warning`) y Render los guarda **7 días**.
- Render → `roya-app` → **Logs** → filtra por `ERROR` o por texto.
- Para ver más detalle temporalmente: Environment → `LOG_LEVEL=info` → *Save, rebuild and deploy*. Vuelve a `warning` después.
- No uses el canal `daily`: el disco de Render se borra en cada reinicio.

## 3. Copias de seguridad de la base

### Cómo funcionan

Cada noche, GitHub Actions:
1. exporta TiDB con `mysqldump` ([scripts/backup-db.sh](../scripts/backup-db.sh)),
2. la comprime y **cifra con AES-256** usando `BACKUP_PASSPHRASE`,
3. **la restaura en un MySQL 8 vacío** y comprueba tablas y roles; si no restaura, el job falla y te llega un correo,
4. la sube a Supabase en `backups/db/daily/` (y los domingos también a `db/weekly/`),
5. borra las antiguas: conserva **7 diarias y 4 semanales**.

El repositorio es **público**: el workflow nunca guarda la copia como *artifact* ni imprime datos. La copia cifrada solo vive en el bucket privado.

Las **fotos** no se copian aparte: viven en Supabase Storage, que ya es almacenamiento persistente. Si se necesita una segunda copia, se puede añadir más adelante.

### Configuración (una sola vez)

**a. Bucket en Supabase.** Storage → **New bucket** → nombre `backups` → **privado**. La misma access key S3 que usa Render sirve.

**b. Usuario de solo lectura en TiDB (recomendado).** Así la clave guardada en GitHub no puede modificar datos. En TiDB → SQL Editor (cambia el prefijo por el de tu usuario y pon una contraseña larga):

```sql
CREATE USER '3X8KbSBwTvNYXcY.backup' IDENTIFIED BY 'CAMBIAR_ESTO';
GRANT SELECT, SHOW VIEW ON roya.* TO '3X8KbSBwTvNYXcY.backup';
```

Si prefieres no crearlo, usa el usuario `.root` actual.

**c. Frase de cifrado.** Genera una larga y **guárdala en tu gestor de contraseñas**. Sin ella las copias no se pueden abrir:

```powershell
php -r "echo bin2hex(random_bytes(24)), PHP_EOL;"
```

**d. Secretos en GitHub.** Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secreto | Valor |
|---|---|
| `BACKUP_DB_HOST` | `gateway01.us-west-2.prod.aws.tidbcloud.com` |
| `BACKUP_DB_USERNAME` | `3X8KbSBwTvNYXcY.backup` (o `.root`) |
| `BACKUP_DB_PASSWORD` | su contraseña |
| `BACKUP_PASSPHRASE` | la frase del paso c |
| `BACKUP_S3_ENDPOINT` | el mismo `AWS_ENDPOINT` de Render |
| `BACKUP_S3_REGION` | el mismo `AWS_DEFAULT_REGION` de Render |
| `BACKUP_S3_ACCESS_KEY_ID` | el mismo `AWS_ACCESS_KEY_ID` de Render |
| `BACKUP_S3_SECRET_ACCESS_KEY` | el mismo `AWS_SECRET_ACCESS_KEY` de Render |

Opcionales (tienen valor por defecto): `BACKUP_DB_PORT` (`4000`), `BACKUP_DB_DATABASE` (`roya`), `BACKUP_S3_BUCKET` (`backups`).

**e. Primera ejecución.** Repo → **Actions** → *Backup base de datos* → **Run workflow**. Debe terminar en verde y aparecer un archivo en Supabase → Storage → `backups/db/daily/`.

> GitHub desactiva los workflows programados de un repo público tras **60 días sin commits**. Si el proyecto queda quieto tanto tiempo, entra en Actions y reactívalo.

### Restaurar una copia

1. Supabase → Storage → `backups` → `db/daily/` → descarga el `.sql.gz.gpg` que quieras.
2. Descifra y descomprime (Git Bash en Windows trae `gpg` y `gunzip`):
   ```bash
   gpg --decrypt roya-AAAAMMDD-HHMMSS.sql.gz.gpg | gunzip > roya.sql
   ```
   Pide la frase de `BACKUP_PASSPHRASE`.
3. **Prueba primero en una base local**, nunca directo sobre producción:
   ```bash
   mysql -u root -p < roya.sql      # crea/llena la base "roya" en tu MySQL local
   ```
4. Para restaurar **en producción** (solo ante pérdida real de datos):
   - Pon la app en mantenimiento o avisa a los usuarios: lo que entre mientras tanto se perderá.
   - Crea en TiDB una base nueva (`roya_restaurada`), cámbiale el nombre dentro de `roya.sql` (líneas `CREATE DATABASE` y `USE`) e impórtala ahí. El `mysql` de XAMPP es MariaDB y no admite estas opciones TLS; usa el cliente de MySQL 8 con Docker:
     ```bash
     docker run --rm -i mysql:8.0 mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 \
       -u 3X8KbSBwTvNYXcY.root -p --ssl-mode=VERIFY_IDENTITY \
       --ssl-ca=/etc/pki/tls/certs/ca-bundle.crt < roya.sql
     ```
   - Comprueba los datos y cambia `DB_DATABASE` en Render → Environment a `roya_restaurada`.
   - Así la base original queda intacta por si hay que volver atrás.

### Prueba de restauración realizada

2026-11-23: copia real de TiDB cifrada y restaurada en un MySQL 8 limpio. Coincidieron 17 tablas, 1 usuario, 3 diagnósticos, 3 roles y 6 entradas del catálogo; con una frase incorrecta no se pudo descifrar.
