import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { getPaymentStatus, isMockMode } from "@/lib/mercadopago";
import { addExcludedPayment, addExcludedEmail, isPaymentExcluded, isEmailExcluded } from "@/lib/exclusions";

// Consulta o status real no Mercado Pago
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { guestMessage: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Pedido não encontrado" }, { status: 404 });
    }

    // Se o pedido foi excluído anteriormente
    if (order.status === "DELETED") {
      return NextResponse.json({
        success: true,
        data: order,
        message: "Este pedido foi excluído pelos noivos.",
        isRealPayment: false,
      });
    }

    // Se for pedido de simulação mock
    if (!order.mpPaymentId || order.mpPaymentId.startsWith("mock_mp_")) {
      return NextResponse.json({
        success: true,
        data: order,
        message: "Este é um pedido de teste/simulação gerado localmente.",
        isRealPayment: false,
      });
    }

    // Consulta status oficial diretamente no Mercado Pago
    const realStatus = await getPaymentStatus(order.mpPaymentId);

    // Atualiza o banco de dados com a verdade do Mercado Pago
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: realStatus },
      include: { gift: true, guestMessage: true },
    });

    // Se no Mercado Pago NÃO estiver aprovado, remove mensagem indevida se existir
    if (realStatus !== "APPROVED" && updated.guestMessage) {
      await prisma.guestMessage.delete({
        where: { orderId: updated.id },
      });
    }

    // Se no Mercado Pago ESTIVER aprovado e tiver recado real digitado
    if (realStatus === "APPROVED" && updated.payerMessage && !updated.guestMessage) {
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
      data: updated,
      realStatus,
      isRealPayment: true,
      message:
        realStatus === "APPROVED"
          ? "Pagamento confirmado pelo Mercado Pago!"
          : "Pagamento ainda pendente no Mercado Pago.",
    });
  } catch (error: any) {
    console.error("[Admin Check Order] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao consultar Mercado Pago." },
      { status: 500 }
    );
  }
}

// Exclui pedido definitivamente para que nunca mais reapareça
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { guestMessage: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
    }

    // 1. Remove qualquer recado do mural imediatamente
    await prisma.guestMessage.deleteMany({
      where: { orderId: id },
    });

    // 2. Registra na lista de exclusões permanente para nunca ser ressuscitado pelo sync
    if (order.mpPaymentId) {
      addExcludedPayment(order.mpPaymentId);
    }
    if (order.payerEmail) {
      addExcludedEmail(order.payerEmail);
    }

    // 3. Marca como DELETED no banco para rastreabilidade e evitar re-inserção
    await prisma.order.update({
      where: { id },
      data: { status: "DELETED" },
    });

    return NextResponse.json({
      success: true,
      message: "Pedido e recado excluídos definitivamente com sucesso.",
    });
  } catch (error: any) {
    console.error("[Admin Delete Order] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao remover pedido." },
      { status: 500 }
    );
  }
}
