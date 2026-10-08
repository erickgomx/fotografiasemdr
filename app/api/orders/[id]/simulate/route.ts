import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const action = body.action || "approve"; // "approve" | "reject"

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        gift: true,
        guestMessage: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado para simulação." },
        { status: 404 }
      );
    }

    const newStatus = action === "reject" ? "REJECTED" : "APPROVED";

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
      },
      include: {
        gift: true,
        guestMessage: true,
      },
    });

    // Se aprovado e o pagador deixou recado, cria o registro em GuestMessage
    if (newStatus === "APPROVED" && updatedOrder.payerMessage && !updatedOrder.guestMessage) {
      const displayName = updatedOrder.isAnonymous ? "Anônimo Apaixonado" : updatedOrder.payerName;
      await prisma.guestMessage.create({
        data: {
          orderId: updatedOrder.id,
          name: displayName,
          message: updatedOrder.payerMessage,
        },
      });
    }

    console.log(`[Simulador Mock] Pedido ${id} alterado com sucesso para ${newStatus}`);

    return NextResponse.json({
      success: true,
      message: `Simulação concluída! Status do pedido: ${newStatus}`,
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("[API /api/orders/[id]/simulate] Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro na simulação do pagamento." },
      { status: 500 }
    );
  }
}
