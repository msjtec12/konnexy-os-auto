import { 
  Company, 
  Customer, 
  Vehicle, 
  Quote, 
  ServiceOrder, 
  Payment, 
  Reminder, 
  ServiceCatalogItem,
  ServicePackage,
  Plan,
  Subscription,
  AuditLog,
  KanbanStageConfig,
  BusinessType
} from '../types';

export const BUSINESS_TYPE_PRESETS: Record<BusinessType, { label: string; stages: KanbanStageConfig[]; defaultServices: Array<{ name: string; type: 'service' | 'part'; price: number }> }> = {
  mechanic: {
    label: 'Oficina Mecânica',
    stages: [
      { id: 'received', title: 'Entrada / Check-in', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'diagnosis', title: 'Diagnóstico', color: 'border-blue-500 text-blue-700', badgeBg: 'bg-blue-50' },
      { id: 'awaiting_approval', title: 'Aguardando Aprovação', color: 'border-purple-500 text-purple-700', badgeBg: 'bg-purple-50' },
      { id: 'in_progress', title: 'Em Serviço', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'awaiting_parts', title: 'Aguardando Peça', color: 'border-orange-500 text-orange-700', badgeBg: 'bg-orange-50' },
      { id: 'finishing', title: 'Teste de Rodagem', color: 'border-indigo-500 text-indigo-700', badgeBg: 'bg-indigo-50' },
      { id: 'ready', title: 'Pronto p/ Retirada', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue / Concluído', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Troca de Óleo e Filtro (Mão de Obra)', type: 'service', price: 120 },
      { name: 'Alinhamento e Balanceamento 3D', type: 'service', price: 80 },
      { name: 'Revisão Preventiva Geral', type: 'service', price: 350 },
      { name: 'Substituição de Pastilhas de Freio', type: 'service', price: 140 },
      { name: 'Óleo Sintético 5W30 (Litro)', type: 'part', price: 48 },
      { name: 'Filtro de Óleo Automotivo', type: 'part', price: 45 }
    ]
  },
  auto_center: {
    label: 'Centro Automotivo Completo',
    stages: [
      { id: 'received', title: 'Recepção', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'diagnosis', title: 'Check-up / Diagnóstico', color: 'border-blue-500 text-blue-700', badgeBg: 'bg-blue-50' },
      { id: 'awaiting_approval', title: 'Orçamento Enviado', color: 'border-purple-500 text-purple-700', badgeBg: 'bg-purple-50' },
      { id: 'in_progress', title: 'Em Execução', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'awaiting_parts', title: 'Peça em Trânsito', color: 'border-orange-500 text-orange-700', badgeBg: 'bg-orange-50' },
      { id: 'ready', title: 'Pronto / Higienizado', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Geometria Completa + Balanceamento', type: 'service', price: 110 },
      { name: 'Limpeza de Bicos Injetores', type: 'service', price: 220 },
      { name: 'Troca de Discos e Pastilhas', type: 'service', price: 180 },
    ]
  },
  detailing: {
    label: 'Estética Automotiva / Detailing',
    stages: [
      { id: 'received', title: 'Recebido / Vistoria', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'diagnosis', title: 'Lavagem Técnica & Descontaminação', color: 'border-blue-500 text-blue-700', badgeBg: 'bg-blue-50' },
      { id: 'in_progress', title: 'Polimento Técnico', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'awaiting_parts', title: 'Vitrificação / Proteção Cerâmica', color: 'border-purple-500 text-purple-700', badgeBg: 'bg-purple-50' },
      { id: 'finishing', title: 'Cura e Acabamento', color: 'border-indigo-500 text-indigo-700', badgeBg: 'bg-indigo-50' },
      { id: 'ready', title: 'Pronto para Retirada', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Lavagem Técnica Detalhada com Cera', type: 'service', price: 180 },
      { name: 'Polimento Comercial / Espelhamento', type: 'service', price: 450 },
      { name: 'Vitrificação de Pintura 9H (Garantia 3 anos)', type: 'service', price: 1200 },
      { name: 'Higienização Interna com Oxi-Sanitização', type: 'service', price: 350 },
    ]
  },
  bodywork: {
    label: 'Funilaria e Pintura',
    stages: [
      { id: 'received', title: 'Entrada / Perícia', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'diagnosis', title: 'Desmontagem', color: 'border-blue-500 text-blue-700', badgeBg: 'bg-blue-50' },
      { id: 'in_progress', title: 'Funilaria / Repuxo', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'awaiting_parts', title: 'Preparação & Primer', color: 'border-orange-500 text-orange-700', badgeBg: 'bg-orange-50' },
      { id: 'finishing', title: 'Cabine de Pintura & Montagem', color: 'border-indigo-500 text-indigo-700', badgeBg: 'bg-indigo-50' },
      { id: 'ready', title: 'Polimento Final / Pronto', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Pintura de Para-choque', type: 'service', price: 480 },
      { name: 'Reparo de Para-lama (Funilaria + Pintura)', type: 'service', price: 650 },
      { name: 'Martelinho de Ouro (Por peça)', type: 'service', price: 180 },
    ]
  },
  electric: {
    label: 'Autoelétrica & Ar Condicionado',
    stages: [
      { id: 'received', title: 'Entrada', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'diagnosis', title: 'Scanner & Teste Elétrico', color: 'border-blue-500 text-blue-700', badgeBg: 'bg-blue-50' },
      { id: 'awaiting_approval', title: 'Aguardando Aprovação', color: 'border-purple-500 text-purple-700', badgeBg: 'bg-purple-50' },
      { id: 'in_progress', title: 'Reparo em Andamento', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'ready', title: 'Testado & Pronto', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Carga de Gás Ecológico R134a + Óleo', type: 'service', price: 200 },
      { name: 'Diagnóstico de Injeção Eletrônica via Scanner', type: 'service', price: 150 },
      { name: 'Revisão de Alternador e Motor de Partida', type: 'service', price: 280 },
    ]
  },
  car_wash: {
    label: 'Lava-Rápido Premium',
    stages: [
      { id: 'received', title: 'Fila de Lavagem', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'in_progress', title: 'Lavagem & Secagem', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'finishing', title: 'Aspiração & Cera', color: 'border-indigo-500 text-indigo-700', badgeBg: 'bg-indigo-50' },
      { id: 'ready', title: 'Pronto para Entrega', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Lavagem Completa com Cera Líquida', type: 'service', price: 70 },
      { name: 'Lavagem de Chassi e Motor', type: 'service', price: 120 },
    ]
  },
  accessories: {
    label: 'Acessórios & Som Automotivo',
    stages: [
      { id: 'received', title: 'Veículo Recebido', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'in_progress', title: 'Instalação / Cabeamento', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'finishing', title: 'Regulagem & Acabamento', color: 'border-indigo-500 text-indigo-700', badgeBg: 'bg-indigo-50' },
      { id: 'ready', title: 'Pronto / Testado', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Instalação de Central Multimídia + Câmera de Ré', type: 'service', price: 250 },
      { name: 'Aplicação de Película Solar Window Film', type: 'service', price: 280 },
    ]
  },
  motorcycle: {
    label: 'Oficina de Motos',
    stages: [
      { id: 'received', title: 'Entrada Moto', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'diagnosis', title: 'Diagnóstico', color: 'border-blue-500 text-blue-700', badgeBg: 'bg-blue-50' },
      { id: 'in_progress', title: 'Em Manutenção', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'ready', title: 'Pronta', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Revisão Geral de Moto (Freios, Relação, Óleo)', type: 'service', price: 180 },
      { name: 'Troca de Kit Transmissão Relação', type: 'service', price: 90 },
    ]
  },
  oil_change: {
    label: 'Troca de Óleo Rápida',
    stages: [
      { id: 'received', title: 'Entrada / Box', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'in_progress', title: 'Drenagem e Troca', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'ready', title: 'Nível Verificado / Pronto', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Liberado', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Troca de Óleo e Filtros (Mão de Obra)', type: 'service', price: 60 },
      { name: 'Óleo 5W30 Sintético 4L', type: 'part', price: 190 },
      { name: 'Filtro de Óleo e Ar', type: 'part', price: 80 }
    ]
  },
  general: {
    label: 'Centro Automotivo Geral',
    stages: [
      { id: 'received', title: 'Recepção', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'diagnosis', title: 'Diagnóstico', color: 'border-blue-500 text-blue-700', badgeBg: 'bg-blue-50' },
      { id: 'in_progress', title: 'Serviço', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'ready', title: 'Pronto', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Revisão e Manutenção Geral', type: 'service', price: 250 }
    ]
  },
  other: {
    label: 'Outro Segmento Automotivo',
    stages: [
      { id: 'received', title: 'Entrada', color: 'border-slate-400 text-slate-700', badgeBg: 'bg-slate-100' },
      { id: 'in_progress', title: 'Em Serviço', color: 'border-amber-500 text-amber-700', badgeBg: 'bg-amber-50' },
      { id: 'ready', title: 'Pronto', color: 'border-emerald-500 text-emerald-700', badgeBg: 'bg-emerald-50' },
      { id: 'delivered', title: 'Entregue', color: 'border-teal-500 text-teal-700', badgeBg: 'bg-teal-50' },
    ],
    defaultServices: [
      { name: 'Serviço Geral Especializado', type: 'service', price: 150 }
    ]
  }
};

export const DEMO_COMPANY: Company = {
  id: 'c1111111-1111-1111-1111-111111111111',
  name: 'AutoPrime Centro Automotivo',
  trade_name: 'AutoPrime Manutenção e Estética Automotiva Ltda',
  document: '12.345.678/0001-90',
  phone: '(11) 3456-7890',
  whatsapp: '(11) 98765-4321',
  email: 'contato@autoprimeauto.com.br',
  address: 'Av. dos Bandeirantes, 1420 - Moema',
  city: 'São Paulo',
  state: 'SP',
  logo_url: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=200&auto=format&fit=crop&q=80',
  primary_color: '#2563EB',
  pix_key: '12345678000190',
  pix_key_type: 'cpf_cnpj',
  business_hours: 'Seg a Sex: 08h às 18h | Sáb: 08h às 13h',
  instagram: '@autoprime.centroauto',
  business_type: 'mechanic',
  onboarding_completed: true,
  owner_id: 'user-admin-1',
  plan_id: 'pro',
  subscription_status: 'active',
  created_at: '2026-01-10T08:00:00.000Z',
  updated_at: '2026-01-10T08:00:00.000Z'
};

export const DEMO_PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    slug: 'basic',
    price_monthly: 97.00,
    max_users: 2,
    max_orders_monthly: 40,
    features: ['Orçamentos no WhatsApp', 'Até 40 Ordens de Serviço/mês', '2 Usuários', 'Pós-venda assistido'],
    active: true
  },
  {
    id: 'pro',
    name: 'Profissional',
    slug: 'pro',
    price_monthly: 197.00,
    max_users: 6,
    max_orders_monthly: 200,
    features: ['Orçamentos ilimitados', 'Quadro Kanban da Oficina', 'Check-in com fotos', 'Aprovações adicionais', 'Até 6 Usuários', 'Relatórios comerciais'],
    active: true
  },
  {
    id: 'premium',
    name: 'Premium / Frotas',
    slug: 'premium',
    price_monthly: 349.00,
    max_users: 20,
    max_orders_monthly: 1000,
    features: ['Usuários ilimitados', 'OS Ilimitadas', 'Gestão de Frotistas', 'Suporte Prioritário VIP', 'White-label completo'],
    active: true
  }
];

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    company_id: DEMO_COMPANY.id,
    name: 'Carlos Oliveira',
    phone: '(11) 3344-5566',
    whatsapp: '(11) 98765-4321',
    document: '234.567.890-12',
    email: 'carlos.oliveira@email.com',
    notes: 'Cliente muito cuidadoso com o veículo. Prefere atendimento pela manhã.',
    created_at: '2026-02-15T10:00:00.000Z',
    updated_at: '2026-02-15T10:00:00.000Z'
  },
  {
    id: 'cust-2',
    company_id: DEMO_COMPANY.id,
    name: 'Mariana Santos',
    phone: '(11) 97777-8888',
    whatsapp: '(11) 97777-8888',
    document: '345.678.901-23',
    email: 'mariana.santos@empresa.com.br',
    notes: 'Utiliza o carro para viagens frequentes a trabalho.',
    created_at: '2026-03-01T14:30:00.000Z',
    updated_at: '2026-03-01T14:30:00.000Z'
  },
  {
    id: 'cust-3',
    company_id: DEMO_COMPANY.id,
    name: 'Roberto Almeida',
    phone: '(11) 96666-5555',
    whatsapp: '(11) 96666-5555',
    document: '456.789.012-34',
    email: 'roberto.almeida@gmail.com',
    notes: 'Frotista com 2 carros na oficina.',
    created_at: '2026-03-10T09:15:00.000Z',
    updated_at: '2026-03-10T09:15:00.000Z'
  },
  {
    id: 'cust-4',
    company_id: DEMO_COMPANY.id,
    name: 'Juliana Ferreira',
    phone: '(11) 95555-4444',
    whatsapp: '(11) 95555-4444',
    document: '567.890.123-45',
    email: 'juliana.f@outlook.com',
    notes: 'Solicitou revisão pré-viagem de férias.',
    created_at: '2026-03-20T11:00:00.000Z',
    updated_at: '2026-03-20T11:00:00.000Z'
  }
];

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-1',
    make: 'Chevrolet',
    model: 'Onix LT 1.0 Turbo',
    version: 'LT Flex 6MT',
    year: 2022,
    license_plate: 'ABC1D23',
    mileage: 67420,
    fuel_type: 'Flex',
    color: 'Prata Metálico',
    notes: 'Manutenções periódicas em dia.',
    checklist: {
      fuel_level: 'half',
      scratches: true,
      scratches_notes: 'Pequeno risco superficial no para-choque traseiro direito',
      dents: false,
      wheels_condition: 'Rodas de liga leve sem ralados graves',
      tires_condition: 'Pneus dianteiros meia-vida, traseiros bons',
      mirrors_ok: true,
      glasses_ok: true,
      spare_tire: true,
      jack_wrench: true,
      belongings: 'Óculos de sol no porta-luvas, cabo de celular',
      observations: 'Cliente solicitou conferir ruído leve ao frear.'
    },
    created_at: '2026-02-15T10:05:00.000Z',
    updated_at: '2026-02-15T10:05:00.000Z'
  },
  {
    id: 'veh-2',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-2',
    make: 'Jeep',
    model: 'Renegade Longitude 1.3 Turbo',
    version: 'T270 4x2 Aut.',
    year: 2021,
    license_plate: 'BRA2E19',
    mileage: 48900,
    fuel_type: 'Flex',
    color: 'Cinza Granite',
    notes: 'Revisão geral e higienização de ar condicionado.',
    checklist: {
      fuel_level: 'three_quarters',
      scratches: false,
      dents: false,
      wheels_condition: 'Em perfeito estado',
      tires_condition: 'Pneus seminovos',
      mirrors_ok: true,
      glasses_ok: true,
      spare_tire: true,
      jack_wrench: true,
      belongings: 'Nenhum item deixado',
      observations: 'Revisão dos 50.000 km.'
    },
    created_at: '2026-03-01T14:35:00.000Z',
    updated_at: '2026-03-01T14:35:00.000Z'
  },
  {
    id: 'veh-3',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-3',
    make: 'Hyundai',
    model: 'HB20 Sense 1.0',
    version: 'Sense Flex',
    year: 2020,
    license_plate: 'KLS3456',
    mileage: 82150,
    fuel_type: 'Flex',
    color: 'Branco Polar',
    notes: 'Troca de embreagem e velas.',
    checklist: {
      fuel_level: 'quarter',
      scratches: true,
      scratches_notes: 'Ralado na quina da porta do motorista',
      dents: true,
      dents_notes: 'Pequeno amassado no para-lama esquerdo',
      wheels_condition: 'Calotas originais',
      tires_condition: 'Pneus precisando de alinhamento',
      mirrors_ok: true,
      glasses_ok: true,
      spare_tire: true,
      jack_wrench: true,
      belongings: 'Cadeirinha infantil no banco traseiro',
      observations: 'Pedal da embreagem pesado.'
    },
    created_at: '2026-03-10T09:20:00.000Z',
    updated_at: '2026-03-10T09:20:00.000Z'
  },
  {
    id: 'veh-4',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-4',
    make: 'Toyota',
    model: 'Corolla XEi 2.0',
    version: 'Dynamic Force Aut.',
    year: 2023,
    license_plate: 'TOY9G88',
    mileage: 26300,
    fuel_type: 'Flex',
    color: 'Preto Eclipse',
    notes: 'Vitrificação de pintura e revisão preventiva.',
    checklist: {
      fuel_level: 'full',
      scratches: false,
      dents: false,
      wheels_condition: 'Perfeitas',
      tires_condition: 'Originais excelentes',
      mirrors_ok: true,
      glasses_ok: true,
      spare_tire: true,
      jack_wrench: true,
      belongings: 'Sem pertences',
      observations: 'Serviço de detalhamento e revisão de 30 mil antecipada.'
    },
    created_at: '2026-03-20T11:05:00.000Z',
    updated_at: '2026-03-20T11:05:00.000Z'
  }
];

export const DEMO_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg-1',
    company_id: DEMO_COMPANY.id,
    name: 'Revisão Básica Preventiva',
    description: 'Troca de óleo sintético + Filtro de óleo + Filtro de ar + Inspeção de 30 itens',
    total_suggested_price: 360.00,
    items: [
      { name: 'Troca de Óleo e Filtro (Mão de Obra)', type: 'service', default_price: 120, quantity: 1 },
      { name: 'Óleo Sintético 5W30 (4L)', type: 'part', default_price: 190, quantity: 1 },
      { name: 'Filtro de Óleo Automotivo', type: 'part', default_price: 45, quantity: 1 },
      { name: 'Inspeção Preventiva de Segurança', type: 'service', default_price: 0, quantity: 1 }
    ],
    created_at: '2026-01-01'
  },
  {
    id: 'pkg-2',
    company_id: DEMO_COMPANY.id,
    name: 'Alinhamento 3D + Balanceamento 4 Rodas',
    description: 'Geometria a laser dianteira/traseira e calibração de pesos',
    total_suggested_price: 130.00,
    items: [
      { name: 'Alinhamento 3D de Direção', type: 'service', default_price: 80, quantity: 1 },
      { name: 'Balanceamento de 4 Rodas', type: 'service', default_price: 50, quantity: 1 }
    ],
    created_at: '2026-01-01'
  }
];

