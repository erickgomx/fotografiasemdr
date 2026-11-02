import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
export const AUTH_COOKIE_NAME = "ei_admin_token";
export const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 horas de sessão válida

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim() || ADMIN_PASSWORD.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[SECURITY ALERT] AUTH_SECRET ou ADMIN_PASSWORD deve ser configurado no ambiente de produção!");
    }
    return "fallback-secret-development-only-change-env";
  }
  return secret;
}

interface SessionPayload {
  role: "admin";
  iat: number;
  exp: number;
  nonce: string;
}

/**
 * Gera um token de sessão criptográfico dinâmico com timestamp, expiração, nonce e HMAC-SHA256
 */
export function generateAuthToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: "admin",
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
    nonce: crypto.randomBytes(16).toString("hex"),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = getAuthSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifica o token de sessão, garantindo assinatura válida, integridade estrutural e não expiração
 */
export function verifyAuthToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return false;

  try {
    const secret = getAuthSecret();
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature, "utf-8");
    const expectedBuf = Buffer.from(expectedSig, "utf-8");

    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.role !== "admin") return false;
    if (!payload.exp || now > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Validação segura de senha em tempo constante (anti-timing attack)
 */
export function verifyPassword(providedPassword: string): boolean {
  const configuredPassword = ADMIN_PASSWORD ? ADMIN_PASSWORD.trim() : "";
  if (!configuredPassword || !providedPassword) return false;

  const providedBuf = Buffer.from(providedPassword.trim(), "utf-8");
  const configuredBuf = Buffer.from(configuredPassword, "utf-8");

  if (providedBuf.length !== configuredBuf.length) {
    // Comparação dummy para manter o mesmo custo computacional aproximado
    crypto.timingSafeEqual(configuredBuf, configuredBuf);
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, configuredBuf);
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
