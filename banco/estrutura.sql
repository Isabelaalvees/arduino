-- =========================================
-- BANCO DE DADOS - PROJETO SENSORES
-- =========================================

-- Tabela de dados atmosféricos
CREATE TABLE IF NOT EXISTS atmosfera (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pressao_atmosferica DECIMAL(10,2),
    temperatura DECIMAL(5,2),
    altitude_aproximada DECIMAL(8,2)
);

-- Tabela de nível da água
CREATE TABLE IF NOT EXISTS nivel_agua (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nivel_agua DECIMAL(8,2)
);

CREATE TABLE IF NOT EXISTS temperatura (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperatura DECIMAL(5,2) NOT NULL
);