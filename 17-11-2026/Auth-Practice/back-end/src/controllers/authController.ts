import type { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthenticatedRequest } from "../middleware/auth";
import { findUserByEmail, registerUser, userDetails, verifyPassword } from "../services/authService";
import type { LoginBody, PublicUser, RegisterBody } from "../types/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cookieOptions: CookieOptions = { httpOnly: true, secure: env.isProduction, sameSite: "strict", path: "/" };
const stringValue = (value: unknown): string => typeof value === "string" ? value : "";

function databaseErrorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : undefined;
}

function setAuthCookie(res: Response, user: PublicUser, rememberMe: boolean): void {
  const token = jwt.sign({ sub: String(user.id), email: user.email }, env.jwtSecret, { expiresIn: rememberMe ? "7d" : "2h" });
  res.cookie("customer_token", token, { ...cookieOptions, ...(rememberMe ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}) });
}

export async function register(req: Request<object, object, RegisterBody>, res: Response): Promise<void> {
  const name = stringValue(req.body.name).trim();
  const email = stringValue(req.body.email).trim().toLowerCase();
  const password = stringValue(req.body.password);
  if (name.length < 2 || name.length > 100) { res.status(400).json({ message: "Name must be between 2 and 100 characters." }); return; }
  if (!emailPattern.test(email) || email.length > 255) { res.status(400).json({ message: "Enter a valid email address." }); return; }
  if (password.length < 8 || password.length > 72) { res.status(400).json({ message: "Password must be between 8 and 72 characters." }); return; }

  try {
    const user = await registerUser(name, email, password);
    res.status(201).json({ message: "Account created. You can now log in.", user });
  } catch (error) {
    if (databaseErrorCode(error) === "23505") { res.status(409).json({ message: "An account with this email already exists." }); return; }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Could not create the account." });
  }
}

export async function login(req: Request<object, object, LoginBody>, res: Response): Promise<void> {
  const email = stringValue(req.body.email).trim().toLowerCase();
  const password = stringValue(req.body.password);
  const rememberMe = req.body.rememberMe === true;
  if (!emailPattern.test(email) || !password) { res.status(400).json({ message: "Enter a valid email and password." }); return; }

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) { res.status(401).json({ message: "Incorrect email or password." }); return; }
    const safeUser = userDetails(user);
    setAuthCookie(res, safeUser, rememberMe);
    res.json({ message: "Login successful.", user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to log in right now." });
  }
}

export function currentUser(req: AuthenticatedRequest, res: Response): void { res.json({ user: req.user }); }
export function logout(_req: Request, res: Response): void { res.clearCookie("customer_token", cookieOptions); res.json({ message: "Logged out successfully." }); }

export function forgotPassword(req: Request<object, object, { email?: unknown }>, res: Response): void {
  if (!emailPattern.test(stringValue(req.body.email).trim())) { res.status(400).json({ message: "Enter a valid email address." }); return; }
  res.json({ message: "If an account exists for that email, password reset instructions will be sent." });
}
