CREATE TABLE IF NOT EXISTS entries (
  id            serial PRIMARY KEY,
  name          text        NOT NULL,
  message       text        NOT NULL,
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz
);
