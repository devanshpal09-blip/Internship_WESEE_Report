import Fastify from "fastify";
import { prisma } from "./plugins/prisma.js";

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  // Basic API health check
  app.get("/health", async () => {
    return {
      success: true,
      message: "Customer Payment API is running"
    };
  });

  // Database health check
  app.get("/health/db", async () => {
    await prisma.$queryRaw`SELECT 1`;

    return {
      success: true,
      message: "PostgreSQL connected successfully"
    };
  });

  // Close database connection when server shuts down
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}