-- The retailer's own selling price for a product (FR-07), stored like observation prices.
ALTER TABLE products
  ADD COLUMN own_price text CHECK (own_price ~ '^[0-9]+\.[0-9]{2}$'),
  ADD COLUMN own_currency text CHECK (own_currency ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT products_own_price_has_currency CHECK (own_price IS NULL OR own_currency IS NOT NULL);
