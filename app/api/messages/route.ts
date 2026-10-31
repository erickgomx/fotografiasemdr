import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Garante que todo pedido aprovado que possui recado esteja registrado no mural
    const approvedOrdersWithMsg = await prisma.order.findMany({
      where: {
        status: "APPROVED",
        payerMessage: { not: null },
        guestMessage: null,
      },
    });

    for (const ord of approvedOrdersWithMsg) {
      if (ord.payerMessage && ord.payerMessage.trim()) {
        const displayName = ord.isAnonymous ? "Anônimo Apaixonado" : ord.payerName;
        await prisma.guestMessage.create({
          data: {
            orderId: ord.id,
            name: displayName,
            message: ord.payerMessage.trim(),
            createdAt: ord.createdAt,
          },
        }).catch(() => {});
      }
    }

    const messages = await prisma.guestMessage.findMany({
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
      { success: false, error: "Erro ao buscar recados." },
      { status: 500 }
    );
  }
}
