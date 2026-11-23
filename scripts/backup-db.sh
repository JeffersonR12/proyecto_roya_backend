#!/usr/bin/env bash
# Copia de la base de datos de produccion (TiDB Cloud o MySQL 8): mysqldump -> gzip -> cifrado AES256.
# Lo ejecuta .github/workflows/backup.yml cada noche; tambien sirve a mano.
#
# Variables obligatorias: DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD BACKUP_PASSPHRASE
# Opcionales: OUT_DIR (por defecto ./backups), DB_SSL_CA (por defecto el bundle del sistema)
# Salida: imprime la ruta del archivo .sql.gz.gpg creado.
#
# Restaurar: gpg -d --batch --passphrase "$BACKUP_PASSPHRASE" ARCHIVO | gunzip | mysql ...  (ver deploy/README-operacion.md)
set -euo pipefail

: "${DB_HOST:?Falta DB_HOST}" "${DB_PORT:?Falta DB_PORT}" "${DB_DATABASE:?Falta DB_DATABASE}"
: "${DB_USERNAME:?Falta DB_USERNAME}" "${DB_PASSWORD:?Falta DB_PASSWORD}" "${BACKUP_PASSPHRASE:?Falta BACKUP_PASSPHRASE}"

OUT_DIR="${OUT_DIR:-./backups}"
DB_SSL_CA="${DB_SSL_CA:-/etc/ssl/certs/ca-certificates.crt}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
FILE="${OUT_DIR}/roya-${STAMP}.sql.gz.gpg"

mkdir -p "$OUT_DIR"

# Si algo falla a mitad, no dejar un archivo incompleto que parezca una copia valida.
trap 'rm -f "$FILE"' ERR

# La clave va por MYSQL_PWD para que no aparezca en la lista de procesos.
# --column-statistics=0 y --set-gtid-purged=OFF: TiDB no tiene esas tablas/variables de MySQL.
# Sin --single-transaction: usa SAVEPOINT, que TiDB no admite. --skip-lock-tables evita
# bloquear la app; con el volumen del piloto la copia tarda segundos.
MYSQL_PWD="$DB_PASSWORD" mysqldump \
    --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USERNAME" \
    --ssl-mode=VERIFY_IDENTITY --ssl-ca="$DB_SSL_CA" \
    --skip-lock-tables --quick --no-tablespaces \
    --column-statistics=0 --set-gtid-purged=OFF \
    --default-character-set=utf8mb4 \
    --databases "$DB_DATABASE" \
    | gzip -9 \
    | gpg --batch --yes --quiet --symmetric --cipher-algo AES256 \
        --passphrase-fd 3 --output "$FILE" 3<<<"$BACKUP_PASSPHRASE"

# Un volcado sin la tabla users no es una copia valida (credenciales sin permisos, base vacia...).
if ! gpg --batch --quiet --decrypt --passphrase-fd 3 "$FILE" 3<<<"$BACKUP_PASSPHRASE" \
    | gunzip | grep 'CREATE TABLE `users`' >/dev/null; then # sin -q: grep -q corta el pipe y pipefail daria falso error
    echo "La copia no contiene la tabla users: revisa credenciales y DB_DATABASE." >&2
    rm -f "$FILE"
    exit 1
fi

echo "$FILE"
