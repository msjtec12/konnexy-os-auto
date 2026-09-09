import React from 'react';
import { VehicleChecklist as ChecklistType } from '../../types';
import { Fuel, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export interface VehicleChecklistProps {
  value: ChecklistType;
  onChange: (value: ChecklistType) => void;
  readOnly?: boolean;
}

export const VehicleChecklist: React.FC<VehicleChecklistProps> = ({
  value,
  onChange,
  readOnly = false,
}) => {
  const updateField = <K extends keyof ChecklistType>(key: K, val: ChecklistType[K]) => {
    if (readOnly) return;
    onChange({
      ...value,
      [key]: val,
    });
  };

  const fuelOptions: { id: ChecklistType['fuel_level']; label: string; icon: string }[] = [
    { id: 'empty', label: 'Reserva / Vazio', icon: '⛽ 0%' },
    { id: 'quarter', label: '1/4 Tanque', icon: '⛽ 25%' },
    { id: 'half', label: '1/2 Tanque', icon: '⛽ 50%' },
    { id: 'three_quarters', label: '3/4 Tanque', icon: '⛽ 75%' },
    { id: 'full', label: 'Cheio', icon: '⛽ 100%' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Fuel Level */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          <Fuel className="w-4 h-4 text-primary-600" />
          Nível de Combustível na Entrada
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {fuelOptions.map(opt => {
            const isSelected = value.fuel_level === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={readOnly}
                onClick={() => updateField('fuel_level', opt.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-xs ring-2 ring-primary-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                } ${readOnly ? 'cursor-default' : ''}`}
              >
                <span className="text-sm mb-0.5">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Visual Damages & Conditions */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Checklist de Avarias & Acessórios
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Riscos */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Possui Riscos / Arranhões?</span>
              <input
                type="checkbox"
                disabled={readOnly}
                checked={value.scratches || false}
                onChange={(e) => updateField('scratches', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </label>
            {value.scratches && (
              <input
                type="text"
                disabled={readOnly}
                placeholder="Detalhar onde (ex: porta direita, para-choque)"
                value={value.scratches_notes || ''}
                onChange={(e) => updateField('scratches_notes', e.target.value)}
                className="mt-2 w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            )}
          </div>

          {/* Amassados */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Possui Amassados / Batidas?</span>
              <input
                type="checkbox"
                disabled={readOnly}
                checked={value.dents || false}
                onChange={(e) => updateField('dents', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </label>
            {value.dents && (
              <input
                type="text"
                disabled={readOnly}
                placeholder="Detalhar onde (ex: para-lama esquerdo)"
                value={value.dents_notes || ''}
                onChange={(e) => updateField('dents_notes', e.target.value)}
                className="mt-2 w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            )}
          </div>

          {/* Vidros & Retrovisores */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Vidros e Retrovisores Íntegros?</span>
              <input
                type="checkbox"
                disabled={readOnly}
                checked={value.glasses_ok !== false}
                onChange={(e) => updateField('glasses_ok', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </label>
          </div>

          {/* Estepe / Chave de Roda */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Estepe e Macaco no Veículo?</span>
              <input
                type="checkbox"
                disabled={readOnly}
                checked={value.spare_tire !== false}
                onChange={(e) => updateField('spare_tire', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Belongings & Loose Items */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          <Package className="w-4 h-4 text-slate-600" />
          Objetos e Pertences Deixados no Veículo
        </label>
        <input
          type="text"
          disabled={readOnly}
          placeholder="Ex: Óculos de sol, celular, ferramentas no porta-malas..."
          value={value.belongings || ''}
          onChange={(e) => updateField('belongings', e.target.value)}
          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
    </div>
  );
};
