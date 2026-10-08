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
  installments?: number;
  cardToken?: string;
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
 * Criação unificada de pagamento com adaptação inteligente (Mock / Oficial)
 */
export async function createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
  const mockActive = isMockMode();

  if (mockActive) {
    console.log(`[MercadoPago Adapter] 🚀 MOCK MODE ATIVO para pedido ${input.orderId} (R$ ${input.amount})`);
    const mockId = `mock_mp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (input.paymentMethod === "PIX") {
      // Gera payload Pix realista de teste (BR Code EMVco compatível)
      const sanitizedAmount = input.amount.toFixed(2);
      const mockPixCopiaECola = `00020126580014br.gov.bcb.pix0136casamento-${input.orderId.slice(0, 8)}@presentes.mock520400005303986540${sanitizedAmount}5802BR5924Casamento Erick e Itally6009Sao Paulo62070503***6304MOCK`;

      // Gera QR Code Base64 real para a interface exibir
      const qrCodeDataUrl = await QRCode.toDataURL(mockPixCopiaECola, {
        errorCorrectionLevel: "M",
        width: 320,
        margin: 2,
        color: {
          dark: "#1e1e24",
          light: "#ffffff",
        },
      });

      // Retira o prefixo data:image/png;base64, para compatibilidade com o formato do MP
      const rawBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");

      return {
        isMock: true,
        mpPaymentId: mockId,
        status: "PENDING",
        paymentMethod: "PIX",
        pixData: {
          qrCode: mockPixCopiaECola,
          qrCodeBase64: rawBase64,
          ticketUrl: `http://localhost:3000/pedido/${input.orderId}`,
        },
      };
    } else {
      // Cartão de Crédito em Mock
      return {
        isMock: true,
        mpPaymentId: mockId,
        status: "APPROVED", // Cartão em simulação aprova direto ou após teste
        paymentMethod: "CREDIT_CARD",
      };
    }
  }

  // --- MODO REAL DO MERCADO PAGO ---
  console.log(`[MercadoPago Adapter] 💳 MODO REAL acionado com credenciais oficiais para ${input.orderId}`);
  const paymentService = getMPPaymentInstance();
  if (!paymentService) {
    throw new Error("Instância do Mercado Pago não inicializada.");
  }

  const cleanCpf = input.payerCpf.replace(/\D/g, "");
  const [firstName, ...lastNameParts] = input.payerName.trim().split(" ");
  const lastName = lastNameParts.join(" ") || firstName;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (input.paymentMethod === "PIX") {
    const paymentResponse = await paymentService.create({
      body: {
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
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
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
    // Cartão de Crédito Real
    const paymentResponse = await paymentService.create({
      body: {
        transaction_amount: Number(input.amount.toFixed(2)),
        token: input.cardToken,
        description: input.description,
        installments: input.installments || 1,
        payment_method_id: "credit_card",
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
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
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

function mapMPStatus(status?: string): "PENDING" | "APPROVED" | "REJECTED" {
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
