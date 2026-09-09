import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useData } from '../../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, Bell, User, LogOut, Settings, Wrench } from 'lucide-react';
import { Button } from '../ui/Button';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { company } = useTenant();
  const { quotes } = useData();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Stagnant quotes > 2 days
  const pendingQuotesAttention = quotes.filter(q => {
    if (q.status !== 'sent') return false;
    const diffDays = (Date.now() - new Date(q.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 2;
  });

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: Mobile Brand & Search Trigger */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 sm:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block leading-tight">
                {company.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">OS Auto</span>
            </div>
          </Link>

          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 text-xs font-medium transition-colors w-64 lg:w-80 border border-slate-200/60"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="flex-1 text-left">Buscar placa, cliente ou OS...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-white text-slate-500 rounded border border-slate-300 shadow-xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Alerts & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="p-2 sm:hidden rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Attention / Notification Bell */}
          <button
            type="button"
            onClick={() => navigate('/dashboard#alerts')}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Alertas e atenção necessária"
          >
            <Bell className="w-5 h-5" />
            {pendingQuotesAttention.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Quick Create Quote Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/quotes/new')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden sm:inline-flex font-bold"
          >
            Novo Orçamento
          </Button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user?.full_name || 'Usuário'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {user?.role || 'Admin'}
                </p>
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{company.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Configurações da Oficina
                  </Link>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sair da Conta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
