import { prisma } from "@/lib/prisma";
import { searchAllMPPayments, isWeddingPayment, mapMPStatus } from "@/lib/mercadopago";
import { isPaymentExcluded, addExcludedPayment, isEmailExcluded, addExcludedEmail, getExcludedEmails } from "@/lib/exclusions";

// Cache em memória para evitar chamadas redundantes em segundos seguidos
let lastSyncTimestamp = 0;
const SYNC_COOLDOWN_MS = 20 * 1000; // 20 segundos de intervalo mínimo entre chamadas automáticas

export async function syncWeddingOrdersAndMessages(force = false) {
  const now = Date.now();
  if (!force && now - lastSyncTimestamp < SYNC_COOLDOWN_MS) {
    return { skipped: true };
  }
  lastSyncTimestamp = now;

  try {
    // 0. Limpeza preventiva de mensagens padrão falsas ou de pedidos deletados/excluídos
    const excludedEmails = Array.from(getExcludedEmails());
    await prisma.guestMessage.deleteMany({
      where: {
        OR: [
          { message: "Muitas felicidades, amor e prosperidade aos noivos Erick & Itally!" },
          ...(excludedEmails.length > 0 ? [{ order: { payerEmail: { in: excludedEmails } } }] : []),
          { order: { status: "DELETED" } },
        ],
      },
    }).catch(() => {});

    const allMpPayments = await searchAllMPPayments();
    if (!allMpPayments || allMpPayments.length === 0) {
      return { recoveredCount: 0, updatedCount: 0 };
    }

    // 1. FILTRA ESTRITAMENTE APENAS O QUE É PRESENTE DO CASAMENTO
    const mpPayments = allMpPayments.filter(isWeddingPayment);

    // 2. Limpa qualquer pedido não relacionado ao casamento
    const nonWeddingMpIds = allMpPayments
      .filter((mp) => !isWeddingPayment(mp))
      .map((mp) => String(mp.id));

    if (nonWeddingMpIds.length > 0) {
      await prisma.guestMessage.deleteMany({
        where: { order: { mpPaymentId: { in: nonWeddingMpIds } } },
      }).catch(() => {});

      await prisma.order.deleteMany({
        where: { mpPaymentId: { in: nonWeddingMpIds } },
      }).catch(() => {});
    }

    // Garante que haja ao menos um presente para associar
    let defaultGift = await prisma.gift.findFirst({ where: { active: true } });
    if (!defaultGift) {
      defaultGift = await prisma.gift.create({
        data: {
          title: "Contribuição Especial aos Noivos",
          description: "Presente de casamento enviado com muito carinho pelos convidados.",
          imageUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80",
          price: 197.0,
          category: "aberto",
          active: true,
        },
      });
    }

    let recoveredCount = 0;
    let updatedCount = 0;

    for (const mp of mpPayments) {
      const mpIdStr = String(mp.id);
      const payerEmail = (mp.payer?.email || "").trim().toLowerCase();

      // VERIFICA SE O PAGAMENTO OU EMAIL FOI EXCLUÍDO PELOS NOIVOS
      if (isPaymentExcluded(mpIdStr) || isEmailExcluded(payerEmail)) {
        const old = await prisma.order.findFirst({
          where: {
            OR: [
              { mpPaymentId: mpIdStr },
              ...(payerEmail ? [{ payerEmail: payerEmail }] : []),
            ],
          },
          include: { guestMessage: true },
        });
        if (old) {
          if (old.guestMessage) {
            await prisma.guestMessage.deleteMany({ where: { orderId: old.id } }).catch(() => {});
          }
          if (old.status !== "DELETED") {
            await prisma.order.update({ where: { id: old.id }, data: { status: "DELETED" } }).catch(() => {});
          }
        }
        continue;
      }

      const realStatus = mapMPStatus(mp.status);
      const isAnon = Boolean(mp.metadata?.is_anonymous);
      const payerName = isAnon
        ? "Anônimo Apaixonado"
        : ([mp.payer?.first_name, mp.payer?.last_name].filter(Boolean).join(" ").trim() ||
           mp.payer?.email ||
           "Convidado Especial");
      const payerCpf = mp.payer?.identification?.number || "";
      const amount = Number(mp.transaction_amount) || 0;
      const isPix = mp.payment_type_id === "bank_transfer" || mp.payment_method_id === "pix";
      const paymentMethod = isPix ? "PIX" : "CREDIT_CARD";
      const createdAt = mp.date_created ? new Date(mp.date_created) : new Date();

      // Recado deixado pelo convidado (apenas se realmente foi digitado)
      const rawMessage = mp.metadata?.payer_message;
      const message = rawMessage && String(rawMessage).trim().length > 0 ? String(rawMessage).trim() : null;

      const existing = await prisma.order.findFirst({
        where: { mpPaymentId: mpIdStr },
        include: { guestMessage: true },
      });

      if (!existing) {
        let matchedGift = defaultGift;
        if (mp.description) {
          const found = await prisma.gift.findFirst({
            where: { title: { contains: mp.description.slice(0, 20) } },
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
            isAnonymous: isAnon,
            paymentMethod,
            mpPaymentId: mpIdStr,
            status: realStatus,
            createdAt,
          },
        });

        // SÓ cria recado se o convidado realmente tiver digitado uma mensagem!
        // NUNCA cria mensagens padrão automáticas
        if (realStatus === "APPROVED" && message) {
          await prisma.guestMessage.create({
            data: {
              orderId: newOrder.id,
              name: payerName,
              message,
              createdAt,
            },
          }).catch(() => {});
        }

        recoveredCount++;
      } else {
        // Se já existe e está marcado como DELETED, nunca recrie e assegure que está marcado nas exclusões
        if (existing.status === "DELETED") {
          addExcludedPayment(mpIdStr);
          if (payerEmail) addExcludedEmail(payerEmail);
          if (existing.guestMessage) {
            await prisma.guestMessage.deleteMany({ where: { orderId: existing.id } }).catch(() => {});
          }
          continue;
        }

        if (existing.status !== realStatus) {
          await prisma.order.update({
            where: { id: existing.id },
            data: { status: realStatus },
          });
          updatedCount++;
        }

        // Se estiver aprovado e tiver mensagem real do convidado, sincroniza
        const userMsg = existing.payerMessage?.trim() || message;
        if (realStatus === "APPROVED" && userMsg && !existing.guestMessage) {
          await prisma.guestMessage.create({
            data: {
              orderId: existing.id,
              name: existing.isAnonymous ? "Anônimo Apaixonado" : existing.payerName,
              message: userMsg,
              createdAt: existing.createdAt,
            },
          }).catch(() => {});
          updatedCount++;
        }
      }
    }

    return { recoveredCount, updatedCount };
  } catch (err) {
    console.error("[syncWeddingOrdersAndMessages] Erro:", err);
    return { error: err };
  }
}
