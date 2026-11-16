import Fastify from "fastify";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { prisma } from "./plugins/prisma.js";

const publicFile = (fileName: string) =>
  readFileSync(resolve(process.cwd(), "public", fileName), "utf8");

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  // A small, framework-free login UI. Keeping the assets in public makes the
  // page easy to replace with a dedicated frontend later without changing API routes.
  app.get("/login", async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(publicFile("login.html"));
  });

  app.get("/login.css", async (_request, reply) => {
    return reply.type("text/css; charset=utf-8").send(publicFile("login.css"));
  });

  app.get("/login.js", async (_request, reply) => {
    return reply.type("application/javascript; charset=utf-8").send(publicFile("login.js"));
  });

  app.get("/", async () => {
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
