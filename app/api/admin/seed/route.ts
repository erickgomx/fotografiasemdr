import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_GIFTS } from "@/lib/seedData";
import { isAuthenticated } from "@/lib/auth";

export async function POST() {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  try {
    for (const item of INITIAL_GIFTS) {
      const exists = await prisma.gift.findFirst({
        where: { title: item.title },
      });
      if (!exists) {
        await prisma.gift.create({ data: item });
      } else {
        await prisma.gift.update({
          where: { id: exists.id },
          data: {
            imageUrl: item.imageUrl,
            description: item.description,
            price: item.price,
            category: item.category,
          },
        });
      }
    }

    const gifts = await prisma.gift.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "Catálogo de presentes atualizado com fotos cinematográficas!",
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
