import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-rose-100 bg-white/60 py-10 text-center text-xs text-stone-500">
      <div className="max-w-4xl mx-auto px-4 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="font-serif text-lg font-bold text-stone-900">Erick &amp; Itally</span>
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
        </div>
        <p className="text-stone-500">
          Obrigado por celebrar esse momento tão especial com a gente e por ajudar a manter nossa sanidade mental!
        </p>
        <div className="pt-2 text-[11px] text-stone-400">
          Aplicação Full-Stack de Presentes de Casamento • Mercado Pago &amp; Mock Mode Integrado
        </div>
      </div>
    </footer>
  );
}
