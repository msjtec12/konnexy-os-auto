import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Car, 
  FileText, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Wrench,
  UserPlus,
  AlertCircle,
  Zap,
  Check,
  ListTodo
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, getQuoteStatusBadge, getServiceOrderStatusBadge } from '../../lib/formatters';
import { WhatsAppShareModal } from '../../components/common/WhatsAppShareModal';
import { WhatsAppTemplates } from '../../lib/whatsapp';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { company } = useTenant();
  const { quotes, serviceOrders, getDashboardMetrics } = useData();
  const metrics = getDashboardMetrics();

  // Selected quote for WhatsApp reminder
  const [reminderQuote, setReminderQuote] = useState<any>(null);

  // Stagnant quotes (> 48h)
  const stagnantQuotes = quotes.filter(q => {
    if (q.status !== 'sent' && q.status !== 'viewed') return false;
    const diffHours = (Date.now() - new Date(q.created_at).getTime()) / (1000 * 60 * 60);
    return diffHours >= 48;
  });

  const totalStagnantValue = stagnantQuotes.reduce((acc, q) => acc + (q.total || q.total_amount || 0), 0);

  // Deliveries in risk
  const deliveriesInRisk = serviceOrders.filter(os => {
    if (os.status === 'ready' || os.status === 'delivered' || os.status === 'cancelled') return false;
    const targetDate = os.promised_client_delivery ? new Date(os.promised_client_delivery).getTime() : 
      os.internal_estimated_delivery ? new Date(os.internal_estimated_delivery).getTime() : null;
    if (!targetDate) return false;
    return Date.now() >= targetDate;
  });

  const awaitingPartsOrders = serviceOrders.filter(o => o.status === 'awaiting_parts');
  const readyOrders = serviceOrders.filter(o => o.status === 'ready');

  // Onboarding progress calculation
  const hasPix = Boolean(company.pix_key);
  const hasPhone = Boolean(company.phone || company.whatsapp);
  const hasQuotes = quotes.length > 0;
  const hasOS = serviceOrders.length > 0;
  const onboardingScore = [hasPix, hasPhone, hasQuotes, hasOS].filter(Boolean).length;
  const isFullyConfigured = onboardingScore === 4;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-700 via-primary-600 to-blue-600 rounded-3xl p-6 text-white shadow-elevated">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" /> Painel Operacional • Konnexy OS Auto
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Olá, {company.name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Acompanhe o fluxo da oficina do orçamento ao recebimento em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            className="bg-white text-primary-700 hover:bg-blue-50 border-0 font-bold shadow-sm"
            onClick={() => navigate('/quotes/new')}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Novo Orçamento
          </Button>

          <Button
            variant="outline"
            size="md"
            className="bg-white/15 text-white hover:bg-white/25 border-white/30 backdrop-blur-xs"
            onClick={() => navigate('/customers')}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Clientes
          </Button>
        </div>
      </div>

      {/* Onboarding Checklist Widget (if not fully configured or for new workshops) */}
      {!isFullyConfigured && (
        <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-3xl border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Configuração Inicial da Oficina ({onboardingScore}/4 concluídos)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Complete os passos abaixo para liberar o fluxo de automação via WhatsApp e Pix Copia e Cola.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/onboarding')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-bold shrink-0"
            >
              Abrir Assistente
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/10">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
              hasPhone ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <Check className={`w-3.5 h-3.5 ${hasPhone ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>WhatsApp Oficina</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
              hasPix ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <Check className={`w-3.5 h-3.5 ${hasPix ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Chave Pix Configurada</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
              hasQuotes ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <Check className={`w-3.5 h-3.5 ${hasQuotes ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>1º Orçamento Gerado</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
              hasOS ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <Check className={`w-3.5 h-3.5 ${hasOS ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>1ª Ordem de Serviço</span>
            </div>
          </div>
        </Card>
      )}

      {/* 2. Top Strategic Metric: Taxa de Conversão & Valor Aguardando */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Conversão */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200/80 p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Taxa de Conversão de Orçamentos
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-950">
                  {metrics.quoteConversionRate.toFixed(1)}%
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  de aprovação
                </span>
              </div>
              <p className="text-xs text-emerald-800/80 mt-1.5 font-medium">
                <strong>{metrics.approvedQuotesCount} aprovados</strong> de {metrics.totalQuotesSent} enviados no WhatsApp.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Card Valor em Negociação / Follow-up Highlight */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/80 p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Orçamentos Parados (&gt;48h)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-950">
                  {formatCurrency(totalStagnantValue)}
                </span>
              </div>
              <p className="text-xs text-amber-800/80 mt-1.5 font-medium">
                <strong>{stagnantQuotes.length} orçamentos</strong> aguardando resposta para disparo de follow-up.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/quotes/follow-up')}
              className="bg-white border-amber-300 text-amber-900 font-bold text-xs"
            >
              Fila Follow-Up
            </Button>
          </div>
        </Card>
      </div>

      {/* 3. Resumo Operacional do Dia */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Veículos em Atendimento */}
        <Card className="hover:border-primary-300 cursor-pointer" onClick={() => navigate('/service-orders/kanban')}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Veículos em Serviço</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.activeVehiclesCount}</p>
            <p className="text-[11px] font-semibold text-primary-600 mt-1 flex items-center gap-1">
              Ver no Quadro Oficina <ChevronRight className="w-3 h-3" />
            </p>
          </CardContent>
        </Card>

        {/* Serviços Prontos */}
        <Card className="hover:border-emerald-300 cursor-pointer" onClick={() => navigate('/service-orders?status=ready')}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Serviços Prontos</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700">{metrics.readyServicesCount}</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">
              Prontos para retirada
            </p>
          </CardContent>
        </Card>

        {/* Valores Pendentes */}
        <Card className="hover:border-rose-300 cursor-pointer" onClick={() => navigate('/service-orders')}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Saldo a Receber</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(metrics.pendingPaymentAmount)}</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Serviços em andamento
            </p>
          </CardContent>
        </Card>

        {/* Faturamento Estimado */}
        <Card className="hover:border-indigo-300 cursor-pointer" onClick={() => navigate('/reports')}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Faturamento Aprovado</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-indigo-900">{formatCurrency(metrics.estimatedRevenue)}</p>
            <p className="text-[11px] font-semibold text-indigo-600 mt-1 flex items-center gap-1">
              Ver Relatório <ChevronRight className="w-3 h-3" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Atenção Necessária / Entregas em Risco & Alertas */}
      <div id="alerts" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900">Atenção Necessária & Entregas em Risco</h2>
          </div>
          <button
            onClick={() => navigate('/quotes/follow-up')}
            className="text-xs font-bold text-primary-600 hover:underline"
          >
            Abrir Fila Completa de Follow-Up →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Alerta Entregas em Risco */}
          {deliveriesInRisk.map(os => (
            <Card key={os.id} className="border-rose-300 bg-rose-50/70 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="danger" size="sm">
                  ⚠️ Entrega em Risco
                </Badge>
                <span className="text-xs font-bold text-rose-900">OS #{os.os_number}</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">Prazo de Entrega Atingido</p>
              <p className="text-xs text-rose-800 mb-3">
                Veículo com promessa de conclusão atingida. Priorizar execução e avisar cliente.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs bg-rose-600 hover:bg-rose-700"
                onClick={() => navigate(`/service-orders/${os.id}`)}
              >
                Abrir OS & Atualizar Prazo
              </Button>
            </Card>
          ))}

          {/* Alerta: Orçamentos sem resposta há > 48 horas */}
          {stagnantQuotes.slice(0, 2).map(q => (
            <Card key={q.id} className="border-amber-200 bg-amber-50/40 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="warning" size="sm">
                  Sem resposta há &gt;48h
                </Badge>
                <span className="text-xs font-extrabold text-slate-900">{formatCurrency(q.total)}</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{q.customer?.name}</p>
              <p className="text-xs text-slate-600 mb-3">
                {q.vehicle?.make} {q.vehicle?.model} • Placa {formatLicensePlate(q.vehicle?.license_plate)}
              </p>
              <Button
                variant="whatsapp"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => setReminderQuote(q)}
                leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
              >
                Disparar Follow-Up WhatsApp
              </Button>
            </Card>
          ))}

          {/* Alerta: Veículos aguardando peças */}
          {awaitingPartsOrders.slice(0, 1).map(os => (
            <Card key={os.id} className="border-orange-200 bg-orange-50/40 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="warning" size="sm">
                  Aguardando Peça
                </Badge>
                <span className="text-xs font-bold text-slate-700">OS #{os.os_number}</span>
              </div>
              <p className="text-sm font-bold text-slate-900">Peça com distribuidor</p>
              <p className="text-xs text-slate-600 mb-3">
                {os.notes || 'Peça solicitada ao fornecedor.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate(`/service-orders/${os.id}`)}
              >
                Ver Detalhes da OS
              </Button>
            </Card>
          ))}

          {stagnantQuotes.length === 0 && awaitingPartsOrders.length === 0 && deliveriesInRisk.length === 0 && (
            <div className="col-span-full bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Tudo em dia! Nenhum orçamento parado ou entrega em risco no momento.</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Quotes & Active Service Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Orçamentos Recentes</CardTitle>
              <p className="text-xs text-slate-500">Últimas propostas elaboradas</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/quotes')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {quotes.slice(0, 4).map(q => {
              const statusBadge = getQuoteStatusBadge(q.status);
              return (
                <div
                  key={q.id}
                  onClick={() => navigate(`/quotes/${q.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {q.customer?.name || 'Cliente'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {q.vehicle?.model} • Placa {formatLicensePlate(q.vehicle?.license_plate)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-slate-900">{formatCurrency(q.total)}</p>
                    <p className="text-[10px] text-slate-400">#{q.quote_number}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Active Service Orders in Workshop */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Veículos na Oficina</CardTitle>
              <p className="text-xs text-slate-500">Ordens de serviço em andamento</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/service-orders/kanban')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Quadro Kanban
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {serviceOrders.slice(0, 4).map(os => {
              const statusBadge = getServiceOrderStatusBadge(os.status);
              return (
                <div
                  key={os.id}
                  onClick={() => navigate(`/service-orders/${os.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        OS #{os.os_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      Resp: {os.responsible_name || 'Equipe Geral'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600">
                      Ver OS <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Reminder Modal */}
      {reminderQuote && (
        <WhatsAppShareModal
          isOpen={true}
          onClose={() => setReminderQuote(null)}
          phone={reminderQuote.customer?.whatsapp || reminderQuote.customer?.phone || ''}
          customerName={reminderQuote.customer?.name || 'Cliente'}
          defaultMessage={WhatsAppTemplates.quoteReminder(
            reminderQuote.customer?.name || 'Cliente',
            `${reminderQuote.vehicle?.make || ''} ${reminderQuote.vehicle?.model || 'Veículo'}`,
            `${window.location.origin}/orcamento/${reminderQuote.public_token}`,
            company.name
          )}
          title="Cobrança e Lembrete de Orçamento"
        />
      )}
    </div>
  );
};
