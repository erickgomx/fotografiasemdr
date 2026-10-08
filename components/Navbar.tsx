"use client";

import { useState } from "react";
import { Heart, Sparkles, ShieldAlert, CheckCircle2, X } from "lucide-react";

interface NavbarProps {
  isMock: boolean;
  activeTab: "presentes" | "recados" | "admin";
  onTabChange: (tab: "presentes" | "recados" | "admin") => void;
}

export function Navbar({ isMock, activeTab, onTabChange }: NavbarProps) {
  const [showMockInfo, setShowMockInfo] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-rose-100/60 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo / Monograma */}
          <div
            onClick={() => onTabChange("presentes")}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse-fast" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 group-hover:text-rose-700 transition-colors">
                Erick &amp; Itally
              </span>
              <span className="hidden sm:block text-xs text-stone-500 tracking-wider uppercase font-medium">
                15 de Novembro de 2026
              </span>
            </div>
          </div>

          {/* Navegação Principal */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange("presentes")}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === "presentes"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "text-stone-600 hover:text-stone-900 hover:bg-rose-50/50"
              }`}
            >
              🎁 Presentes
            </button>
            <button
              onClick={() => onTabChange("recados")}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === "recados"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "text-stone-600 hover:text-stone-900 hover:bg-rose-50/50"
              }`}
            >
              💌 Mural
            </button>
            <button
              onClick={() => onTabChange("admin")}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === "admin"
                  ? "bg-stone-800 text-white shadow-md"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              📊 Noivos
            </button>

            {/* Pill de Mock Mode */}
            {isMock && (
              <button
                onClick={() => setShowMockInfo(true)}
                className="ml-1 sm:ml-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors shadow-sm"
                title="Clique para saber como funciona o Modo Mock"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: "6s" }} />
                <span className="hidden md:inline">Modo Mock Ativo</span>
                <span className="md:hidden">Mock</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Modal explicativo do Mock Mode */}
      {showMockInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 relative animate-scale-up">
            <button
              onClick={() => setShowMockInfo(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Modo Simulador / Mock Ativo</h3>
                <p className="text-xs text-amber-700 font-medium">Ambiente Local Seguro</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-stone-600">
              <p>
                As credenciais do Mercado Pago não foram configuradas no arquivo{" "}
                <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono text-xs">.env.local</code>.
              </p>
              <p>
                O sistema alternou automaticamente para o <strong>Adaptador de Simulação</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
                <li>Gera QR Codes Pix de teste visualmente fiéis.</li>
                <li>Oferece um botão de <strong>1 clique</strong> para simular aprovação imediata.</li>
                <li>Permite homologar o mural de recados, banco de dados SQLite e painel de noivos sem custos.</li>
              </ul>
              <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Quando você adicionar <code className="font-mono font-bold">MP_ACCESS_TOKEN</code> no futuro, a API real do Mercado Pago assumirá sem alterar nenhuma linha de código!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowMockInfo(false)}
              className="mt-5 w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Entendido, vamos testar!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
