import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { pool } from "./config/database";
import { env } from "./config/env";
import { authRouter } from "./routes/authRoutes";

const app = express();
const frontendPath = path.resolve(__dirname, "../../front-end");

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.static(frontendPath));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/api/auth", authRouter);
app.get("/", (_req, res) => res.redirect("/pages/login.html"));
app.get("*", (_req, res) => res.sendFile(path.join(frontendPath, "pages", "login.html")));

app.listen(env.port, () => console.log(`Customer Login System running at http://localhost:${env.port}`));
