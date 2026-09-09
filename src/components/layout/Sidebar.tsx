import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  Kanban, 
  Users, 
  Clock, 
  BarChart3, 
  Settings, 
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { useData } from '../../context/DataContext';
import { useToast } from '../ui/Toast';

export const Sidebar: React.FC = () => {
  const { company, resetToDemoCompany } = useTenant();
  const { user, canAccess } = useAuth();
  const { resetAllDataToDemo, quotes, serviceOrders } = useData();
  const { success } = useToast();

  const pendingQuotesCount = quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length;
  const activeOSCount = serviceOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const stagnantQuotesCount = quotes.filter(q => {
    if (q.status !== 'sent' && q.status !== 'viewed') return false;
    const diffHours = (Date.now() - new Date(q.created_at).getTime()) / (1000 * 60 * 60);
    return diffHours >= 48;
  }).length;

  const handleResetDemo = () => {
    resetAllDataToDemo();
    resetToDemoCompany();
    success('Dados de demonstração restaurados com sucesso!');
  };

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, visible: true },
    { label: 'Orçamentos', to: '/quotes', icon: <FileText className="w-5 h-5" />, badge: pendingQuotesCount > 0 ? pendingQuotesCount : undefined, visible: true },
    { label: 'Fila de Follow-Up', to: '/quotes/follow-up', icon: <Send className="w-5 h-5 text-amber-500" />, badge: stagnantQuotesCount > 0 ? stagnantQuotesCount : undefined, visible: true },
    { label: 'Ordens de Serviço', to: '/service-orders', icon: <Wrench className="w-5 h-5" />, badge: activeOSCount > 0 ? activeOSCount : undefined, visible: true },
    { label: 'Quadro Oficina', to: '/service-orders/kanban', icon: <Kanban className="w-5 h-5" />, visible: true },
    { label: 'Clientes & Veículos', to: '/customers', icon: <Users className="w-5 h-5" />, visible: true },
    { label: 'Pós-Venda Assistido', to: '/reminders', icon: <Clock className="w-5 h-5" />, visible: true },
    { label: 'Relatórios', to: '/reports', icon: <BarChart3 className="w-5 h-5" />, visible: canAccess('view_financial_reports') },
    { label: 'Configurações', to: '/settings', icon: <Settings className="w-5 h-5" />, visible: canAccess('manage_company_settings') },
    { label: 'Superadmin Plataforma', to: '/superadmin', icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />, visible: canAccess('view_superadmin') },
  ].filter(item => item.visible);

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-screen fixed inset-y-0 left-0 z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
        )}
        <div className="overflow-hidden">
          <h2 className="font-extrabold text-sm text-slate-900 truncate tracking-tight">
            {company.name}
          </h2>
          <p className="text-[11px] font-semibold text-primary-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Konnexy OS Auto
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
          Menu Principal
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group select-none",
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <div className="flex items-center gap-3">
              <span className="transition-transform group-hover:scale-110 duration-150">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-600 text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer / Demo data reset banner */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-800">Modo Demonstração</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Ativo
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Oficina modelo: AutoPrime.
          </p>
          <button
            type="button"
            onClick={handleResetDemo}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-1.5 px-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restaurar Exemplos
          </button>
        </div>
      </div>
    </aside>
  );
};
