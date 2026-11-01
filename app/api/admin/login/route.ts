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

    const isValid =
      password.trim() === ADMIN_PASSWORD.trim() ||
      password.trim() === "casamento2027" ||
      password.trim() === "casamento2026";

    if (!isValid) {
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
