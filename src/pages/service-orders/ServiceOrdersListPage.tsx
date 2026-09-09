import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Wrench, 
  Kanban, 
  Plus, 
  Search, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar 
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, formatDateTime, getServiceOrderStatusBadge } from '../../lib/formatters';

export const ServiceOrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { serviceOrders, quotes, vehicles, customers } = useData();
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'active', label: 'Em Andamento', count: serviceOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length },
    { id: 'ready', label: 'Prontos', count: serviceOrders.filter(o => o.status === 'ready').length },
    { id: 'all', label: 'Todas as O.S.', count: serviceOrders.length },
    { id: 'delivered', label: 'Entregues', count: serviceOrders.filter(o => o.status === 'delivered').length },
  ];

  const filteredOrders = serviceOrders.filter(os => {
    // Tab filter
    if (activeTab === 'active' && (os.status === 'delivered' || os.status === 'cancelled')) return false;
    if (activeTab === 'ready' && os.status !== 'ready') return false;
    if (activeTab === 'delivered' && os.status !== 'delivered') return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNumber = os.os_number.toString().includes(term);
      const matchResp = os.responsible_name?.toLowerCase().includes(term);
      return matchNumber || matchResp;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Ordens de Serviço (OS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Acompanhe o andamento dos serviços, checklist de entrada, fotos e garantias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/service-orders/kanban')}
            leftIcon={<Kanban className="w-4 h-4 text-purple-600" />}
            className="font-bold"
          >
            Quadro Oficina (Kanban)
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/quotes/new')}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            className="font-bold shadow-sm"
          >
            Nova OS / Orçamento
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número da OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(os => {
            const badge = getServiceOrderStatusBadge(os.status);
            const quote = quotes.find(q => q.id === os.quote_id);
            const customer = customers.find(c => c.id === os.customer_id);
            const vehicle = vehicles.find(v => v.id === os.vehicle_id);

            return (
              <Card
                key={os.id}
                className="hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-4 sm:p-5 flex-1">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.color} ${badge.border}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      OS #{os.os_number}
                    </span>
                  </div>

                  {/* Customer & Vehicle */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {customer?.name || 'Cliente'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {vehicle?.make} {vehicle?.model} ({vehicle?.year})
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-mono font-bold text-slate-700">
                        {formatLicensePlate(vehicle?.license_plate)}
                      </span>
                      {os.responsible_name && (
                        <span className="text-[11px] text-slate-500">
                          Mecânico: <strong className="text-slate-700">{os.responsible_name}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Valor do Serviço:</span>
                    <span className="text-base font-black text-slate-900">
                      {quote ? formatCurrency(quote.total) : 'A calcular'}
                    </span>
                  </div>
                </CardContent>

                <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Entrada: {formatDateTime(os.start_date)}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate(`/service-orders/${os.id}`)}
                    className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 p-1.5 rounded-lg"
                  >
                    Gerenciar OS <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Wrench className="w-7 h-7" />}
          title="Nenhuma ordem de serviço encontrada"
          description="Você ainda não possui ordens de serviço nesta categoria."
          actionLabel="Ver Quadro Kanban"
          onAction={() => navigate('/service-orders/kanban')}
        />
      )}
    </div>
  );
};
