"use client";

import { Heart, Sparkles, Film, ArrowRight } from "lucide-react";

export interface GiftItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: "lua-de-mel" | "festa" | "sobrevivencia" | "aberto" | string;
  active: boolean;
  _count?: {
    orders: number;
  };
}

interface GiftCardProps {
  gift: GiftItem;
  onSelect: (gift: GiftItem, customAmount?: number) => void;
  className?: string;
}

export function GiftCard({ gift, onSelect, className }: GiftCardProps) {
  const isSpecial = gift.category === "aberto";

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "aberto":
        return "Presente Especial";
      case "sobrevivencia":
        return "Ilha de Edição";
      case "festa":
        return "Festa & Set";
      case "lua-de-mel":
        return "Lua de Mel";
      default:
        return "Presente dos Noivos";
    }
  };

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(gift.price);

  return (
    <div
      className={`group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 ${
        isSpecial
          ? "bg-gradient-to-b from-stone-900 to-stone-950 text-white border border-amber-400/50 shadow-md shadow-amber-950/20 ring-1 ring-amber-400/30"
          : "bg-white border border-stone-200/80 shadow-xs hover:shadow-md hover:border-stone-300 text-stone-900"
      } ${className || ""}`}
    >
      {/* Moldura da Imagem Cinematográfica 16:9 */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-stone-950 shrink-0">
        <img
          src={gift.imageUrl}
          alt={gift.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Vinheta cinematográfica (gradiente de luz e sombra de cinema) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/35 pointer-events-none" />

        {/* Categoria / Badge de Cinema */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-xs ${
              isSpecial
                ? "bg-amber-400 text-stone-950 font-bold"
                : "bg-stone-900/80 text-white border border-white/10"
            }`}
          >
            {isSpecial ? (
              <>
                <Sparkles className="w-2.5 h-2.5" />
                <span>{getCategoryLabel(gift.category)}</span>
              </>
            ) : (
              <span>{getCategoryLabel(gift.category)}</span>
            )}
          </span>
        </div>

        {/* Contador de Presentes Afetivo */}
        {gift._count && gift._count.orders > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/95 backdrop-blur-md text-stone-800 shadow-xs">
              <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
              <span>
                {gift._count.orders} {gift._count.orders > 1 ? "presentes" : "presente"}
              </span>
            </span>
          </div>
        )}

        {/* Marca d'água sutil de película */}
        <div className="absolute bottom-2 right-3 pointer-events-none">
          <span className="text-[9px] uppercase tracking-widest text-white/50 font-mono">
            {isSpecial ? "PRODUCER // 2027" : "CINE // 24FPS"}
          </span>
        </div>
      </div>

      {/* Conteúdo Textual Padronizado */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <h3
            className={`font-serif text-base sm:text-lg font-bold leading-snug line-clamp-2 min-h-[2.75rem] flex items-center transition-colors ${
              isSpecial
                ? "text-amber-100 group-hover:text-amber-300"
                : "text-stone-900 group-hover:text-stone-700"
            }`}
          >
            {gift.title}
          </h3>

          <p
            className={`mt-2 text-xs sm:text-sm leading-relaxed font-light line-clamp-3 min-h-[3.75rem] ${
              isSpecial ? "text-stone-300" : "text-stone-600"
            }`}
          >
            {gift.description}
          </p>
        </div>

        {/* Rodapé do Card (Mesma altura e dimensões em todos os cards) */}
        {isSpecial ? (
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-semibold text-amber-300/80 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Valor Livre
              </span>
              <span className="text-lg sm:text-xl font-bold text-amber-200 tracking-tight">
                A partir de R$ 197
              </span>
            </div>

            <button
              onClick={() => onSelect(gift)}
              className="group/btn inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 transition-all duration-200 shrink-0 shadow-md shadow-amber-950/30 active:scale-95 cursor-pointer"
            >
              <span>Personalizar</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-900 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider block">
                Valor do Presente
              </span>
              <span className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                {formattedPrice}
              </span>
            </div>

            <button
              onClick={() => onSelect(gift)}
              className="group/btn inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm bg-stone-900 hover:bg-stone-800 text-white transition-all duration-200 shrink-0 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
            >
              <span>Presentear</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
