import React from 'react';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Wrench 
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

export const ReportsPage: React.FC = () => {
  const { quotes, serviceOrders, payments, customers, getDashboardMetrics } = useData();
  const metrics = getDashboardMetrics();

  const totalQuotesValue = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const approvedQuotes = quotes.filter(q => q.status === 'approved');
  const approvedValue = approvedQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const rejectedQuotes = quotes.filter(q => q.status === 'rejected');
  const totalReceived = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Top services simulation from items
  const popularServices = [
    { name: 'Troca de Óleo e Filtros', count: 18, total: 4200 },
    { name: 'Revisão Geral Preventiva', count: 9, total: 6800 },
    { name: 'Troca de Pastilhas de Freio', count: 8, total: 2450 },
    { name: 'Alinhamento e Balanceamento 3D', count: 14, total: 1120 },
    { name: 'Higienização de Ar Condicionado', count: 7, total: 1260 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Relatórios & Performance da Oficina
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Indicadores práticos de conversão de orçamentos, faturamento e clientes.
        </p>
      </div>

      {/* Strategic Conversion Rate Highlight (Topic 32) */}
      <Card className="bg-gradient-to-r from-blue-900 via-primary-800 to-indigo-900 text-white p-6 rounded-3xl shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-primary-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Conversão de Orçamentos
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white">
                {metrics.quoteConversionRate.toFixed(1)}%
              </span>
              <span className="text-sm font-semibold text-emerald-400">
                Taxa de Fechamento
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-2">
              <strong>{metrics.approvedQuotesCount} orçamentos aprovados</strong> de {metrics.totalQuotesSent} propostas enviadas aos clientes.
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-xs text-left md:text-right">
            <span className="text-xs text-slate-300 font-bold block">Em Negociação / Aguardando</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 block mt-0.5">
              {formatCurrency(metrics.awaitingApprovalAmount)}
            </span>
            <span className="text-[11px] text-slate-300 mt-1 block">
              {metrics.awaitingApprovalQuotesCount} clientes avaliando propostas
            </span>
          </div>
        </div>
      </Card>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-500 block">Total Orçado</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalQuotesValue)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {quotes.length} orçamentos criados
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-500 block">Valor Aprovado</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            {formatCurrency(approvedValue)}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            {approvedQuotes.length} serviços fechados
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-500 block">Total Recebido</span>
          <p className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
            {formatCurrency(totalReceived)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {payments.length} lançamentos via Pix / Cartão
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-500 block">Saldo a Receber</span>
          <p className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
            {formatCurrency(metrics.pendingPaymentAmount)}
          </p>
          <span className="text-[11px] text-amber-600 mt-1 block">
            Serviços em andamento
          </span>
        </Card>
      </div>

      {/* Clientes & Serviços Mais Demandados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clientes */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              Retenção e Fidelidade de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-bold block">Base de Clientes</span>
                <span className="text-xl font-black text-slate-900">{customers.length} cadastrados</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-700 font-bold block">Taxa de Recorrência</span>
                <span className="text-xl font-black text-emerald-700">75%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Clientes com histórico veicular e lembretes de revisão agendados retornam com maior frequência.
            </p>
          </CardContent>
        </Card>

        {/* Serviços Mais Realizados */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              Serviços Mais Realizados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {popularServices.map((s, idx) => (
              <div key={idx} className="p-3.5 px-5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className="text-[11px] text-slate-500 block">{s.count} atendimentos</span>
                </div>
                <span className="font-extrabold text-slate-800">{formatCurrency(s.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
