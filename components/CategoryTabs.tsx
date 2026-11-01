"use client";

import { Search } from "lucide-react";

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
    { id: "todas", label: "Todos os Itens" },
    { id: "aberto", label: "Valor Livre" },
    { id: "sobrevivencia", label: "Ilha de Edição" },
    { id: "festa", label: "Festa & Set" },
    { id: "lua-de-mel", label: "Lua de Mel" },
  ];

  return (
    <div className="space-y-4 mb-10">
      {/* Abas Minimalistas */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 ${
                isSelected
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Busca e Ordenação Clean */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por termo (ex: Premiere, Café, Drone, Tequila...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-all shadow-xs"
          />
        </div>

        <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
          <span className="text-xs text-stone-400 font-medium hidden sm:inline">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:border-stone-900 transition-all shadow-xs"
          >
            <option value="title-asc">Ordem alfabética (A-Z)</option>
            <option value="price-asc">Menor valor</option>
            <option value="price-desc">Maior valor</option>
          </select>
        </div>
      </div>
    </div>
  );
}
