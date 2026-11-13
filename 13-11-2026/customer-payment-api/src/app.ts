import Fastify from "fastify";
import { prisma } from "./plugins/prisma.js";

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.get("/", async (request, reply) => {
  return {
    message: "Customer Payment API is running",
    status: "success"
  };
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