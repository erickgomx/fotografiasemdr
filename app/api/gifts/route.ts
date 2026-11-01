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
      // Sincroniza se ainda estiver com os dados ou textos anteriores
      const needsSync = await prisma.gift.findFirst({
        where: {
          OR: [
            { price: { lt: 197 } },
            { title: "Produtor Executivo: Você Define o Orçamento da Produção!" },
            { title: "Cota pro Noivo Não Pedir Microfone Lapela no Altar" },
          ],
        },
      });
      if (needsSync) {
        for (const item of INITIAL_GIFTS) {
          const existing = await prisma.gift.findFirst({
            where: {
              OR: [{ imageUrl: item.imageUrl }, { title: item.title }],
            },
          });
          if (existing) {
            await prisma.gift.update({
              where: { id: existing.id },
              data: {
                title: item.title,
                price: item.price,
                description: item.description,
                imageUrl: item.imageUrl,
                category: item.category,
              },
            });
          } else {
            await prisma.gift.create({ data: item });
          }
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
