#!/bin/sh
# Arranque del contenedor: cachea la configuracion con las variables del entorno,
# aplica las migraciones pendientes y levanta Nginx, PHP-FPM y la cola.
set -e
cd /var/www/html

if [ -z "$APP_KEY" ]; then
    echo "[roya] Falta APP_KEY. Generala en tu PC con: php artisan key:generate --show" >&2
    exit 1
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

# El plan gratis de Render no tiene "pre-deploy": las migraciones corren al arrancar.
php artisan migrate --force

# Datos base (idempotentes). No se usa DatabaseSeeder: crea usuarios demo con claves conocidas.
php artisan db:seed --class=RoleSeeder --force
php artisan db:seed --class=CatalogoFitosanitarioSeeder --force

chown -R www-data:www-data storage bootstrap/cache

exec /usr/bin/supervisord -c /etc/supervisor/roya.conf
