import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { getPaymentStatus, searchAllMPPayments, mapMPStatus } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  try {
    let recoveredCount = 0;
    let updatedCount = 0;

    // 1. Busca os pagamentos reais diretamente nos servidores do Mercado Pago
    const mpPayments = await searchAllMPPayments();

    // Garante que haja ao menos um presente para associar
    let defaultGift = await prisma.gift.findFirst({ where: { active: true } });
    if (!defaultGift) {
      defaultGift = await prisma.gift.create({
        data: {
          title: "Contribuição Especial aos Noivos",
          description: "Presente de casamento enviado com muito carinho pelos convidados.",
          imageUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80",
          price: 100.0,
          category: "aberto",
          active: true,
        },
      });
    }

    // 2. Itera sobre cada pagamento registrado no Mercado Pago
    for (const mp of mpPayments) {
      const mpIdStr = String(mp.id);
      const realStatus = mapMPStatus(mp.status);

      // Extrai dados do pagador
      const payerName =
        [mp.payer?.first_name, mp.payer?.last_name].filter(Boolean).join(" ").trim() ||
        mp.payer?.email ||
        "Convidado Especial";
      const payerEmail = mp.payer?.email || "";
      const payerCpf = mp.payer?.identification?.number || "";
      const amount = Number(mp.transaction_amount) || 0;
      const isPix = mp.payment_type_id === "bank_transfer" || mp.payment_method_id === "pix";
      const paymentMethod = isPix ? "PIX" : "CREDIT_CARD";
      const createdAt = mp.date_created ? new Date(mp.date_created) : new Date();
      const message = mp.description || null;

      // Procura se já existe no banco
      const existing = await prisma.order.findFirst({
        where: { mpPaymentId: mpIdStr },
        include: { guestMessage: true },
      });

      if (!existing) {
        // Tenta achar um presente pelo título na descrição
        let matchedGift = defaultGift;
        if (mp.description) {
          const found = await prisma.gift.findFirst({
            where: {
              title: {
                contains: mp.description.slice(0, 20),
              },
            },
          });
          if (found) matchedGift = found;
        }

        const newOrder = await prisma.order.create({
          data: {
            id: mp.external_reference || `mp_${mpIdStr}`,
            giftId: matchedGift.id,
            amount,
            payerName,
            payerEmail,
            payerCpf,
            payerMessage: message,
            isAnonymous: false,
            paymentMethod,
            mpPaymentId: mpIdStr,
            status: realStatus,
            createdAt,
          },
        });

        // Se estiver aprovado e tiver recado, coloca no mural
        if (realStatus === "APPROVED" && message) {
          await prisma.guestMessage.create({
            data: {
              orderId: newOrder.id,
              name: payerName,
              message: message,
              createdAt,
            },
          });
        }

        recoveredCount++;
      } else {
        // Se já existe, atualiza o status se mudou
        if (existing.status !== realStatus) {
          await prisma.order.update({
            where: { id: existing.id },
            data: { status: realStatus },
          });

          if (realStatus === "APPROVED" && !existing.guestMessage && existing.payerMessage) {
            await prisma.guestMessage.create({
              data: {
                orderId: existing.id,
                name: existing.payerName,
                message: existing.payerMessage,
                createdAt: existing.createdAt,
              },
            });
          }

          updatedCount++;
        }
      }
    }

    // 3. Verifica também pedidos já no banco que talvez não tenham vindo no search
    const localOrders = await prisma.order.findMany({
      where: {
        mpPaymentId: { not: null },
      },
      include: { guestMessage: true },
    });

    for (const order of localOrders) {
      if (order.mpPaymentId && !order.mpPaymentId.startsWith("mock_mp_")) {
        const liveStatus = await getPaymentStatus(order.mpPaymentId);
        if (order.status !== liveStatus) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: liveStatus },
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída com sucesso! ${recoveredCount} pedidos resgatados diretamente do Mercado Pago e ${updatedCount} pedidos com status atualizado.`,
      recoveredCount,
      updatedCount,
    });
  } catch (error: any) {
    console.error("[Admin Sync All] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao sincronizar com Mercado Pago." },
      { status: 500 }
    );
  }
}
