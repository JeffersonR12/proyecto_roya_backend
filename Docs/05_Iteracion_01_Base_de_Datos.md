**DOCUMENTO TÉCNICO**
**05. Iteración 01 - Base de Datos y Catálogo Fitosanitario**
*Diseño, implementación y validación del modelo de datos*
**Sistema de Detección Temprana de Roya Amarilla en Trigo (Edge-Cloud)**
Octubre de 2026

# 1. Objetivo de la iteración
Implementar la base de datos central y el almacenamiento local mínimo que permiten administrar usuarios, parcelas, catálogo, diagnósticos, alertas y trazabilidad de sincronización, siguiendo el modelo multi-tenant y offline-first del MVP mejorado.
# 2. Alcance
- PostgreSQL cloud como base recomendada de producción.
- SQLite como almacenamiento local Edge; IndexedDB puede utilizarse en la PWA cuando la implementación sea estrictamente navegador.
- Migraciones, claves foráneas, índices y restricciones.
- Seeders de roles y catálogo fitosanitario inicial.
- UUID local y estados de sincronización.
# 3. Tareas de implementación
| ID | Tarea | Salida | Criterio de aceptación |
|---|---|---|---|
| T-01 | Crear migraciones de tenants y roles | Migraciones versionadas | Ejecutan sin error y son reversibles. |
| T-02 | Crear tabla usuarios con aislamiento por tenant | Tabla + índices | Email único por tenant y FK válidas. |
| T-03 | Crear parcelas y geolocalización | Tabla + restricciones | Coordenadas dentro de rango. |
| T-04 | Crear catálogo fitosanitario | Tabla + seeder | Roya Amarilla incluida. |
| T-05 | Crear diagnósticos y UUID | Tabla + índices | UUID único y confianza/severidad 0-100. |
| T-06 | Crear alertas y sync_events | Tablas | Trazabilidad completa de eventos. |
| T-07 | Crear SQLite/IndexedDB local | Esquema local | Permite guardar diagnósticos sin red. |
| T-08 | Pruebas de integridad | Suite de pruebas | FK, índices y restricciones verificados. |

# 4. SQL de referencia - PostgreSQL
```sql
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    rol_id BIGINT NOT NULL REFERENCES roles(id),
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (tenant_id, email)
);
```

# 5. SQL de referencia - diagnóstico
```sql
CREATE TABLE diagnosticos (
    id BIGSERIAL PRIMARY KEY,
    uuid_local UUID UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    parcela_id BIGINT REFERENCES parcelas(id),
    catalogo_id BIGINT REFERENCES catalogo_fitosanitario(id),
    clase VARCHAR(30) NOT NULL,
    confianza NUMERIC(5,2) NOT NULL CHECK (confianza BETWEEN 0 AND 100),
    severidad NUMERIC(5,2) CHECK (severidad BETWEEN 0 AND 100),
    imagen_path VARCHAR(255) NOT NULL,
    mascara_path VARCHAR(255),
    modelo_version VARCHAR(50) NOT NULL,
    captured_at TIMESTAMP NOT NULL,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
);
```

# 6. Seeder del catálogo
| Código | Nombre | Agente causal / referencia | Uso |
|---|---|---|---|
| PHY-001 | Roya Amarilla | Puccinia striiformis | Clase objetivo. |
| PHY-002 | Roya de la Hoja | Puccinia triticina | Catálogo complementario. |
| PHY-003 | Roya del Tallo | Puccinia graminis | Catálogo complementario. |
| PHY-004 | Oídio | Blumeria graminis | Catálogo complementario. |
| PHY-005 | Septoriosis | Septoria tritici | Catálogo complementario. |
| PHY-000 | Sana | Estado sin enfermedad detectada | Clase sana. |

# 7. Esquema local mínimo
```sql
CREATE TABLE diagnosticos_local (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid_local TEXT UNIQUE NOT NULL,
    image_path TEXT,
    clase TEXT NOT NULL,
    confianza REAL NOT NULL,
    severidad REAL,
    latitud REAL,
    longitud REAL,
    modelo_version TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

# 8. Evidencias de la iteración
- Capturas de migraciones ejecutadas.
- Capturas de PostgreSQL/PGAdmin o herramienta utilizada.
- Capturas del almacenamiento local.
- Registro de seeders ejecutados.
- Pruebas que demuestren unicidad del UUID.
- Prueba de guardar un diagnóstico sin conectividad.
# 9. Criterios de aceptación
- Todas las migraciones finalizan sin errores.
- Las relaciones y restricciones impiden registros inválidos.
- El catálogo inicial está disponible.
- Un diagnóstico puede persistir localmente sin Internet.
- El mismo UUID no puede crear dos diagnósticos en cloud.
