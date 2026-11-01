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

    // Validações básicas de presença
    if (!giftId || !payerName || !payerEmail || !payerCpf) {
      return NextResponse.json(
        { success: false, error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    const cleanName = String(payerName).trim();
    const cleanEmail = String(payerEmail).trim().toLowerCase();
    const cleanCpf = String(payerCpf).replace(/\D/g, "");
    const cleanMessage = payerMessage ? String(payerMessage).trim() : null;

    // Validação de limites e formatos
    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { success: false, error: "O nome deve ter entre 2 e 100 caracteres." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 120) {
      return NextResponse.json(
        { success: false, error: "Informe um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    if (cleanCpf.length !== 11) {
      return NextResponse.json(
        { success: false, error: "CPF inválido. Certifique-se de digitar os 11 números do seu CPF." },
        { status: 400 }
      );
    }

    if (cleanMessage && cleanMessage.length > 500) {
      return NextResponse.json(
        { success: false, error: "A mensagem para os noivos deve ter no máximo 500 caracteres." },
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
        payerName: cleanName,
        payerEmail: cleanEmail,
        payerCpf: cleanCpf,
        payerMessage: cleanMessage,
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
      payerMessage: order.payerMessage,
      isAnonymous: order.isAnonymous,
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
