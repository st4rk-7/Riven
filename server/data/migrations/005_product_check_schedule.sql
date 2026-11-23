ALTER TABLE products
  ADD COLUMN check_every_hours smallint DEFAULT 6
    CHECK (check_every_hours IN (6, 12, 24)),
  ADD COLUMN next_check_at timestamptz DEFAULT (now() + interval '6 hours');