import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, generateAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Informe a senha de acesso." },
        { status: 400 }
      );
    }

    const configuredPassword = ADMIN_PASSWORD ? ADMIN_PASSWORD.trim() : "";

    if (!configuredPassword) {
      console.error("[Login API] Variável de ambiente ADMIN_PASSWORD não configurada no servidor.");
      return NextResponse.json(
        { success: false, error: "Senha de administração não configurada no servidor." },
        { status: 500 }
      );
    }

    if (password.trim() !== configuredPassword) {
      return NextResponse.json(
        { success: false, error: "Senha incorreta. Tente novamente." },
        { status: 401 }
      );
    }

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
      maxAge: 60 * 60 * 24 * 7, // 7 dias
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
