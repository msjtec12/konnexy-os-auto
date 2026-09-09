import { cleanPhone } from './formatters';

export function generateWhatsAppLink(phone: string, message: string): string {
  let clean = cleanPhone(phone);
  if (!clean.startsWith('55') && (clean.length === 10 || clean.length === 11)) {
    clean = `55${clean}`;
  }
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encoded}`;
}

export function interpolateTemplate(
  template: string,
  params: {
    cliente?: string;
    veiculo?: string;
    placa?: string;
    valor?: string;
    link?: string;
    oficina?: string;
    empresa?: string;
    status?: string;
    item?: string;
    motivo?: string;
    [key: string]: string | undefined;
  }
): string {
  let result = template;
  if (params.cliente) result = result.replace(/\{\{cliente\}\}/gi, params.cliente);
  if (params.veiculo) result = result.replace(/\{\{veiculo\}\}/gi, params.veiculo);
  if (params.placa) result = result.replace(/\{\{placa\}\}/gi, params.placa);
  if (params.valor) result = result.replace(/\{\{valor\}\}/gi, params.valor);
  if (params.link) result = result.replace(/\{\{link\}\}/gi, params.link);
  if (params.oficina || params.empresa) {
    const ofc = params.oficina || params.empresa || '';
    result = result.replace(/\{\{oficina\}\}/gi, ofc).replace(/\{\{empresa\}\}/gi, ofc);
  }
  if (params.status) result = result.replace(/\{\{status\}\}/gi, params.status);
  if (params.item) result = result.replace(/\{\{item\}\}/gi, params.item);
  if (params.motivo) result = result.replace(/\{\{motivo\}\}/gi, params.motivo);
  return result;
}

export function interpolateWhatsAppTemplate(
  template: string,
  params: {
    customerName?: string;
    vehicleName?: string;
    plate?: string;
    totalAmount?: string;
    publicLink?: string;
    companyName?: string;
  }
): string {
  return interpolateTemplate(template, {
    cliente: params.customerName,
    veiculo: params.vehicleName,
    placa: params.plate,
    valor: params.totalAmount,
    link: params.publicLink,
    empresa: params.companyName,
    oficina: params.companyName,
  });
}

export const DefaultWhatsAppTemplates = {
  quoteCreated: 
    `Olá, *{{cliente}}*! Preparamos o orçamento do seu *{{veiculo}}* aqui na *{{oficina}}*.\n\n` +
    `Você pode conferir todos os detalhes dos serviços e aprovar facilmente pelo link seguro abaixo:\n\n` +
    `👉 {{link}}\n\n` +
    `Qualquer dúvida estamos à sua total disposição!`,

  quoteReminder: 
    `Olá, *{{cliente}}*! Tudo bem?\n\n` +
    `Passando para saber se você conseguiu conferir o orçamento do seu *{{veiculo}}* enviado pela *{{oficina}}*.\n\n` +
    `Você pode visualizar e aprovar por aqui:\n👉 {{link}}\n\n` +
    `Caso precise de algum ajuste ou tirar dúvidas, estamos à disposição!`,

  serviceStatusUpdate: 
    `Olá, *{{cliente}}*! O status do seu *{{veiculo}}* na *{{oficina}}* foi atualizado para:\n\n` +
    `🔧 *{{status}}*\n\n` +
    `Acompanhe as fotos e etapas em tempo real:\n👉 {{link}}`,

  serviceReady: 
    `🚗 Olá, *{{cliente}}*! Temos ótimas notícias!\n\n` +
    `O serviço do seu *{{veiculo}}* foi concluído com sucesso e o veículo está *PRONTO PARA RETIRADA* na *{{oficina}}*.\n\n` +
    `Confira o resumo final e garantia pelo link:\n👉 {{link}}\n\n` +
    `Aguardamos você!`,

  additionalApproval: 
    `Olá, *{{cliente}}*! Durante a execução do serviço no seu *{{veiculo}}*, identificamos a necessidade de uma aprovação adicional:\n\n` +
    `⚠️ *{{item}}* — {{valor}}\n\n` +
    `Por gentileza, confira as fotos e autorize pelo link:\n👉 {{link}}`,

  preventiveReminder: 
    `Olá, *{{cliente}}*! Tudo bem? Aqui é da *{{oficina}}*.\n\n` +
    `Passando pelo nosso pós-venda assistido para lembrar que está no período da *{{motivo}}* do seu *{{veiculo}}*.\n\n` +
    `Deseja agendar um horário para cuidarmos do seu carro?`
};

export const WhatsAppTemplates = {
  quoteCreated: (customerName: string, vehicleName: string, publicUrl: string, companyName: string) => 
    interpolateTemplate(DefaultWhatsAppTemplates.quoteCreated, {
      cliente: customerName,
      veiculo: vehicleName,
      link: publicUrl,
      oficina: companyName,
      empresa: companyName,
    }),

  quoteReminder: (customerName: string, vehicleName: string, publicUrl: string, companyName: string) =>
    interpolateTemplate(DefaultWhatsAppTemplates.quoteReminder, {
      cliente: customerName,
      veiculo: vehicleName,
      link: publicUrl,
      oficina: companyName,
      empresa: companyName,
    }),

  quoteFollowUp: (params: { customerName: string; companyName: string; plate?: string; quoteNumber?: string | number; publicLink: string }) =>
    `Olá, *${params.customerName}*! Tudo bem? Aqui é da *${params.companyName}*.\n\n` +
    `Gostaria de saber se você teve a oportunidade de avaliar a proposta #${params.quoteNumber || ''} do seu veículo ${params.plate ? `(Placa ${params.plate})` : ''}.\n\n` +
    `Caso queira negociar prazos ou formas de pagamento, estou à disposição!\n\n` +
    `👉 ${params.publicLink}`,

  serviceStatusUpdate: (customerName: string, vehicleName: string, statusLabel: string, publicUrl: string, companyName: string) =>
    interpolateTemplate(DefaultWhatsAppTemplates.serviceStatusUpdate, {
      cliente: customerName,
      veiculo: vehicleName,
      status: statusLabel,
      link: publicUrl,
      oficina: companyName,
      empresa: companyName,
    }),

  serviceReady: (customerName: string, vehicleName: string, publicUrl: string, companyName: string) =>
    interpolateTemplate(DefaultWhatsAppTemplates.serviceReady, {
      cliente: customerName,
      veiculo: vehicleName,
      link: publicUrl,
      oficina: companyName,
      empresa: companyName,
    }),

  additionalApproval: (customerName: string, vehicleName: string, itemTitle: string, amountFormatted: string, publicUrl: string, companyName: string) =>
    interpolateTemplate(DefaultWhatsAppTemplates.additionalApproval, {
      cliente: customerName,
      veiculo: vehicleName,
      item: itemTitle,
      valor: amountFormatted,
      link: publicUrl,
      oficina: companyName,
      empresa: companyName,
    }),

  preventiveReminder: (customerName: string, vehicleName: string, reason: string, companyName: string) =>
    interpolateTemplate(DefaultWhatsAppTemplates.preventiveReminder, {
      cliente: customerName,
      veiculo: vehicleName,
      motivo: reason,
      oficina: companyName,
      empresa: companyName,
    })
};

export const WHATSAPP_TEMPLATES = WhatsAppTemplates;
