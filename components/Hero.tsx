"use client";

interface HeroProps {
  onScrollToGifts: () => void;
  onOpenMessages: () => void;
}

export function Hero({ onScrollToGifts, onOpenMessages }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Overline discreto */}
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-stone-400 block mb-4">
          Lista de Presentes &amp; Cotas Cinematográficas
        </span>

        {/* Título Principal Editorial */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 leading-[1.18] sm:leading-[1.15]">
          Apoie o Casamento &amp; Garanta o{" "}
          <span className="italic font-normal text-stone-700">
            Corte Final Sem DRs
          </span>
        </h1>

        {/* Subtítulo leve e bem-humorado */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
          Já temos panelas e lentes suficientes. O que realmente precisamos é de{" "}
          <span className="font-medium text-stone-800">
            café para madrugadas de render, paciência no set e zero comentários sobre 24fps
          </span>
          . Escolha uma cota sincera e deixe sua mensagem gravada em nosso mural.
        </p>

        {/* Botões de Ação Minimalistas */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onScrollToGifts}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm tracking-wide transition-all shadow-sm"
          >
            Escolher um Presente
          </button>

          <button
            onClick={onOpenMessages}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs sm:text-sm tracking-wide border border-stone-200 transition-all shadow-xs"
          >
            Ver Mural de Recados
          </button>
        </div>

        {/* Assinatura discreta de recursos */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-stone-200/60 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-stone-400 font-medium">
          <span>Pix Instantâneo Dinâmico</span>
          <span className="text-stone-300">•</span>
          <span>Mural de Recados Afetivo</span>
          <span className="text-stone-300">•</span>
          <span>Ambiente 100% Seguro</span>
        </div>
      </div>
    </section>
  );
}
