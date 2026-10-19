CREATE TABLE products (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  retailer_id text NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 500),
  brand text NOT NULL DEFAULT '' CHECK (length(brand) <= 200),
  asin text CHECK (asin ~ '^[A-Z0-9]{10}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, retailer_id)
);
CREATE INDEX products_retailer_idx ON products(retailer_id);

CREATE TABLE observations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  retailer_id text NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  product_id text,
  asin text NOT NULL CHECK (asin ~ '^[A-Z0-9]{10}$'),
  product_name text NOT NULL CHECK (length(btrim(product_name)) BETWEEN 1 AND 500),
  source text NOT NULL CHECK (length(btrim(source)) > 0),
  seller text CHECK (length(seller) <= 200),
  price text CHECK (price ~ '^[0-9]+\.[0-9]{2}$'),
  currency text CHECK (currency ~ '^[A-Z]{3}$'),
  availability text NOT NULL CHECK (availability IN ('in_stock', 'out_of_stock', 'unknown')),
  match_status text NOT NULL DEFAULT 'unverified'
    CHECK (match_status IN ('confirmed', 'unverified', 'mismatch')),
  observed_at timestamptz NOT NULL DEFAULT now(),
  collected_via text NOT NULL CHECK (collected_via IN ('extension', 'crawler')),
  CHECK (price IS NULL OR currency IS NOT NULL),
  CHECK (product_id IS NOT NULL OR match_status = 'unverified'),
  FOREIGN KEY (product_id, retailer_id) REFERENCES products(id, retailer_id)
);
CREATE INDEX observations_retailer_time_idx ON observations(retailer_id, observed_at DESC, id);

CREATE TABLE attempts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  retailer_id text NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  product_id text,
  source text NOT NULL CHECK (length(btrim(source)) > 0),
  status text NOT NULL CHECK (status IN ('ok', 'blocked', 'failed')),
  reason text CHECK (length(reason) <= 300),
  attempted_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (product_id, retailer_id) REFERENCES products(id, retailer_id)
);
CREATE INDEX attempts_retailer_time_idx ON attempts(retailer_id, attempted_at DESC, id);
