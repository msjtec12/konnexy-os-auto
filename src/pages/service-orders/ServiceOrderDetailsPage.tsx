import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { useToast } from '../../components/ui/Toast';
import { ServiceOrderStatus, PaymentType } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { VehicleChecklist } from '../../components/common/VehicleChecklist';
import { PixModal } from '../../components/common/PixModal';
import { WhatsAppShareModal } from '../../components/common/WhatsAppShareModal';
import { WhatsAppTemplates, generateWhatsAppLink } from '../../lib/whatsapp';
import { 
  ArrowLeft, 
  MessageSquare, 
  ExternalLink, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Car, 
  User, 
  Wrench, 
  Camera, 
  Plus, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle,
  FileCheck,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, formatDateTime, formatDate, getServiceOrderStatusBadge } from '../../lib/formatters';

export const ServiceOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company } = useTenant();
  const { success } = useToast();

  const { 
    getServiceOrderById, 
    updateServiceOrderStatus, 
    updateServiceOrder, 
    quotes, 
    customers, 
    vehicles, 
    payments, 
    addPayment 
  } = useData();

  const os = getServiceOrderById(id || '');

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ServiceOrderStatus>('in_progress');
  const [statusNotes, setStatusNotes] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState<PaymentType>('pix');
  const [payNotes, setPayNotes] = useState('');

  const [showAdditionalModal, setShowAdditionalModal] = useState(false);
  const [addTitle, setAddTitle] = useState('Pastilhas de Freio Dianteiras Desgastadas');
  const [addAmount, setAddAmount] = useState('280');
  const [addDesc, setAddDesc] = useState('Identificamos espessura abaixo do limite de segurança durante a desmontagem.');

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finalKm, setFinalKm] = useState('67425');
  const [warrantyDays, setWarrantyDays] = useState('90');
  const [warrantyNotes, setWarrantyNotes] = useState('Garantia legal de 90 dias ou 5.000 km para peças e mão de obra.');

  const [showPixModal, setShowPixModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Local photos state for demonstration
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; category: string; is_client_visible: boolean; caption: string }>>([
    {
      id: 'ph-1',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&auto=format&fit=crop&q=80',
      category: 'entrada',
      is_client_visible: true,
      caption: 'Check-in de entrada e vistoria inicial'
    },
    {
      id: 'ph-2',
      url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=80',
      category: 'durante',
      is_client_visible: true,
      caption: 'Execução da troca de componentes na bancada'
    }
  ]);

  if (!os) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Ordem de Serviço não encontrada</h2>
        <Button variant="primary" size="md" className="mt-4" onClick={() => navigate('/service-orders')}>
          Voltar para Lista
        </Button>
      </div>
    );
  }

  const customer = customers.find(c => c.id === os.customer_id);
  const vehicle = vehicles.find(v => v.id === os.vehicle_id);
  const quote = quotes.find(q => q.id === os.quote_id);
  const osPayments = payments.filter(p => p.service_order_id === os.id);

  const totalValue = quote ? quote.total : 0;
  const totalPaid = osPayments.reduce((acc, p) => acc + p.amount, 0);
  const pendingBalance = Math.max(0, totalValue - totalPaid);

  const statusBadge = getServiceOrderStatusBadge(os.status);
  const publicTrackingUrl = `${window.location.origin}/acompanhar/${os.public_token}`;

  // Check if delivery is in risk (passed internal delivery date or approaching promised date)
  const isDeliveryInRisk = (() => {
    if (os.status === 'ready' || os.status === 'delivered' || os.status === 'cancelled') return false;
    const targetDate = os.promised_client_delivery ? new Date(os.promised_client_delivery).getTime() : 
      os.internal_estimated_delivery ? new Date(os.internal_estimated_delivery).getTime() : 
      os.estimated_completion_date ? new Date(os.estimated_completion_date).getTime() : null;
    if (!targetDate) return false;
    return Date.now() >= targetDate;
  })();

  // Change Status Submit
  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateServiceOrderStatus(os.id, newStatus, statusNotes);
    success(`Status atualizado para: ${getServiceOrderStatusBadge(newStatus).label}`);
    setShowStatusModal(false);
    setStatusNotes('');
  };

  // Add Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      return;
    }
    addPayment({
      service_order_id: os.id,
      amount: amountNum,
      payment_type: payType,
      is_down_payment: false,
      payment_date: new Date().toISOString(),
      notes: payNotes || 'Pagamento registrado na OS',
    });
    success(`Pagamento de ${formatCurrency(amountNum)} registrado com sucesso!`);
    setShowPaymentModal(false);
    setPayAmount('');
  };

  // Finalize OS Submit
  const handleFinalizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateServiceOrder(os.id, {
      status: 'ready',
      final_mileage: Number(finalKm) || os.initial_mileage,
      warranty_days: Number(warrantyDays) || 90,
      warranty_notes: warrantyNotes,
      completed_at: new Date().toISOString(),
    });
    success('Ordem de Serviço finalizada com sucesso! Veículo pronto para retirada.');
    setShowFinishModal(false);
  };

  // Add sample photo
  const handleAddPhoto = () => {
    const newPh = {
      id: `ph-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&auto=format&fit=crop&q=80',
      category: 'durante',
      is_client_visible: true,
      caption: `Registro fotográfico ${new Date().toLocaleTimeString()}`
    };
    setPhotos(prev => [...prev, newPh]);
    success('Foto anexada à Ordem de Serviço!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/service-orders')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ordem de Serviço #{os.os_number}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}>
                {statusBadge.label}
              </span>
              {isDeliveryInRisk && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" /> Entrega em Risco
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Entrada em {formatDateTime(os.start_date)} • Responsável: <strong className="text-slate-700">{os.responsible_name || 'Equipe Oficina'}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {os.status !== 'ready' && os.status !== 'delivered' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setNewStatus(os.status); setShowStatusModal(true); }}
              leftIcon={<Clock className="w-4 h-4" />}
              className="font-bold"
            >
              Mudar Status
            </Button>
          )}

          {os.status !== 'delivered' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setShowFinishModal(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="font-bold"
            >
              Concluir Serviço
            </Button>
          )}

          <Button
            variant="whatsapp"
            size="sm"
            onClick={() => setShowWhatsAppModal(true)}
            leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
          >
            Avisar WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(publicTrackingUrl, '_blank')}
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            Acompanhamento Cliente
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Imprimir Resumo
          </Button>
        </div>
      </div>

      {/* Previsão de Entrega: Interna vs Prometida ao Cliente (Topic: Oficina & Operação) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Previsão de Conclusão Interna (Oficina)
            </span>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">
              {os.internal_estimated_delivery ? formatDateTime(os.internal_estimated_delivery) : 
               os.estimated_completion_date ? formatDateTime(os.estimated_completion_date) : 'Hoje até 17:00'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between ${
          isDeliveryInRisk ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDeliveryInRisk ? 'text-rose-600' : 'text-slate-400'}`}>
              Prazo Prometido ao Cliente
            </span>
            <p className="text-sm font-black mt-0.5">
              {os.promised_client_delivery ? formatDateTime(os.promised_client_delivery) : 'Amanhã às 12:00'}
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isDeliveryInRisk ? 'bg-rose-600 text-white' : 'bg-primary-50 text-primary-600'
          }`}>
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 1. Customer & Vehicle Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cliente</span>
              <h3 className="text-base font-bold text-slate-900 truncate">{customer?.name}</h3>
              <p className="text-xs text-slate-600 font-mono mt-0.5">{customer?.whatsapp}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Veículo</span>
              <h3 className="text-base font-bold text-slate-900 truncate">
                {vehicle?.make} {vehicle?.model} ({vehicle?.year})
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-xs font-mono font-bold">
                  {formatLicensePlate(vehicle?.license_plate)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {vehicle?.mileage ? `${vehicle.mileage.toLocaleString('pt-BR')} km` : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Separação Operacional (Relato vs Diagnóstico vs Solução) */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary-600" />
            Detalhamento & Diagnóstico Operacional
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                1. Relato do Cliente
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {quote?.customer_complaint || 'Barulho na suspensão ao trafegar em pisos irregulares.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
                2. Diagnóstico Técnico
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {quote?.technical_diagnosis || 'Amortecedor com perda de pressão hidráulica e coxim rompido.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-primary-50/50 border border-primary-200">
              <span className="text-[10px] font-extrabold text-primary-700 uppercase tracking-wider block mb-1">
                3. Solução Recomendada
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {quote?.recommended_solution || 'Substituição do par dianteiro e alinhamento computadorizado.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Checklist de Entrada do Veículo */}
      {vehicle?.checklist && (
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base">Checklist & Vistoria de Entrada</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <VehicleChecklist value={vehicle.checklist} onChange={() => {}} readOnly={true} />
          </CardContent>
        </Card>
      )}

      {/* 3. Galeria de Fotos da OS */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-600" />
              Fotos do Veículo & Execução
            </CardTitle>
            <p className="text-xs text-slate-500">Fotos autorizadas aparecem no link do cliente</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddPhoto}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            + Anexar Foto
          </Button>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map(ph => (
              <div key={ph.id} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                <img src={ph.url} alt={ph.caption} className="w-full h-36 object-cover" />
                <div className="p-2 bg-white text-[11px] font-medium text-slate-800 flex items-center justify-between">
                  <span className="truncate">{ph.caption}</span>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                    <Eye className="w-3 h-3" /> Cliente
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Aprovações Adicionais */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Serviços / Peças Adicionais Identificados
            </CardTitle>
            <p className="text-xs text-slate-500">Envie autorização adicional para o cliente no WhatsApp</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdditionalModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            + Solicitar Aprovação
          </Button>
        </CardHeader>
        <CardContent className="p-5">
          <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-amber-950">
                  Pastilhas Dianteiras Desgastadas
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Pendente autorização
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-1">
                Identificado desgaste excessivo durante desmontagem.
              </p>
              <p className="text-sm font-black text-amber-950 mt-1.5">
                R$ 280,00
              </p>
            </div>

            <Button
              variant="whatsapp"
              size="sm"
              onClick={() => {
                const msg = WhatsAppTemplates.additionalApproval(
                  customer?.name || 'Cliente',
                  vehicle?.model || 'Veículo',
                  'Troca das Pastilhas Dianteiras Desgastadas',
                  'R$ 280,00',
                  publicTrackingUrl,
                  company.name
                );
                window.open(generateWhatsAppLink(customer?.whatsapp || '', msg), '_blank');
              }}
              leftIcon={<MessageSquare className="w-3.5 h-3.5 fill-current" />}
            >
              Pedir no WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 5. Módulo Financeiro & Pagamentos */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Pagamentos & Liquidação
          </CardTitle>
          <div className="flex items-center gap-2">
            {company.pix_key && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPixModal(true)}
                leftIcon={<DollarSign className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Gerar Pix
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPaymentModal(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Registrar Pagamento
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total da OS</span>
              <span className="text-sm sm:text-base font-black text-slate-900">{formatCurrency(totalValue)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Pago</span>
              <span className="text-sm sm:text-base font-black text-emerald-800">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">Saldo Pendente</span>
              <span className="text-sm sm:text-base font-black text-rose-800">{formatCurrency(pendingBalance)}</span>
            </div>
          </div>

          {/* Payments list */}
          {osPayments.length > 0 && (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {osPayments.map(p => (
                <div key={p.id} className="p-3 flex items-center justify-between text-xs bg-white">
                  <div>
                    <span className="font-bold text-slate-800 capitalize">
                      {p.payment_type} {p.is_down_payment ? '(Sinal)' : ''}
                    </span>
                    <p className="text-[11px] text-slate-400">{formatDateTime(p.payment_date)} • {p.notes}</p>
                  </div>
                  <span className="font-extrabold text-emerald-700">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Garantia */}
      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Garantia Assegurada: {os.warranty_days || 90} dias
              </h4>
              <p className="text-xs text-slate-500">
                {os.warranty_notes || 'Garantia legal de 90 dias referente a serviços prestados e peças aplicadas.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Alterar Status da Ordem de Serviço"
        maxWidth="md"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <Select
            label="Novo Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ServiceOrderStatus)}
          >
            <option value="received">Veículo Recebido / Check-in</option>
            <option value="diagnosis">Diagnóstico Técnico</option>
            <option value="awaiting_approval">Aguardando Aprovação do Cliente</option>
            <option value="in_progress">Em Execução / Serviço</option>
            <option value="awaiting_parts">Aguardando Peça do Fornecedor</option>
            <option value="finishing">Acabamento e Teste de Rodagem</option>
            <option value="ready">Pronto para Retirada</option>
            <option value="delivered">Entregue ao Cliente</option>
          </Select>

          <Textarea
            label="Observação da Etapa"
            placeholder="Ex: Peças montadas com sucesso. Iniciando teste final..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
            Confirmar e Salvar Status
          </Button>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Registrar Pagamento na OS"
        maxWidth="md"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <Input
            label="Valor Recebido (R$)"
            type="number"
            step="0.01"
            required
            placeholder={pendingBalance.toString()}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />

          <Select
            label="Forma de Pagamento"
            value={payType}
            onChange={(e) => setPayType(e.target.value as PaymentType)}
          >
            <option value="pix">Pix</option>
            <option value="credit">Cartão de Crédito</option>
            <option value="debit">Cartão de Débito</option>
            <option value="cash">Dinheiro em Espécie</option>
            <option value="transfer">Transferência Bancária</option>
            <option value="other">Outro</option>
          </Select>

          <Input
            label="Observação"
            placeholder="Ex: Pago no balcão..."
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
          />

          <Button type="submit" variant="success" size="lg" className="w-full font-bold">
            Registrar Recebimento
          </Button>
        </form>
      </Modal>

      {/* Finish OS Modal */}
      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="Concluir e Finalizar Ordem de Serviço"
        maxWidth="md"
      >
        <form onSubmit={handleFinalizeSubmit} className="space-y-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
            Ao finalizar, o veículo passará para o status <strong>Pronto para Retirada</strong> e o cliente poderá ser notificado.
          </div>

          <Input
            label="Quilometragem Final de Saída (KM)"
            type="number"
            value={finalKm}
            onChange={(e) => setFinalKm(e.target.value)}
          />

          <Input
            label="Prazo de Garantia (Dias)"
            type="number"
            value={warrantyDays}
            onChange={(e) => setWarrantyDays(e.target.value)}
          />

          <Textarea
            label="Termos de Garantia"
            value={warrantyNotes}
            onChange={(e) => setWarrantyNotes(e.target.value)}
          />

          <Button type="submit" variant="success" size="lg" className="w-full font-bold">
            Confirmar Conclusão da OS
          </Button>
        </form>
      </Modal>

      {/* Additional Approval Modal */}
      <Modal
        isOpen={showAdditionalModal}
        onClose={() => setShowAdditionalModal(false)}
        title="Solicitar Aprovação Adicional ao Cliente"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Título do Serviço ou Peça Adicional"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
          />
          <Input
            label="Valor Adicional (R$)"
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
          />
          <Textarea
            label="Justificativa Técnica"
            value={addDesc}
            onChange={(e) => setAddDesc(e.target.value)}
          />
          <Button
            variant="whatsapp"
            size="lg"
            className="w-full font-bold"
            onClick={() => {
              const msg = WhatsAppTemplates.additionalApproval(
                customer?.name || 'Cliente',
                vehicle?.model || 'Veículo',
                addTitle,
                formatCurrency(Number(addAmount)),
                publicTrackingUrl,
                company.name
              );
              window.open(generateWhatsAppLink(customer?.whatsapp || '', msg), '_blank');
              setShowAdditionalModal(false);
            }}
            leftIcon={<MessageSquare className="w-5 h-5 fill-current" />}
          >
            Enviar Pedido pelo WhatsApp
          </Button>
        </div>
      </Modal>

      {/* Pix Modal */}
      {showPixModal && (
        <PixModal
          isOpen={true}
          onClose={() => setShowPixModal(false)}
          amount={pendingBalance > 0 ? pendingBalance : totalValue}
          title={`Pix da OS #${os.os_number}`}
          referenceId={`OS-${os.os_number}`}
        />
      )}

      {/* WhatsApp Status Modal */}
      {showWhatsAppModal && (
        <WhatsAppShareModal
          isOpen={true}
          onClose={() => setShowWhatsAppModal(false)}
          phone={customer?.whatsapp || customer?.phone || ''}
          customerName={customer?.name || 'Cliente'}
          defaultMessage={
            os.status === 'ready'
              ? WhatsAppTemplates.serviceReady(customer?.name || 'Cliente', vehicle?.model || 'Veículo', publicTrackingUrl, company.name)
              : WhatsAppTemplates.serviceStatusUpdate(customer?.name || 'Cliente', vehicle?.model || 'Veículo', statusBadge.label, publicTrackingUrl, company.name)
          }
          title="Notificar Cliente pelo WhatsApp"
        />
      )}
    </div>
  );
};
