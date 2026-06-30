-- Execute este SQL no Supabase SQL Editor para criar as tabelas

CREATE TABLE IF NOT EXISTS pets (
  id          SERIAL PRIMARY KEY,
  nome        TEXT    NOT NULL,
  especie     TEXT    NOT NULL,
  raca        TEXT,
  idade       TEXT,
  sexo        TEXT,
  porte       TEXT    DEFAULT 'medio',
  status      TEXT    DEFAULT 'disponivel',
  vacinado    BOOLEAN DEFAULT FALSE,
  castrado    BOOLEAN DEFAULT FALSE,
  vermifugado BOOLEAN DEFAULT FALSE,
  descricao   TEXT,
  contato     TEXT,
  adotado_por TEXT,
  data_adocao TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_memories (
  id         SERIAL PRIMARY KEY,
  pet_id     INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  tipo       TEXT    DEFAULT 'texto',
  conteudo   TEXT    NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
