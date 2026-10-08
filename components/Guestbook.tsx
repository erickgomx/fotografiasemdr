"use client";

import { useEffect, useState } from "react";
import { MessageSquareHeart, Heart, Sparkles, RefreshCw, Gift } from "lucide-react";

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

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
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
    fetchMessages();
  }, []);

  return (
    <section className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Cabeçalho do Mural */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-3">
          <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
          <span>Feed de Mensagens &amp; Padrinhos</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
          Mural de Recados dos Noivos
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-600">
          Todas as declarações de amor, piadas dos amigos e votos de paciência deixados junto aos presentes!
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose-500" : ""}`} />
            <span>Atualizar mural</span>
          </button>
        </div>
      </div>

      {/* Grid de Recados */}
      {loading && messages.length === 0 ? (
        <div className="py-16 text-center text-stone-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-3" />
          <p className="text-sm">Carregando recadinhos...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Nenhum recado publicado ainda
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-stone-600">
            Seja o primeiro padrinho ou amigo a presentear os noivos e deixar sua marca histórica!
          </p>
          <button
            onClick={onBackToGifts}
            className="mt-6 px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all inline-flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>Escolher uma Cota Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {messages.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group"
              >
                <div>
                  {/* Badge de Presente Vinculado */}
                  {item.order?.gift && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50/80 border border-rose-100 text-[11px] font-semibold text-rose-800">
                      <Gift className="w-3 h-3 text-rose-500" />
                      <span className="truncate max-w-[220px]">{item.order.gift.title}</span>
                    </div>
                  )}

                  {/* Mensagem em si */}
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                    "{item.message}"
                  </p>
                </div>

                {/* Autor e Data */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[11px] text-stone-400">{formattedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
