import type { Client } from 'pg';

export async function up(client: Client): Promise<void> {
  await client.query(`
    CREATE TABLE cars (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(255)   NOT NULL,
      sku         VARCHAR(64)    NOT NULL UNIQUE,
      description TEXT,
      Brand       VARCHAR(100),
      price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      stock       INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
      is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);
  await client.query(
    `CREATE INDEX idx_cars_name ON cars (name)`
  );
}

export async function down(client: Client): Promise<void> {
  await client.query(`DROP INDEX idx_cars_name`);
  await client.query(`DROP TABLE cars`);
}