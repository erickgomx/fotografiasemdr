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
  ShieldAlert,
  Database,
  Check,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Loader2,
  Sparkles,
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

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Verifica se o usuário já tem cookie de autenticação válido
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const json = await res.json();
      if (json.authenticated) {
        setIsAuthenticated(true);
        fetchMetrics();
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

  const handleApproveOrder = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchMetrics();
      }
    } catch (e) {
      console.error("Erro ao aprovar pedido:", e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncGifts = async () => {
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSyncMessage("Catálogo sincronizado com sucesso!");
        setTimeout(() => setSyncMessage(null), 3000);
        await fetchMetrics();
      }
    } catch (e) {
      console.error("Erro ao sincronizar presentes:", e);
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Carregamento inicial de verificação
  if (isAuthenticated === null) {
    return (
      <div className="py-24 text-center text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-800 mb-2" />
        <p className="text-xs uppercase tracking-wider font-medium">Verificando acesso...</p>
      </div>
    );
  }

  // TELA DE LOGIN MINIMALISTA & SOFISTICADA
  if (!isAuthenticated) {
    return (
      <section className="py-16 sm:py-24 max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Lock className="w-5 h-5 text-stone-800" />
          </div>

          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest block mb-1">
            Área Reservada
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Acesso dos Noivos
          </h2>
          <p className="mt-2 text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
            Digite a senha de administrador para acompanhar presentes, valores e mensagens recebidas.
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
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <span className="text-[11px] text-stone-400 block">
              Senha padrão do ambiente: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 font-mono text-[10px]">casamento2026</code>
            </span>
            <span className="text-[10px] text-stone-400 block mt-1">
              (Você pode alterar no arquivo <code className="font-mono text-[10px]">.env.local</code> com a variável <code className="font-mono text-[10px]">ADMIN_PASSWORD</code>)
            </span>
          </div>
        </div>
      </section>
    );
  }

  // PAINEL DE CONTROLE APÓS LOGIN (EDITORIAL & ESPAÇOSO)
  const filteredOrders =
    data?.orders.filter((order) => {
      const matchesStatus =
        filterStatus === "TODOS" ? true : order.status === filterStatus;
      const matchesSearch =
        order.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.gift.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    }) || [];

  return (
    <section className="py-8 sm:py-14 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-stone-200/80">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-stone-400 block mb-1">
            Gestão Financeira
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Painel dos Noivos
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Acompanhe em tempo real as cotas recebidas e as mensagens dos convidados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-stone-800" : ""}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleSyncGifts}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Recarregar catálogo padrão"
          >
            <Database className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Restaurar Catálogo</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Arrecadado */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Total Arrecadado
            </span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">
              {formatBRL(data?.metrics.totalRaised || 0)}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              {data?.metrics.approvedCount || 0} contribuições
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Presentes Aprovados */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Aprovados
            </span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">
              {data?.metrics.approvedCount || 0}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Confirmados
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Aguardando Pagamento */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Pendentes
            </span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">
              {data?.metrics.pendingCount || 0}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              Aguardando confirmação
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Ticket Médio
            </span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">
              {formatBRL(data?.metrics.averageContribution || 0)}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              Média por presente
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Indicador discreto de modo Mock */}
      {data?.isMockMode && (
        <div className="mb-8 p-4 rounded-2xl bg-stone-100/80 border border-stone-200 text-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>
              <strong>Ambiente de Testes (Modo Mock):</strong> Você pode aprovar pedidos pendentes manualmente abaixo para simular a confirmação de recebimento.
            </span>
          </div>
        </div>
      )}

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
              placeholder="Buscar pedido..."
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
                  <th className="py-3 px-4">Presente</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Status</th>
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
                            Aprovado
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
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-stone-600 italic">
                        {order.payerMessage ? `"${order.payerMessage}"` : "—"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            disabled={actionLoadingId === order.id}
                            className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-white font-medium text-[10px] transition-all"
                          >
                            {actionLoadingId === order.id ? "Aprovando..." : "Aprovar"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
