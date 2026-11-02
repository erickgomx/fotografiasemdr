import { NextResponse } from "next/server";
import {
  ADMIN_PASSWORD,
  generateAuthToken,
  verifyPassword,
  AUTH_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

// Sistema de Rate Limiting em memória para proteção contra ataques de força bruta
interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos de bloqueio

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown-ip";
}

function checkRateLimit(ip: string): { allowed: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { allowed: true };
  }

  if (now > record.lockoutUntil) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const remainingMs = record.lockoutUntil - now;
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    return { allowed: false, remainingMinutes };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || {
    attempts: 0,
    lockoutUntil: now + LOCKOUT_DURATION_MS,
  };

  record.attempts += 1;
  record.lockoutUntil = now + LOCKOUT_DURATION_MS;
  loginAttempts.set(ip, record);

  // Limpeza preventiva de entradas expiradas para evitar vazamento de memória
  if (loginAttempts.size > 2000) {
    loginAttempts.forEach((val, key) => {
      if (now > val.lockoutUntil) {
        loginAttempts.delete(key);
      }
    });
  }
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // 1. Verificação de Rate Limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Muitas tentativas incorretas. Por segurança, tente novamente em ${rateCheck.remainingMinutes} minuto(s).`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Informe a senha de acesso." },
        { status: 400 }
      );
    }

    if (!ADMIN_PASSWORD || !ADMIN_PASSWORD.trim()) {
      console.error("[Login API] Variável de ambiente ADMIN_PASSWORD não configurada no servidor.");
      return NextResponse.json(
        { success: false, error: "Senha de administração não configurada no servidor." },
        { status: 500 }
      );
    }

    // 2. Validação segura com tempo constante
    const isValid = verifyPassword(password);

    if (!isValid) {
      recordFailedAttempt(ip);

      // Atraso de 600ms para dificultar tentativas simultâneas
      await new Promise((resolve) => setTimeout(resolve, 600));

      const currentRecord = loginAttempts.get(ip);
      const remainingAttempts = Math.max(0, MAX_ATTEMPTS - (currentRecord?.attempts || 0));

      const errorMsg =
        remainingAttempts > 0
          ? `Senha incorreta. ${remainingAttempts} tentativa(s) restante(s) antes do bloqueio temporário.`
          : "Senha incorreta. Limite de tentativas excedido. Tente novamente em 15 minutos.";

      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 401 }
      );
    }

    // 3. Sucesso: Limpa contadores e emite novo token dinâmico assinado
    clearAttempts(ip);
    const token = generateAuthToken();

    const response = NextResponse.json({
      success: true,
      message: "Login realizado com sucesso!",
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("[Login API] Erro ao autenticar:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
