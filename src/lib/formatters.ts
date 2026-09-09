export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatKm(km: number | undefined | null): string {
  if (km === undefined || km === null) return '0 km';
  return `${new Intl.NumberFormat('pt-BR').format(km)} km`;
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const clean = cleanPhone(phone);
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  } else if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

export function formatLicensePlate(plate: string | undefined | null): string {
  if (!plate) return '';
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length === 7) {
    // Mercosul (ABC1D23) or Traditional (ABC1234)
    if (/[A-Z]{3}[0-9][A-Z][0-9]{2}/.test(clean)) {
      return clean; // Mercosul pattern
    } else if (/[A-Z]{3}[0-9]{4}/.test(clean)) {
      return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    }
  }
  return clean;
}

export function formatCpfCnpj(doc: string | undefined | null): string {
  if (!doc) return '';
  const clean = doc.replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
  } else if (clean.length === 14) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
  }
  return doc;
}

export function getQuoteStatusBadge(status: string): { label: string; color: string; bg: string; border: string } {
  switch (status) {
    case 'draft':
      return { label: 'Rascunho', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' };
    case 'sent':
      return { label: 'Enviado', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    case 'viewed':
      return { label: 'Visualizado', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' };
    case 'approved':
      return { label: 'Aprovado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'rejected':
      return { label: 'Recusado', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
    case 'expired':
      return { label: 'Expirado', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    default:
      return { label: status, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' };
  }
}

export function getServiceOrderStatusBadge(status: string): { label: string; color: string; bg: string; border: string; stepIndex: number } {
  switch (status) {
    case 'received':
      return { label: 'Veículo Recebido', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', stepIndex: 1 };
    case 'diagnosis':
      return { label: 'Diagnóstico', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300', stepIndex: 2 };
    case 'awaiting_approval':
      return { label: 'Aguardando Aprovação', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-300', stepIndex: 3 };
    case 'in_progress':
      return { label: 'Em Execução', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', stepIndex: 4 };
    case 'awaiting_parts':
      return { label: 'Aguardando Peça', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300', stepIndex: 4 };
    case 'finishing':
      return { label: 'Acabamento & Testes', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-300', stepIndex: 5 };
    case 'ready':
      return { label: 'Pronto para Retirada', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', stepIndex: 6 };
    case 'delivered':
      return { label: 'Entregue / Concluído', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-300', stepIndex: 7 };
    case 'cancelled':
      return { label: 'Cancelado', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300', stepIndex: 0 };
    default:
      return { label: status, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', stepIndex: 0 };
  }
}
