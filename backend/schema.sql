CREATE TABLE IF NOT EXISTS product (
  id BIGSERIAL PRIMARY KEY,
  code CHAR(10) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS raw_material (
  id BIGSERIAL PRIMARY KEY,
  code CHAR(10) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  stock_quantity NUMERIC(14,3) NOT NULL CHECK (stock_quantity >= 0)
);

CREATE TABLE IF NOT EXISTS product_raw_material (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  raw_material_id BIGINT NOT NULL REFERENCES raw_material(id) ON DELETE RESTRICT,
  required_quantity NUMERIC(14,3) NOT NULL CHECK (required_quantity > 0),
  UNIQUE (product_id, raw_material_id)
);