import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.AUTH_SECRET || "erick-itally-wedding-secret-key-2026";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "casamento2026";
export const AUTH_COOKIE_NAME = "ei_admin_token";

export function generateAuthToken(): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(ADMIN_PASSWORD);
  return hmac.digest("hex");
}

export function verifyAuthToken(token?: string | null): boolean {
  if (!token) return false;
  const expected = generateAuthToken();
  return token === expected;
}

export function isAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    return verifyAuthToken(token);
  } catch {
    return false;
  }
}
