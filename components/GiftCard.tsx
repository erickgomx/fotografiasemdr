"use client";

import { Heart } from "lucide-react";

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
  onSelect: (gift: GiftItem) => void;
}

export function GiftCard({ gift, onSelect }: GiftCardProps) {
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "aberto":
        return "Valor Livre";
      case "sobrevivencia":
        return "Ilha de Edição";
      case "festa":
        return "Festa & Set";
      case "lua-de-mel":
        return "Lua de Mel";
      default:
        return "Cota dos Noivos";
    }
  };

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(gift.price);

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/70 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-300">
      {/* Imagem Limpa sem Sobrecarga */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-stone-100">
        <img
          src={gift.imageUrl}
          alt={gift.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />

        {/* Categoria Discreta */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase bg-stone-900/80 text-white backdrop-blur-sm shadow-xs">
            {getCategoryLabel(gift.category)}
          </span>
        </div>

        {/* Contagem de presentes discreta */}
        {gift._count && gift._count.orders > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/90 backdrop-blur-sm text-stone-700 shadow-xs">
              <Heart className="w-2.5 h-2.5 text-stone-800 fill-stone-800" />
              {gift._count.orders} {gift._count.orders > 1 ? "presentes" : "presente"}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo Editorial */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-stone-700 transition-colors leading-snug">
            {gift.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 line-clamp-3 leading-relaxed font-light">
            {gift.description}
          </p>
        </div>

        {/* Rodapé do Card: Preço e Botão Minimalistas */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-medium text-stone-400 tracking-wider block">
              {gift.category === "aberto" ? "Contribuição" : "Valor"}
            </span>
            <span className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              {gift.category === "aberto" ? "A partir de R$ 100" : formattedPrice}
            </span>
          </div>

          <button
            onClick={() => onSelect(gift)}
            className="px-4 py-2 rounded-full font-medium text-xs sm:text-sm bg-stone-900 hover:bg-stone-800 text-white transition-all shrink-0 shadow-xs"
          >
            {gift.category === "aberto" ? "Contribuir" : "Presentear"}
          </button>
        </div>
      </div>
    </div>
  );
}
