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
  ShieldAlert,
  Loader2,
  Share2,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { GiftItem } from "./GiftCard";

interface CheckoutModalProps {
  gift: GiftItem | null;
  onClose: () => void;
  onSuccess: () => void;
  onGoToMessages: () => void;
}

export function CheckoutModal({ gift, onClose, onSuccess, onGoToMessages }: CheckoutModalProps) {
  // Estados do fluxo
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dados do formulário
  const [amount, setAmount] = useState<number>(gift?.price || 100);
  const [isEditingAmount, setIsEditingAmount] = useState<boolean>(gift?.category === "aberto");

  useEffect(() => {
    if (gift) {
      setAmount(gift.price);
      setIsEditingAmount(gift.category === "aberto");
    }
  }, [gift]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [installments, setInstallments] = useState(1);

  // Dados do Cartão (Simulação / Real)
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8899");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");

  // Dados do Pedido retornado da API
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(true);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl?: string;
  } | null>(null);

  // Feedback de cópia do Pix
  const [copied, setCopied] = useState(false);

  // Polling de verificação de pagamento
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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
        colors: ["#f43f5e", "#fb7185", "#b28a47", "#fef08a", "#60a5fa"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#f43f5e", "#fb7185", "#b28a47", "#fef08a", "#60a5fa"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Máscara de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, "$1.$2");
    val = val.replace(/(\d{3})(\d)/, "$1.$2");
    val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(val);
  };

  // Preenchimento de recados engraçados pré-fabricados
  const quickMessages = [
    "Parabéns Erick e Itally! Que a vida a dois tenha zero drop frames e color grading sempre impecável.",
    "Tô bancando esse presente na condição de que o noivo não leve a câmera pro altar!",
    "Minha humilde contribuição para o Erick não renderizar timeline no meio do almoço de domingo.",
    "Que nunca falte amor, paciência e baterias recarregadas no set do casamento!",
  ];

  // Iniciar criação do pedido
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gift) return;

    if (!name.trim() || !email.trim() || !cpf.trim()) {
      setErrorMessage("Por favor, preencha seu nome, e-mail e CPF.");
      return;
    }

    if (!amount || Number(amount) < 10) {
      setErrorMessage("O valor mínimo para contribuição é de R$ 10,00.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
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
          customAmount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao gerar o pedido.");
      }

      setOrderId(data.data.order.id);
      setIsMock(Boolean(data.data.isMock));

      if (paymentMethod === "PIX") {
        setPixData(data.data.pixData);
        setStep("payment");
      } else {
        // Se cartão em Mock ou já aprovado:
        if (data.data.order.status === "APPROVED") {
          setStep("success");
          triggerConfetti();
          onSuccess();
        } else {
          setStep("payment");
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
    if (step === "payment" && orderId && !pollingRef.current) {
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

  // Simulação manual de aprovação com 1 clique (para Mock Mode)
  const handleSimulatePayment = async (action: "approve" | "reject" = "approve") => {
    if (!orderId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (data.success && data.data.status === "APPROVED") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setStep("success");
        triggerConfetti();
        onSuccess();
      } else if (action === "reject") {
        setErrorMessage("Pagamento simulado como RECUSADO pelo banco.");
      }
    } catch (err: any) {
      setErrorMessage("Erro ao simular pagamento: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copiar código Pix
  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Compartilhar no WhatsApp
  const handleShareWhatsApp = () => {
    if (!gift) return;
    const msg = `Acabei de presentear Erick & Itally com "${gift.title}" para o casamento! 🎬👰🤵`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (!gift) return null;

  const currentFormattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(amount) || gift.price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative my-auto animate-scale-up">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-stone-400 hover:text-stone-700 rounded-full bg-white/80 hover:bg-stone-100 backdrop-blur-sm transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header com resumo do presente */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-rose-50/50 to-amber-50 border-b border-rose-100/80 flex items-center gap-3.5">
          <img
            src={gift.imageUrl}
            alt={gift.title}
            className="w-14 h-14 rounded-2xl object-cover border border-rose-200/80 shrink-0 shadow-sm"
          />
          <div className="flex-1 min-w-0 pr-6">
            <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
              {gift.category === "aberto" ? "✨ Cota com Valor Aberto" : "Presente Selecionado"}
            </span>
            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 truncate">
              {gift.title}
            </h3>
            <span className="text-base sm:text-lg font-extrabold text-stone-900">
              {currentFormattedPrice}
            </span>
          </div>
        </div>

        {/* Mensagem de Erro Geral */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ETAPA 1: FORMULÁRIO DO CONVIDADO */}
        {step === "form" && (
          <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4">
            {/* Bloco de Definição / Customização de Valor Aberto */}
            {(gift.category === "aberto" || isEditingAmount) ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50/60 border border-amber-200 text-left space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    {gift.category === "aberto"
                      ? "Defina o Valor do Orçamento (Valor Livre)"
                      : "Personalizar Valor Desta Cota"}
                  </span>
                  {gift.category !== "aberto" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAmount(gift.price);
                        setIsEditingAmount(false);
                      }}
                      className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 underline"
                    >
                      Voltar para R$ {gift.price.toFixed(2)}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    R$
                  </span>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Digite o valor desejado (sem limite máximo)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-300 bg-white font-extrabold text-stone-900 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                {/* Botões Rápidos de Valor */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-stone-400 font-medium">Sugestões:</span>
                  {[50, 100, 200, 500, 1000, 2500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        Number(amount) === preset
                          ? "bg-amber-600 text-white shadow-sm"
                          : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      R$ {preset.toLocaleString("pt-BR")}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-xs text-stone-600">
                  Valor da cota: <strong className="text-stone-900 font-bold">{currentFormattedPrice}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingAmount(true)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Editar valor (Livre)
                </button>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Seu Nome Completo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tio Roberto ou Madrinha Ju"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  CPF <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Recado para os noivos */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  Recado Bem-Humorado para os Noivos (Opcional)
                </label>
                <span className="text-[10px] text-stone-400">Aparecerá no mural</span>
              </div>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Deixe uma piada, conselho sábio ou voto de felicidades..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              />

              {/* Sugestões de Recados */}
              <div className="mt-1 flex flex-wrap gap-1">
                {quickMessages.slice(0, 2).map((qm, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(qm)}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 px-2 py-1 rounded-md transition-colors text-left truncate max-w-full"
                  >
                    💡 "{qm.slice(0, 42)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Opção de Anonimato */}
            <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300"
              />
              <span>Quero mandar em anonimato (apenas o recado aparecerá no mural)</span>
            </label>

            {/* Método de Pagamento */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Escolha como deseja pagar:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PIX")}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    paymentMethod === "PIX"
                      ? "border-rose-500 bg-rose-50/70 text-rose-900 shadow-sm"
                      : "border-stone-200 hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === "PIX" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-600"}`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold">Pix Instantâneo</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">0% taxas • Imediato</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CREDIT_CARD")}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    paymentMethod === "CREDIT_CARD"
                      ? "border-rose-500 bg-rose-50/70 text-rose-900 shadow-sm"
                      : "border-stone-200 hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === "CREDIT_CARD" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-600"}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold">Cartão de Crédito</span>
                    <span className="block text-[10px] text-stone-500">Até 12x parcelas</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando cobrança...</span>
                </>
              ) : (
                <>
                  <span>Prosseguir para {paymentMethod === "PIX" ? "Pix" : "Cartão"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ETAPA 2: PAGAMENTO (PIX OU CARTÃO) */}
        {step === "payment" && (
          <div className="p-5 sm:p-6 space-y-5">
            {paymentMethod === "PIX" ? (
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Aguardando Pagamento Pix</span>
                </div>

                {/* Exibição do QR Code */}
                {pixData?.qrCodeBase64 ? (
                  <div className="relative mx-auto w-56 h-56 p-2 rounded-2xl bg-white border-2 border-stone-200 shadow-md flex items-center justify-center">
                    <img
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                      alt="QR Code Pix do Presente de Casamento"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto flex items-center justify-center bg-stone-100 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                  </div>
                )}

                {/* Instruções */}
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Abra o aplicativo do seu banco, escolha <strong>Pagar via Pix</strong> e escaneie o código acima.
                </p>

                {/* Código Copia e Cola */}
                {pixData?.qrCode && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-semibold text-stone-600 block">
                      Ou utilize o Pix Copia e Cola:
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
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                          copied
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copiado!</span>
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

                {/* Indicador de verificação contínua */}
                <div className="pt-2 flex items-center justify-center gap-2 text-stone-400 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                  <span>Identificando pagamento em tempo real...</span>
                </div>

                {/* MOCK MODE ACTION BOX */}
                {isMock && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-left space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Modo Simulador de Testes (Mock Ativo)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Como você está rodando localmente sem chaves ativas do Mercado Pago no <code>.env.local</code>,
                      você pode testar a experiência completa de aprovação instantânea com 1 clique:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleSimulatePayment("approve")}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>⚡ Simular Aprovação Instantânea (1 Clique)</span>
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleSimulatePayment("reject")}
                        className="py-2.5 px-3 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium text-xs transition-all"
                      >
                        Simular Falha
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Formulário de Cartão de Crédito */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-widest uppercase font-mono text-stone-400">
                      Cartão de Crédito
                    </span>
                    <CreditCard className="w-6 h-6 text-rose-400" />
                  </div>
                  <div className="font-mono text-base tracking-wider">{cardNumber}</div>
                  <div className="flex justify-between items-end text-xs">
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase">Titular</span>
                      <span className="font-medium">{name || "SEU NOME"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase">Validade</span>
                      <span className="font-medium">{cardExpiry}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        Validade (MM/AA)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Parcelamento
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800"
                    >
                      <option value={1}>1x de {currentFormattedPrice} (à vista)</option>
                      <option value={2}>2x de R$ {(amount / 2).toFixed(2)}</option>
                      <option value={3}>3x de R$ {(amount / 3).toFixed(2)}</option>
                      <option value={6}>6x de R$ {(amount / 6).toFixed(2)}</option>
                      <option value={12}>12x de R$ {(amount / 12).toFixed(2)}</option>
                    </select>
                  </div>
                </div>

                {isMock && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    🛠️ <strong>Cartão Simulado:</strong> Clique abaixo para testar a aprovação direta pelo Mock Adapter.
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSimulatePayment("approve")}
                  className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirmar Pagamento de {currentFormattedPrice}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ETAPA 3: SUCESSO & COMEMORAÇÃO */}
        {step === "success" && (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Pagamento Confirmado com Sucesso!
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                Muito Obrigado, {isAnonymous ? "Anônimo Apaixonado" : name}! 🥂
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-600">
                Você acaba de garantir:{" "}
                <strong className="text-stone-800">"{gift.title}"</strong> para Erick &amp; Itally!
              </p>
            </div>

            {/* Recado exibido com carinho */}
            {message && (
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-left relative">
                <MessageSquare className="w-4 h-4 text-rose-400 absolute top-3 right-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
                  Seu Recado Gravado no Mural
                </span>
                <p className="text-xs sm:text-sm text-stone-700 italic">"{message}"</p>
                <span className="text-[11px] font-semibold text-stone-500 mt-2 block">
                  — {isAnonymous ? "Anônimo" : name}
                </span>
              </div>
            )}

            {/* Ações pós-sucesso */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Avisar os Noivos no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToMessages();
                }}
                className="w-full py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium text-xs transition-colors"
              >
                Ver Meu Recado no Mural
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-xs text-stone-400 hover:text-stone-600 pt-1 transition-colors"
              >
                Voltar à lista de presentes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
