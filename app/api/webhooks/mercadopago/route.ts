import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentStatus, isMockMode } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || searchParams.get("type");
    const id = searchParams.get("id") || searchParams.get("data.id");

    const body = await request.json().catch(() => ({}));
    const paymentId = id || body?.data?.id || body?.id;

    console.log(`[Webhook MP] Recebida notificação: topic=${topic}, paymentId=${paymentId}`);

    if (isMockMode()) {
      return NextResponse.json({
        message: "Webhook recebido em modo Mock. Nenhuma ação necessária.",
      });
    }

    if (paymentId) {
      const status = await getPaymentStatus(String(paymentId));

      // Localiza o pedido pelo mpPaymentId
      const order = await prisma.order.findFirst({
        where: { mpPaymentId: String(paymentId) },
        include: { guestMessage: true },
      });

      if (order && order.status !== status) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status },
        });

        if (status === "APPROVED" && order.payerMessage && !order.guestMessage) {
          const displayName = order.isAnonymous ? "Anônimo Apaixonado" : order.payerName;
          await prisma.guestMessage.create({
            data: {
              orderId: order.id,
              name: displayName,
              message: order.payerMessage,
            },
          });
        }

        console.log(`[Webhook MP] Pedido ${order.id} atualizado para status: ${status}`);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook MP] Erro:", error);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}
