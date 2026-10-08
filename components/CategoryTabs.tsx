"use client";

import { Search, ShieldAlert, Sparkles, Palmtree, PartyPopper } from "lucide-react";

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalGiftsCount: number;
}

export function CategoryTabs({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalGiftsCount,
}: CategoryTabsProps) {
  const categories = [
    { id: "todas", label: "🎬 Todos os Takes", icon: Sparkles, count: totalGiftsCount },
    { id: "aberto", label: "✨ Valor Aberto", icon: Sparkles },
    { id: "sobrevivencia", label: "💻 Ilha de Edição (DRs)", icon: ShieldAlert },
    { id: "festa", label: "🎉 Set & Festa dos Noivos", icon: PartyPopper },
    { id: "lua-de-mel", label: "🏖️ Locações & Golden Hour", icon: Palmtree },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Abas de Categorias */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                isSelected
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 scale-[1.02]"
                  : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Busca e Ordenação */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cota (ex: Premiere, Render, Claquete, 4K, Drone, Tequila...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200/90 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all shadow-sm"
          />
        </div>

        <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white border border-stone-200/90 text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all shadow-sm"
          >
            <option value="price-asc">Menor valor (R$)</option>
            <option value="price-desc">Maior valor (R$)</option>
            <option value="title-asc">Ordem alfabética (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
