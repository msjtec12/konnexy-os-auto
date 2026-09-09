import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useData } from '../../context/DataContext';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Wrench, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Company, BusinessType } from '../../types';

export const SuperadminPage: React.FC = () => {
  const { user } = useAuth();
  const { company, setCompany } = useTenant();
  const { platformCompanies, serviceOrders, quotes } = useData();
  const { success, info } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredCompanies = platformCompanies.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.document?.includes(searchTerm);
    const matchesType = filterType === 'all' || comp.business_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && comp.is_active) ||
      (filterStatus === 'inactive' && !comp.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalMRR = platformCompanies.reduce((acc, comp) => {
    if (!comp.is_active) return acc;
    if (comp.plan === 'turbo') return acc + 247;
    if (comp.plan === 'pro') return acc + 147;
    return acc; // trial = 0
  }, 0);

  const activeWorkshops = platformCompanies.filter(c => c.is_active).length;
  const trialWorkshops = platformCompanies.filter(c => c.plan === 'trial').length;
  const totalVolumeQuotes = quotes.length;
  const totalVolumeOS = serviceOrders.length;

  const handleImpersonate = (targetCompany: Company) => {
    setCompany(targetCompany);
    success(`Visualizando como inquilino: ${targetCompany.name}`);
  };

  const businessTypeLabels: Record<BusinessType, string> = {
    mechanic: 'Oficina Mecânica',
    auto_center: 'Centro Automotivo',
    detailing: 'Estética Automotiva',
    bodywork: 'Funilaria e Pintura',
    electric: 'Autoelétrica & Baterias',
    car_wash: 'Lava-Rápido Premium',
    accessories: 'Acessórios & Som',
    oil_change: 'Troca de Óleo Rápida',
    motorcycle: 'Oficina de Motos',
    general: 'Geral / Misto',
    other: 'Outro Segmento'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Painel de Governança Master • Konnexy Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Visão Geral Multi-Tenant
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Monitore todas as oficinas parceiras, métricas de faturamento recorrente (MRR), planos assinados e saúde operacional da rede.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right">
              <span className="text-[11px] text-slate-300 font-bold block uppercase tracking-wider">Inquilino Atual</span>
              <span className="text-sm font-extrabold text-white truncate block max-w-[160px]">
                {company.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">MRR Recorrente</p>
            <p className="text-2xl font-black text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMRR)}
            </p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18.4% vs mês anterior
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Oficinas Ativas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Oficinas Ativas</p>
            <p className="text-2xl font-black text-slate-900">{activeWorkshops}</p>
            <p className="text-[11px] text-slate-500 font-bold">
              {trialWorkshops} em período de teste gratuito
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total OS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume de O.S.</p>
            <p className="text-2xl font-black text-slate-900">{totalVolumeOS}</p>
            <p className="text-[11px] text-slate-500 font-bold">
              Geradas na plataforma
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Orçamentos Emitidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orçamentos</p>
            <p className="text-2xl font-black text-slate-900">{totalVolumeQuotes}</p>
            <p className="text-[11px] text-primary-600 font-bold">
              Tokens públicos criptografados
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Platform Plans Summary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" /> Planos da Plataforma Konnexy
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">Trial / Degustação</span>
              <span className="text-xs font-bold text-slate-500">14 Dias</span>
            </div>
            <p className="text-xl font-black text-slate-900">R$ 0,00</p>
            <p className="text-xs text-slate-500 mt-1">Até 20 orçamentos, 1 usuário, sem taxa de adesão.</p>
          </div>

          <div className="p-4 rounded-2xl bg-primary-50/50 border border-primary-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-primary-700">Plano Pro</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">Mais Popular</span>
            </div>
            <p className="text-xl font-black text-slate-900">R$ 147,00 <span className="text-xs text-slate-500 font-normal">/mês</span></p>
            <p className="text-xs text-slate-600 mt-1">Orçamentos ilimitados, WhatsApp assistido, 5 usuários, Pix copy/paste.</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700">Plano Turbo Multi</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Escala</span>
            </div>
            <p className="text-xl font-black text-slate-900">R$ 247,00 <span className="text-xs text-slate-500 font-normal">/mês</span></p>
            <p className="text-xs text-slate-600 mt-1">Usuários ilimitados, fotos em alta resolução, relatórios avançados de conversão.</p>
          </div>
        </div>
      </div>

      {/* Tenants Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por oficina, CNPJ ou cidade..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Business Type Filter */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Todos os Nichos</option>
              <option value="mechanic">Oficina Mecânica</option>
              <option value="detailing">Estética Automotiva</option>
              <option value="bodywork">Funilaria & Pintura</option>
              <option value="electric">Autoelétrica</option>
              <option value="oil_change">Troca de Óleo</option>
              <option value="motorcycle">Motos</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Bloqueadas</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Estabelecimento / Inquilino</th>
                <th className="py-3 px-4">Segmento</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4">Plano Atual</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações de Governança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredCompanies.map(comp => {
                const isCurrent = comp.id === company.id;
                return (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {comp.logo_url ? (
                          <img src={comp.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {comp.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900">{comp.name}</p>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 font-bold">
                                Ativo Agora
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{comp.document || comp.phone || 'Sem documento'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {businessTypeLabels[comp.business_type || 'mechanic']}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {comp.city ? `${comp.city} - ${comp.state || 'SP'}` : 'Não informado'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-tight ${
                        comp.plan === 'turbo'
                          ? 'bg-purple-100 text-purple-800'
                          : comp.plan === 'pro'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.plan || 'Trial'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {comp.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" /> Inativo
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCurrent}
                          onClick={() => handleImpersonate(comp)}
                          className="text-xs font-bold"
                        >
                          {isCurrent ? 'Em Uso' : 'Acessar Loja'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
