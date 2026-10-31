import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/mercadopago";

export async function POST() {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: { guestMessage: true },
    });

    let updatedCount = 0;
    let mockResetCount = 0;

    for (const order of orders) {
      if (order.mpPaymentId && !order.mpPaymentId.startsWith("mock_mp_")) {
        // Consulta o status real na API do Mercado Pago
        const realStatus = await getPaymentStatus(order.mpPaymentId);

        if (order.status !== realStatus) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: realStatus },
          });

          // Se não estiver pago no Mercado Pago, remove mensagem indevida
          if (realStatus !== "APPROVED" && order.guestMessage) {
            await prisma.guestMessage.delete({
              where: { orderId: order.id },
            });
          }

          updatedCount++;
        }
      } else if (order.mpPaymentId?.startsWith("mock_mp_") && order.status === "APPROVED") {
        // Pedido de simulação que foi aprovado por engano: reseta para PENDING
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PENDING" },
        });

        if (order.guestMessage) {
          await prisma.guestMessage.delete({
            where: { orderId: order.id },
          });
        }

        mockResetCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída! ${updatedCount} pedidos verificados com o Mercado Pago e ${mockResetCount} aprovações manuais de teste revertidas para pendente.`,
    });
  } catch (error: any) {
    console.error("[Admin Sync All] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao sincronizar com Mercado Pago." },
      { status: 500 }
    );
  }
}
