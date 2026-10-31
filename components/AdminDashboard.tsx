"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  RefreshCw,
  Search,
  Database,
  Check,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Loader2,
  Trash2,
  ShieldCheck,
  Pencil,
  Plus,
  Image as ImageIcon,
  X,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface AdminData {
  isMockMode: boolean;
  metrics: {
    totalRaised: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalOrders: number;
    averageContribution: number;
    totalGiftsCount: number;
  };
  orders: Array<{
    id: string;
    amount: number;
    payerName: string;
    payerEmail: string;
    payerCpf: string;
    payerMessage: string | null;
    isAnonymous: boolean;
    paymentMethod: string;
    status: string;
    mpPaymentId: string | null;
    createdAt: string;
    gift: {
      title: string;
      category: string;
    };
    guestMessage?: {
      message: string;
    } | null;
  }>;
}

interface GiftItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  active: boolean;
  createdAt?: string;
  _count?: {
    orders: number;
  };
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Navegação do Dashboard: Pedidos ou Catálogo
  const [activeTab, setActiveTab] = useState<"orders" | "catalog">("orders");

  // Dados de Pedidos e Métricas
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ id: string; msg: string; type: "ok" | "warn" } | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Dados do Catálogo de Presentes
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState("todas");
  const [catalogSearch, setCatalogSearch] = useState("");

  // Modal de Edição / Criação de Presente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [modalGiftId, setModalGiftId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("sobrevivencia");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [savingGift, setSavingGift] = useState(false);
  const [giftFormError, setGiftFormError] = useState<string | null>(null);

  // Categorias disponíveis
  const categoryLabels: Record<string, string> = {
    "aberto": "Valor Livre",
    "sobrevivencia": "Ilha de Edição",
    "festa": "Festa & Set",
    "lua-de-mel": "Lua de Mel",
  };

  // Verifica autenticação
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const json = await res.json();
      if (json.authenticated) {
        setIsAuthenticated(true);
        fetchMetrics();
        fetchGifts();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError("Por favor, digite a senha.");
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const json = await res.json();

      if (json.success) {
        setIsAuthenticated(true);
        setPassword("");
        fetchMetrics();
        fetchGifts();
      } else {
        setLoginError(json.error || "Senha incorreta.");
      }
    } catch {
      setLoginError("Erro ao conectar ao servidor. Tente novamente.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setData(null);
      setGifts([]);
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
    }
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do admin:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGifts = async () => {
    setLoadingGifts(true);
    try {
      const res = await fetch("/api/admin/gifts");
      const json = await res.json();
      if (json.success) {
        setGifts(json.data);
      }
    } catch (e) {
      console.error("Erro ao carregar presentes:", e);
    } finally {
      setLoadingGifts(false);
    }
  };

  // Sincroniza todos os pedidos com a API real do Mercado Pago
  const handleSyncAllWithMercadoPago = async () => {
    setSyncingAll(true);
    setStatusFeedback(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSyncMessage(json.message);
        setTimeout(() => setSyncMessage(null), 6000);
        await fetchMetrics();
      }
    } catch (e) {
      console.error("Erro ao sincronizar com MP:", e);
    } finally {
      setSyncingAll(false);
    }
  };

  // Checa status real do pedido individual no Mercado Pago
  const handleCheckOrderOnMP = async (orderId: string) => {
    setActionLoadingId(orderId);
    setStatusFeedback(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const json = await res.json();
      if (json.success) {
        setStatusFeedback({
          id: orderId,
          msg: json.message,
          type: json.realStatus === "APPROVED" ? "ok" : "warn",
        });
        await fetchMetrics();
      }
    } catch (e) {
      console.error("Erro ao consultar Mercado Pago:", e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Exclui pedido de teste
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Deseja realmente excluir este pedido de teste?")) return;

    setActionLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        await fetchMetrics();
      }
    } catch (e) {
      console.error("Erro ao excluir pedido:", e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Restaura catálogo padrão
  const handleResetCatalog = async () => {
    if (!confirm("Deseja restaurar o catálogo padrão original? Isso atualizará fotos e valores para os padrões pré-definidos.")) return;

    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSyncMessage("Catálogo original restaurado com sucesso!");
        setTimeout(() => setSyncMessage(null), 4000);
        await fetchGifts();
        await fetchMetrics();
      }
    } catch (e) {
      console.error("Erro ao restaurar catálogo:", e);
    }
  };

  // Abrir modal de edição para um presente existente
  const handleOpenEdit = (gift: GiftItem) => {
    setIsEditingNew(false);
    setModalGiftId(gift.id);
    setFormTitle(gift.title);
    setFormPrice(gift.price.toString());
    setFormCategory(gift.category);
    setFormImageUrl(gift.imageUrl);
    setFormDescription(gift.description);
    setFormActive(gift.active);
    setGiftFormError(null);
    setIsModalOpen(true);
  };

  // Abrir modal para novo presente
  const handleOpenNew = () => {
    setIsEditingNew(true);
    setModalGiftId(null);
    setFormTitle("");
    setFormPrice("150");
    setFormCategory("sobrevivencia");
    setFormImageUrl("https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80");
    setFormDescription("");
    setFormActive(true);
    setGiftFormError(null);
    setIsModalOpen(true);
  };

  // Salvar alterações de um presente
  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setGiftFormError("O título do presente é obrigatório.");
      return;
    }
    const numPrice = parseFloat(formPrice.replace(",", "."));
    if (isNaN(numPrice) || numPrice < 1) {
      setGiftFormError("O valor deve ser de no mínimo R$ 1,00.");
      return;
    }
    if (!formImageUrl.trim()) {
      setGiftFormError("A URL da imagem é obrigatória.");
      return;
    }

    setSavingGift(true);
    setGiftFormError(null);

    try {
      if (isEditingNew) {
        // Criar novo
        const res = await fetch("/api/admin/gifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            price: numPrice,
            category: formCategory,
            imageUrl: formImageUrl.trim(),
            description: formDescription.trim(),
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          setSyncMessage("Novo presente adicionado com sucesso ao site!");
          setTimeout(() => setSyncMessage(null), 4000);
          await fetchGifts();
          await fetchMetrics();
        } else {
          setGiftFormError(json.error || "Erro ao criar presente.");
        }
      } else if (modalGiftId) {
        // Atualizar existente
        const res = await fetch(`/api/admin/gifts/${modalGiftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            price: numPrice,
            category: formCategory,
            imageUrl: formImageUrl.trim(),
            description: formDescription.trim(),
            active: formActive,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          setSyncMessage(`Presente "${formTitle}" atualizado com sucesso!`);
          setTimeout(() => setSyncMessage(null), 4000);
          await fetchGifts();
          await fetchMetrics();
        } else {
          setGiftFormError(json.error || "Erro ao salvar alterações.");
        }
      }
    } catch {
      setGiftFormError("Erro de comunicação com o servidor.");
    } finally {
      setSavingGift(false);
    }
  };

  // Alternar ativação/desativação rápida
  const handleToggleActive = async (gift: GiftItem) => {
    try {
      const res = await fetch(`/api/admin/gifts/${gift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !gift.active }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchGifts();
      }
    } catch (e) {
      console.error("Erro ao alterar visibilidade:", e);
    }
  };

  // Excluir presente
  const handleDeleteGift = async (gift: GiftItem) => {
    if (!confirm(`Deseja realmente remover o presente "${gift.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/gifts/${gift.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSyncMessage(json.message);
        setTimeout(() => setSyncMessage(null), 4000);
        await fetchGifts();
        await fetchMetrics();
      }
    } catch (e) {
      console.error("Erro ao excluir presente:", e);
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  if (isAuthenticated === null) {
    return (
      <div className="py-24 text-center text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-800 mb-2" />
        <p className="text-xs uppercase tracking-wider font-medium">Verificando acesso...</p>
      </div>
    );
  }

  // TELA DE LOGIN MINIMALISTA
  if (!isAuthenticated) {
    return (
      <section className="py-16 sm:py-24 max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-stone-800" />
          </div>

          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest block mb-1">
            Área Reservada
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Acesso dos Noivos
          </h2>
          <p className="mt-2 text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
            Digite a senha para gerenciar o catálogo, valores, fotos e acompanhar as doações.
          </p>

          <form onSubmit={handleLogin} className="mt-7 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha..."
                  autoFocus
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Acessando...</span>
                </>
              ) : (
                <span>Entrar no Painel</span>
              )}
            </button>
          </form>
        </div>
      </section>
    );
  }

  // FILTROS DE PEDIDOS
  const filteredOrders =
    data?.orders.filter((order) => {
      const matchesStatus =
        filterStatus === "TODOS" ? true : order.status === filterStatus;
      const matchesSearch =
        order.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.mpPaymentId && order.mpPaymentId.includes(searchTerm));
      return matchesStatus && matchesSearch;
    }) || [];

  // FILTROS DO CATÁLOGO
  const filteredGifts = gifts.filter((gift) => {
    const matchesCategory =
      catalogCategory === "todas" ? true : gift.category === catalogCategory;
    const matchesSearch =
      gift.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      gift.description.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-8 sm:py-14 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-200/80">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-stone-400 block mb-1">
            Gestão do Casamento
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Painel dos Noivos
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Acompanhe presentes recebidos pelo Mercado Pago ou edite fotos, nomes e valores do catálogo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "orders" && (
            <button
              onClick={handleSyncAllWithMercadoPago}
              disabled={syncingAll}
              className="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              title="Consulta a API do Mercado Pago para todos os pedidos e atualiza o total real"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${syncingAll ? "animate-spin" : ""}`} />
              <span>{syncingAll ? "Sincronizando..." : "Sincronizar com Mercado Pago"}</span>
            </button>
          )}

          {activeTab === "catalog" && (
            <button
              onClick={handleOpenNew}
              className="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Presente</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchMetrics();
              fetchGifts();
            }}
            disabled={loading || loadingGifts}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Recarregar tela"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingGifts ? "animate-spin text-stone-800" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK GLOBAL */}
      {syncMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-fade-in font-medium">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* NAVEGAÇÃO POR ABAS: PRESENTES RECEBIDOS vs CATÁLOGO */}
      <div className="flex items-center gap-2 mb-8 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === "orders"
              ? "border-stone-900 text-stone-900"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Presentes Recebidos & Caixa</span>
          {data?.metrics.approvedCount !== undefined && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-600">
              {data.metrics.approvedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("catalog");
            if (gifts.length === 0) fetchGifts();
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === "catalog"
              ? "border-stone-900 text-stone-900"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catálogo de Presentes</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-600">
            {gifts.length}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* ABA 1: PRESENTES RECEBIDOS & CAIXA                           */}
      {/* ============================================================ */}
      {activeTab === "orders" && (
        <>
          {/* Métricas Oficiais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Total Confirmado
                </span>
                <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                  {formatBRL(data?.metrics.totalRaised || 0)}
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  {data?.metrics.approvedCount || 0} pagamentos recebidos
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Aprovados no MP
                </span>
                <span className="text-2xl font-bold text-stone-900 mt-1 block">
                  {data?.metrics.approvedCount || 0}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                  Dinheiro na conta
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Pendentes / Não Pagos
                </span>
                <span className="text-2xl font-bold text-amber-600 mt-1 block">
                  {data?.metrics.pendingCount || 0}
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  Aguardando Pix ou cartão
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Ticket Médio
                </span>
                <span className="text-2xl font-bold text-stone-900 mt-1 block">
                  {formatBRL(data?.metrics.averageContribution || 0)}
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  Média por presente real
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Tabela de Pedidos */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            {/* Filtros da Tabela */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: "TODOS", label: "Todos" },
                  { id: "APPROVED", label: "Aprovados" },
                  { id: "PENDING", label: "Pendentes" },
                  { id: "REJECTED", label: "Recusados" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStatus(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      filterStatus === st.id
                        ? "bg-stone-900 text-white"
                        : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, presente ou ID..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            {/* Listagem */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs">
                Nenhum pedido encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/60 border-b border-stone-200/70 text-stone-500 uppercase font-medium text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Convidado</th>
                      <th className="py-3 px-4">ID Mercado Pago</th>
                      <th className="py-3 px-4">Presente</th>
                      <th className="py-3 px-4">Valor</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Status no MP</th>
                      <th className="py-3 px-4">Recado</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((order) => {
                      const dateStr = new Date(order.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const isChecking = actionLoadingId === order.id;
                      const feedback = statusFeedback?.id === order.id ? statusFeedback : null;

                      return (
                        <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-stone-900">
                              {order.isAnonymous ? (
                                <span className="text-stone-500 italic">
                                  {order.payerName} (Anônimo)
                                </span>
                              ) : (
                                order.payerName
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {order.payerEmail} • {dateStr}
                            </div>
                          </td>

                          {/* Coluna ID Mercado Pago com clique para copiar */}
                          <td className="py-3 px-4">
                            {order.mpPaymentId ? (
                              <div className="flex items-center gap-1 font-mono text-[11px] text-stone-700 bg-stone-100 px-2 py-1 rounded w-fit select-all">
                                <span>{order.mpPaymentId}</span>
                              </div>
                            ) : (
                              <span className="text-stone-400 text-[10px]">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-medium text-stone-800">{order.gift.title}</span>
                          </td>

                          <td className="py-3 px-4 font-bold text-stone-900">
                            {formatBRL(order.amount)}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium text-[10px]">
                              {order.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {order.status === "APPROVED" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                                <CheckCircle2 className="w-3 h-3" />
                                Confirmado
                              </span>
                            )}
                            {order.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[10px]">
                                <Clock className="w-3 h-3" />
                                Pendente
                              </span>
                            )}
                            {order.status === "REJECTED" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium text-[10px]">
                                <XCircle className="w-3 h-3" />
                                Recusado
                              </span>
                            )}

                            {feedback && (
                              <div className={`text-[10px] mt-1 font-medium ${feedback.type === "ok" ? "text-emerald-700" : "text-amber-700"}`}>
                                {feedback.msg}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 max-w-xs truncate text-stone-600 italic">
                            {order.payerMessage ? `"${order.payerMessage}"` : "—"}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleCheckOrderOnMP(order.id)}
                                disabled={isChecking}
                                className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[10px] transition-all flex items-center gap-1"
                                title="Verifica se o pagamento já caiu na conta do Mercado Pago"
                              >
                                <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
                                <span>Checar</span>
                              </button>

                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={isChecking}
                                className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Excluir este pedido"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* ABA 2: GERENCIAMENTO DO CATÁLOGO DE PRESENTES                */}
      {/* ============================================================ */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Barra de Controles e Filtros do Catálogo */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { id: "todas", label: "Todas as Categorias" },
                { id: "aberto", label: "Valor Livre" },
                { id: "sobrevivencia", label: "Ilha de Edição" },
                { id: "festa", label: "Festa & Set" },
                { id: "lua-de-mel", label: "Lua de Mel" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCatalogCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    catalogCategory === cat.id
                      ? "bg-stone-900 text-white"
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar no catálogo..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              <button
                onClick={handleResetCatalog}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 shrink-0"
                title="Restaura os valores e fotos originais do sistema"
              >
                Restaurar Padrão
              </button>
            </div>
          </div>

          {/* Grid de Presentes */}
          {loadingGifts ? (
            <div className="py-20 text-center text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-800 mb-2" />
              <p className="text-xs uppercase tracking-wider">Carregando catálogo...</p>
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 text-xs">
              Nenhum presente encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGifts.map((gift) => (
                <div
                  key={gift.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    gift.active
                      ? "border-stone-200/90 shadow-xs hover:border-stone-400"
                      : "border-stone-200 opacity-60 bg-stone-50/50"
                  }`}
                >
                  <div>
                    {/* Imagem do Presente com Tag de Categoria */}
                    <div className="relative h-44 w-full bg-stone-100 overflow-hidden group">
                      <img
                        src={gift.imageUrl}
                        alt={gift.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-medium text-white tracking-wide">
                          {categoryLabels[gift.category] || gift.category}
                        </span>
                        {!gift.active && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                            Oculto no Site
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-xs font-bold text-stone-900 shadow-xs">
                          {gift.category === "aberto" ? `Mínimo: ${formatBRL(gift.price)}` : formatBRL(gift.price)}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo Textual */}
                    <div className="p-4 sm:p-5">
                      <h3 className="font-serif font-bold text-stone-900 text-base leading-snug line-clamp-2">
                        {gift.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-2 line-clamp-3 leading-relaxed">
                        {gift.description}
                      </p>

                      {gift._count?.orders !== undefined && gift._count.orders > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{gift._count.orders} presentes recebidos</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de Ações do Item */}
                  <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(gift)}
                      className={`text-[11px] font-medium transition-colors ${
                        gift.active ? "text-stone-500 hover:text-stone-900" : "text-emerald-700 hover:underline"
                      }`}
                      title={gift.active ? "Ocultar do catálogo público" : "Mostrar no site"}
                    >
                      {gift.active ? "Ocultar" : "Tornar Visível"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(gift)}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteGift(gift)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remover presente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE EDIÇÃO / CRIAÇÃO DE PRESENTE                        */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-xl overflow-hidden my-8">
            {/* Topo do Modal */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 block mb-0.5">
                  Personalização
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {isEditingNew ? "Adicionar Novo Presente" : "Editar Presente"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveGift} className="p-6 space-y-4">
              {giftFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {giftFormError}
                </div>
              )}

              {/* Título / Nome */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nome do Presente
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Noite de Pizza & Vinho na Edição"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                  required
                />
              </div>

              {/* Valor & Categoria em 2 colunas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {formCategory === "aberto" ? "Valor Mínimo da Contribuição (R$)" : "Valor (R$)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="150,00"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    {formCategory === "aberto"
                      ? "Os convidados não poderão doar menos do que este valor no presente de Valor Livre (mínimo R$ 100,00)."
                      : "Valor configurado para este presente."}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="sobrevivencia">Ilha de Edição</option>
                    <option value="festa">Festa & Set</option>
                    <option value="lua-de-mel">Lua de Mel</option>
                    <option value="aberto">Valor Livre</option>
                  </select>
                </div>
              </div>

              {/* URL da Imagem com Preview em Tempo Real */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Link da Foto (URL)
                </label>
                <div className="flex gap-3 items-start">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      required
                    />
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="w-16 h-12 rounded-xl border border-stone-200 overflow-hidden bg-stone-100 shrink-0">
                    {formImageUrl ? (
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Você pode usar links de fotos do Unsplash, Imgur, Pexels ou qualquer hospedagem de imagens.
                </span>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Descrição / História Divertida
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Escreva um texto engraçado ou carinhoso explicando por que os noivos precisam desse presente..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              {/* Checkbox de Ativo */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formActiveCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 border-stone-300"
                />
                <label htmlFor="formActiveCheck" className="text-xs text-stone-700 font-medium select-none cursor-pointer">
                  Presente visível e disponível para escolha no site
                </label>
              </div>

              {/* Rodapé do Modal com Botões */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingGift}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {savingGift ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
