import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentStatus, isMockMode } from "@/lib/mercadopago";

// Remove dados sensíveis (CPF, Email) de respostas públicas (Conformidade LGPD)
function sanitizePublicOrder(order: any) {
  return {
    id: order.id,
    status: order.status,
    amount: order.amount,
    paymentMethod: order.paymentMethod,
    isAnonymous: order.isAnonymous,
    createdAt: order.createdAt,
    gift: order.gift
      ? {
          id: order.gift.id,
          title: order.gift.title,
          imageUrl: order.gift.imageUrl,
          category: order.gift.category,
        }
      : null,
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        gift: true,
        guestMessage: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    // Se estiver pendente, tiver mpPaymentId e não for mock, verifica no Mercado Pago se já pagou
    if (order.status === "PENDING" && order.mpPaymentId && !isMockMode()) {
      const mpStatus = await getPaymentStatus(order.mpPaymentId);

      if (mpStatus !== "PENDING") {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: { status: mpStatus },
          include: {
            gift: true,
            guestMessage: true,
          },
        });

        if (mpStatus === "APPROVED" && updated.payerMessage && !updated.guestMessage) {
          const displayName = updated.isAnonymous ? "Anônimo Apaixonado" : updated.payerName;
          await prisma.guestMessage.create({
            data: {
              orderId: updated.id,
              name: displayName,
              message: updated.payerMessage,
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: sanitizePublicOrder(updated),
          isMock: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: sanitizePublicOrder(order),
      isMock: isMockMode(),
    });
  } catch (error: any) {
    console.error("[API /api/orders/[id]] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao consultar status do pedido." },
      { status: 500 }
    );
  }
}
