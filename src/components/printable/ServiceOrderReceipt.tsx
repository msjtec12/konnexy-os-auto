import React from 'react';
import { Company, Customer, Vehicle, ServiceOrder, Quote } from '../../types';
import { formatCurrency, formatLicensePlate, formatDate, formatDateTime } from '../../lib/formatters';
import { Wrench } from 'lucide-react';

export interface ServiceOrderReceiptProps {
  company: Company;
  customer?: Customer;
  vehicle?: Vehicle;
  serviceOrder: ServiceOrder;
  quote?: Quote;
}

export const ServiceOrderReceipt: React.FC<ServiceOrderReceiptProps> = ({
  company,
  customer,
  vehicle,
  serviceOrder,
  quote,
}) => {
  return (
    <div className="bg-white p-8 max-w-3xl mx-auto text-slate-900 text-xs font-sans print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900 mb-6">
        <div className="flex items-center gap-4">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              <Wrench className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">{company.name}</h1>
            {company.trade_name && <p className="text-[11px] text-slate-600">{company.trade_name}</p>}
            <p className="text-[11px] text-slate-600">{company.document} • {company.phone || company.whatsapp}</p>
            {company.address && <p className="text-[11px] text-slate-600">{company.address}, {company.city} - {company.state}</p>}
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
            Resumo da Ordem de Serviço
          </h2>
          <span className="text-xl font-black text-slate-900 block mt-1">
            OS #{serviceOrder.os_number}
          </span>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            Emissão: {formatDateTime(new Date())}
          </p>
        </div>
      </div>

      {/* Customer & Vehicle Info Box */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Dados do Cliente
          </span>
          <p className="text-sm font-extrabold">{customer?.name || 'Cliente'}</p>
          <p className="text-xs text-slate-700">WhatsApp/Tel: {customer?.whatsapp || customer?.phone || '-'}</p>
          {customer?.document && <p className="text-xs text-slate-700">CPF/CNPJ: {customer.document}</p>}
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Dados do Veículo
          </span>
          <p className="text-sm font-extrabold">
            {vehicle?.make} {vehicle?.model} ({vehicle?.year})
          </p>
          <p className="text-xs font-mono font-bold text-slate-800">
            Placa: {formatLicensePlate(vehicle?.license_plate)}
          </p>
          <p className="text-xs text-slate-700">
            KM de Entrada: {serviceOrder.initial_mileage ? `${serviceOrder.initial_mileage.toLocaleString('pt-BR')} km` : '-'}
            {serviceOrder.final_mileage ? ` | Saída: ${serviceOrder.final_mileage.toLocaleString('pt-BR')} km` : ''}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
          Serviços Prestados & Peças Aplicadas
        </h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-[10px] uppercase font-bold text-slate-700">
              <th className="py-2">Item</th>
              <th className="py-2">Tipo</th>
              <th className="py-2 text-center">Qtd</th>
              <th className="py-2 text-right">Unitário</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {quote?.items?.map((it, idx) => (
              <tr key={it.id} className="py-2">
                <td className="py-2 font-medium">{it.description}</td>
                <td className="py-2 text-slate-600">{it.type === 'service' ? 'Mão de obra' : 'Peça'}</td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(it.unit_price)}</td>
                <td className="py-2 text-right font-bold">{formatCurrency(it.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Financial */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(quote?.subtotal || 0)}</span>
          </div>
          {quote?.discount ? (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Desconto:</span>
              <span>-{formatCurrency(quote.discount)}</span>
            </div>
          ) : null}
          <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm text-slate-900">
            <span>VALOR TOTAL:</span>
            <span>{formatCurrency(quote?.total || 0)}</span>
          </div>
        </div>
      </div>

      {/* Warranty Terms */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
          Termo de Garantia — {serviceOrder.warranty_days || 90} Dias
        </span>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {serviceOrder.warranty_notes || 'Garantia legal referente aos serviços executados e peças aplicadas, mediante apresentação deste comprovante.'}
        </p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200 text-center">
        <div>
          <div className="border-t border-slate-900 pt-2 font-bold text-xs">
            {customer?.name || 'Cliente'}
          </div>
          <span className="text-[10px] text-slate-500">Assinatura do Cliente</span>
        </div>

        <div>
          <div className="border-t border-slate-900 pt-2 font-bold text-xs">
            {company.name}
          </div>
          <span className="text-[10px] text-slate-500">Responsável Técnico</span>
        </div>
      </div>
    </div>
  );
};
