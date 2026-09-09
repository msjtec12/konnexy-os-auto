import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Search, User, Car, FileText, Wrench, ArrowRight } from 'lucide-react';
import { formatCurrency, formatLicensePlate } from '../../lib/formatters';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { searchGlobal } = useData();
  const navigate = useNavigate();

  const results = searchGlobal(query);
  const hasResults = query.trim().length > 0 && (
    results.customers.length > 0 ||
    results.vehicles.length > 0 ||
    results.quotes.length > 0 ||
    results.serviceOrders.length > 0
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" showCloseButton={false}>
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Pesquisar por cliente, telefone, placa, modelo, orçamento ou OS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Results */}
        {query.trim().length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
            {/* Clientes */}
            {results.customers.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Clientes ({results.customers.length})
                </span>
                <div className="space-y-1">
                  {results.customers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelect(`/customers/${c.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.whatsapp} • {c.document || 'Sem CPF'}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Veículos */}
            {results.vehicles.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Veículos ({results.vehicles.length})
                </span>
                <div className="space-y-1">
                  {results.vehicles.map(v => (
                    <div
                      key={v.id}
                      onClick={() => handleSelect(`/vehicles/${v.id}/history`)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {v.make} {v.model} ({v.year})
                          </p>
                          <p className="text-xs text-slate-500">
                            Placa: <strong className="text-slate-800">{formatLicensePlate(v.license_plate)}</strong> • {v.customer?.name}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orçamentos */}
            {results.quotes.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Orçamentos ({results.quotes.length})
                </span>
                <div className="space-y-1">
                  {results.quotes.map(q => (
                    <div
                      key={q.id}
                      onClick={() => handleSelect(`/quotes/${q.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Orçamento #{q.quote_number} — {formatCurrency(q.total)}
                          </p>
                          <p className="text-xs text-slate-500">{q.customer?.name} • {q.vehicle?.model}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ordens de Serviço */}
            {results.serviceOrders.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Ordens de Serviço ({results.serviceOrders.length})
                </span>
                <div className="space-y-1">
                  {results.serviceOrders.map(os => (
                    <div
                      key={os.id}
                      onClick={() => handleSelect(`/service-orders/${os.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            OS #{os.os_number}
                          </p>
                          <p className="text-xs text-slate-500">Resp: {os.responsible_name || 'Geral'}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasResults && (
              <div className="py-8 text-center text-slate-500 text-sm">
                Nenhum resultado encontrado para "{query}".
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Digite ao menos 1 caractere para pesquisar clientes, placas ou números.
          </div>
        )}
      </div>
    </Modal>
  );
};
