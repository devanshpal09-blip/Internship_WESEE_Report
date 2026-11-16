import type { Client } from 'pg';

export async function up(client: Client): Promise<void> {
  await client.query(`
    CREATE TABLE products (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(255)   NOT NULL,
      sku         VARCHAR(64)    NOT NULL UNIQUE,
      description TEXT,
      price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      stock       INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
      is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);
  await client.query(
    `CREATE INDEX idx_products_name ON products (name)`
  );
}

export async function down(client: Client): Promise<void> {
  await client.query(`DROP INDEX idx_products_name`);
  await client.query(`DROP TABLE products`);
}