export const DEMO_QUOTES: Quote[] = [
  {
    id: 'quote-1023',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-1',
    vehicle_id: 'veh-1',
    quote_number: 1023,
    current_version: 1,
    status: 'sent',
    public_token: 'token-quote-1023',
    subtotal: 435.00,
    discount: 0.00,
    total: 435.00,
    down_payment: 0.00,
    balance: 435.00,
    estimated_days: 1,
    notes: 'Valores sujeitos à aprovação do cliente. Peças com garantia de fábrica.',
    internal_notes: 'Filtro e óleo disponíveis no estoque local.',
    is_immutable: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (> 48h) for follow-up queue
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    versions: [
      {
        id: 'qv-1023-1',
        quote_id: 'quote-1023',
        company_id: DEMO_COMPANY.id,
        version_number: 1,
        subtotal: 435.00,
        discount: 0.00,
        total: 435.00,
        down_payment: 0.00,
        balance: 435.00,
        estimated_days: 1,
        status: 'sent',
        items_snapshot: [
          { id: 'qi-1', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', type: 'service', description: 'Troca de Óleo e Filtro (Mão de obra)', quantity: 1, unit_price: 120.00, total_price: 120.00 },
          { id: 'qi-2', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', type: 'part', description: 'Óleo Sintético 5W30 Dexos 1 (4 Litros)', quantity: 1, unit_price: 190.00, total_price: 190.00 },
          { id: 'qi-3', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', type: 'part', description: 'Filtro de Óleo Original ACDelco', quantity: 1, unit_price: 45.00, total_price: 45.00 },
          { id: 'qi-4', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', type: 'service', description: 'Alinhamento e Balanceamento 3D', quantity: 1, unit_price: 80.00, total_price: 80.00 }
        ],
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    items: [
      { id: 'qi-1', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', type: 'service', description: 'Troca de Óleo e Filtro (Mão de obra)', quantity: 1, unit_price: 120.00, total_price: 120.00 },
      { id: 'qi-2', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', type: 'part', description: 'Óleo Sintético 5W30 Dexos 1 (4 Litros)', quantity: 1, unit_price: 190.00, total_price: 190.00 },
      { id: 'qi-3', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', type: 'part', description: 'Filtro de Óleo Original ACDelco', quantity: 1, unit_price: 45.00, total_price: 45.00 },
      { id: 'qi-4', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', type: 'service', description: 'Alinhamento e Balanceamento 3D', quantity: 1, unit_price: 80.00, total_price: 80.00 }
    ],
    events: [
      { id: 'qe-1', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', event_type: 'created', description: 'Orçamento versão v1 gerado', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'qe-2', company_id: DEMO_COMPANY.id, quote_id: 'quote-1023', event_type: 'sent', description: 'Proposta v1 enviada por link seguro no WhatsApp', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'quote-1024',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-2',
    vehicle_id: 'veh-2',
    quote_number: 1024,
    current_version: 1,
    status: 'approved',
    public_token: 'token-quote-1024',
    subtotal: 1250.00,
    discount: 50.00,
    total: 1200.00,
    down_payment: 300.00,
    balance: 900.00,
    estimated_days: 2,
    approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_immutable: true, // Immutable because approved
    approval_snapshot: {
      approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      approved_name: 'Mariana Santos',
      approved_total: 1200.00,
      version_number: 1,
      terms_agreed: true,
      items_snapshot: []
    },
    notes: 'Revisão completa de 50.000km com higienização de ar e oxi-sanitização.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    versions: [
      {
        id: 'qv-1024-1',
        quote_id: 'quote-1024',
        company_id: DEMO_COMPANY.id,
        version_number: 1,
        subtotal: 1250.00,
        discount: 50.00,
        total: 1200.00,
        down_payment: 300.00,
        balance: 900.00,
        estimated_days: 2,
        status: 'approved',
        approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        approved_name: 'Mariana Santos',
        items_snapshot: [
          { id: 'qi-5', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', type: 'service', description: 'Revisão Preventiva Geral e Diagnóstico Computadorizado', quantity: 1, unit_price: 350.00, total_price: 350.00 },
          { id: 'qi-6', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', type: 'part', description: 'Kit Filtros (Óleo, Ar, Combustível, Cabine)', quantity: 1, unit_price: 290.00, total_price: 290.00 },
          { id: 'qi-7', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', type: 'part', description: 'Jogo de Pastilhas de Freio Dianteiras Cerâmica', quantity: 1, unit_price: 380.00, total_price: 380.00 },
          { id: 'qi-8', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', type: 'service', description: 'Higienização e Oxi-Sanitização do Sistema de Ar Condicionado', quantity: 1, unit_price: 180.00, total_price: 180.00 }
        ],
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    items: [
      { id: 'qi-5', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', type: 'service', description: 'Revisão Preventiva Geral e Diagnóstico Computadorizado', quantity: 1, unit_price: 350.00, total_price: 350.00 },
      { id: 'qi-6', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', type: 'part', description: 'Kit Filtros (Óleo, Ar, Combustível, Cabine)', quantity: 1, unit_price: 290.00, total_price: 290.00 },
      { id: 'qi-7', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', type: 'part', description: 'Jogo de Pastilhas de Freio Dianteiras Cerâmica', quantity: 1, unit_price: 380.00, total_price: 380.00 },
      { id: 'qi-8', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', type: 'service', description: 'Higienização e Oxi-Sanitização do Sistema de Ar Condicionado', quantity: 1, unit_price: 180.00, total_price: 180.00 }
    ],
    events: [
      { id: 'qe-3', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', event_type: 'created', description: 'Orçamento v1 criado', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'qe-4', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', event_type: 'sent', description: 'Enviado por WhatsApp', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString() },
      { id: 'qe-5', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', event_type: 'viewed', description: 'Cliente abriu a proposta', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString() },
      { id: 'qe-6', company_id: DEMO_COMPANY.id, quote_id: 'quote-1024', event_type: 'approved', description: 'Aprovado por Mariana Santos com snapshot auditado', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 22 * 60 * 1000).toISOString() }
    ]
  }
];

export const DEMO_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'os-00230',
    company_id: DEMO_COMPANY.id,
    quote_id: 'quote-1024',
    customer_id: 'cust-2',
    vehicle_id: 'veh-2',
    os_number: 230,
    status: 'in_progress',
    public_token: 'token-os-00230',
    responsible_name: 'Marcos Mecânico',
    customer_complaint: 'Cliente relatou ruído leve ao acionar o ar condicionado e vibração ao frear em descidas.',
    technical_diagnosis: 'Pastilhas de freio vitrificadas e filtro de cabine saturado com ácaros.',
    recommended_solution: 'Substituição das pastilhas por modelo de cerâmica e oxi-sanitização do sistema de ar.',
    diagnosed_by: 'Marcos Mecânico',
    diagnosed_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    start_date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    estimated_completion_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    promised_completion_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    initial_mileage: 48900,
    warranty_days: 90,
    warranty_notes: 'Garantia de 90 dias ou 5.000 km para peças e mão de obra de revisão.',
    notes: 'Revisão dos 50k km em andamento.',
    internal_notes: 'Troca de pastilhas dianteiras finalizada. Iniciando higienização do ar condicionado.',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    additional_approvals: [
      {
        id: 'appr-1',
        company_id: DEMO_COMPANY.id,
        service_order_id: 'os-00230',
        title: 'Troca das Buchas da Barra Estabilizadora',
        description: 'Identificada folga excessiva nas buchas dianteiras durante o alinhamento.',
        amount: 240.00,
        parts_amount: 140.00,
        labor_amount: 100.00,
        status: 'pending',
        public_token: 'extra-buchas-230',
        requested_by: 'Marcos Mecânico',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'os-00229',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-4',
    vehicle_id: 'veh-4',
    os_number: 229,
    status: 'ready',
    public_token: 'token-os-00229',
    responsible_name: 'Renato Detailer',
    customer_complaint: 'Cliente deseja proteção de pintura contra micro-riscos e acabamento espelhado.',
    technical_diagnosis: 'Pintura com micro-riscos superficiais (swirls) e pequenas marcas de água ácida.',
    recommended_solution: 'Descontaminação com clay bar, polimento em 2 etapas e vitrificação cerâmica 9H.',
    diagnosed_by: 'Renato Detailer',
    diagnosed_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    start_date: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    estimated_completion_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    promised_completion_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    initial_mileage: 26300,
    final_mileage: 26302,
    warranty_days: 180,
    warranty_notes: 'Garantia de 6 meses no coating cerâmico da pintura.',
    notes: 'Polimento técnico e vitrificação cerâmica 9H concluídos.',
    created_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'os-00228',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-3',
    vehicle_id: 'veh-3',
    os_number: 228,
    status: 'awaiting_parts',
    public_token: 'token-os-00228',
    responsible_name: 'Carlos Chefe de Oficina',
    customer_complaint: 'Pedal de embreagem duro e rangendo ao trocar marchas.',
    technical_diagnosis: 'Platô desgastado e atuador hidráulico com vazamento de fluido.',
    recommended_solution: 'Substituição completa do kit de embreagem e atuador hidráulico original LUK.',
    diagnosed_by: 'Carlos Chefe de Oficina',
    diagnosed_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    start_date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    estimated_completion_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    promised_completion_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Promised soon -> at risk alert!
    initial_mileage: 82150,
    warranty_days: 90,
    warranty_notes: 'Garantia legal de 90 dias.',
    notes: 'Aguardando chegada do atuador hidráulico do distribuidor.',
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
];

export const DEMO_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    company_id: DEMO_COMPANY.id,
    service_order_id: 'os-00230',
    quote_id: 'quote-1024',
    amount: 300.00,
    payment_type: 'pix',
    is_down_payment: true,
    payment_date: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    notes: 'Sinal recebido via Pix no início do serviço.',
    created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pay-2',
    company_id: DEMO_COMPANY.id,
    service_order_id: 'os-00229',
    amount: 850.00,
    payment_type: 'credit',
    is_down_payment: false,
    payment_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notes: 'Pagamento total em 3x no cartão de crédito.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

export const DEMO_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-1',
    vehicle_id: 'veh-1',
    type: 'oil_change',
    description: 'Próxima troca de óleo aos 77.000 km ou em 6 meses',
    due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_mileage: 77420,
    status: 'pending',
    notes: 'Utilizar sempre óleo sintético 5W30 Dexos 1.',
    created_at: '2026-02-15T10:00:00.000Z'
  },
  {
    id: 'rem-2',
    company_id: DEMO_COMPANY.id,
    customer_id: 'cust-2',
    vehicle_id: 'veh-2',
    type: 'revision',
    description: 'Revisão dos 60.000 km (Velas de ignição e correia)',
    due_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_mileage: 60000,
    status: 'pending',
    created_at: '2026-03-01T14:30:00.000Z'
  }
];

export const DEMO_CATALOG: ServiceCatalogItem[] = [
  { id: 'cat-1', company_id: DEMO_COMPANY.id, type: 'service', name: 'Troca de Óleo e Filtro (Mão de Obra)', default_price: 120.00, is_favorite: true, use_count: 42, created_at: '2026-01-01' },
  { id: 'cat-2', company_id: DEMO_COMPANY.id, type: 'service', name: 'Alinhamento e Balanceamento 3D', default_price: 80.00, is_favorite: true, use_count: 38, created_at: '2026-01-01' },
  { id: 'cat-3', company_id: DEMO_COMPANY.id, type: 'service', name: 'Higienização do Ar Condicionado + Filtro', default_price: 180.00, is_favorite: true, use_count: 24, created_at: '2026-01-01' },
  { id: 'cat-4', company_id: DEMO_COMPANY.id, type: 'service', name: 'Troca de Pastilhas de Freio (Dianteiras)', default_price: 140.00, is_favorite: true, use_count: 31, created_at: '2026-01-01' },
  { id: 'cat-5', company_id: DEMO_COMPANY.id, type: 'service', name: 'Troca de Kit de Embreagem (Mão de Obra)', default_price: 550.00, is_favorite: false, use_count: 12, created_at: '2026-01-01' },
  { id: 'cat-6', company_id: DEMO_COMPANY.id, type: 'service', name: 'Limpeza e Equalização de Bicos Injetores', default_price: 220.00, is_favorite: false, use_count: 15, created_at: '2026-01-01' },
  { id: 'cat-7', company_id: DEMO_COMPANY.id, type: 'service', name: 'Polimento Técnico e Cristalização', default_price: 450.00, is_favorite: false, use_count: 9, created_at: '2026-01-01' },
  { id: 'cat-8', company_id: DEMO_COMPANY.id, type: 'part', name: 'Óleo 5W30 Sintético (Litro)', default_price: 48.00, is_favorite: true, use_count: 85, created_at: '2026-01-01' },
  { id: 'cat-9', company_id: DEMO_COMPANY.id, type: 'part', name: 'Filtro de Óleo Automotivo', default_price: 45.00, is_favorite: true, use_count: 42, created_at: '2026-01-01' },
  { id: 'cat-10', company_id: DEMO_COMPANY.id, type: 'part', name: 'Filtro de Ar do Motor', default_price: 55.00, is_favorite: true, use_count: 30, created_at: '2026-01-01' },
  { id: 'cat-11', company_id: DEMO_COMPANY.id, type: 'part', name: 'Jogo de Pastilhas Cerâmica', default_price: 280.00, is_favorite: false, use_count: 19, created_at: '2026-01-01' }
];

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', company_id: DEMO_COMPANY.id, user_name: 'Carlos Gerente', action: 'quote.created', entity_type: 'quote', entity_id: 'quote-1023', metadata: { quote_number: 1023 }, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'log-2', company_id: DEMO_COMPANY.id, user_name: 'Mariana Santos (Cliente)', action: 'quote.approved', entity_type: 'quote', entity_id: 'quote-1024', metadata: { version: 1, total: 1200 }, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'log-3', company_id: DEMO_COMPANY.id, user_name: 'Carlos Gerente', action: 'service_order.created', entity_type: 'service_order', entity_id: 'os-00230', metadata: { os_number: 230 }, created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
  { id: 'log-4', company_id: DEMO_COMPANY.id, user_name: 'Carlos Gerente', action: 'payment.created', entity_type: 'payment', entity_id: 'pay-1', metadata: { amount: 300, type: 'pix' }, created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString() }
];

export const DEMO_PLATFORM_COMPANIES: Company[] = [
  {
    ...DEMO_COMPANY,
    plan: 'pro',
    is_active: true,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Elite Car Estética Automotiva',
    trade_name: 'Elite Car Detailing Eireli',
    whatsapp: '(19) 99888-7766',
    city: 'Campinas',
    state: 'SP',
    primary_color: '#9333EA',
    business_type: 'detailing',
    plan_id: 'turbo',
    plan: 'turbo',
    is_active: true,
    subscription_status: 'active',
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Mecânica e Autoelétrica Silva',
    trade_name: 'Silva & Silva Serviços Automotivos',
    whatsapp: '(31) 98777-6655',
    city: 'Belo Horizonte',
    state: 'MG',
    primary_color: '#EA580C',
    business_type: 'mechanic',
    plan_id: 'trial',
    plan: 'trial',
    is_active: true,
    subscription_status: 'trial',
    created_at: '2026-03-01T08:00:00.000Z',
    updated_at: '2026-03-01T08:00:00.000Z'
  }
];
