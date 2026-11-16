
import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";

import dbPlugin from "./db.js";
import productRoutes from "./routes/products.js";

export async function buildApp(
  opts: FastifyServerOptions = {},): Promise<FastifyInstance>
{
  const app = Fastify({ logger: true, ...opts });

  await app.register(dbPlugin);

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(productRoutes);

  return app;
}
