import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { getPaymentStatus, searchAllMPPayments, isWeddingPayment, mapMPStatus } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  try {
    let recoveredCount = 0;
    let updatedCount = 0;
    let purgedCount = 0;

    // 1. Busca transações recentes da conta do Mercado Pago
    const allMpPayments = await searchAllMPPayments();

    // 2. FILTRA ESTRITAMENTE APENAS O QUE É PRESENTE DO CASAMENTO
    const mpPayments = allMpPayments.filter(isWeddingPayment);

    // 3. Identifica qualquer transação pessoal que possa ter sido importada por engano
    const nonWeddingMpIds = allMpPayments
      .filter((mp) => !isWeddingPayment(mp))
      .map((mp) => String(mp.id));

    if (nonWeddingMpIds.length > 0) {
      // Remove recados vinculados a pagamentos não relacionados ao casamento
      await prisma.guestMessage.deleteMany({
        where: {
          order: {
            mpPaymentId: { in: nonWeddingMpIds },
          },
        },
      });

      // Remove pedidos não relacionados ao casamento
      const deleteResult = await prisma.order.deleteMany({
        where: {
          mpPaymentId: { in: nonWeddingMpIds },
        },
      });
      purgedCount = deleteResult.count;
    }

    // 4. Garante que haja ao menos um presente para associar
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

    // 5. Itera e sincroniza APENAS pagamentos legítimos do casamento
    for (const mp of mpPayments) {
      const mpIdStr = String(mp.id);
      const realStatus = mapMPStatus(mp.status);

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

      const existing = await prisma.order.findFirst({
        where: { mpPaymentId: mpIdStr },
        include: { guestMessage: true },
      });

      if (!existing) {
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

    return NextResponse.json({
      success: true,
      message: `Sincronização limpa concluída! Apenas presentes do casamento foram mantidos (${recoveredCount} novos presentes resgatados, ${updatedCount} atualizados${purgedCount > 0 ? `, e ${purgedCount} transações pessoais removidas` : ""}).`,
      recoveredCount,
      updatedCount,
      purgedCount,
    });
  } catch (error: any) {
    console.error("[Admin Sync All] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao sincronizar com Mercado Pago." },
      { status: 500 }
    );
  }
}
