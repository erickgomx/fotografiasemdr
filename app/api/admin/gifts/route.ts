import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  try {
    const gifts = await prisma.gift.findMany({
      orderBy: { price: "asc" },
      include: {
        _count: {
          select: {
            orders: {
              where: { status: "APPROVED" },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: gifts,
    });
  } catch (error: any) {
    console.error("[API GET /api/admin/gifts] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar catálogo de presentes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, imageUrl, price, category } = body;

    if (!title || !imageUrl || !price || !category) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const newGift = await prisma.gift.create({
      data: {
        title: title.trim(),
        description: (description || "").trim(),
        imageUrl: imageUrl.trim(),
        price: Number(price),
        category: category.trim(),
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newGift,
      message: "Presente criado com sucesso!",
    });
  } catch (error: any) {
    console.error("[API POST /api/admin/gifts] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar presente." },
      { status: 500 }
    );
  }
}
