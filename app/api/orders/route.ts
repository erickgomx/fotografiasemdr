import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPayment, isMockMode } from "@/lib/mercadopago";
import { calculateCheckoutAmount } from "@/lib/fees";

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
      paymentMethodId,
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

    // Valor base escolhido para o presente (valor líquido dos noivos)
    const baseAmount =
      customAmount !== undefined && customAmount !== null && Number(customAmount) > 0
        ? Number(Number(customAmount).toFixed(2))
        : gift.price;

    const minRequired = gift.category === "aberto" ? Math.max(197, gift.price) : 197;
    if (baseAmount < minRequired) {
      return NextResponse.json(
        {
          success: false,
          error: `O valor mínimo para este presente é de ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(minRequired)}.`,
        },
        { status: 400 }
      );
    }

    // Calcula o repasse de taxas da operadora (Pix ou Cartão)
    const normalizedMethod = paymentMethod === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX";
    const feeCalculation = calculateCheckoutAmount(
      baseAmount,
      normalizedMethod,
      Number(installments) || 1
    );

    // Salva o pedido com o valor líquido que os noivos recebem
    const order = await prisma.order.create({
      data: {
        giftId: gift.id,
        amount: feeCalculation.baseAmount, // Salva o valor líquido dos noivos no painel
        payerName: payerName.trim(),
        payerEmail: payerEmail.trim(),
        payerCpf: payerCpf.trim(),
        payerMessage: payerMessage ? payerMessage.trim() : null,
        isAnonymous: Boolean(isAnonymous),
        paymentMethod: normalizedMethod,
        installments: Number(installments) || 1,
        status: "PENDING",
      },
    });

    // Cobra no Mercado Pago o valor com a taxa inclusa por conta do pagador
    const paymentResult = await createPayment({
      orderId: order.id,
      amount: feeCalculation.totalAmount, // Valor total cobrado do pagador
      description: `Presente: ${gift.title} - Casamento Erick & Itally`,
      payerName: order.payerName,
      payerEmail: order.payerEmail,
      payerCpf: order.payerCpf,
      paymentMethod: order.paymentMethod as "PIX" | "CREDIT_CARD",
      installments: order.installments,
      cardToken,
      paymentMethodId,
    });

    // Atualiza o pedido com o id de pagamento do Mercado Pago
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
        feeCalculation,
        pixData: paymentResult.pixData,
        isMock: paymentResult.isMock,
      },
    });
  } catch (error: any) {
    console.error("[API /api/orders] Erro:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao criar pedido." },
      { status: 500 }
    );
  }
}
