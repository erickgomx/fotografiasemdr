"use client";

import { Heart, Sparkles, ShieldCheck, Zap, MessageSquareHeart } from "lucide-react";

interface HeroProps {
  onScrollToGifts: () => void;
  onOpenMessages: () => void;
}

export function Hero({ onScrollToGifts, onOpenMessages }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-100/40 via-champagne-100/20 to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="absolute top-12 left-10 w-72 h-72 bg-rose-200/20 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm font-medium shadow-sm mb-6 animate-bounce-subtle">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>Erick &amp; Itally • Cotas &amp; Presentes Cinematográficos</span>
          <span className="text-rose-400">•</span>
          <span className="font-semibold">Take 1 • 2026</span>
        </div>

        {/* Título Principal */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
          Apoie o Casamento &amp; Garanta o{" "}
          <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
            Corte Final Sem DRs
          </span>
        </h1>

        {/* Subtítulo bem-humorado */}
        <p className="mt-5 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Já temos jogo de panelas e lentes suficientes. O que realmente precisamos é de{" "}
          <span className="font-semibold text-stone-800">
            café para madrugadas de render, paciência no set e zero comentários sobre 24fps na Netflix
          </span>
          . Escolha uma cota sincera e deixe seu recado gravado no nosso mural!
        </p>

        {/* Botões de Ação */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onScrollToGifts}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-rose-600/25 hover:shadow-rose-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-white" />
            Escolher um Presente
          </button>

          <button
            onClick={onOpenMessages}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm sm:text-base border border-stone-200/90 shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquareHeart className="w-4 h-4 text-rose-500" />
            Ver Mural de Recados
          </button>
        </div>

        {/* Destaques / Benefícios */}
        <div className="mt-12 pt-8 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-stone-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-stone-800">Pix Instantâneo</h4>
              <p className="text-[11px] sm:text-xs text-stone-500">QR Code dinâmico e cópia-e-cola</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-stone-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-stone-800">Recados com Carinho</h4>
              <p className="text-[11px] sm:text-xs text-stone-500">Seu recado publicado no mural</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-stone-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-stone-800">100% Seguro</h4>
              <p className="text-[11px] sm:text-xs text-stone-500">Integração oficial Mercado Pago</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
