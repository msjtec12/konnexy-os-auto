import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/common/EmptyState';
import { WhatsAppShareModal } from '../../components/common/WhatsAppShareModal';
import { WhatsAppTemplates } from '../../lib/whatsapp';
import { 
  Plus, 
  FileText, 
  MessageSquare, 
  Search, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink 
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, formatDate, getQuoteStatusBadge } from '../../lib/formatters';

export const QuotesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { company } = useTenant();
  const { quotes } = useData();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shareQuote, setShareQuote] = useState<any>(null);

  const tabs = [
    { id: 'all', label: 'Todos', count: quotes.length },
    { id: 'sent', label: 'Aguardando', count: quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length },
    { id: 'approved', label: 'Aprovados', count: quotes.filter(q => q.status === 'approved').length },
    { id: 'draft', label: 'Rascunhos', count: quotes.filter(q => q.status === 'draft').length },
    { id: 'rejected', label: 'Recusados', count: quotes.filter(q => q.status === 'rejected').length },
  ];

  const filteredQuotes = quotes.filter(q => {
    // Tab filter
    if (activeTab === 'sent' && q.status !== 'sent' && q.status !== 'viewed') return false;
    if (activeTab === 'approved' && q.status !== 'approved') return false;
    if (activeTab === 'draft' && q.status !== 'draft') return false;
    if (activeTab === 'rejected' && q.status !== 'rejected') return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNumber = q.quote_number.toString().includes(term);
      const matchCustomer = q.customer?.name.toLowerCase().includes(term);
      const matchVehicle = q.vehicle?.model.toLowerCase().includes(term) || q.vehicle?.license_plate.toLowerCase().includes(term);
      return matchNumber || matchCustomer || matchVehicle;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Orçamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Crie propostas rápidas e envie diretamente pelo WhatsApp para aprovação.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/quotes/new')}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="font-bold shadow-sm"
        >
          Novo Orçamento
        </Button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Quotes Cards List */}
      {filteredQuotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map(q => {
            const badge = getQuoteStatusBadge(q.status);
            const publicUrl = `${window.location.origin}/orcamento/${q.public_token}`;

            return (
              <Card
                key={q.id}
                className="hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-4 sm:p-5 flex-1">
                  {/* Top: Status & Quote # */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.color} ${badge.border}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      #{q.quote_number}
                    </span>
                  </div>

                  {/* Customer & Vehicle */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {q.customer?.name || 'Cliente sem nome'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {q.vehicle?.make} {q.vehicle?.model} ({q.vehicle?.year})
                    </p>
                    <div className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 rounded text-[11px] font-mono font-bold text-slate-700">
                      {formatLicensePlate(q.vehicle?.license_plate)}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total do Orçamento</span>
                      <span className="text-lg font-black text-slate-900">{formatCurrency(q.total)}</span>
                    </div>
                    {q.down_payment > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Sinal</span>
                        <span className="text-xs font-bold text-emerald-700">{formatCurrency(q.down_payment)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShareQuote(q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" /> WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/quotes/${q.id}`)}
                    className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 p-1.5 rounded-lg"
                  >
                    Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="Nenhum orçamento encontrado"
          description="Você ainda não possui orçamentos nesta categoria. Comece criando um novo orçamento para o cliente."
          actionLabel="+ Novo Orçamento"
          onAction={() => navigate('/quotes/new')}
        />
      )}

      {/* WhatsApp Share Modal */}
      {shareQuote && (
        <WhatsAppShareModal
          isOpen={true}
          onClose={() => setShareQuote(null)}
          phone={shareQuote.customer?.whatsapp || shareQuote.customer?.phone || ''}
          customerName={shareQuote.customer?.name || 'Cliente'}
          defaultMessage={WhatsAppTemplates.quoteCreated(
            shareQuote.customer?.name || 'Cliente',
            `${shareQuote.vehicle?.make || ''} ${shareQuote.vehicle?.model || 'Veículo'}`,
            `${window.location.origin}/orcamento/${shareQuote.public_token}`,
            company.name
          )}
          title="Enviar Orçamento pelo WhatsApp"
        />
      )}
    </div>
  );
};
