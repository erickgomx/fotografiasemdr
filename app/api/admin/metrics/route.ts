import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMockMode, searchAllMPPayments, isWeddingPayment, mapMPStatus } from "@/lib/mercadopago";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado. Faça login primeiro." },
      { status: 401 }
    );
  }

  try {
    let orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        gift: true,
        guestMessage: true,
      },
    });

    // Se o banco estiver sem pedidos mas temos conexão oficial com o Mercado Pago,
    // recupera automaticamente APENAS as transações do casamento dos noivos
    if (orders.length === 0 && !isMockMode()) {
      try {
        const allMpPayments = await searchAllMPPayments();
        // FILTRA ESTRITAMENTE APENAS PRESENTES DO SITE DO CASAMENTO
        const mpPayments = allMpPayments.filter(isWeddingPayment);

        if (mpPayments.length > 0) {
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

            const newOrder = await prisma.order.create({
              data: {
                id: mp.external_reference || `mp_${mpIdStr}`,
                giftId: defaultGift.id,
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
          }

          // Recarrega orders após auto-recuperação
          orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: {
              gift: true,
              guestMessage: true,
            },
          });
        }
      } catch (recoveryErr) {
        console.warn("[Admin Metrics] Aviso ao auto-recuperar do MP:", recoveryErr);
      }
    }

    const totalOrders = orders.length;
    const approvedOrders = orders.filter((o) => o.status === "APPROVED");
    const pendingOrders = orders.filter((o) => o.status === "PENDING");
    const rejectedOrders = orders.filter((o) => o.status === "REJECTED");

    const totalRaised = approvedOrders.reduce((acc, curr) => acc + curr.amount, 0);
    const averageContribution = approvedOrders.length > 0 ? totalRaised / approvedOrders.length : 0;

    const totalGiftsCount = await prisma.gift.count();

    return NextResponse.json({
      success: true,
      data: {
        isMockMode: isMockMode(),
        metrics: {
          totalRaised,
          approvedCount: approvedOrders.length,
          pendingCount: pendingOrders.length,
          rejectedCount: rejectedOrders.length,
          totalOrders,
          averageContribution,
          totalGiftsCount,
        },
        orders,
      },
    });
  } catch (error) {
    console.error("[API /api/admin/metrics] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar métricas" },
      { status: 500 }
    );
  }
}
