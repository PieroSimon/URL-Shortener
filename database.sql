-- 1. Crear la tabla principal de URLs
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    clicks INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear la tabla de logs para estadísticas detalladas
CREATE TABLE click_logs (
    id SERIAL PRIMARY KEY,
    url_id INT REFERENCES urls(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    referrer TEXT
);

-- Opcional: Crear un índice para búsquedas más rápidas por código
CREATE INDEX idx_short_code ON urls(short_code);