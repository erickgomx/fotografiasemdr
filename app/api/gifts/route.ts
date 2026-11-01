import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_GIFTS } from "@/lib/seedData";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Auto-seed se o banco estiver vazio
    const count = await prisma.gift.count();
    if (count === 0) {
      for (const item of INITIAL_GIFTS) {
        await prisma.gift.create({ data: item });
      }
    } else {
      // Se houver algum presente com preço antigo inferior a 197, atualiza para os novos valores oficiais
      const hasOldPrices = await prisma.gift.findFirst({
        where: { price: { lt: 197 } },
      });
      if (hasOldPrices) {
        for (const item of INITIAL_GIFTS) {
          await prisma.gift.updateMany({
            where: { title: item.title },
            data: {
              price: item.price,
              description: item.description,
              imageUrl: item.imageUrl,
              category: item.category,
            },
          });
        }
      }
    }

    const whereClause: { active: boolean; category?: string } = {
      active: true,
    };

    if (category && category !== "todas") {
      whereClause.category = category;
    }

    const gifts = await prisma.gift.findMany({
      where: whereClause,
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
  } catch (error) {
    console.error("[API /api/gifts] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar presentes" },
      { status: 500 }
    );
  }
}
