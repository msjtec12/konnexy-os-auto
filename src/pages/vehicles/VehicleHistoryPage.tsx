import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ArrowLeft, 
  Car, 
  User, 
  Clock, 
  Wrench, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp,
  Gauge
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, formatDate, formatKm } from '../../lib/formatters';

export const VehicleHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, customers, quotes, serviceOrders } = useData();

  const vehicle = vehicles.find(v => v.id === id);
  const customer = customers.find(c => c.id === vehicle?.customer_id);

  if (!vehicle) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Veículo não encontrado</h2>
        <Button variant="primary" size="md" className="mt-4" onClick={() => navigate('/customers')}>
          Voltar
        </Button>
      </div>
    );
  }

  const vehQuotes = quotes.filter(q => q.vehicle_id === vehicle.id);
  const vehOrders = serviceOrders.filter(o => o.vehicle_id === vehicle.id);

  // Simulated Historical Timeline Events (Topic 27)
  const historyEvents = [
    {
      date: '08/09/2026',
      km: vehicle.mileage || 67420,
      title: 'Revisão Geral e Troca de Óleo',
      items: 'Óleo Sintético 5W30 Dexos 1, Filtro de Óleo, Alinhamento e Balanceamento 3D',
      total: 435.00,
      osNumber: '230'
    },
    {
      date: '23/05/2026',
      km: 61300,
      title: 'Troca de Pastilhas de Freio Dianteiras',
      items: 'Jogo de pastilhas cerâmicas e sangria de fluido DOT 4',
      total: 380.00,
      osNumber: '198'
    },
    {
      date: '12/01/2026',
      km: 54000,
      title: 'Troca de Óleo Periódica',
      items: 'Óleo Sintético 5W30 + Filtros de Óleo e Ar do Motor',
      total: 265.00,
      osNumber: '154'
    }
  ];

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-lg text-xs font-mono font-bold">
                {formatLicensePlate(vehicle.license_plate)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Proprietário: <strong className="text-slate-700">{customer?.name}</strong> • Ano {vehicle.year}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/quotes/new')}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="font-bold shadow-sm"
        >
          Novo Orçamento para este Carro
        </Button>
      </div>

      {/* Vehicle Spec Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">KM Atual</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{formatKm(vehicle.mileage)}</p>
        </Card>

        <Card className="p-4 bg-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Combustível</span>
          <p className="text-base font-bold text-slate-800 mt-0.5">{vehicle.fuel_type || 'Flex'}</p>
        </Card>

        <Card className="p-4 bg-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cor</span>
          <p className="text-base font-bold text-slate-800 mt-0.5">{vehicle.color || 'Prata'}</p>
        </Card>

        <Card className="p-4 bg-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Atendimentos</span>
          <p className="text-lg font-black text-primary-600 mt-0.5">{historyEvents.length} serviços</p>
        </Card>
      </div>

      {/* Strategic Retention: Histórico do Veículo Timeline (Topic 27) */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              Linha do Tempo & Histórico de Manutenções
            </CardTitle>
            <p className="text-xs text-slate-500">Histórico completo para fidelização e pós-venda</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Veículo Fidelizado
          </span>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {historyEvents.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                {idx !== historyEvents.length - 1 && (
                  <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-slate-200" />
                )}

                {/* Pin icon */}
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <Gauge className="w-4 h-4" />
                </div>

                <div className="flex-1 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {evt.date}
                      </span>
                      <span className="text-xs font-bold text-primary-700 font-mono">
                        {evt.km.toLocaleString('pt-BR')} km
                      </span>
                    </div>

                    <span className="text-xs font-extrabold text-slate-900">
                      {formatCurrency(evt.total)} (OS #{evt.osNumber})
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 pt-1">{evt.title}</h4>
                  <p className="text-xs text-slate-600">{evt.items}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
