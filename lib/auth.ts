import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.AUTH_SECRET || "erick-itally-wedding-secret-token";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
export const AUTH_COOKIE_NAME = "ei_admin_token";

export function generateAuthToken(): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(ADMIN_PASSWORD || SECRET);
  return hmac.digest("hex");
}

export function verifyAuthToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const expected = generateAuthToken();
    const tokenBuf = Buffer.from(token, "utf-8");
    const expectedBuf = Buffer.from(expected, "utf-8");
    if (tokenBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
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
