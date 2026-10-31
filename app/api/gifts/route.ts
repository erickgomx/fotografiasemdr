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
      // Sincroniza automaticamente se houver novas fotos no catálogo
      const checkFirst = await prisma.gift.findFirst({
        where: { title: INITIAL_GIFTS[0].title },
      });
      if (checkFirst && checkFirst.imageUrl !== INITIAL_GIFTS[0].imageUrl) {
        for (const item of INITIAL_GIFTS) {
          await prisma.gift.updateMany({
            where: { title: item.title },
            data: {
              imageUrl: item.imageUrl,
              description: item.description,
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
