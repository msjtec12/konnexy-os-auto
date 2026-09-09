import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ServiceOrderStatus, ServiceOrder } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Plus, 
  Car, 
  User, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatLicensePlate } from '../../lib/formatters';

interface ColumnDef {
  id: ServiceOrderStatus;
  title: string;
  color: string;
  badgeBg: string;
}

const KANBAN_COLUMNS: ColumnDef[] = [
  { id: 'received', title: 'Entrada / Recebido', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
  { id: 'diagnosis', title: 'Diagnóstico', color: 'border-blue-500 text-blue-700', badgeBg: 'bg-blue-50' },
  { id: 'awaiting_approval', title: 'Aguardando Aprovação', color: 'border-purple-500 text-purple-700', badgeBg: 'bg-purple-50' },
  { id: 'in_progress', title: 'Em Serviço', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
  { id: 'awaiting_parts', title: 'Aguardando Peça', color: 'border-orange-500 text-orange-700', badgeBg: 'bg-orange-50' },
  { id: 'ready', title: 'Pronto p/ Retirada', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
  { id: 'delivered', title: 'Entregue / Concluído', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
];

export const ServiceOrderKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const { serviceOrders, quotes, customers, vehicles, updateServiceOrderStatus } = useData();

  const handleMoveStatus = (osId: string, currentStatus: ServiceOrderStatus, direction: 'next' | 'prev') => {
    const currentIndex = KANBAN_COLUMNS.findIndex(c => c.id === currentStatus);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < KANBAN_COLUMNS.length) {
      const nextStatus = KANBAN_COLUMNS[nextIndex].id;
      updateServiceOrderStatus(osId, nextStatus);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quadro Oficina (Kanban)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize todos os veículos no pátio e mova as etapas de trabalho rapidamente.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/quotes/new')}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="font-bold shadow-sm"
        >
          Nova Entrada / OS
        </Button>
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory">
        {KANBAN_COLUMNS.map((col, colIndex) => {
          const columnOrders = serviceOrders.filter(o => o.status === col.id);

          return (
            <div
              key={col.id}
              className="w-72 sm:w-80 shrink-0 bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[0].replace('border', 'bg')}`} />
                  <span className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight">
                    {col.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-slate-700 shadow-2xs border border-slate-200">
                  {columnOrders.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {columnOrders.map(os => {
                  const customer = customers.find(c => c.id === os.customer_id);
                  const vehicle = vehicles.find(v => v.id === os.vehicle_id);
                  const quote = quotes.find(q => q.id === os.quote_id);

                  return (
                    <div
                      key={os.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-card hover:border-slate-300 transition-all space-y-2.5 group"
                    >
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-extrabold text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                          OS #{os.os_number}
                        </span>
                        {quote && (
                          <span className="text-xs font-extrabold text-slate-900">
                            {formatCurrency(quote.total)}
                          </span>
                        )}
                      </div>

                      {/* Vehicle & Customer */}
                      <div
                        onClick={() => navigate(`/service-orders/${os.id}`)}
                        className="cursor-pointer"
                      >
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">
                          {vehicle?.model || 'Veículo'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {customer?.name || 'Cliente'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono font-bold">
                            {formatLicensePlate(vehicle?.license_plate)}
                          </span>
                          {os.responsible_name && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                              Resp: <strong>{os.responsible_name}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Move status buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          disabled={colIndex === 0}
                          onClick={() => handleMoveStatus(os.id, os.status, 'prev')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Voltar etapa"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/service-orders/${os.id}`)}
                          className="text-[11px] font-bold text-primary-600 hover:underline"
                        >
                          Detalhes
                        </button>

                        <button
                          type="button"
                          disabled={colIndex === KANBAN_COLUMNS.length - 1}
                          onClick={() => handleMoveStatus(os.id, os.status, 'next')}
                          className="p-1 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Avançar etapa"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {columnOrders.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Nenhum veículo nesta etapa.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
