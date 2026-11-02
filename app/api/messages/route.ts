import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncWeddingOrdersAndMessages } from "@/lib/sync";
import { getExcludedEmails } from "@/lib/exclusions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    const excludedEmails = Array.from(getExcludedEmails());

    // 0. Limpeza preventiva no banco de recados padrão falsos e de emails excluídos
    await prisma.guestMessage.deleteMany({
      where: {
        OR: [
          { message: "Muitas felicidades, amor e prosperidade aos noivos Erick & Itally!" },
          { order: { payerEmail: { in: excludedEmails } } },
          { order: { status: "DELETED" } },
        ],
      },
    }).catch(() => {});

    // 1. Se o banco local estiver vazio ou o visitante solicitou atualizar o mural,
    // sincroniza de forma segura respeitando estritamente o cooldown global anti-DoS (force = false)
    const currentCount = await prisma.guestMessage.count();
    if (currentCount === 0 || forceRefresh) {
      await syncWeddingOrdersAndMessages(false);
    }

    // 2. Garante apenas que pedidos aprovados que REALMENTE tenham recado escrito pelo convidado estejam no mural
    const approvedOrdersWithRealMsg = await prisma.order.findMany({
      where: {
        status: "APPROVED",
        payerEmail: { notIn: excludedEmails },
        guestMessage: null,
        payerMessage: { not: null },
      },
    });

    for (const ord of approvedOrdersWithRealMsg) {
      const realMsg = ord.payerMessage?.trim();
      if (!realMsg || realMsg.length === 0) continue;

      const displayName = ord.isAnonymous ? "Anônimo Apaixonado" : ord.payerName;
      await prisma.guestMessage.create({
        data: {
          orderId: ord.id,
          name: displayName,
          message: realMsg,
          createdAt: ord.createdAt,
        },
      }).catch(() => {});
    }

    // 3. Retorna todas as mensagens legítimas do mural em ordem cronológica decrescente
    const messages = await prisma.guestMessage.findMany({
      where: {
        order: {
          status: "APPROVED",
          payerEmail: { notIn: excludedEmails },
        },
        message: {
          not: "Muitas felicidades, amor e prosperidade aos noivos Erick & Itally!",
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("[API /api/messages] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar recados do mural." },
      { status: 500 }
    );
  }
}
