import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPayment, isMockMode } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      giftId,
      payerName,
      payerEmail,
      payerCpf,
      payerMessage,
      isAnonymous = false,
      paymentMethod = "PIX",
      installments = 1,
      cardToken,
      customAmount,
    } = body;

    // Validações básicas
    if (!giftId || !payerName || !payerEmail || !payerCpf) {
      return NextResponse.json(
        { success: false, error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    // Busca o presente
    const gift = await prisma.gift.findUnique({
      where: { id: giftId },
    });

    if (!gift || !gift.active) {
      return NextResponse.json(
        { success: false, error: "Presente não encontrado ou indisponível." },
        { status: 404 }
      );
    }

    // Calcula valor final (suporte a valor aberto / personalizado)
    const finalAmount =
      customAmount !== undefined && customAmount !== null && Number(customAmount) > 0
        ? Number(Number(customAmount).toFixed(2))
        : gift.price;

    if (finalAmount < 5) {
      return NextResponse.json(
        { success: false, error: "O valor mínimo para contribuição é de R$ 5,00." },
        { status: 400 }
      );
    }

    // Cria o pedido inicial no banco de dados com status PENDING
    const order = await prisma.order.create({
      data: {
        giftId: gift.id,
        amount: finalAmount,
        payerName: payerName.trim(),
        payerEmail: payerEmail.trim(),
        payerCpf: payerCpf.trim(),
        payerMessage: payerMessage ? payerMessage.trim() : null,
        isAnonymous: Boolean(isAnonymous),
        paymentMethod: paymentMethod === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX",
        installments: Number(installments) || 1,
        status: "PENDING",
      },
    });

    // Chama o adaptador de pagamento (Mock ou Oficial)
    const paymentResult = await createPayment({
      orderId: order.id,
      amount: finalAmount,
      description: `Presente: ${gift.title} - Casamento Erick & Itally`,
      payerName: order.payerName,
      payerEmail: order.payerEmail,
      payerCpf: order.payerCpf,
      paymentMethod: order.paymentMethod as "PIX" | "CREDIT_CARD",
      installments: order.installments,
      cardToken,
    });

    // Atualiza o pedido com o id de pagamento do Mercado Pago (ou mock id) e status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        mpPaymentId: paymentResult.mpPaymentId,
        status: paymentResult.status,
      },
      include: {
        gift: true,
      },
    });

    // Se o pagamento já nasceu aprovado (ex: cartão mock/real aprovado instantâneo) e tem recado:
    if (updatedOrder.status === "APPROVED" && updatedOrder.payerMessage) {
      const displayName = updatedOrder.isAnonymous ? "Anônimo Apaixonado" : updatedOrder.payerName;
      await prisma.guestMessage.upsert({
        where: { orderId: updatedOrder.id },
        update: { message: updatedOrder.payerMessage, name: displayName },
        create: {
          orderId: updatedOrder.id,
          name: displayName,
          message: updatedOrder.payerMessage,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        isMock: paymentResult.isMock,
        paymentMethod: paymentResult.paymentMethod,
        pixData: paymentResult.pixData,
      },
    });
  } catch (error: any) {
    console.error("[API /api/orders] Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao processar pedido." },
      { status: 500 }
    );
  }
}
