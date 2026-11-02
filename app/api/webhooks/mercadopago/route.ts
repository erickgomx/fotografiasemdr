import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getPaymentStatus, isMockMode } from "@/lib/mercadopago";

/**
 * Validação criptográfica de assinatura oficial do Mercado Pago (anti-spoofing e anti-replay)
 */
function verifyMercadoPagoSignature(
  xSignatureHeader: string | null,
  xRequestIdHeader: string | null,
  dataId: string | null
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET?.trim();

  // Em desenvolvimento ou se a secret ainda não foi cadastrada nas variáveis de ambiente:
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[Webhook MP] AVISO: MP_WEBHOOK_SECRET não configurado em produção. Recomenda-se adicionar para proteção total.");
    }
    return true;
  }

  if (!xSignatureHeader || !xRequestIdHeader) {
    console.warn("[Webhook MP] Requisição rejeitada: cabeçalhos x-signature ou x-request-id ausentes.");
    return false;
  }

  try {
    const parts = Object.fromEntries(
      xSignatureHeader.split(",").map((part) => {
        const [k, ...v] = part.trim().split("=");
        return [k, v.join("=")];
      })
    );

    const ts = parts["ts"];
    const v1 = parts["v1"];

    if (!ts || !v1) return false;

    // Janela anti-replay: rejeita notificações com mais de 5 minutos de diferença
    const nowSec = Math.floor(Date.now() / 1000);
    const tsSec = parseInt(ts, 10);
    if (isNaN(tsSec) || Math.abs(nowSec - tsSec) > 300) {
      console.warn(`[Webhook MP] Timestamp expirado ou inválido (Replay Attack mitigado): diff=${nowSec - tsSec}s`);
      return false;
    }

    const manifest = `id:${dataId || ""};request-id:${xRequestIdHeader};ts:${ts};`;
    const computedHmac = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    const v1Buf = Buffer.from(v1, "utf-8");
    const compBuf = Buffer.from(computedHmac, "utf-8");

    if (v1Buf.length !== compBuf.length) return false;
    return crypto.timingSafeEqual(v1Buf, compBuf);
  } catch (err) {
    console.error("[Webhook MP] Erro ao validar assinatura criptográfica:", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || searchParams.get("type");
    const id = searchParams.get("id") || searchParams.get("data.id");

    const body = await request.json().catch(() => ({}));
    const paymentId = id || body?.data?.id || body?.id;

    // Validação de assinatura HMAC
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const isAuthentic = verifyMercadoPagoSignature(xSignature, xRequestId, String(paymentId || ""));

    if (!isAuthentic) {
      console.warn(`[Webhook MP] Tentativa de webhook rejeitada por assinatura inválida. IP ou origem suspeita.`);
      return NextResponse.json({ error: "Assinatura de notificação inválida." }, { status: 401 });
    }

    console.log(`[Webhook MP] Recebida notificação legítima: topic=${topic}, paymentId=${paymentId}`);

    if (isMockMode()) {
      return NextResponse.json({
        message: "Webhook recebido em modo Mock. Nenhuma ação necessária.",
      });
    }

    if (paymentId) {
      const status = await getPaymentStatus(String(paymentId));

      // Localiza o pedido pelo mpPaymentId
      const order = await prisma.order.findFirst({
        where: { mpPaymentId: String(paymentId) },
        include: { guestMessage: true },
      });

      if (order && order.status !== status) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status },
        });

        if (status === "APPROVED" && order.payerMessage && !order.guestMessage) {
          const displayName = order.isAnonymous ? "Anônimo Apaixonado" : order.payerName;
          await prisma.guestMessage.create({
            data: {
              orderId: order.id,
              name: displayName,
              message: order.payerMessage,
            },
          });
        }

        console.log(`[Webhook MP] Pedido ${order.id} atualizado para status: ${status}`);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook MP] Erro:", error);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}
