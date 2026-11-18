export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export type PublicUser = Omit<UserRecord, "password_hash">;

export interface RegisterBody { name?: unknown; email?: unknown; password?: unknown; }
export interface LoginBody { email?: unknown; password?: unknown; rememberMe?: unknown; }
