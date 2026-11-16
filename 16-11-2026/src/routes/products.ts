import type { FastifyInstance, FastifyReply } from 'fastify';
import {
  createCarSchema,
  listCarsSchema,
  getCarSchema,
  updateCarSchema,
  deleteCarSchema,
  type Car,
  type CreateCarBody,
  type UpdateCarBody,
  type IdParams,
  type ListQuery
} from '../schemas/car_schemas.js';

// Yahan car routes register honge.

// price is NUMERIC in PG (returned as string) -> cast to float for JSON
const COLUMNS = `id, name, sku, description, price::float8 AS price,
                 stock, is_active, created_at, updated_at`;

const UNIQUE_VIOLATION = '23505';

const notFound = (reply: FastifyReply) =>
  reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Car not found' });

const skuConflict = (reply: FastifyReply) =>
  reply.code(409).send({ statusCode: 409, error: 'Conflict', message: 'SKU already exists' });

const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === UNIQUE_VIOLATION;

export default async function carRoutes(app: FastifyInstance): Promise<void> {
  // Create
  app.post<{ Body: CreateCarBody }>(
    '/cars',
    { schema: createCarSchema },
    async (req, reply) => {
      const { name, sku, description = null, price, stock = 0, is_active = true } = req.body;
      try {
        const { rows } = await app.db.query<Car>(
          `INSERT INTO cars (name, sku, description, price, stock, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING ${COLUMNS}`,
          [name, sku, description, price, stock, is_active]
        );
        return reply.code(201).send(rows[0]);
      } catch (err) {
        if (isUniqueViolation(err)) return skuConflict(reply);
        throw err;
      }
    }
  );

  // List (paginated)
  app.get<{ Querystring: ListQuery }>(
    '/cars',
    { schema: listCarsSchema },
    async (req) => {
      const { limit, offset } = req.query;
      const { rows } = await app.db.query<Car>(
        `SELECT ${COLUMNS} FROM cars ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return { data: rows, limit, offset };
    }
  );

  // Get one
  app.get<{ Params: IdParams }>(
    '/cars/:id',
    { schema: getCarSchema },
    async (req, reply) => {
      const { rows } = await app.db.query<Car>(
        `SELECT ${COLUMNS} FROM cars WHERE id = $1`,
        [req.params.id]
      );
      return rows.length ? rows[0] : notFound(reply);
    }
  );

  // Update (partial). Field names are safe: body schema forbids extra properties.
  app.put<{ Params: IdParams; Body: UpdateCarBody }>(
    '/cars/:id',
    { schema: updateCarSchema },
    async (req, reply) => {
      const fields = Object.keys(req.body) as (keyof UpdateCarBody)[];
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const values = fields.map((f) => req.body[f]);

      try {
        const { rows } = await app.db.query<Car>(
          `UPDATE cars
              SET ${setClause}, updated_at = NOW()
            WHERE id = $${fields.length + 1}
        RETURNING ${COLUMNS}`,
          [...values, req.params.id]
        );
        return rows.length ? rows[0] : notFound(reply);
      } catch (err) {
        if (isUniqueViolation(err)) return skuConflict(reply);
        throw err;
      }
    }
  );

  // Delete
  app.delete<{ Params: IdParams }>(
    '/cars/:id',
    { schema: deleteCarSchema },
    async (req, reply) => {
      const result = await app.db.query('DELETE FROM cars WHERE id = $1', [req.params.id]);
      return result.rowCount ? reply.code(204).send() : notFound(reply);
    }
  );
}