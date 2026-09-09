import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { useToast } from '../../components/ui/Toast';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MessageSquare, 
  Car, 
  ArrowRight, 
  ChevronRight 
} from 'lucide-react';
import { formatPhone, formatLicensePlate } from '../../lib/formatters';
import { generateWhatsAppLink } from '../../lib/whatsapp';

export const CustomersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, vehicles, addCustomer } = useData();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [doc, setDoc] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.whatsapp.toLowerCase().includes(term) ||
      c.document?.toLowerCase().includes(term)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      error('Preencha ao menos o nome e o WhatsApp');
      return;
    }

    const created = addCustomer({
      name,
      phone,
      whatsapp,
      document: doc,
      email,
      notes,
    });

    success('Cliente cadastrado com sucesso!');
    setShowNewModal(false);
    setName('');
    setPhone('');
    setWhatsapp('');
    setDoc('');
    setEmail('');
    setNotes('');
    navigate(`/customers/${created.id}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Clientes & Frotas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerencie contatos, veículos cadastrados e histórico de atendimentos.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowNewModal(true)}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="font-bold shadow-sm"
        >
          Novo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Customers List */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(cust => {
            const custVehicles = vehicles.filter(v => v.customer_id === cust.id);

            return (
              <Card
                key={cust.id}
                className="hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-4 sm:p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {cust.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => window.open(generateWhatsAppLink(cust.whatsapp, `Olá, ${cust.name}!`), '_blank')}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      title="Conversar no WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 font-mono">
                    {formatPhone(cust.whatsapp)}
                  </p>
                  {cust.document && (
                    <p className="text-[11px] text-slate-400 mt-0.5">CPF/CNPJ: {cust.document}</p>
                  )}

                  {/* Vehicles count & list */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Veículos ({custVehicles.length})
                    </span>
                    {custVehicles.length > 0 ? (
                      custVehicles.map(v => (
                        <div
                          key={v.id}
                          onClick={() => navigate(`/vehicles/${v.id}/history`)}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs transition-colors"
                        >
                          <span className="font-semibold text-slate-800 truncate">
                            {v.make} {v.model}
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono font-bold">
                            {formatLicensePlate(v.license_plate)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhum veículo vinculado.</p>
                    )}
                  </div>
                </CardContent>

                <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(`/quotes/new`)}
                    className="text-xs font-bold text-primary-600 hover:underline"
                  >
                    + Criar Orçamento
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/customers/${cust.id}`)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900"
                  >
                    Ver Cadastro <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="Nenhum cliente encontrado"
          description="Cadastre seu primeiro cliente para começar a gerar orçamentos rápidos."
          actionLabel="+ Novo Cliente"
          onAction={() => setShowNewModal(true)}
        />
      )}

      {/* New Customer Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Cadastrar Novo Cliente"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Nome Completo *"
            required
            placeholder="Ex: Carlos Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="WhatsApp com DDD *"
            required
            type="tel"
            placeholder="(11) 98765-4321"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone Fixo / Recado"
              placeholder="(11) 3344-5566"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="CPF / CNPJ"
              placeholder="000.000.000-00"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
            />
          </div>

          <Input
            label="E-mail"
            type="email"
            placeholder="cliente@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Textarea
            label="Observações / Preferências"
            placeholder="Ex: Prefere atendimento via WhatsApp pela manhã..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
            Salvar Cliente
          </Button>
        </form>
      </Modal>
    </div>
  );
};
