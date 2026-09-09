import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { 
  Clock, 
  MessageCircle, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Send, 
  Calendar, 
  User, 
  Car, 
  ChevronRight,
  TrendingDown,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Quote, RejectionReasonCategory } from '../../types';
import { generateWhatsAppLink, WHATSAPP_TEMPLATES } from '../../lib/whatsapp';

export const FollowUpQueuePage: React.FC = () => {
  const { quotes, customers, vehicles, updateQuoteStatus, recordQuoteRejection } = useData();
  const { company } = useTenant();
  const { success, info } = useToast();

  const [selectedQuoteForLoss, setSelectedQuoteForLoss] = useState<Quote | null>(null);
  const [lossCategory, setLossCategory] = useState<RejectionReasonCategory>('price');
  const [lossDetails, setLossDetails] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Identify stagnant quotes: status is 'sent' or 'viewed' and created more than 48 hours ago
  const stagnantQuotes = quotes.filter(q => {
    if (q.status !== 'sent' && q.status !== 'viewed') return false;
    const hoursSinceCreation = (Date.now() - new Date(q.created_at).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation >= 48;
  });

  const allPendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'viewed');
  const lostQuotes = quotes.filter(q => q.status === 'rejected');

  const filteredStagnant = stagnantQuotes.filter(q => {
    const cust = customers.find(c => c.id === q.customer_id);
    const veh = vehicles.find(v => v.id === q.vehicle_id);
    const term = searchTerm.toLowerCase();
    return q.quote_number.toString().toLowerCase().includes(term) ||
      cust?.name.toLowerCase().includes(term) ||
      veh?.license_plate.toLowerCase().includes(term);
  });

  const totalStagnantValue = stagnantQuotes.reduce((acc, q) => acc + (q.total || q.total_amount || 0), 0);
  const totalPendingPipeline = allPendingQuotes.reduce((acc, q) => acc + (q.total || q.total_amount || 0), 0);

  // Lost reasons distribution
  const lostStats = lostQuotes.reduce<Record<string, number>>((acc, q) => {
    const cat = q.rejection_category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const handleSendWhatsAppFollowUp = (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customer_id);
    const vehicle = vehicles.find(v => v.id === quote.vehicle_id);
    if (!customer?.phone && !customer?.whatsapp) {
      info('Cliente sem telefone cadastrado.');
      return;
    }

    const publicUrl = `${window.location.origin}/orcamento/${quote.public_token}`;
    const text = WHATSAPP_TEMPLATES.quoteFollowUp({
      customerName: customer?.name || 'Cliente',
      companyName: company.name,
      plate: vehicle?.license_plate || '',
      quoteNumber: quote.quote_number,
      publicLink: publicUrl,
    });

    const link = generateWhatsAppLink(customer?.whatsapp || customer?.phone || '', text);
    window.open(link, '_blank');
    success('Link de WhatsApp aberto!');
  };

  const handleConfirmLoss = () => {
    if (!selectedQuoteForLoss) return;
    recordQuoteRejection(selectedQuoteForLoss.id, lossCategory, lossDetails);
    success(`Orçamento ${selectedQuoteForLoss.quote_number} arquivado como Recusado.`);
    setSelectedQuoteForLoss(null);
    setLossDetails('');
  };

  const lossLabels: Record<RejectionReasonCategory, string> = {
    price: 'Preço / Orçamento Alto',
    deadline: 'Prazo Longo',
    competitor: 'Fechou com Concorrente',
    later: 'Fará Mais Tarde',
    not_needed: 'Serviço Não Necessário',
    gave_up: 'Desistiu do Serviço',
    sold_car: 'Vendeu o Veículo',
    other: 'Outro Motivo'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-300" />
              Recuperação Comercial Ativa • Follow-Up
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Fila de Orçamentos Parados (&gt;48h)
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Orçamentos enviados que não foram respondidos há mais de 48 horas. Envie um WhatsApp assistido com 1 clique para não perder vendas.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-right">
            <span className="text-[11px] text-amber-200 font-bold block uppercase tracking-wider">Pipeline Travado</span>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalStagnantValue)}
            </span>
            <span className="text-[10px] text-amber-200 font-semibold block mt-0.5">
              {stagnantQuotes.length} orçamentos aguardando resposta
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parados &gt; 48 Horas</p>
            <p className="text-2xl font-black text-amber-600">{stagnantQuotes.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Requerem contato hoje</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pendentes</p>
            <p className="text-2xl font-black text-slate-900">{allPendingQuotes.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendingPipeline)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orçamentos Perdidos</p>
            <p className="text-2xl font-black text-rose-600">{lostQuotes.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Com motivo registrado</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, placa ou número..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-colors"
            />
          </div>
          <span className="text-xs font-bold text-slate-500">
            Exibindo {filteredStagnant.length} de {stagnantQuotes.length} parados
          </span>
        </div>

        {filteredStagnant.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Nenhum orçamento parado no momento!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Todos os seus orçamentos enviados estão em dia ou foram respondidos dentro do prazo de 48h.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStagnant.map(quote => {
              const customer = customers.find(c => c.id === quote.customer_id);
              const vehicle = vehicles.find(v => v.id === quote.vehicle_id);
              const daysWaiting = Math.floor((Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div key={quote.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900">{quote.quote_number}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                        {daysWaiting} dias sem resposta
                      </span>
                      {quote.status === 'viewed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Visualizado pelo cliente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {customer?.name || 'Cliente não identificado'}
                      </span>
                      {vehicle && (
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-slate-400" />
                          {vehicle.model} ({vehicle.license_plate})
                        </span>
                      )}
                      <span className="font-extrabold text-slate-900 text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total || quote.total_amount || 0)}
                      </span>
                    </div>

                    {quote.technical_diagnosis && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                        "{quote.technical_diagnosis}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendWhatsAppFollowUp(quote)}
                      leftIcon={<MessageCircle className="w-4 h-4" />}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Disparar WhatsApp
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuoteForLoss(quote)}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs font-bold"
                    >
                      Marcar Perdido
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lost Reasons Analytics Breakdown */}
      {lostQuotes.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" /> Análise de Motivos de Perda
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(lossLabels).map(([catKey, label]) => {
              const count = lostStats[catKey] || 0;
              const percentage = Math.round((count / lostQuotes.length) * 100) || 0;

              return (
                <div key={catKey} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xl font-black text-slate-900">{count}</p>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight mt-0.5">{label}</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loss Modal */}
      {selectedQuoteForLoss && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Registrar Motivo de Perda
              </h3>
              <button
                onClick={() => setSelectedQuoteForLoss(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Por que o orçamento <span className="font-bold text-slate-900">{selectedQuoteForLoss.quote_number}</span> não foi fechado? Isso ajuda a melhorar a taxa de conversão da sua oficina.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Categoria do Motivo</label>
                <select
                  value={lossCategory}
                  onChange={e => setLossCategory(e.target.value as RejectionReasonCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {Object.entries(lossLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Observações adicionais (opcional)</label>
                <textarea
                  rows={3}
                  value={lossDetails}
                  onChange={e => setLossDetails(e.target.value)}
                  placeholder="Ex: Cliente achou a peça cara e vai orçar em outro lugar..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuoteForLoss(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmLoss}
                className="font-bold"
              >
                Confirmar Perda
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
