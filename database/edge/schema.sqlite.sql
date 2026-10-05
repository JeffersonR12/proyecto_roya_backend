CREATE TABLE IF NOT EXISTS diagnosticos_local (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid_local TEXT UNIQUE NOT NULL,
    image_path TEXT,
    clase TEXT NOT NULL,
    confianza REAL NOT NULL,
    severidad REAL,
    parcela_id_local TEXT,
    latitud REAL,
    longitud REAL,
    modelo_version TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
