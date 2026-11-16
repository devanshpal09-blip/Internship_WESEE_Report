import fp from 'fastify-plugin';
import pg from 'pg';

// Tell TypeScript that app.db exists
declare module 'fastify' {
  interface FastifyInstance {
    db: pg.Pool;
  }
}

export default fp(async (app) => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  await pool.query('SELECT 1'); // fail fast if DB is unreachable

  app.decorate('db', pool);
  app.addHook('onClose', async () => {
    await pool.end();
  });
});