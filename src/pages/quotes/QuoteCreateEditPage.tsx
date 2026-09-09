import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { useToast } from '../../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Trash2, 
  User, 
  Car, 
  FileText, 
  DollarSign, 
  Wrench, 
  Package, 
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Zap,
  Lock,
  History,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { formatCurrency, formatLicensePlate } from '../../lib/formatters';
import { WhatsAppShareModal } from '../../components/common/WhatsAppShareModal';
import { WhatsAppTemplates } from '../../lib/whatsapp';
import { ServicePackage } from '../../types';

interface FormItem {
  id: string;
  type: 'service' | 'part';
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const QuoteCreateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { company } = useTenant();
  const { success, error, info } = useToast();

  const { 
    customers, 
    vehicles, 
    catalog, 
    servicePackages,
    addCustomer, 
    addVehicle, 
    addQuote, 
    updateQuote, 
    createNewQuoteVersion,
    getQuoteById 
  } = useData();

  // Loaded existing quote state
  const [existingQuote, setExistingQuote] = useState<any>(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Operational Fields (Prompt Topic: Separação Clara)
  const [customerComplaint, setCustomerComplaint] = useState('');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState('');
  const [recommendedSolution, setRecommendedSolution] = useState('');

  // Quick Customer Creation inline modal/expand
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustWhatsapp, setNewCustWhatsapp] = useState('');
  const [newCustDoc, setNewCustDoc] = useState('');

  // Quick Vehicle Creation inline modal/expand
  const [showNewVehicle, setShowNewVehicle] = useState(false);
  const [newVehMake, setNewVehMake] = useState('Chevrolet');
  const [newVehModel, setNewVehModel] = useState('');
  const [newVehYear, setNewVehYear] = useState('2022');
  const [newVehPlate, setNewVehPlate] = useState('');
  const [newVehKm, setNewVehKm] = useState('50000');

  // Items
  const [items, setItems] = useState<FormItem[]>([
    { id: '1', type: 'service', description: 'Troca de Óleo e Filtro (Mão de Obra)', quantity: 1, unit_price: 120, total_price: 120 },
    { id: '2', type: 'part', description: 'Óleo Sintético 5W30 (4 Litros)', quantity: 1, unit_price: 190, total_price: 190 }
  ]);

  // Totals & Meta
  const [discount, setDiscount] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(1);
  const [notes, setNotes] = useState('Valores sujeitos à aprovação do cliente. Peças com garantia de fábrica.');
  const [internalNotes, setInternalNotes] = useState('');

  // Saved quote for WhatsApp share popup
  const [createdQuote, setCreatedQuote] = useState<any>(null);

