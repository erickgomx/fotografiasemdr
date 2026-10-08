import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const messages = await prisma.guestMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        order: {
          select: {
            gift: {
              select: {
                title: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("[API /api/messages] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar recados." },
      { status: 500 }
    );
  }
}
