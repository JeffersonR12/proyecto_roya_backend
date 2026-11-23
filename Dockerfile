# Imagen de produccion de Roya: Nginx + PHP 8.3-FPM + worker de la cola en un solo contenedor.
# Pensada para Render (plan gratis), pero corre en cualquier host con Docker.
# Prueba local:  docker build -t roya . && docker run --env-file .env.docker -p 10000:10000 roya

# --- 1. Frontend (Vite + PWA + binarios ORT) -------------------------------------------
FROM node:20-bookworm-slim AS assets
WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci

COPY vite.config.js ./
COPY resources ./resources
COPY public ./public

# Render pasa el commit desplegado; asi los telefonos solo ven "Hay una version nueva" cuando cambia.
ARG RENDER_GIT_COMMIT=""
ENV BUILD_ID=${RENDER_GIT_COMMIT}
RUN npm run build

# --- 2. App PHP ---------------------------------------------------------------------
FROM php:8.3-fpm-bookworm

COPY --from=mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor unzip ca-certificates \
    && install-php-extensions pdo_mysql intl zip gd bcmath opcache pcntl \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-roya.ini
COPY docker/fpm-pool.conf /usr/local/etc/php-fpm.d/zz-roya.conf
COPY docker/nginx.conf /etc/nginx/conf.d/roya.conf
COPY docker/supervisord.conf /etc/supervisor/roya.conf
COPY docker/entrypoint.sh /usr/local/bin/roya-entrypoint
RUN chmod +x /usr/local/bin/roya-entrypoint

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
COPY --from=assets /app/public/build ./public/build
COPY --from=assets /app/public/onnx ./public/onnx

RUN composer dump-autoload --optimize --no-dev \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Render enruta el trafico publico al puerto 10000 por defecto.
EXPOSE 10000

ENTRYPOINT ["roya-entrypoint"]