  // Load quote data if editing
  useEffect(() => {
    if (isEditing && id) {
      const q = getQuoteById(id);
      if (q) {
        setExistingQuote(q);
        setSelectedCustomerId(q.customer_id);
        setSelectedVehicleId(q.vehicle_id);
        setCustomerComplaint(q.customer_complaint || '');
        setTechnicalDiagnosis(q.technical_diagnosis || '');
        setRecommendedSolution(q.recommended_solution || '');
        setDiscount(q.discount || 0);
        setDownPayment(q.down_payment || 0);
        setEstimatedDays(q.estimated_days || 1);
        setNotes(q.notes || '');
        setInternalNotes(q.internal_notes || '');
        if (q.items && q.items.length > 0) {
          setItems(q.items.map(it => ({
            id: it.id,
            type: it.type,
            description: it.description,
            quantity: Number(it.quantity),
            unit_price: Number(it.unit_price),
            total_price: Number(it.total_price),
          })));
        }
      }
    } else if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [isEditing, id, customers]);

  // Customer's vehicles
  const customerVehicles = vehicles.filter(v => v.customer_id === selectedCustomerId);

  useEffect(() => {
    if (customerVehicles.length > 0 && (!selectedVehicleId || !customerVehicles.some(v => v.id === selectedVehicleId))) {
      setSelectedVehicleId(customerVehicles[0].id);
    }
  }, [selectedCustomerId, customerVehicles]);

  // Item helpers
  const addItem = (type: 'service' | 'part' = 'service') => {
    const newItem: FormItem = {
      id: Date.now().toString(),
      type,
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (itemId: string, field: keyof FormItem, val: any) => {
    setItems(prev => prev.map(it => {
      if (it.id !== itemId) return it;
      const updated = { ...it, [field]: val };
      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? Number(val) : it.quantity;
        const price = field === 'unit_price' ? Number(val) : it.unit_price;
        updated.total_price = (isNaN(qty) ? 0 : qty) * (isNaN(price) ? 0 : price);
      }
      return updated;
    }));
  };

  const removeItem = (itemId: string) => {
    if (items.length <= 1) {
      error('O orçamento precisa conter ao menos 1 item.');
      return;
    }
    setItems(prev => prev.filter(it => it.id !== itemId));
  };

  const handleSelectCatalog = (itemId: string, catalogItemName: string) => {
    const found = catalog.find(c => c.name === catalogItemName);
    if (found) {
      updateItem(itemId, 'description', found.name);
      updateItem(itemId, 'type', found.type);
      updateItem(itemId, 'unit_price', found.default_price);
    } else {
      updateItem(itemId, 'description', catalogItemName);
    }
  };

  // Add all items from a Service Package (Fast Quote Engine)
  const handleApplyPackage = (pkg: ServicePackage) => {
    const packageItems: FormItem[] = pkg.items.map((item, idx) => ({
      id: `${Date.now()}-${idx}`,
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    setItems(prev => {
      // If current items are empty or just placeholder with 0, replace; otherwise append
      const isPlaceholder = prev.length === 1 && prev[0].description === '' && prev[0].unit_price === 0;
      return isPlaceholder ? packageItems : [...prev, ...packageItems];
    });

    if (pkg.estimated_hours) {
      setEstimatedDays(Math.max(1, Math.ceil(pkg.estimated_hours / 8)));
    }

    success(`Pacote "${pkg.name}" adicionado com ${pkg.items.length} itens!`);
  };

  // Subtotals
  const subtotal = items.reduce((acc, it) => acc + (it.total_price || 0), 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));
  const balance = Math.max(0, total - (Number(downPayment) || 0));

  // Quick Customer Submit
  const handleQuickCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustWhatsapp) {
      error('Preencha o nome e o WhatsApp do cliente');
      return;
    }
    const created = addCustomer({
      name: newCustName,
      whatsapp: newCustWhatsapp,
      document: newCustDoc,
    });
    setSelectedCustomerId(created.id);
    setShowNewCustomer(false);
    setShowNewVehicle(true);
    success('Cliente cadastrado com sucesso!');
  };

  // Quick Vehicle Submit
  const handleQuickVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehModel || !newVehPlate) {
      error('Preencha o modelo e a placa do veículo');
      return;
    }
    const created = addVehicle({
      customer_id: selectedCustomerId,
      make: newVehMake,
      model: newVehModel,
      year: Number(newVehYear) || 2022,
      license_plate: newVehPlate.toUpperCase(),
      mileage: Number(newVehKm) || 0,
    });
    setSelectedVehicleId(created.id);
    setShowNewVehicle(false);
    success('Veículo cadastrado e vinculado ao cliente!');
  };

  // Submit Quote
  const handleSave = (status: 'draft' | 'sent' = 'sent') => {
    if (!selectedCustomerId) {
      error('Selecione ou cadastre um cliente');
      return;
    }
    if (!selectedVehicleId) {
      error('Selecione ou cadastre o veículo do cliente');
      return;
    }
    if (items.some(it => !it.description.trim() || it.unit_price <= 0)) {
      error('Preencha a descrição e valor de todos os itens');
      return;
    }

    const payload = {
      customer_id: selectedCustomerId,
      vehicle_id: selectedVehicleId,
      status,
      customer_complaint: customerComplaint,
      technical_diagnosis: technicalDiagnosis,
      recommended_solution: recommendedSolution,
      subtotal,
      discount: Number(discount) || 0,
      total,
      down_payment: Number(downPayment) || 0,
      balance,
      estimated_days: Number(estimatedDays) || 1,
      notes,
      internal_notes: internalNotes,
    };

    const formattedItems = items.map(it => ({
      type: it.type,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total_price: it.total_price,
    }));

    if (isEditing && id && existingQuote) {
      if (existingQuote.status === 'approved' || existingQuote.is_immutable) {
        // Create new version to preserve historical approval audit trail
        const newVersionQuote = createNewQuoteVersion(
          id,
          payload,
          formattedItems,
          'Revisão de valores / novos itens adicionados após aprovação anterior.'
        );
        success(`Nova versão v${newVersionQuote.version} criada com sucesso para revalidação do cliente!`);
        navigate(`/quotes/${newVersionQuote.id}`);
      } else {
        updateQuote(id, payload, formattedItems);
        success('Orçamento atualizado com sucesso!');
        navigate(`/quotes/${id}`);
      }
    } else {
      const newQuote = addQuote(payload, formattedItems);
      success('Orçamento gerado com sucesso!');
      if (status === 'sent') {
        setCreatedQuote(newQuote);
      } else {
        navigate(`/quotes/${newQuote.id}`);
      }
    }
  };

