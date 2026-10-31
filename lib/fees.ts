/**
 * Tabela de taxas de processamento para repasse ao pagador,
 * garantindo que os noivos recebam 100% líquido do valor do presente.
 */

// Taxa oficial Mercado Pago Pix via API: 0.99%
export const PIX_FEE_RATE = 0.0099;

// Taxas oficiais Mercado Pago Cartão (recebimento na hora + parcelamento)
export const CARD_FEE_RATES: Record<number, number> = {
  1: 0.0499, // 4.99% à vista
  2: 0.0749, // 7.49% em 2x
  3: 0.0849, // 8.49% em 3x
  4: 0.0949, // 9.49% em 4x
  5: 0.1049, // 10.49% em 5x
  6: 0.1149, // 11.49% em 6x
};

export interface FeeCalculation {
  baseAmount: number;
  feeAmount: number;
  totalAmount: number;
  installmentValue: number;
}

export function calculateCheckoutAmount(
  baseAmount: number,
  method: "PIX" | "CREDIT_CARD",
  installments: number = 1
): FeeCalculation {
  const rate =
    method === "PIX"
      ? PIX_FEE_RATE
      : CARD_FEE_RATES[installments] || CARD_FEE_RATES[1];

  // Fórmula para que (Total - Taxa) seja exatamente igual ao baseAmount líquido
  const totalAmount = Number((baseAmount / (1 - rate)).toFixed(2));
  const feeAmount = Number((totalAmount - baseAmount).toFixed(2));
  const installmentCount = method === "PIX" ? 1 : Math.max(1, installments);
  const installmentValue = Number((totalAmount / installmentCount).toFixed(2));

  return {
    baseAmount,
    feeAmount,
    totalAmount,
    installmentValue,
  };
}
