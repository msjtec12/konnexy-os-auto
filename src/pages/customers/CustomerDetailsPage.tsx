import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { 
  ArrowLeft, 
  User, 
  Car, 
  FileText, 
  Wrench, 
  Plus, 
  MessageSquare, 
  Edit, 
  Trash2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, formatPhone, formatDateTime, getQuoteStatusBadge, getServiceOrderStatusBadge } from '../../lib/formatters';
import { generateWhatsAppLink } from '../../lib/whatsapp';

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, vehicles, quotes, serviceOrders, addVehicle, deleteCustomer } = useData();
  const { success, error } = useToast();

  const customer = customers.find(c => c.id === id);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [make, setMake] = useState('Chevrolet');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [year, setYear] = useState('2022');
  const [plate, setPlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState('Flex');
  const [color, setColor] = useState('');

  if (!customer) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Cliente não encontrado</h2>
        <Button variant="primary" size="md" className="mt-4" onClick={() => navigate('/customers')}>
          Voltar para Lista
        </Button>
      </div>
    );
  }

  const custVehicles = vehicles.filter(v => v.customer_id === customer.id);
  const custQuotes = quotes.filter(q => q.customer_id === customer.id);
  const custOrders = serviceOrders.filter(o => o.customer_id === customer.id);

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !plate) {
      error('Preencha ao menos o modelo e a placa do veículo');
      return;
    }

    addVehicle({
      customer_id: customer.id,
      make,
      model,
      version,
      year: Number(year) || 2022,
      license_plate: plate.toUpperCase(),
      mileage: Number(mileage) || 0,
      fuel_type: fuel,
      color,
    });

    success('Veículo adicionado com sucesso!');
    setShowVehicleModal(false);
    setModel('');
    setPlate('');
    setMileage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {customer.name}
            </h1>
            <p className="text-xs text-slate-500">
              Cliente desde {formatDateTime(customer.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="whatsapp"
            size="sm"
            onClick={() => window.open(generateWhatsAppLink(customer.whatsapp, `Olá, ${customer.name}!`), '_blank')}
            leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
          >
            WhatsApp
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowVehicleModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Adicionar Veículo
          </Button>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp</span>
              <span className="font-mono font-bold text-slate-900">{formatPhone(customer.whatsapp)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CPF / CNPJ</span>
              <span className="text-slate-800">{customer.document || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">E-mail</span>
              <span className="text-slate-800 truncate block">{customer.email || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Gasto</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(custQuotes.filter(q => q.status === 'approved').reduce((acc, q) => acc + q.total, 0))}
              </span>
            </div>
          </div>
          {customer.notes && (
            <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded-xl">
              <strong>Observações:</strong> {customer.notes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Vehicles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary-600" />
            Veículos Vinculados ({custVehicles.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVehicleModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Novo Veículo
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {custVehicles.map(v => (
            <Card
              key={v.id}
              className="p-4 hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer"
              onClick={() => navigate(`/vehicles/${v.id}/history`)}
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">{v.make} {v.model}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{v.year} • {v.fuel_type || 'Flex'} • {v.color || 'Prata'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-xs font-mono font-bold">
                    {formatLicensePlate(v.license_plate)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {v.mileage ? `${v.mileage.toLocaleString('pt-BR')} km` : '0 km'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600">
                  Ver Histórico <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Quotes for this customer */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Histórico de Orçamentos do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {custQuotes.map(q => {
            const badge = getQuoteStatusBadge(q.status);
            return (
              <div
                key={q.id}
                onClick={() => navigate(`/quotes/${q.id}`)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Orçamento #{q.quote_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.color} ${badge.border}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(q.created_at)}</p>
                </div>
                <span className="text-sm font-extrabold text-slate-900">{formatCurrency(q.total)}</span>
              </div>
            );
          })}
          {custQuotes.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              Nenhum orçamento registrado para este cliente.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title="Cadastrar Novo Veículo"
        maxWidth="md"
      >
        <form onSubmit={handleAddVehicleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fabricante / Marca *"
              required
              placeholder="Ex: Chevrolet"
              value={make}
              onChange={(e) => setMake(e.target.value)}
            />
            <Input
              label="Modelo *"
              required
              placeholder="Ex: Onix LT 1.0"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Ano Modelo *"
              type="number"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <Input
              label="Placa *"
              required
              placeholder="ABC1D23"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            />
            <Input
              label="KM Atual"
              type="number"
              placeholder="54000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Combustível"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
            >
              <option value="Flex">Flex (Álcool/Gasolina)</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Etanol">Etanol</option>
              <option value="Diesel">Diesel</option>
              <option value="Híbrido/Elétrico">Híbrido / Elétrico</option>
            </Select>
            <Input
              label="Cor do Veículo"
              placeholder="Ex: Prata Metálico"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
            Salvar Veículo
          </Button>
        </form>
      </Modal>
    </div>
  );
};
