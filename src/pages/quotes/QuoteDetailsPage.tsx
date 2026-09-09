import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { useToast } from '../../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { WhatsAppShareModal } from '../../components/common/WhatsAppShareModal';
import { WhatsAppTemplates } from '../../lib/whatsapp';
import { 
  ArrowLeft, 
  MessageSquare, 
  ExternalLink, 
  Wrench, 
  Edit3, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Car, 
  Package, 
  Check, 
  Shield, 
  Sparkles,
  DollarSign,
  Copy,
  Lock,
  Layers,
  History,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, formatDate, formatDateTime, getQuoteStatusBadge } from '../../lib/formatters';

export const QuoteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company } = useTenant();
  const { getQuoteById, updateQuoteStatus, convertQuoteToServiceOrder, duplicateQuote } = useData();
  const { success, error, info } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);

  const quote = getQuoteById(id || '');

  if (!quote) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Orçamento não encontrado</h2>
        <Button variant="primary" size="md" className="mt-4" onClick={() => navigate('/quotes')}>
          Voltar para Lista
        </Button>
      </div>
    );
  }

  const badge = getQuoteStatusBadge(quote.status);
  const publicUrl = `${window.location.origin}/orcamento/${quote.public_token}`;

  const handleConvertToOS = () => {
    const os = convertQuoteToServiceOrder(quote.id, 'Equipe Oficina');
    if (os) {
      success(`Orçamento aprovado e transformado na OS #${os.os_number}!`);
      navigate(`/service-orders/${os.id}`);
    } else {
      error('Não foi possível gerar a OS.');
    }
  };

  const handleDuplicate = () => {
    const dup = duplicateQuote(quote.id);
    if (dup) {
      success(`Orçamento duplicado com sucesso: #${dup.quote_number}`);
      navigate(`/quotes/${dup.id}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isApprovedAndLocked = quote.status === 'approved' || quote.is_immutable;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/quotes')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Orçamento #{quote.quote_number}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.color} ${badge.border}`}>
                {badge.label}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-slate-900 text-white">
                v{quote.version || 1}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Criado em {formatDateTime(quote.created_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quote.status !== 'approved' && (
            <Button
              variant="success"
              size="sm"
              onClick={handleConvertToOS}
              leftIcon={<Wrench className="w-4 h-4" />}
              className="font-bold"
            >
              Transformar em OS
            </Button>
          )}

          <Button
            variant="whatsapp"
            size="sm"
            onClick={() => setShowShareModal(true)}
            leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
          >
            WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(publicUrl, '_blank')}
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            Link Público
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            leftIcon={<Copy className="w-4 h-4" />}
            title="Duplicar como novo orçamento"
          >
            Duplicar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Imprimir
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/quotes/${quote.id}/edit`)}
            leftIcon={<Edit3 className="w-4 h-4" />}
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Immutability Banner if Approved */}
      {isApprovedAndLocked && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 shadow-2xs">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                Orçamento Aprovado & Congelado (Versão v{quote.version || 1})
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                Imutável
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              Este orçamento possui aprovação formal registrada. Qualquer alteração futura gerará automaticamente uma nova versão para re-aprovação.
            </p>
          </div>
        </div>
      )}

      {/* Customer & Vehicle Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Card */}
        <Card>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cliente</span>
              <h3 className="text-base font-bold text-slate-900 truncate">{quote.customer?.name}</h3>
              <p className="text-xs text-slate-600 font-mono mt-0.5">{quote.customer?.whatsapp}</p>
              {quote.customer?.document && (
                <p className="text-xs text-slate-400 mt-0.5">CPF/CNPJ: {quote.customer?.document}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Card */}
        <Card>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Veículo</span>
              <h3 className="text-base font-bold text-slate-900 truncate">
                {quote.vehicle?.make} {quote.vehicle?.model} ({quote.vehicle?.year})
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-xs font-mono font-bold">
                  {formatLicensePlate(quote.vehicle?.license_plate)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {quote.vehicle?.mileage ? `${quote.vehicle.mileage.toLocaleString('pt-BR')} km` : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Fields: Relato, Diagnóstico & Solução */}
      {(quote.customer_complaint || quote.technical_diagnosis || quote.recommended_solution) && (
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary-600" />
              Detalhamento Operacional & Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  1. Relato do Cliente
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {quote.customer_complaint || 'Não informado'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
                  2. Diagnóstico Técnico
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {quote.technical_diagnosis || 'Não informado'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-primary-50/50 border border-primary-200">
                <span className="text-[10px] font-extrabold text-primary-700 uppercase tracking-wider block mb-1">
                  3. Solução Recomendada
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {quote.recommended_solution || 'Não informado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Audit Snapshot (If Approved) */}
      {quote.approval_snapshot && (
        <Card className="bg-slate-900 text-white">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Comprovante de Aprovação Digital Auditada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-2 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Aprovado por:</span>
                <span className="font-bold text-white text-sm">{quote.approval_snapshot.approved_by_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Data & Hora:</span>
                <span className="font-bold text-white">{formatDateTime(quote.approval_snapshot.timestamp)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Termos de Serviço:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aceitos Formalmente
                </span>
              </div>
            </div>
            {quote.approval_snapshot.ip_address && (
              <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 font-mono">
                IP: {quote.approval_snapshot.ip_address} • Dispositivo: {quote.approval_snapshot.user_agent?.slice(0, 60)}...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Items Breakdown Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Serviços & Peças Discriminados</CardTitle>
          <span className="text-xs font-bold text-slate-500">
            Prazo Estimado: {quote.estimated_days || 1} dia(s)
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {quote.items?.map((item, idx) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {item.description}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.type === 'service' ? 'Mão de obra' : 'Peça'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.quantity}x {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(item.total_price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 rounded-b-2xl space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 font-medium">
                <span>Desconto Especial:</span>
                <span>-{formatCurrency(quote.discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">TOTAL DO ORÇAMENTO:</span>
              <span className="text-2xl font-black text-slate-900">{formatCurrency(quote.total)}</span>
            </div>
            {quote.down_payment > 0 && (
              <div className="pt-2 border-t border-slate-200/80 flex justify-between text-xs font-bold">
                <span className="text-slate-600">Sinal / Entrada solicitada:</span>
                <span className="text-emerald-700">{formatCurrency(quote.down_payment)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Version History (Topic: Versionamento & Imutabilidade) */}
      {quote.versions && quote.versions.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-primary-600" />
              Histórico de Versões do Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {quote.versions.map(v => (
                <div key={v.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Versão v{v.version_number}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateTime(v.created_at)}
                      </span>
                    </div>
                    {v.change_summary && (
                      <p className="text-xs text-slate-600">{v.change_summary}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">
                      {formatCurrency(v.total_amount)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {v.items?.length || 0} itens
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline de Auditoria */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            Linha do Tempo de Auditoria & Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            {quote.events && quote.events.length > 0 ? (
              quote.events.map((evt, idx) => (
                <div key={evt.id} className="flex items-start gap-3 relative">
                  {idx !== quote.events!.length - 1 && (
                    <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-200 -z-0" />
                  )}
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 z-10">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{evt.description}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatDateTime(evt.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Orçamento registrado</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{formatDateTime(quote.created_at)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Share Modal */}
      {showShareModal && (
        <WhatsAppShareModal
          isOpen={true}
          onClose={() => setShowShareModal(false)}
          phone={quote.customer?.whatsapp || quote.customer?.phone || ''}
          customerName={quote.customer?.name || 'Cliente'}
          defaultMessage={WhatsAppTemplates.quoteCreated(
            quote.customer?.name || 'Cliente',
            `${quote.vehicle?.make || ''} ${quote.vehicle?.model || 'Veículo'}`,
            publicUrl,
            company.name
          )}
          title="Compartilhar Orçamento no WhatsApp"
        />
      )}
    </div>
  );
};
