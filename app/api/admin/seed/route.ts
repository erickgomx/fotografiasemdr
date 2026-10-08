import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_GIFTS } from "@/lib/seedData";

export async function POST() {
  try {
    for (const item of INITIAL_GIFTS) {
      const exists = await prisma.gift.findFirst({
        where: { title: item.title },
      });
      if (!exists) {
        await prisma.gift.create({ data: item });
      }
    }

    const gifts = await prisma.gift.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "Lista de presentes sincronizada com sucesso!",
      count: gifts.length,
    });
  } catch (error: any) {
    console.error("[API /api/admin/seed] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao sincronizar presentes." },
      { status: 500 }
    );
  }
}
