import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { useToast } from '../../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Clock, 
  Plus, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Car, 
  User, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';
import { formatDate, formatLicensePlate } from '../../lib/formatters';
import { generateWhatsAppLink, WhatsAppTemplates } from '../../lib/whatsapp';

export const RemindersPage: React.FC = () => {
  const { reminders, customers, vehicles, addReminder, updateReminderStatus } = useData();
  const { company } = useTenant();
  const { success, error } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [selectedVehId, setSelectedVehId] = useState('');
  const [type, setType] = useState<any>('oil_change');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dueKm, setDueKm] = useState('');

  const custVehicles = vehicles.filter(v => v.customer_id === selectedCustId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || !selectedVehId || !desc || !dueDate) {
      error('Preencha os campos obrigatórios');
      return;
    }

    addReminder({
      customer_id: selectedCustId,
      vehicle_id: selectedVehId,
      type,
      description: desc,
      due_date: dueDate,
      due_mileage: Number(dueKm) || undefined,
      status: 'pending',
    });

    success('Lembrete de pós-venda agendado!');
    setShowModal(false);
    setDesc('');
  };

  const handleContactWhatsApp = (reminder: any) => {
    const cust = customers.find(c => c.id === reminder.customer_id);
    const veh = vehicles.find(v => v.id === reminder.vehicle_id);
    const msg = WhatsAppTemplates.preventiveReminder(
      cust?.name || 'Cliente',
      `${veh?.make || ''} ${veh?.model || 'veículo'}`,
      reminder.description,
      company.name
    );
    window.open(generateWhatsAppLink(cust?.whatsapp || '', msg), '_blank');
    updateReminderStatus(reminder.id, 'contacted');
    success('Status atualizado para Contatado!');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Lembretes & Pós-Venda
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Agende lembretes de troca de óleo, revisão e alinhamento para fidelizar clientes.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="font-bold shadow-sm"
        >
          Novo Lembrete
        </Button>
      </div>

      {/* Reminders List */}
      {reminders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map(rem => {
            const cust = customers.find(c => c.id === rem.customer_id);
            const veh = vehicles.find(v => v.id === rem.vehicle_id);

            return (
              <Card key={rem.id} className="p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {rem.type === 'oil_change' ? '🛢️ Troca de Óleo' : rem.type === 'revision' ? '🔧 Revisão Preventiva' : '✨ Estética / Alinhamento'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {formatDate(rem.due_date)}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                    {cust?.name || 'Cliente'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {veh?.make} {veh?.model} • Placa {formatLicensePlate(veh?.license_plate)}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    {rem.description}
                    {rem.due_mileage && (
                      <span className="block mt-0.5 text-primary-700 font-bold">
                        Quilometragem prevista: {rem.due_mileage.toLocaleString('pt-BR')} km
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="whatsapp"
                    size="sm"
                    className="w-full"
                    onClick={() => handleContactWhatsApp(rem)}
                    leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
                  >
                    Chamar no WhatsApp
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Clock className="w-7 h-7" />}
          title="Nenhum lembrete agendado"
          description="Crie lembretes de revisão periódica e troca de óleo para reter clientes."
          actionLabel="+ Criar Lembrete"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Agendar Lembrete de Pós-Venda"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Select
            label="Cliente *"
            value={selectedCustId}
            onChange={(e) => {
              setSelectedCustId(e.target.value);
              const v = vehicles.find(veh => veh.customer_id === e.target.value);
              if (v) setSelectedVehId(v.id);
            }}
          >
            <option value="">Selecione o cliente...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Select
            label="Veículo *"
            value={selectedVehId}
            onChange={(e) => setSelectedVehId(e.target.value)}
          >
            <option value="">Selecione o veículo...</option>
            {custVehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} ({formatLicensePlate(v.license_plate)})
              </option>
            ))}
          </Select>

          <Select
            label="Tipo de Lembrete"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="oil_change">Troca de Óleo Preventiva</option>
            <option value="revision">Revisão Periódica / 10.000 km</option>
            <option value="alignment">Alinhamento e Balanceamento</option>
            <option value="detailing">Higienização e Proteção de Pintura</option>
            <option value="custom">Outro Lembrete Personalizado</option>
          </Select>

          <Input
            label="Descrição do Lembrete *"
            required
            placeholder="Ex: Próxima troca de óleo aos 77.000 km..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Data Prevista *"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Input
              label="KM Estimado (opcional)"
              type="number"
              placeholder="77000"
              value={dueKm}
              onChange={(e) => setDueKm(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
            Agendar Lembrete
          </Button>
        </form>
      </Modal>
    </div>
  );
};
