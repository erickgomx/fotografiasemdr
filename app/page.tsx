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
  const [isMock, setIsMock] = useState(true);

  // Filtros e ordenação
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");

  // Presente selecionado para checkout
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

  // Carrega a lista de presentes
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

  // Carrega status do modo Mock
  const checkMockStatus = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      const json = await res.json();
      if (json.success) {
        setIsMock(Boolean(json.data.isMockMode));
      }
    } catch (e) {
      // Default to mock in case of failure
      setIsMock(true);
    }
  };

  useEffect(() => {
    loadGifts();
    checkMockStatus();
  }, []);

  // Filtragem e ordenação dos presentes
  const filteredGifts = useMemo(() => {
    return gifts
      .filter((gift) => {
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
  }, [gifts, selectedCategory, searchQuery, sortBy]);

  const scrollToGifts = () => {
    const el = document.getElementById("catalogo-presentes");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Barra de Navegação Superior */}
      <Navbar
        isMock={isMock}
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
              className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
            >
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Catálogo de Cotas Bem-Humoradas
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-500">
                  Clique no presente desejado para contribuir com Pix dinâmico ou Cartão de Crédito.
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
                <div className="py-20 text-center text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-3" />
                  <p className="text-sm font-medium">Carregando lista de presentes...</p>
                </div>
              ) : filteredGifts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-sm max-w-md mx-auto">
                  <Gift className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-bold text-stone-800 text-sm">
                    Nenhum presente encontrado
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Tente buscar por outro termo ou selecione a categoria "Todos".
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("todas");
                      setSearchQuery("");
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                  {filteredGifts.map((gift) => (
                    <GiftCard
                      key={gift.id}
                      gift={gift}
                      onSelect={(item) => setSelectedGift(item)}
                    />
                  ))}
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

      {/* Modal de Checkout / Pagamento / Simulação */}
      {selectedGift && (
        <CheckoutModal
          gift={selectedGift}
          onClose={() => setSelectedGift(null)}
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
