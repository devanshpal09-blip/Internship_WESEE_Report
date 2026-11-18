import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false
});

pool.on("error", (error: Error) => console.error("Unexpected PostgreSQL pool error:", error));