  const isQuoteApprovedAndLocked = existingQuote?.status === 'approved' || existingQuote?.is_immutable;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/quotes')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {isEditing ? `Editar Orçamento #${existingQuote?.quote_number || ''}` : 'Novo Orçamento Rápido'}
              </h1>
              {existingQuote?.version && (
                <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-bold">
                  v{existingQuote.version}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Monte serviços, peças e gere o link seguro de aprovação em menos de 60 segundos.
            </p>
          </div>
        </div>
      </div>

      {/* Approved Quote Warning Banner */}
      {isQuoteApprovedAndLocked && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Orçamento Já Aprovado (Auditado e Imutável)
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Ao salvar alterações neste orçamento, o Konnexy OS criará automaticamente a <strong>Versão v{(existingQuote.version || 1) + 1}</strong>. 
              A versão anterior aprovada permanecerá arquivada para segurança jurídica.
            </p>
          </div>
        </div>
      )}

      {/* Quick Service Packages Carousel */}
      {servicePackages && servicePackages.length > 0 && (
        <div className="bg-gradient-to-r from-primary-900 via-slate-900 to-indigo-950 p-5 rounded-3xl text-white shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold tracking-wide uppercase text-amber-300">
                Agilidade: Pacotes de Serviços Prontos
              </span>
            </div>
            <span className="text-[11px] text-slate-300">Clique para adicionar em 1 segundo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {servicePackages.map(pkg => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handleApplyPackage(pkg)}
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1">{pkg.name}</p>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">{pkg.description}</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                  <span className="text-xs font-black text-amber-300">
                    {formatCurrency(pkg.total_price)}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/40 text-primary-200">
                    + {pkg.items.length} itens
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1. Cliente & Veículo */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" />
            Cliente & Veículo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Cliente *</label>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(!showNewCustomer)}
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  {showNewCustomer ? 'Cancelar' : '+ Novo Cliente'}
                </button>
              </div>

              {showNewCustomer ? (
                <div className="p-3.5 bg-primary-50/60 rounded-xl border border-primary-200 space-y-2.5">
                  <Input
                    placeholder="Nome completo"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                  />
                  <Input
                    placeholder="WhatsApp (ex: 11987654321)"
                    value={newCustWhatsapp}
                    onChange={(e) => setNewCustWhatsapp(e.target.value)}
                  />
                  <Input
                    placeholder="CPF (opcional)"
                    value={newCustDoc}
                    onChange={(e) => setNewCustDoc(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className="w-full font-bold"
                    onClick={handleQuickCustomerSubmit}
                  >
                    Salvar e Selecionar Cliente
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.whatsapp}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            {/* Vehicle select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Veículo do Cliente *</label>
                {selectedCustomerId && (
                  <button
                    type="button"
                    onClick={() => setShowNewVehicle(!showNewVehicle)}
                    className="text-xs font-bold text-primary-600 hover:underline"
                  >
                    {showNewVehicle ? 'Cancelar' : '+ Novo Veículo'}
                  </button>
                )}
              </div>

              {showNewVehicle ? (
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Marca (Ex: Chevrolet)"
                      value={newVehMake}
                      onChange={(e) => setNewVehMake(e.target.value)}
                    />
                    <Input
                      placeholder="Modelo (Ex: Onix LT)"
                      value={newVehModel}
                      onChange={(e) => setNewVehModel(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Ano (2022)"
                      value={newVehYear}
                      onChange={(e) => setNewVehYear(e.target.value)}
                    />
                    <Input
                      placeholder="Placa (ABC1D23)"
                      value={newVehPlate}
                      onChange={(e) => setNewVehPlate(e.target.value)}
                    />
                    <Input
                      placeholder="KM (67400)"
                      value={newVehKm}
                      onChange={(e) => setNewVehKm(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="success"
                    className="w-full font-bold"
                    onClick={handleQuickVehicleSubmit}
                  >
                    Salvar e Selecionar Veículo
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  disabled={!selectedCustomerId || customerVehicles.length === 0}
                >
                  {customerVehicles.length === 0 ? (
                    <option value="">Nenhum veículo cadastrado para este cliente</option>
                  ) : (
                    customerVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.year}) — Placa: {formatLicensePlate(v.license_plate)}
                      </option>
                    ))
                  )}
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Separação Operacional: Queixa do Cliente vs Diagnóstico vs Solução */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" />
            Entrada & Diagnóstico Técnico
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                1. Relato / Queixa do Cliente
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Barulho metálico na dianteira direita ao passar em buracos..."
                value={customerComplaint}
                onChange={e => setCustomerComplaint(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                2. Diagnóstico Técnico Oficina
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Amortecedor dianteiro com vazamento de óleo e coxim estourado..."
                value={technicalDiagnosis}
                onChange={e => setTechnicalDiagnosis(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                3. Solução Recomendada
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Substituição do par de amortecedores, kit batente e alinhamento..."
                value={recommendedSolution}
                onChange={e => setRecommendedSolution(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none bg-slate-50/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Serviços & Peças */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary-600" />
            Itens do Orçamento (Mão de Obra e Peças)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItem('service')}
              leftIcon={<Wrench className="w-3.5 h-3.5 text-primary-600" />}
            >
              + Serviço
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItem('part')}
              leftIcon={<Package className="w-3.5 h-3.5 text-amber-600" />}
            >
              + Peça
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(item.id, 'type', e.target.value as any)}
                    className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
                  >
                    <option value="service">🔧 Serviço / Mão de Obra</option>
                    <option value="part">📦 Peça / Material</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                  title="Remover item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Description with autocomplete from catalog */}
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    list={`catalog-list-${item.id}`}
                    placeholder="Descrição do serviço ou peça..."
                    value={item.description}
                    onChange={(e) => handleSelectCatalog(item.id, e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <datalist id={`catalog-list-${item.id}`}>
                    {catalog.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.type === 'service' ? '🔧' : '📦'} {formatCurrency(c.default_price)}
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Qtd"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Valor Unit."
                    value={item.unit_price || ''}
                    onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white text-right focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {/* Total */}
                <div className="sm:col-span-2 flex items-center justify-end px-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(item.total_price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Totais, Sinal, Prazos & Observações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base">Prazo & Condições</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <Input
              label="Prazo Estimado (em dias úteis)"
              type="number"
              min="1"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(Number(e.target.value))}
            />

            <Textarea
              label="Observações para o Cliente (Visível no Link)"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Textarea
              label="Notas Internas da Oficina (Somente Equipe)"
              rows={2}
              placeholder="Ex: Peça encomendada com distribuidor X..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card className="bg-slate-900 text-white flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-base text-white">Resumo do Orçamento</CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-3.5 flex-1">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Subtotal dos Itens:</span>
              <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Desconto Comercial:</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="R$ 0,00"
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-28 text-right px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 font-bold focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-200">TOTAL FINAL:</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{formatCurrency(total)}</span>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span>Valor de Entrada / Sinal:</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="R$ 0,00"
                value={downPayment || ''}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-28 text-right px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none"
              />
            </div>

            {downPayment > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Saldo Restante na Conclusão:</span>
                <span className="font-bold text-amber-400">{formatCurrency(balance)}</span>
              </div>
            )}
          </CardContent>

          {/* Action Buttons */}
          <div className="p-5 pt-0 space-y-2.5">
            <Button
              type="button"
              variant="whatsapp"
              size="lg"
              className="w-full text-base font-bold shadow-elevated"
              onClick={() => handleSave('sent')}
              leftIcon={<MessageSquare className="w-5 h-5 fill-current" />}
            >
              {isQuoteApprovedAndLocked ? 'Gerar Nova Versão & Enviar' : 'Salvar & Enviar no WhatsApp'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => handleSave('draft')}
            >
              Salvar como Rascunho Interno
            </Button>
          </div>
        </Card>
      </div>

      {/* WhatsApp Modal after creating quote */}
      {createdQuote && (
        <WhatsAppShareModal
          isOpen={true}
          onClose={() => navigate(`/quotes/${createdQuote.id}`)}
          phone={createdQuote.customer?.whatsapp || createdQuote.customer?.phone || ''}
          customerName={createdQuote.customer?.name || 'Cliente'}
          defaultMessage={WhatsAppTemplates.quoteCreated(
            createdQuote.customer?.name || 'Cliente',
            `${createdQuote.vehicle?.make || ''} ${createdQuote.vehicle?.model || 'Veículo'}`,
            `${window.location.origin}/orcamento/${createdQuote.public_token}`,
            company.name
          )}
          title="Orçamento Pronto! Enviar no WhatsApp"
        />
      )}
    </div>
  );
};
