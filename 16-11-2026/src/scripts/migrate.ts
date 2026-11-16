import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';
import type { Migration } from '../migrations/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const direction = process.argv[2];
if (direction !== 'up' && direction !== 'down') {
  console.error('Usage: migrate <up|down>');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

// Matches 001_name.ts (dev) or 001_name.js (after build), ignores .d.ts
const MIGRATION_FILE = /^\d+_.+\.(ts|js)$/;

async function listMigrations(): Promise<string[]> {
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files
    .filter((f) => MIGRATION_FILE.test(f) && !f.endsWith('.d.ts'))
    .sort();
}

const nameOf = (file: string) => file.replace(/\.(ts|js)$/, '');

async function load(file: string): Promise<Migration> {
  return import(pathToFileURL(path.join(MIGRATIONS_DIR, file)).href);
}

async function ensureTable(): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
}

async function up(): Promise<void> {
  const { rows } = await client.query<{ name: string }>(
    'SELECT name FROM schema_migrations'
  );
  const applied = new Set(rows.map((r) => r.name));
  const pending = (await listMigrations()).filter((f) => !applied.has(nameOf(f)));

  if (!pending.length) return console.log('Nothing to migrate.');

  for (const file of pending) {
    const migration = await load(file);
    try {
      await client.query('BEGIN');
      await migration.up(client);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [nameOf(file)]);
      await client.query('COMMIT');
      console.log(`✔ applied  ${nameOf(file)}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  }
}

async function down(): Promise<void> {
  // Reverts only the most recently applied migration
  const { rows } = await client.query<{ name: string }>(
    'SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1'
  );
  const row = rows[0];
  if (!row) return console.log('Nothing to roll back.');

  const { name } = row;
  const file = (await listMigrations()).find((f) => nameOf(f) === name);
  if (!file) throw new Error(`Migration file for "${name}" not found`);

  const migration = await load(file);
  try {
    await client.query('BEGIN');
    await migration.down(client);
    await client.query('DELETE FROM schema_migrations WHERE name = $1', [name]);
    await client.query('COMMIT');
    console.log(`✔ reverted ${name}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

try {
  await client.connect();
  await ensureTable();
  await (direction === 'up' ? up() : down());
} catch (err) {
  console.error('Migration failed:', (err as Error).message);
  process.exitCode = 1;
} finally {
  await client.end();
}