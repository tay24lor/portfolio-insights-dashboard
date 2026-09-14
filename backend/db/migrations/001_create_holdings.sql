CREATE TABLE IF NOT EXISTS holdings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  symbol VARCHAR(12) NOT NULL,
  shares NUMERIC(18, 6) NOT NULL CHECK (shares >= 0),
  avg_price NUMERIC(18, 4) NOT NULL CHECK (avg_price >= 0),
  current_price NUMERIC(18, 4) NOT NULL CHECK (current_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, symbol)
);

CREATE INDEX IF NOT EXISTS holdings_user_id_idx ON holdings (user_id);
