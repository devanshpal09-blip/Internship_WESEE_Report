import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

if (!databaseUrl) throw new Error("DATABASE_URL is missing. Configure it in back-end/.env.");
if (!jwtSecret || jwtSecret.length < 32) throw new Error("JWT_SECRET must be set and at least 32 characters long.");

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl,
  jwtSecret,
  databaseSsl: process.env.DB_SSL === "true",
  isProduction: process.env.NODE_ENV === "production"
};
