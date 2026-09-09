import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Plus, 
  Wrench, 
  FileText, 
  Menu, 
  Kanban, 
  Clock, 
  BarChart3, 
  Settings, 
  X,
  Send,
  ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { quotes, serviceOrders } = useData();
  const { canAccess } = useAuth();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const pendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length;
  const activeOS = serviceOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <>
      {/* Mobile Drawer for "Mais" */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl p-5 shadow-2xl z-50 border-t border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-sm font-bold text-slate-900">Mais Opções</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <button
                onClick={() => { setMoreMenuOpen(false); navigate('/quotes/follow-up'); }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">Follow-Up</p>
                  <p className="text-[10px] text-amber-800">Orçamentos &gt;48h</p>
                </div>
              </button>

              <button
                onClick={() => { setMoreMenuOpen(false); navigate('/service-orders/kanban'); }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-primary-50 border border-slate-200 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Kanban className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Quadro Oficina</p>
                  <p className="text-[10px] text-slate-500">Kanban de status</p>
                </div>
              </button>

              <button
                onClick={() => { setMoreMenuOpen(false); navigate('/reminders'); }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-primary-50 border border-slate-200 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Pós-Venda Assistido</p>
                  <p className="text-[10px] text-slate-500">Lembretes & Trocas</p>
                </div>
              </button>

              {canAccess('view_financial_reports') && (
                <button
                  onClick={() => { setMoreMenuOpen(false); navigate('/reports'); }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-primary-50 border border-slate-200 text-left transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Relatórios</p>
                    <p className="text-[10px] text-slate-500">Conversão e valores</p>
                  </div>
                </button>
              )}

              {canAccess('manage_company_settings') && (
                <button
                  onClick={() => { setMoreMenuOpen(false); navigate('/settings'); }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-primary-50 border border-slate-200 text-left transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Configurações</p>
                    <p className="text-[10px] text-slate-500">Empresa e Pix</p>
                  </div>
                </button>
              )}

              {canAccess('view_superadmin') && (
                <button
                  onClick={() => { setMoreMenuOpen(false); navigate('/superadmin'); }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-left transition-colors col-span-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-200 text-indigo-900 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-950">Superadmin Master</p>
                    <p className="text-[10px] text-indigo-700">Governança Multi-Tenant</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-elevated">
        {/* 1. Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-colors w-14",
              isActive ? "text-primary-600" : "text-slate-500 hover:text-slate-900"
            )
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Início</span>
        </NavLink>

        {/* 2. Clientes */}
        <NavLink
          to="/customers"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-colors w-14",
              isActive ? "text-primary-600" : "text-slate-500 hover:text-slate-900"
            )
          }
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Clientes</span>
        </NavLink>

        {/* 3. Center Action Button "+ Novo" */}
        <button
          type="button"
          onClick={() => navigate('/quotes/new')}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-elevated hover:bg-primary-700 active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-extrabold text-primary-700 mt-1 uppercase tracking-tight">Novo</span>
        </button>

        {/* 4. Orçamentos */}
        <NavLink
          to="/quotes"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-colors w-14 relative",
              isActive ? "text-primary-600" : "text-slate-500 hover:text-slate-900"
            )
          }
        >
          <div className="relative">
            <FileText className="w-5 h-5 mb-0.5" />
            {pendingQuotes > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingQuotes}
              </span>
            )}
          </div>
          <span>Orçam.</span>
        </NavLink>

        {/* 5. OS */}
        <NavLink
          to="/service-orders"
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-colors w-14 relative",
              isActive ? "text-primary-600" : "text-slate-500 hover:text-slate-900"
            )
          }
        >
          <div className="relative">
            <Wrench className="w-5 h-5 mb-0.5" />
            {activeOS > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {activeOS}
              </span>
            )}
          </div>
          <span>O.S.</span>
        </NavLink>

        {/* 6. Mais */}
        <button
          type="button"
          onClick={() => setMoreMenuOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-900 w-14"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
};
