import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import confetti from 'canvas-confetti';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { PixModal } from '../../components/common/PixModal';
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Car, 
  User, 
  ShieldCheck, 
  Clock, 
  Phone, 
  MapPin, 
  QrCode, 
  Wrench,
  Check,
  AlertCircle,
  FileCheck2,
  Lock
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, formatDate, formatDateTime, getQuoteStatusBadge } from '../../lib/formatters';
import { generateWhatsAppLink } from '../../lib/whatsapp';
import { RejectionReasonCategory } from '../../types';

export const PublicQuotePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { company } = useTenant();
  const { getQuoteByToken, approveQuotePublic, rejectQuotePublic } = useData();

  const [quote, setQuote] = useState(() => getQuoteByToken(token || ''));
  const [isApproving, setIsApproving] = useState(false);
  
  // Approval Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approverName, setApproverName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Rejection Modal States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState<RejectionReasonCategory>('price');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [showPixModal, setShowPixModal] = useState(false);

  useEffect(() => {
    if (token) {
      const found = getQuoteByToken(token);
      if (found) {
        setQuote(found);
        if (found.customer?.name && !approverName) {
          setApproverName(found.customer.name);
        }
      }
    }
  }, [token, getQuoteByToken]);

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Orçamento não encontrado</h2>
          <p className="text-xs text-slate-500 mt-1">
            O link pode estar expirado ou incorreto. Entre em contato com a oficina pelo WhatsApp.
          </p>
        </Card>
      </div>
    );
  }

  const isApproved = quote.status === 'approved';
  const isRejected = quote.status === 'rejected';
  const badge = getQuoteStatusBadge(quote.status);

  const handleConfirmApproval = () => {
    if (!approverName.trim()) return;
    if (!agreeTerms) return;

    setIsApproving(true);
    // Trigger festive confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const updated = approveQuotePublic(quote.public_token, approverName.trim());
    if (updated) {
      setQuote(updated);
    }
    setIsApproving(false);
    setShowApproveModal(false);
  };

  const handleConfirmRejection = () => {
    const updated = rejectQuotePublic(quote.public_token, rejectionCategory, rejectionReason);
    if (updated) {
      setQuote(updated);
    }
    setShowRejectModal(false);
  };

  const handleOpenWhatsApp = () => {
    const message = `Olá, ${company.name}! Gostaria de falar sobre o Orçamento #${quote.quote_number} do meu ${quote.vehicle?.model}.`;
    const link = generateWhatsAppLink(company.whatsapp || '(11) 99999-9999', message);
    window.open(link, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Workshop Header Banner */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-xs">
                <Wrench className="w-7 h-7" />
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {company.name}
              </h1>
              {company.address && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  {company.address}, {company.city} - {company.state}
                </p>
              )}
              {company.phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  {company.phone}
                </p>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proposta Nº</span>
            <span className="text-lg font-black text-slate-900">#{quote.quote_number}</span>
            <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Versão v{quote.version || 1}
            </span>
          </div>
        </div>

        {/* Status Callout if approved */}
        {isApproved && (
          <div className="bg-emerald-600 text-white p-5 rounded-3xl shadow-elevated space-y-2 animate-in zoom-in-95">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Orçamento Aprovado com Sucesso!</h3>
                <p className="text-xs text-emerald-100">
                  Nossa equipe técnica já foi notificada e dará início aos serviços conforme acordado.
                </p>
              </div>
            </div>

            {quote.approval_snapshot && (
              <div className="p-3 bg-emerald-700/50 rounded-2xl text-[11px] text-emerald-100 border border-emerald-500/30 flex items-center justify-between">
                <span>Autorizado por: <strong>{quote.approval_snapshot.approved_by_name}</strong></span>
                <span>{formatDateTime(quote.approval_snapshot.timestamp)}</span>
              </div>
            )}
          </div>
        )}

        {isRejected && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-3xl flex items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Orçamento Recusado</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Caso deseje reformular a proposta ou negociar prazos, fale diretamente pelo WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* Customer & Vehicle Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cliente</span>
            <p className="text-sm font-bold text-slate-900">{quote.customer?.name}</p>
            <p className="text-xs text-slate-500">{quote.customer?.whatsapp}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Veículo</span>
            <p className="text-sm font-bold text-slate-900">
              {quote.vehicle?.make} {quote.vehicle?.model} ({quote.vehicle?.year})
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-900 text-white rounded text-[11px] font-mono font-bold">
              {formatLicensePlate(quote.vehicle?.license_plate)}
            </span>
          </div>
        </div>

        {/* Diagnóstico Técnico (se houver) */}
        {(quote.technical_diagnosis || quote.customer_complaint) && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Constatação Técnica da Oficina
            </span>
            {quote.technical_diagnosis && (
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {quote.technical_diagnosis}
              </p>
            )}
          </div>
        )}

        {/* Items Breakdown */}
        <Card className="overflow-hidden shadow-elevated">
          <CardHeader className="bg-slate-50/80 border-b border-slate-200/80 pb-3">
            <CardTitle className="text-base">Detalhamento dos Serviços e Peças</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {quote.items?.map((it, idx) => (
                <div key={it.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {it.description}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {it.quantity}x {formatCurrency(it.unit_price)} • {it.type === 'service' ? 'Mão de obra' : 'Peça/Material'}
                    </p>
                  </div>
                  <div className="text-right font-extrabold text-sm text-slate-900">
                    {formatCurrency(it.total_price)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-5 bg-slate-900 text-white space-y-2.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal:</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                  <span>Desconto Aplicado:</span>
                  <span>-{formatCurrency(quote.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-200">VALOR TOTAL:</span>
                <span className="text-2xl sm:text-3xl font-black text-white">{formatCurrency(quote.total)}</span>
              </div>
              {quote.down_payment > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs">
                  <span className="text-slate-300">Entrada / Sinal solicitado:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(quote.down_payment)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prazo & Observações */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Clock className="w-4 h-4 text-primary-600" />
            Prazo Estimado de Execução: {quote.estimated_days || 1} dia(s) úteis
          </div>
          {quote.notes && (
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {quote.notes}
            </p>
          )}
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Garantia legal de 90 dias para serviços e garantia de fábrica para peças.
          </p>
        </div>

        {/* Action Buttons */}
        {!isApproved && !isRejected && (
          <div className="space-y-3 pt-2">
            <Button
              variant="success"
              size="lg"
              className="w-full text-base sm:text-lg font-black py-4 shadow-elevated bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowApproveModal(true)}
              leftIcon={<Check className="w-6 h-6 stroke-[3]" />}
            >
              APROVAR ORÇAMENTO
            </Button>

            {quote.down_payment > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="w-full font-bold border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50"
                onClick={() => setShowPixModal(true)}
                leftIcon={<QrCode className="w-5 h-5 text-emerald-600" />}
              >
                Pagar Sinal de {formatCurrency(quote.down_payment)} via Pix
              </Button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="whatsapp"
                size="md"
                className="w-full font-bold"
                onClick={handleOpenWhatsApp}
                leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
              >
                Tirar Dúvida WhatsApp
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                onClick={() => setShowRejectModal(true)}
              >
                Recusar Orçamento
              </Button>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="space-y-3 pt-2">
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full font-bold shadow-sm"
              onClick={handleOpenWhatsApp}
              leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
            >
              Falar com a Oficina pelo WhatsApp
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400 pt-4">
          Orçamento processado com criptografia e segurança por <strong>Konnexy OS Auto</strong>.
        </div>
      </div>

      {/* Formal Approval Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Confirmar Aprovação do Orçamento"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
            Ao confirmar, a oficina <strong>{company.name}</strong> iniciará a separação de peças e execução dos serviços orçados no valor total de <strong>{formatCurrency(quote.total)}</strong>.
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nome de quem está autorizando *
            </label>
            <Input
              value={approverName}
              onChange={e => setApproverName(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
            />
            <span className="text-xs text-slate-700 font-medium leading-tight">
              Declaro que conferi os itens, valores e prazos, e autorizo a realização dos serviços especificados neste orçamento.
            </span>
          </label>

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="success"
              size="lg"
              disabled={!approverName.trim() || !agreeTerms || isApproving}
              isLoading={isApproving}
              className="flex-1 font-extrabold bg-emerald-600 hover:bg-emerald-700"
              onClick={handleConfirmApproval}
            >
              Confirmar & Autorizar
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowApproveModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Recusar Orçamento"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Você gostaria de nos informar o motivo da recusa? Isso nos ajuda a entender suas necessidades e melhorar nosso atendimento.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Principal Motivo</label>
            <select
              value={rejectionCategory}
              onChange={e => setRejectionCategory(e.target.value as RejectionReasonCategory)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="price">Preço / Orçamento acima do esperado</option>
              <option value="deadline">Prazo de entrega muito longo</option>
              <option value="competitor">Optei por outra oficina</option>
              <option value="gave_up">Desisti de fazer o serviço agora</option>
              <option value="sold_car">Vendi ou negociei o veículo</option>
              <option value="other">Outro motivo</option>
            </select>
          </div>

          <Textarea
            placeholder="Detalhes adicionais (opcional)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={2}
          />

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="danger"
              size="md"
              className="flex-1 font-bold"
              onClick={handleConfirmRejection}
            >
              Confirmar Recusa
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowRejectModal(false)}
            >
              Voltar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pix Modal for Down Payment */}
      {showPixModal && (
        <PixModal
          isOpen={true}
          onClose={() => setShowPixModal(false)}
          amount={quote.down_payment}
          title={`Sinal do Orçamento #${quote.quote_number}`}
          referenceId={`SINAL-${quote.quote_number}`}
        />
      )}
    </div>
  );
};
