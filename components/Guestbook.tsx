"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, MessageSquareQuote } from "lucide-react";

interface GuestMessageItem {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  order?: {
    gift?: {
      title: string;
      category: string;
    };
  };
}

interface GuestbookProps {
  onBackToGifts: () => void;
}

export function Guestbook({ onBackToGifts }: GuestbookProps) {
  const [messages, setMessages] = useState<GuestMessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async (force = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages${force ? "?refresh=true" : ""}`);
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
      }
    } catch (e) {
      console.error("Erro ao buscar recados:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(false);
  }, []);

  return (
    <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Cabeçalho do Mural */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-xl mx-auto mb-12"
      >
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest block mb-2">
          Mensagens &amp; Votos
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
          Mural de Recados dos Noivos
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
          Declarações, piadas de bastidores e votos deixados pelos padrinhos e convidados junto com os presentes.
        </p>

        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => fetchMessages(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-stone-900" : ""}`} />
            <span>Atualizar mural</span>
          </button>
        </div>
      </motion.div>

      {/* Grid de Recados */}
      {loading && messages.length === 0 ? (
        <div className="py-20 text-center text-stone-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-stone-800 mb-2" />
          <p className="text-xs uppercase tracking-wider font-medium">Carregando mensagens...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="p-8 sm:p-14 text-center bg-white rounded-2xl border border-stone-200/80 shadow-xs max-w-md mx-auto">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Nenhum recado publicado ainda
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 font-light">
            Seja o primeiro a presentear os noivos e deixar sua mensagem gravada aqui.
          </p>
          <button
            onClick={onBackToGifts}
            className="mt-6 px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm transition-all"
          >
            Escolher um Presente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {messages.map((item, idx) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.45,
                  delay: (idx % 3) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <MessageSquareQuote className="w-5 h-5 text-stone-300 mb-3" />
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-serif italic">
                    "{item.message}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900 tracking-tight">{item.name}</span>
                  <span className="text-[10px] text-stone-400">{formattedDate}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
