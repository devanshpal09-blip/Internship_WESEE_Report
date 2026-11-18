import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { env } from "../config/env";
import type { PublicUser } from "../types/auth";

export interface AuthenticatedRequest extends Request { user?: PublicUser; }

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies.customer_token as string | undefined;
    if (!token) { res.status(401).json({ message: "Please log in." }); return; }
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === "string" || !payload.sub) { res.status(401).json({ message: "Your session is invalid. Please log in again." }); return; }

    const result = await pool.query<PublicUser>("SELECT id, name, email, created_at FROM users WHERE id = $1", [payload.sub]);
    if (result.rowCount === 0) { res.status(401).json({ message: "Account not found. Please log in again." }); return; }
    req.user = result.rows[0];
    next();
  } catch {
    res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}
