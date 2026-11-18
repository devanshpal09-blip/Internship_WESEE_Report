import bcrypt from "bcryptjs";
import { pool } from "../config/database";
import type { PublicUser, UserRecord } from "../types/auth";

const SALT_ROUNDS = 12;

export function userDetails(user: UserRecord): PublicUser {
  const { password_hash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function registerUser(name: string, email: string, password: string): Promise<PublicUser> {
  const passwordHash = await hashPassword(password);
  const result = await pool.query<PublicUser>(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
    [name, email, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const result = await pool.query<UserRecord>(
    "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
