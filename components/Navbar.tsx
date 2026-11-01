"use client";

import { Heart } from "lucide-react";

interface NavbarProps {
  activeTab: "presentes" | "recados" | "admin";
  onTabChange: (tab: "presentes" | "recados" | "admin") => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200/60 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Monograma / Logo */}
        <div
          onClick={() => onTabChange("presentes")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-800 transition-colors group-hover:border-stone-400">
            <span className="font-serif text-xs font-bold tracking-tighter">E&amp;I</span>
          </div>
          <div>
            <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              Erick &amp; Itally
            </span>
            <span className="hidden sm:block text-[10px] text-stone-400 tracking-widest uppercase font-medium">
              Junho • 2027
            </span>
          </div>
        </div>

        {/* Navegação Minimalista */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange("presentes")}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === "presentes"
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
            }`}
          >
            Presentes
          </button>
          <button
            onClick={() => onTabChange("recados")}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === "recados"
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
            }`}
          >
            Mural
          </button>
          <button
            onClick={() => onTabChange("admin")}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === "admin"
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
            }`}
          >
            Área dos Noivos
          </button>
        </nav>
      </div>
    </header>
  );
}
