"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Heart,
  QrCode,
  CreditCard,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Loader2,
  Share2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { GiftItem } from "./GiftCard";
import { calculateCheckoutAmount } from "@/lib/fees";

interface CheckoutModalProps {
  gift: GiftItem | null;
  onClose: () => void;
  onSuccess: () => void;
  onGoToMessages: () => void;
}

// Carrega o SDK seguro do Mercado Pago sob demanda no navegador
function loadMercadoPagoSDK(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).MercadoPago) {
      return resolve((window as any).MercadoPago);
    }
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => resolve((window as any).MercadoPago);
    script.onerror = () =>
      reject(new Error("Não foi possível carregar o sistema seguro de cartões. Tente novamente ou use Pix."));
    document.body.appendChild(script);
  });
}

// Identifica a bandeira do cartão a partir dos primeiros dígitos (BIN)
function detectCardBrand(num: string): string {
  const clean = num.replace(/\D/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "master";
  if (/^(4011|4389|4514|4576|5041|5066|5090|6277|6362|6363)/.test(clean)) return "elo";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^(606282|3841)/.test(clean)) return "hipercard";
  return "visa";
}

export function CheckoutModal({ gift, onClose, onSuccess, onGoToMessages }: CheckoutModalProps) {
  // Etapa atual
  const [step, setStep] = useState<"form" | "pix" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chave pública do Mercado Pago
  const [mpPublicKey, setMpPublicKey] = useState<string>("");

  // Dados do formulário
  const minRequiredAmount = gift ? (gift.category === "aberto" ? Math.max(100, gift.price) : 100) : 100;
  const [amount, setAmount] = useState<number>(gift?.price || 100);
  const [isEditingAmount, setIsEditingAmount] = useState<boolean>(gift?.category === "aberto");

  useEffect(() => {
    if (gift) {
      const initialVal = gift.category === "aberto" ? Math.max(100, gift.price) : Math.max(100, gift.price);
      setAmount(initialVal);
      setIsEditingAmount(gift.category === "aberto");
    }
  }, [gift]);

  // Busca a chave pública do Mercado Pago
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.publicKey) {
          setMpPublicKey(data.publicKey);
          loadMercadoPagoSDK().catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [installments, setInstallments] = useState(1);

  // Dados do Cartão (Digitados no navegador - NUNCA SALVOS NO BANCO)
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Dados do Pedido Pix retornado da API
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cálculo das taxas em tempo real (repasse para o pagador)
  const feeData = calculateCheckoutAmount(
    amount || 1,
    paymentMethod,
    paymentMethod === "CREDIT_CARD" ? installments : 1
  );

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Efeito de confetes no sucesso
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#1c1917", "#D4AF37", "#f43f5e", "#10b981"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#1c1917", "#D4AF37", "#f43f5e", "#10b981"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Máscaras de input
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, "$1.$2");
    val = val.replace(/(\d{3})(\d)/, "$1.$2");
    val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(val);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    setCardCvv(val);
  };

  const quickMessages = [
    "Parabéns Erick e Itally! Que a vida a dois tenha zero drop frames e color grading sempre impecável.",
    "Tô bancando esse presente na condição de que o noivo não leve a câmera pro altar!",
    "Minha humilde contribuição para o Erick não renderizar timeline no meio do almoço de domingo.",
    "Que nunca falte amor, paciência e baterias recarregadas no set do casamento!",
  ];

  // SUBMISSÃO DO CHECKOUT (PIX OU CARTÃO TOKENIZADO)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gift) return;

    if (!name.trim() || !email.trim() || !cpf.trim()) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setErrorMessage("Por favor, informe um CPF válido com 11 dígitos.");
      return;
    }

    if (!amount || Number(amount) < minRequiredAmount) {
      setErrorMessage(
        gift.category === "aberto"
          ? `O valor mínimo configurado pelos noivos para este presente é de ${formatBRL(minRequiredAmount)}.`
          : `O valor mínimo para contribuição é de ${formatBRL(minRequiredAmount)}.`
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      let cardToken: string | undefined = undefined;
      let detectedMethod: string = "visa";

      // SE FOR CARTÃO DE CRÉDITO: TOKENIZA DIRETAMENTE COM O MERCADO PAGO
      if (paymentMethod === "CREDIT_CARD") {
        const cleanNumber = cardNumber.replace(/\D/g, "");
        if (cleanNumber.length < 13) {
          throw new Error("Número de cartão inválido.");
        }
        if (!cardHolder.trim()) {
          throw new Error("Informe o nome do titular impresso no cartão.");
        }
        const [month, yearRaw] = cardExpiry.split("/");
        if (!month || !yearRaw || Number(month) < 1 || Number(month) > 12) {
          throw new Error("Data de validade do cartão inválida (formato MM/AA).");
        }
        if (cardCvv.replace(/\D/g, "").length < 3) {
          throw new Error("Código de segurança (CVV) inválido.");
        }

        detectedMethod = detectCardBrand(cleanNumber);

        // Se houver chave pública oficial do Mercado Pago, cria o token seguro
        if (mpPublicKey) {
          const MPClass = await loadMercadoPagoSDK();
          const mp = new MPClass(mpPublicKey);

          const fullYear = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;

          const tokenResult = await mp.createCardToken({
            cardNumber: cleanNumber,
            cardholderName: cardHolder.trim(),
            cardExpirationMonth: month.trim(),
            cardExpirationYear: fullYear.trim(),
            securityCode: cardCvv.trim(),
            identification: {
              type: "CPF",
              number: cleanCpf,
            },
          });

          if (!tokenResult?.id) {
            throw new Error(
              "Não foi possível validar o cartão no Mercado Pago. Verifique os dados digitados."
            );
          }

          cardToken = tokenResult.id;

          // Limpa imediatamente os dados confidenciais da memória do navegador por segurança
          setCardNumber("");
          setCardCvv("");
        }
      }

      // Envia requisição para a API local (SEM DADOS SENSÍVEIS DO CARTÃO)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: gift.id,
          payerName: name,
          payerEmail: email,
          payerCpf: cpf,
          payerMessage: message,
          isAnonymous,
          paymentMethod,
          installments: Number(installments),
          cardToken,
          paymentMethodId: detectedMethod,
          customAmount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao processar o pagamento.");
      }

      setOrderId(data.data.order.id);

      if (paymentMethod === "PIX") {
        setPixData(data.data.pixData);
        setStep("pix");
      } else {
        // Se cartão aprovado pelo Mercado Pago
        if (data.data.order.status === "APPROVED") {
          setStep("success");
          triggerConfetti();
          onSuccess();
        } else if (data.data.order.status === "REJECTED") {
          throw new Error("O pagamento foi recusado pela operadora do cartão. Tente outro cartão ou use Pix.");
        } else {
          // Pendente de análise antifraude do cartão
          setStep("success");
          onSuccess();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocorreu um erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Polling de verificação de status do Pix
  useEffect(() => {
    if (step === "pix" && orderId && !pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          const json = await res.json();
          if (json.success && json.data.status === "APPROVED") {
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
            setStep("success");
            triggerConfetti();
            onSuccess();
          }
        } catch (e) {
          console.error("Erro no polling de status:", e);
        }
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [step, orderId, onSuccess]);

  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    if (!gift) return;
    const msg = `Acabei de presentear Erick & Itally com "${gift.title}" para o casamento! 🎬👰🤵`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (!gift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-bold text-stone-900 truncate max-w-[280px]">
              {gift.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de erro */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {/* ETAPA 1: FORMULÁRIO DO CONVIDADO */}
          {step === "form" && (
            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4">
              {/* Valor da Cota ou Valor Livre */}
              {gift.category === "aberto" || isEditingAmount ? (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800">
                      Personalizar Valor do Presente
                    </span>
                    {gift.category !== "aberto" && (
                      <button
                        type="button"
                        onClick={() => {
                          setAmount(gift.price);
                          setIsEditingAmount(false);
                        }}
                        className="text-[11px] font-medium text-stone-500 hover:text-stone-800 underline"
                      >
                        Voltar para {formatBRL(gift.price)}
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                      R$
                    </span>
                    <input
                      type="number"
                      min={minRequiredAmount}
                      step={1}
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder={`Mínimo ${formatBRL(minRequiredAmount)}`}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900 text-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                    <span>Mínimo permitido: <strong className="text-stone-800">{formatBRL(minRequiredAmount)}</strong></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-stone-400 font-medium">Sugestões:</span>
                    {(minRequiredAmount <= 100
                      ? [100, 150, 200, 300, 500, 1000]
                      : [minRequiredAmount, Math.round(minRequiredAmount * 1.5), minRequiredAmount * 2, minRequiredAmount * 3, minRequiredAmount * 5]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          Number(amount) === preset
                            ? "bg-stone-900 text-white"
                            : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        R$ {preset}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-xs text-stone-600">
                    Valor da cota: <strong className="text-stone-900 font-bold">{formatBRL(amount)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingAmount(true)}
                    className="text-xs text-stone-700 hover:text-stone-900 font-medium underline"
                  >
                    Editar valor
                  </button>
                </div>
              )}

              {/* Dados do Convidado */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Seu Nome Completo <span className="text-stone-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome e Sobrenome"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    E-mail <span className="text-stone-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    CPF <span className="text-stone-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              {/* Recado para os noivos */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-700">
                    Mensagem para os Noivos (Opcional)
                  </label>
                  <span className="text-[10px] text-stone-400">Publicado no mural</span>
                </div>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Deixe um conselho ou voto de felicidades..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-stone-900 resize-none"
                />

                <div className="mt-1 flex flex-wrap gap-1">
                  {quickMessages.slice(0, 2).map((qm, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(qm)}
                      className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-1 rounded-md text-left truncate max-w-full"
                    >
                      "{qm.slice(0, 42)}..."
                    </button>
                  ))}
                </div>
              </div>

              {/* Opção Anônimo */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-stone-900 focus:ring-0 border-stone-300"
                />
                <label htmlFor="anonymousCheck" className="text-xs text-stone-600 select-none">
                  Contribuir como anônimo no mural
                </label>
              </div>

              {/* Seleção do Método de Pagamento */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("PIX")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === "PIX"
                        ? "border-stone-900 bg-stone-900 text-white shadow-xs"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <QrCode className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Pix Instantâneo</span>
                      <span className={`block text-[10px] ${paymentMethod === "PIX" ? "text-stone-300" : "text-stone-400"}`}>
                        QR Code dinâmico
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CREDIT_CARD")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === "CREDIT_CARD"
                        ? "border-stone-900 bg-stone-900 text-white shadow-xs"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">Cartão de Crédito</span>
                      <span className={`block text-[10px] ${paymentMethod === "CREDIT_CARD" ? "text-stone-300" : "text-stone-400"}`}>
                        Até 6x no cartão
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* CAMPOS SEGUROS DO CARTÃO DE CRÉDITO (QUANDO SELECIONADO) */}
              {paymentMethod === "CREDIT_CARD" && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-stone-700" />
                      Dados do Cartão (Processamento Seguro)
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-600">
                      {detectCardBrand(cardNumber).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === "CREDIT_CARD"}
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Nome Impresso no Cartão
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === "CREDIT_CARD"}
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="COMO APARECE NO CARTÃO"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-stone-900 uppercase font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-stone-600 block mb-1">
                        Validade (MM/AA)
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "CREDIT_CARD"}
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono bg-white focus:outline-none focus:border-stone-900 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-stone-600 block mb-1">
                        Código CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required={paymentMethod === "CREDIT_CARD"}
                        value={cardCvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono bg-white focus:outline-none focus:border-stone-900 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Parcelas
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-white focus:outline-none focus:border-stone-900"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => {
                        const optFee = calculateCheckoutAmount(amount, "CREDIT_CARD", num);
                        return (
                          <option key={num} value={num}>
                            {num}x de {formatBRL(optFee.installmentValue)} (Total: {formatBRL(optFee.totalAmount)})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="pt-1 flex items-start gap-1.5 text-[10px] text-stone-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Criptografia de ponta a ponta Mercado Pago. Os dados do seu cartão nunca são salvos pelo site.
                    </span>
                  </div>
                </div>
              )}

              {/* RESUMO DE TAXAS TRANSPARENTE (REPASSE AO PAGADOR) */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between items-center">
                  <span>Valor do presente (para os noivos):</span>
                  <span className="font-semibold text-stone-900">{formatBRL(feeData.baseAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-stone-500">
                  <span>
                    Taxa da operadora ({paymentMethod === "PIX" ? "0,99% Pix" : `Processamento Cartão ${installments}x`}):
                  </span>
                  <span>+{formatBRL(feeData.feeAmount)}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-stone-900 text-sm">
                  <span>Total a pagar:</span>
                  <span className="text-stone-900">{formatBRL(feeData.totalAmount)}</span>
                </div>
                <p className="text-[10px] text-stone-400 text-center pt-1 font-light">
                  ✨ Os noivos receberão exatamente {formatBRL(feeData.baseAmount)} livres de taxa.
                </p>
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando pagamento seguro...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === "PIX"
                        ? `Gerar Pix de ${formatBRL(feeData.totalAmount)}`
                        : `Pagar ${formatBRL(feeData.totalAmount)} no Cartão`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ETAPA 2: PAGAMENTO VIA PIX */}
          {step === "pix" && (
            <div className="p-6 space-y-5 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium">
                Aguardando Pagamento Pix
              </span>

              {pixData?.qrCodeBase64 ? (
                <div className="mx-auto w-52 h-52 p-2 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center">
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code Pix"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto flex items-center justify-center bg-stone-100 rounded-2xl">
                  <Loader2 className="w-7 h-7 animate-spin text-stone-400" />
                </div>
              )}

              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Abra o aplicativo do seu banco, escolha <strong>Pagar com Pix</strong> e aponte a câmera para o QR Code acima.
              </p>

              {pixData?.qrCode && (
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-medium text-stone-500 block">
                    Ou copie o código Pix abaixo:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixData.qrCode}
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 text-stone-600 font-mono select-all truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                        copied
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-900 text-white hover:bg-stone-800"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-2 text-stone-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-800" />
                <span>Identificando confirmação do banco...</span>
              </div>
            </div>
          )}

          {/* ETAPA 3: SUCESSO / CONFIRMAÇÃO */}
          {step === "success" && (
            <div className="p-8 sm:p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="text-[11px] uppercase tracking-widest font-semibold text-emerald-600 block">
                Pagamento Confirmado
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Muito Obrigado pelo Carinho!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed font-light">
                Seu presente para <strong>{gift.title}</strong> foi confirmado com sucesso. Sua mensagem já está disponível no mural dos noivos!
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Avisar no WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onGoToMessages();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-all shadow-xs"
                >
                  Ver no Mural
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
