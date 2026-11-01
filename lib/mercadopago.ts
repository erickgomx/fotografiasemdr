import { MercadoPagoConfig, Payment } from "mercadopago";
import QRCode from "qrcode";

// Verifica se o modo Mock deve ser ativado
export const isMockMode = (): boolean => {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token) return true;
  if (token === "YOUR_ACCESS_TOKEN" || token === "TEST-MOCK" || token.length < 15) {
    return true;
  }
  return false;
};

// Singleton do cliente Mercado Pago oficial (apenas quando não em mock)
let mpClient: MercadoPagoConfig | null = null;
let mpPayment: Payment | null = null;

const getMPPaymentInstance = () => {
  if (isMockMode()) return null;
  if (!mpClient) {
    const accessToken = process.env.MP_ACCESS_TOKEN!.trim();
    mpClient = new MercadoPagoConfig({ accessToken });
    mpPayment = new Payment(mpClient);
  }
  return mpPayment;
};

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  description: string;
  payerName: string;
  payerEmail: string;
  payerCpf: string;
  paymentMethod: "PIX" | "CREDIT_CARD";
  payerMessage?: string | null;
  isAnonymous?: boolean;
  installments?: number;
  cardToken?: string;
  paymentMethodId?: string;
}

export interface PaymentResult {
  isMock: boolean;
  mpPaymentId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentMethod: "PIX" | "CREDIT_CARD";
  pixData?: {
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl?: string;
  };
}

/**
 * Retorna uma URL de notificação webhook válida com HTTPS público para o Mercado Pago,
 * ou undefined se estiver em localhost para não causar erro de validação na API.
 */
function getValidNotificationUrl(): string | undefined {
  let url = process.env.NEXT_PUBLIC_BASE_URL?.trim();

  if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      url = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    } else if (process.env.VERCEL_URL) {
      url = `https://${process.env.VERCEL_URL}`;
    } else {
      url = "https://fotografiasemdr.vercel.app";
    }
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // O Mercado Pago exige estritamente HTTPS público válido
  if (url.startsWith("https://") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
    return `${url.replace(/\/$/, "")}/api/webhooks/mercadopago`;
  }

  return undefined;
}

/**
 * Criação unificada de pagamento com adaptação inteligente (Mock / Oficial)
 */
