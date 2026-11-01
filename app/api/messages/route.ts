import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncWeddingOrdersAndMessages } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    // 1. Se o banco local estiver vazio ou o usuário pediu para atualizar o mural,
    // sincroniza automaticamente direto da API do Mercado Pago
    const currentCount = await prisma.guestMessage.count();
    if (currentCount === 0 || forceRefresh) {
      await syncWeddingOrdersAndMessages(forceRefresh);
    }

    // 2. Garante também que qualquer pedido aprovado no banco que tenha recado esteja no mural
    const approvedOrdersWithMsg = await prisma.order.findMany({
      where: {
        status: "APPROVED",
        guestMessage: null,
      },
    });

    for (const ord of approvedOrdersWithMsg) {
      const displayName = ord.isAnonymous ? "Anônimo Apaixonado" : ord.payerName;
      const finalMsg = ord.payerMessage?.trim() || "Muitas felicidades, amor e prosperidade aos noivos Erick & Itally!";
      await prisma.guestMessage.create({
        data: {
          orderId: ord.id,
          name: displayName,
          message: finalMsg,
          createdAt: ord.createdAt,
        },
      }).catch(() => {});
    }

    // 3. Retorna todas as mensagens legítimas do mural em ordem cronológica decrescente
    const messages = await prisma.guestMessage.findMany({
      where: {
        order: {
          status: "APPROVED",
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
