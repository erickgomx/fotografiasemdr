"use client";

import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryTabs } from "@/components/CategoryTabs";
import { GiftCard, GiftItem } from "@/components/GiftCard";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Guestbook } from "@/components/Guestbook";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Footer } from "@/components/Footer";
import { Loader2, Gift } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"presentes" | "recados" | "admin">("presentes");
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros e ordenação
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");

  // Presente selecionado para checkout
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [initialCustomAmount, setInitialCustomAmount] = useState<number | undefined>(undefined);

  // Carrega a lista de presentes pública
  const loadGifts = async () => {
    try {
      const res = await fetch("/api/gifts");
      const json = await res.json();
      if (json.success) {
        setGifts(json.data);
      }
    } catch (e) {
      console.error("Erro ao carregar presentes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, []);

  // Filtragem e posicionamento estratégico dos presentes
  const filteredGifts = useMemo(() => {
    // 1. Identifica o presente de valor personalizado/aberto
    const specialGift = gifts.find(
      (gift) =>
        gift.category === "aberto" &&
        (gift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gift.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const isSpecialCategorySelected = selectedCategory === "aberto";
    const isAllCategories = selectedCategory === "todas";

    // 2. Filtra os outros presentes
    const regularGifts = gifts
      .filter((gift) => {
        if (gift.category === "aberto") return false;
        const matchesCategory =
          selectedCategory === "todas" ? true : gift.category === selectedCategory;
        const matchesSearch =
          gift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gift.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "title-asc") return a.title.localeCompare(b.title);
        return 0;
      });

    // Se o usuário filtrou especificamente pela categoria "Valor Livre"
    if (isSpecialCategorySelected) {
      return specialGift ? [specialGift] : [];
    }

    // Se o card especial não deve ser exibido (busca não combinou ou categoria específica selecionada como festa/lua de mel)
    if (!specialGift || (!isAllCategories && selectedCategory !== "aberto")) {
      return regularGifts;
    }

    // Se não há outros presentes nos resultados
    if (regularGifts.length === 0) {
      return [specialGift];
    }

    // Posiciona o card de valor personalizado NO MEIO DOS DEMAIS
    // e garante que ele caia na COLUNA CENTRAL (index % 3 === 1) em telas grandes
    const half = Math.floor(regularGifts.length / 2);
    let targetIndex = half;

    if (targetIndex % 3 === 0) {
      targetIndex = Math.min(regularGifts.length, targetIndex + 1);
    } else if (targetIndex % 3 === 2) {
      targetIndex = Math.max(0, targetIndex - 1);
    }

    return [
      ...regularGifts.slice(0, targetIndex),
      specialGift,
      ...regularGifts.slice(targetIndex),
    ];
  }, [gifts, selectedCategory, searchQuery, sortBy]);

  const scrollToGifts = () => {
    const el = document.getElementById("catalogo-presentes");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F6]">
      {/* Barra de Navegação Superior */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Conteúdo Conforme a Aba Ativa */}
      <main className="flex-1">
        {activeTab === "presentes" && (
          <>
            <Hero
              onScrollToGifts={scrollToGifts}
              onOpenMessages={() => setActiveTab("recados")}
            />

            <section
              id="catalogo-presentes"
              className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16"
            >
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest block mb-2">
                  Escolha Seu Presente
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Catálogo de Presentes
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
                  Selecione o presente desejado para contribuir com Pix dinâmico ou Cartão de Crédito.
                </p>
              </div>

              {/* Filtros e Busca */}
              <CategoryTabs
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalGiftsCount={gifts.length}
              />

              {/* Grid de Presentes */}
              {loading ? (
                <div className="py-24 text-center text-stone-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-800 mb-2" />
                  <p className="text-xs uppercase tracking-wider font-medium">Carregando catálogo...</p>
                </div>
              ) : filteredGifts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 shadow-xs max-w-md mx-auto">
                  <Gift className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-stone-800 text-sm">
                    Nenhum presente encontrado
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 font-light">
                    Tente buscar por outro termo ou selecione a categoria "Todos os Itens".
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("todas");
                      setSearchQuery("");
                    }}
                    className="mt-4 px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredGifts.map((gift) => {
                    const isSingleSpecial =
                      filteredGifts.length === 1 && gift.category === "aberto";

                    return (
                      <div
                        key={gift.id}
                        className={
                          isSingleSpecial
                            ? "sm:col-span-2 lg:col-span-1 lg:col-start-2 w-full max-w-md mx-auto lg:max-w-none"
                            : "w-full"
                        }
                      >
                        <GiftCard
                          gift={gift}
                          onSelect={(item, val) => {
                            setSelectedGift(item);
                            setInitialCustomAmount(val);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "recados" && (
          <Guestbook onBackToGifts={() => setActiveTab("presentes")} />
        )}

        {activeTab === "admin" && <AdminDashboard />}
      </main>

      {/* Modal de Checkout / Pagamento */}
      {selectedGift && (
        <CheckoutModal
          gift={selectedGift}
          initialAmount={initialCustomAmount}
          onClose={() => {
            setSelectedGift(null);
            setInitialCustomAmount(undefined);
          }}
          onSuccess={() => {
            loadGifts();
          }}
          onGoToMessages={() => {
            setActiveTab("recados");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {/* Rodapé */}
      <Footer />
    </div>
  );
}
