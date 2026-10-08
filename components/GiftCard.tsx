"use client";

import { Heart, Gift as GiftIcon, ShieldAlert, PartyPopper, Palmtree, Sparkles, Gem } from "lucide-react";

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
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case "aberto":
        return {
          label: "Valor Aberto / Livre",
          bg: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
          icon: Sparkles,
        };
      case "sobrevivencia":
        return {
          label: "Ilha de Edição",
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          icon: ShieldAlert,
        };
      case "festa":
        return {
          label: "Set & Festa",
          bg: "bg-purple-50 text-purple-700 border-purple-200/80",
          icon: PartyPopper,
        };
      case "lua-de-mel":
        return {
          label: "Locações & Golden Hour",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: Palmtree,
        };
      default:
        return {
          label: "Cota Fictícia",
          bg: "bg-rose-50 text-rose-700 border-rose-200/80",
          icon: GiftIcon,
        };
    }
  };

  const catMeta = getCategoryDetails(gift.category);
  const CatIcon = catMeta.icon;

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(gift.price);

  return (
    <div className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-1 transition-all duration-300">
      {/* Imagem do Presente com Tag de Categoria */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-stone-100">
        <img
          src={gift.imageUrl}
          alt={gift.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Badge de Categoria */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-sm ${catMeta.bg}`}
          >
            <CatIcon className="w-3.5 h-3.5" />
            {catMeta.label}
          </span>
        </div>

        {/* Badge de Cota Master para itens de alto valor */}
        {gift.price >= 650 && gift.category !== "aberto" && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-md shadow-sm border border-amber-300/40">
              <Gem className="w-3 h-3" />
              Cota Master
            </span>
          </div>
        )}

        {/* Quantidade de contribuições já recebidas */}
        {gift._count && gift._count.orders > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-stone-700 border border-stone-200 shadow-sm">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              {gift._count.orders} presenteado{gift._count.orders > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors leading-snug">
            {gift.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">
            {gift.description}
          </p>
        </div>

        {/* Rodapé do Card: Preço e Botão */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
              {gift.category === "aberto" ? "Valor Livre" : "Valor da Cota"}
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              {gift.category === "aberto" ? "A partir de R$ 10" : formattedPrice}
            </span>
          </div>

          <button
            onClick={() => onSelect(gift)}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0 ${
              gift.category === "aberto"
                ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-amber-600/20"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 hover:shadow-rose-600/30"
            }`}
          >
            {gift.category === "aberto" ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Escolher Valor</span>
              </>
            ) : (
              <>
                <GiftIcon className="w-4 h-4" />
                <span>Presentear</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
