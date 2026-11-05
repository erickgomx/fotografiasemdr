"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200/60 bg-white/40 py-12 text-center text-xs text-stone-400">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto px-4 space-y-3"
      >
        <span className="font-serif text-base font-bold text-stone-800 tracking-tight block">
          Erick &amp; Itally
        </span>
        <p className="text-stone-500 font-light max-w-md mx-auto">
          Obrigado por celebrar esse momento especial com a gente e por fazer parte da nossa história.
        </p>
        <div className="pt-2 text-[10px] uppercase tracking-widest text-stone-400">
          2027 • Fotografia &amp; Filmmaking
        </div>
      </motion.div>
    </footer>
  );
}
