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
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Database,
  Check,
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
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do admin:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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
        setSyncMessage("Presentes sincronizados com sucesso!");
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
    <section className="py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold mb-2">
            <span>Área dos Noivos • Gestão Financeira</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Painel de Controle de Presentes
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Acompanhe as cotas recebidas, valores arrecadados e mensagens dos convidados em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose-500" : ""}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleSyncGifts}
            className="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Restaurar Catálogo</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Arrecadado */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              Total Arrecadado
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {formatBRL(data?.metrics.totalRaised || 0)}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              {data?.metrics.approvedCount || 0} contribuições confirmadas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Presentes Aprovados */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              Aprovados
            </span>
            <span className="text-2xl font-black text-stone-900 mt-1 block">
              {data?.metrics.approvedCount || 0}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Status confirmado
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Aguardando Pagamento */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              Pendentes / Pix
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {data?.metrics.pendingCount || 0}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              Aguardando pagamento
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              Média por Presente
            </span>
            <span className="text-2xl font-black text-stone-900 mt-1 block">
              {formatBRL(data?.metrics.averageContribution || 0)}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              Ticket médio por convidado
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Banner de Ambiente Mock / Local */}
      {data?.isMockMode && (
        <div className="mb-8 p-4 rounded-3xl bg-amber-50/80 border border-amber-200 text-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                Modo Mock / Simulador Ativo
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-700">
                Você pode aprovar manualmente qualquer pedido pendente abaixo clicando no botão "Aprovar (Mock)" para simular a conciliação bancária.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {/* Barra de Filtros da Tabela */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["TODOS", "APPROVED", "PENDING", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  filterStatus === st
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {st === "TODOS"
                  ? "Todos"
                  : st === "APPROVED"
                  ? "Aprovados"
                  : st === "PENDING"
                  ? "Pendentes"
                  : "Recusados"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou presente..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Listagem */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            Nenhum pedido encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200/80 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Convidado</th>
                  <th className="py-3 px-4">Presente</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Pagamento</th>
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
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">
                          {order.isAnonymous ? (
                            <span className="text-stone-500 italic">
                              {order.payerName} (Anônimo)
                            </span>
                          ) : (
                            order.payerName
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {order.payerEmail} • {dateStr}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-800">{order.gift.title}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        {formatBRL(order.amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold text-[10px]">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {order.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Aprovado
                          </span>
                        )}
                        {order.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pendente
                          </span>
                        )}
                        {order.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold text-[10px] border border-red-200">
                            <XCircle className="w-3 h-3" />
                            Recusado
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-stone-600 italic">
                        {order.payerMessage ? `"${order.payerMessage}"` : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            disabled={actionLoadingId === order.id}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-sm transition-all"
                          >
                            {actionLoadingId === order.id ? "Aprovando..." : "⚡ Aprovar"}
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