export async function createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
  const mockActive = isMockMode();

  if (mockActive) {
    console.log(`[MercadoPago Adapter] 🚀 MOCK MODE ATIVO para pedido ${input.orderId} (R$ ${input.amount})`);
    const mockId = `mock_mp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (input.paymentMethod === "PIX") {
      const sanitizedAmount = input.amount.toFixed(2);
      const mockPixCopiaECola = `00020126580014br.gov.bcb.pix0136casamento-${input.orderId.slice(0, 8)}@presentes.mock520400005303986540${sanitizedAmount}5802BR5924Casamento Erick e Itally6009Sao Paulo62070503***6304MOCK`;

      const qrCodeDataUrl = await QRCode.toDataURL(mockPixCopiaECola, {
        errorCorrectionLevel: "M",
        width: 320,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const qrCodeBase64 = qrCodeDataUrl.split(",")[1];

      return {
        isMock: true,
        mpPaymentId: mockId,
        status: "PENDING",
        paymentMethod: "PIX",
        pixData: {
          qrCode: mockPixCopiaECola,
          qrCodeBase64,
        },
      };
    } else {
      return {
        isMock: true,
        mpPaymentId: mockId,
        status: "APPROVED",
        paymentMethod: "CREDIT_CARD",
      };
    }
  }

  // MODO OFICIAL (MERCADO PAGO API)
  const paymentService = getMPPaymentInstance();
  if (!paymentService) {
    throw new Error("Cliente oficial do Mercado Pago não configurado. Verifique MP_ACCESS_TOKEN.");
  }

  const cleanCpf = input.payerCpf.replace(/\D/g, "");
  const nameParts = input.payerName.trim().split(" ");
  const firstName = nameParts[0] || "Convidado";
  const lastName = nameParts.slice(1).join(" ") || "Especial";
  const notificationUrl = getValidNotificationUrl();

  if (input.paymentMethod === "PIX") {
    const paymentBody: any = {
      transaction_amount: Number(input.amount.toFixed(2)),
      description: input.description,
      payment_method_id: "pix",
      payer: {
        email: input.payerEmail,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: "CPF",
          number: cleanCpf,
        },
      },
      external_reference: input.orderId,
      metadata: {
        app: "fotografiasemdr",
        wedding: "erick_itally",
        order_id: input.orderId,
        payer_message: input.payerMessage || "",
        is_anonymous: Boolean(input.isAnonymous),
      },
    };

    if (notificationUrl) {
      paymentBody.notification_url = notificationUrl;
    }

    const paymentResponse = await paymentService.create({
      body: paymentBody,
    });

    const txData = paymentResponse.point_of_interaction?.transaction_data;
    const qrCode = txData?.qr_code || "";
    const qrCodeBase64 = txData?.qr_code_base64 || "";
    const ticketUrl = txData?.ticket_url;

    return {
      isMock: false,
      mpPaymentId: String(paymentResponse.id),
      status: mapMPStatus(paymentResponse.status),
      paymentMethod: "PIX",
      pixData: {
        qrCode,
        qrCodeBase64,
        ticketUrl,
      },
    };
  } else {
    // Cartão de Crédito Real (usando token temporário criado pelo MercadoPago.js)
    const paymentBody: any = {
      transaction_amount: Number(input.amount.toFixed(2)),
      token: input.cardToken,
      description: input.description,
      installments: Number(input.installments) || 1,
      payment_method_id: input.paymentMethodId || "visa",
      payer: {
        email: input.payerEmail,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: "CPF",
          number: cleanCpf,
        },
      },
      external_reference: input.orderId,
      metadata: {
        app: "fotografiasemdr",
        wedding: "erick_itally",
        order_id: input.orderId,
        payer_message: input.payerMessage || "",
        is_anonymous: Boolean(input.isAnonymous),
      },
    };

    if (notificationUrl) {
      paymentBody.notification_url = notificationUrl;
    }

    const paymentResponse = await paymentService.create({
      body: paymentBody,
    });

    return {
      isMock: false,
      mpPaymentId: String(paymentResponse.id),
      status: mapMPStatus(paymentResponse.status),
      paymentMethod: "CREDIT_CARD",
    };
  }
}

/**
 * Consulta status de um pagamento no Mercado Pago
 */
export async function getPaymentStatus(mpPaymentId: string): Promise<"PENDING" | "APPROVED" | "REJECTED"> {
  if (isMockMode() || mpPaymentId.startsWith("mock_mp_")) {
    return "PENDING";
  }

  try {
    const paymentService = getMPPaymentInstance();
    if (!paymentService) return "PENDING";

    const payment = await paymentService.get({ id: mpPaymentId });
    return mapMPStatus(payment.status);
  } catch (error) {
    console.error("[MercadoPago Adapter] Erro ao consultar pagamento:", error);
    return "PENDING";
  }
}

/**
 * Busca pagamentos reais diretamente na conta do Mercado Pago para recuperação automática
 */
export async function searchAllMPPayments(): Promise<any[]> {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token || isMockMode()) return [];

  try {
    const res = await fetch(
      "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=50",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("[MercadoPago Search] Erro HTTP:", res.status);
      return [];
    }

    const json = await res.json();
    return json.results || [];
  } catch (error) {
    console.error("[MercadoPago Search] Erro ao buscar pagamentos:", error);
    return [];
  }
}

/**
 * Verifica se um pagamento do Mercado Pago pertence estritamente ao casamento Erick & Itally
 */
export function isWeddingPayment(mp: any): boolean {
  if (!mp) return false;

  // 1. Identificação via Metadata gravada pelo site
  if (
    mp.metadata?.app === "fotografiasemdr" ||
    mp.metadata?.wedding === "erick_itally"
  ) {
    return true;
  }

  // 2. Identificação via Descrição do pagamento gerada pelo checkout
  const desc = (mp.description || "").toLowerCase();
  if (
    desc.includes("casamento erick & itally") ||
    desc.includes("casamento erick e itally") ||
    desc.startsWith("presente:")
  ) {
    return true;
  }

  // 3. Identificação via external_reference (UUID do pedido gerado pelo Prisma)
  if (
    mp.external_reference &&
    (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mp.external_reference) ||
      mp.external_reference.startsWith("ei_"))
  ) {
    return true;
  }

  return false;
}

export function mapMPStatus(status?: string): "PENDING" | "APPROVED" | "REJECTED" {
  switch (status) {
    case "approved":
      return "APPROVED";
    case "rejected":
    case "cancelled":
      return "REJECTED";
    default:
      return "PENDING";
  }
}
