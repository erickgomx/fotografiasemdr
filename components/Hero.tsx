"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, Film, MessageSquareHeart, Sparkles } from "lucide-react";

interface HeroProps {
  onScrollToGifts: () => void;
  onOpenMessages: () => void;
}

export function Hero({ onScrollToGifts, onOpenMessages }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-14 sm:pt-20 sm:pb-24">
      {/* Luz ambiente cinematográfica suave (100% CSS acelerado por hardware, peso zero) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="w-[600px] h-[350px] sm:w-[900px] sm:h-[450px] rounded-full bg-gradient-to-tr from-amber-200/25 via-rose-100/20 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Claquete / Take Badge com ponto REC pulsante */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-stone-200/80 shadow-xs backdrop-blur-sm mb-5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-stone-600"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
          <span>TAKE 01 • ROLO 2027 • PRODUÇÃO ERICK &amp; ITALLY</span>
        </motion.div>

        {/* Título Principal Editorial Cinematográfico */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 leading-[1.16] sm:leading-[1.12]"
        >
          Apoie o Casamento &amp; Garanta o{" "}
          <span className="italic font-normal text-stone-700 underline decoration-amber-300/60 decoration-wavy decoration-1 underline-offset-8">
            Corte Final dos Nossos Sonhos
          </span>
        </motion.h1>

        {/* Foto do Casal (Erick & Itally) */}
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 mb-6 flex justify-center"
        >
          <div className="relative group max-w-[280px] sm:max-w-[320px]">
            {/* Halo suave com estética cinematográfica e calorosa */}
            <div 
              aria-hidden="true" 
              className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-amber-200/40 via-rose-200/30 to-amber-100/30 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" 
            />

            {/* Moldura fotográfica estilo editorial */}
            <div className="relative rounded-2xl bg-white p-2 sm:p-2.5 shadow-xl shadow-stone-900/10 ring-1 ring-stone-900/5 transition-transform duration-300 group-hover:scale-[1.01]">
              <div className="relative aspect-[793/1024] w-full overflow-hidden rounded-xl bg-stone-100">
                <Image
                  src="/casal.jpg"
                  alt="Erick &amp; Itally"
                  width={793}
                  height={1024}
                  priority
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subtítulo leve, envolvente e persuasivo */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-sm sm:text-base md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Panelas e eletrodomésticos a gente resolve. O que sustenta esse casal é{" "}
          <span className="font-medium text-stone-800">
            café pras madrugadas de render, tolerância a palestras de 24fps e amor à prova de falhas no set
          </span>
          . Escolha seu presente, assine nossos créditos como Produtor e deixe seu recado gravado no mural!
        </motion.p>

        {/* Botões de Ação Dinâmicos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={onScrollToGifts}
            className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Film className="w-4 h-4 text-stone-300 group-hover:rotate-12 transition-transform duration-300" />
            <span>Escolher um Presente</span>
          </button>

          <button
            onClick={onOpenMessages}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs sm:text-sm tracking-wide border border-stone-200/90 transition-all duration-200 shadow-xs hover:border-stone-300 active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageSquareHeart className="w-4 h-4 text-stone-500" />
            <span>Mural dos Convidados</span>
          </button>
        </motion.div>

        {/* Selos de segurança e facilidade */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-14 pt-6 border-t border-stone-200/60 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-stone-400 font-medium"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" /> Pix Instantâneo Seguro
          </span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span>Mural de Recados em Tempo Real</span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span>Créditos Oficiais no Filme</span>
        </motion.div>

        {/* Indicador sutil de scroll ("Role para explorar o set") */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.88 }}
          className="mt-10 sm:mt-12 flex justify-center"
        >
          <button
            onClick={onScrollToGifts}
            aria-label="Rolar para os presentes"
            className="group flex flex-col items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-stone-400 group-hover:text-stone-600 transition-colors">
              Explorar Cenas &amp; Presentes
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce text-stone-400 group-hover:text-stone-700 transition-colors" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
