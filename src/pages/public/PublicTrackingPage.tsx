import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTenant } from '../../context/TenantContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PixModal } from '../../components/common/PixModal';
import { Modal } from '../../components/ui/Modal';
import { 
  Car, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Camera, 
  Wrench, 
  Check, 
  AlertCircle,
  Search,
  FileCheck2,
  Sparkles,
  ChevronRight,
  Share2,
  Maximize2,
  QrCode,
  Calendar,
  Layers,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { formatCurrency, formatLicensePlate, formatDate, formatDateTime, getServiceOrderStatusBadge } from '../../lib/formatters';
import { generateWhatsAppLink } from '../../lib/whatsapp';

interface TrackingStepConfig {
  id: string;
  stepNumber: number;
  label: string;
  tag: string;
  desc: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TRACKING_STEPS: TrackingStepConfig[] = [
  { 
    id: 'received', 
    stepNumber: 1,
    label: 'Veículo Recebido', 
    tag: 'Checklist de Entrada',
    desc: 'Recepção na oficina e vistoria inicial do veículo.',
    detail: 'O veículo deu entrada na oficina e foi registrado no sistema com fotos e quilometragem.',
    icon: Car,
  },
  { 
    id: 'diagnosis', 
    stepNumber: 2,
    label: 'Diagnóstico Técnico', 
    tag: 'Avaliação da Equipe',
    desc: 'Varredura técnica de componentes e teste de falhas.',
    detail: 'Nossos técnicos especializados realizaram o diagnóstico completo dos sistemas e peças.',
    icon: Search,
  },
  { 
    id: 'approved', 
    stepNumber: 3,
    label: 'Orçamento Autorizado', 
    tag: 'Serviços Aprovados',
    desc: 'Serviços e peças autorizados pelo cliente.',
    detail: 'Proposta formal aprovada com garantia de peças e mão de obra homologada.',
    icon: FileCheck2,
  },
  { 
    id: 'in_progress', 
    stepNumber: 4,
    label: 'Serviço em Execução', 
    tag: 'Trabalho na Bancada',
    desc: 'Mão de obra qualificada atuando no veículo.',
    detail: 'Equipe trabalhando ativamente na troca de peças, manutenção preventiva e reparos.',
    icon: Wrench,
  },
  { 
    id: 'finishing', 
    stepNumber: 5,
    label: 'Finalização & Testes', 
    tag: 'Controle de Qualidade',
    desc: 'Testes de rodagem, vistoria final e limpeza.',
    detail: 'Inspeção rigorosa de segurança, alinhamento, scanner de saída e acabamento.',
    icon: Sparkles,
  },
  { 
    id: 'ready', 
    stepNumber: 6,
    label: 'Pronto para Retirada', 
    tag: 'Veículo Finalizado',
    desc: 'Tudo pronto! Você já pode retirar seu carro.',
    detail: 'Serviço concluído com sucesso. O veículo está liberado para entrega com garantia.',
    icon: CheckCircle2,
  },
];

export const PublicTrackingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { company } = useTenant();
  const { getServiceOrderByToken, vehicles, customers } = useData();

  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption: string } | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const os = getServiceOrderByToken(token || '');

  if (!os) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <Card className="max-w-md w-full text-center p-8 bg-slate-900 border-slate-800 text-white shadow-2xl">
          <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold">Acompanhamento não encontrado</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            O link de acompanhamento pode ter expirado ou o código da ordem de serviço não foi localizado.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              size="md"
              className="w-full text-slate-800"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const customer = customers.find(c => c.id === os.customer_id);
  const vehicle = vehicles.find(v => v.id === os.vehicle_id);
  const statusBadge = getServiceOrderStatusBadge(os.status);

  // Map status to step index (1-6)
  let currentStepIdx = statusBadge.stepIndex || 1;
  if (os.status === 'delivered') currentStepIdx = 6;

  const progressPercentage = Math.round((currentStepIdx / 6) * 100);

  const handleOpenWhatsApp = () => {
    const msg = `Olá, ${company.name}! Estou acompanhando a OS #${os.os_number} do ${vehicle?.model || 'meu veículo'} (Placa: ${vehicle?.license_plate || ''}) e gostaria de mais informações.`;
    window.open(generateWhatsAppLink(company.whatsapp || '(11) 99999-9999', msg), '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Status do ${vehicle?.model} - ${company.name}`,
        text: `Acompanhe em tempo real o serviço no meu ${vehicle?.model} na ${company.name}:`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  // Photos list
  const photos = os.photos && os.photos.length > 0 ? os.photos : [
    {
      id: 'p1',
      photo_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
      caption: 'Checklist e Vistoria de Entrada',
      category: 'entry' as const,
      is_client_visible: true,
      created_at: os.start_date,
    },
    {
      id: 'p2',
      photo_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
      caption: 'Execução Técnica & Manutenção',
      category: 'during' as const,
      is_client_visible: true,
      created_at: os.start_date,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28 selection:bg-primary-500 selection:text-white">
      {/* Top Ambient Glow / Background Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
        
        {/* 1. Header com Marca & Status Ao Vivo */}
        <header className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-700 bg-slate-800 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-extrabold shadow-lg shrink-0">
                <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
                  {company.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ao Vivo
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Portal do Cliente • Acompanhamento em Tempo Real
              </p>
            </div>
          </div>

          {/* OS Number Badge */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordem de Serviço</span>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-black text-sm sm:text-base shadow-inner">
              <span className="text-primary-400 font-bold">#</span>{os.os_number}
            </div>
          </div>
        </header>

        {/* 2. Hero Card: Veículo & Status Central com Barra de Progresso */}
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl p-5 sm:p-7 border border-slate-800/80 shadow-2xl overflow-hidden">
          {/* Subtle decorative background lines */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            
            {/* Top row: Status Badge & Tag */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
                SEU VEÍCULO EM ATENDIMENTO
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-extrabold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {statusBadge.label}
              </div>
            </div>

            {/* Vehicle Title & Mercosul Plate */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                  {vehicle?.make} {vehicle?.model}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                  <span>Cliente: <strong className="text-white font-bold">{customer?.name}</strong></span>
                  {os.responsible_name && (
                    <>
                      <span>•</span>
                      <span>Consultor: <strong className="text-slate-200">{os.responsible_name}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Placa Padrão Mercosul Autêntica */}
              <div className="shrink-0 self-start sm:self-auto">
                <div className="bg-white rounded-lg border border-slate-300 shadow-md overflow-hidden text-center w-36">
                  <div className="bg-[#003399] px-2 py-0.5 flex items-center justify-between text-[8px] font-black text-white tracking-widest uppercase">
                    <span>BRASIL</span>
                    <svg className="w-3.5 h-2.5 rounded-[1px]" viewBox="0 0 720 504" fill="none">
                      <rect width="720" height="504" fill="#009B3A"/>
                      <polygon points="360,40 680,252 360,464 40,252" fill="#FEDF00"/>
                      <circle cx="360" cy="252" r="126" fill="#002776"/>
                      <path d="M234,252 a126,126 0 0,0 252,0" stroke="#FFFFFF" strokeWidth="12" fill="none"/>
                    </svg>
                  </div>
                  <div className="py-1 px-2 font-mono font-black text-slate-950 text-base tracking-wider leading-none">
                    {formatLicensePlate(vehicle?.license_plate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Progress Indicator */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Progresso do Atendimento</span>
                <span className="text-primary-400 font-extrabold">
                  Etapa {currentStepIdx} de 6 • {progressPercentage}% Concluído
                </span>
              </div>
              
              {/* Progress Track */}
              <div className="w-full bg-slate-800 rounded-full h-3.5 p-0.5 border border-slate-700/80 overflow-hidden shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-emerald-400 transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Quick Delivery Estimation Badge */}
            {(os.estimated_completion_at || os.estimated_completion_date) && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400">Previsão Prometida de Entrega: </span>
                  <strong className="text-white font-bold">
                    {os.estimated_completion_at ? formatDateTime(os.estimated_completion_at) : formatDate(os.estimated_completion_date || '')}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Ready for Pickup Special Banner (When Status is Ready) */}
        {os.status === 'ready' && (
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-2xl border border-emerald-400/30 flex flex-col sm:flex-row items-center justify-between gap-5 animate-in zoom-in-95">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                  Liberado para Retirada
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Seu veículo está liberado para retirada
                </h3>
                <p className="text-xs text-emerald-100 mt-1">
                  Todos os serviços foram concluídos e validados. Você já pode retirar seu carro na oficina.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold shrink-0 shadow-md w-full sm:w-auto"
              onClick={handleOpenWhatsApp}
              leftIcon={<MessageSquare className="w-5 h-5 text-emerald-700" />}
            >
              Avisar que Estou a Caminho
            </Button>
          </div>
        )}

        {/* 4. Linha do Tempo das Etapas Totalmente Destacada */}
        <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-400" />
                Linha do Tempo das Etapas
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhe o andamento detalhado em cada fase do serviço
              </p>
            </div>
            <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-3 py-1 rounded-xl border border-primary-500/20">
              6 Fases
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {TRACKING_STEPS.map((st) => {
              const isCompleted = currentStepIdx > st.stepNumber;
              const isCurrent = currentStepIdx === st.stepNumber;
              const isPending = currentStepIdx < st.stepNumber;
              const IconComponent = st.icon;

              return (
                <div
                  key={st.id}
                  className={`relative rounded-2xl p-4 transition-all duration-200 border ${
                    isCurrent
                      ? 'bg-gradient-to-r from-primary-950/80 via-slate-900 to-primary-950/40 border-primary-500/80 shadow-elevated ring-2 ring-primary-500/20 scale-[1.01]'
                      : isCompleted
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : 'bg-slate-900/30 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Step Icon Badge */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-sm transition-all shadow-md ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                          : isCurrent
                          ? 'bg-primary-600 text-white ring-4 ring-primary-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 stroke-[3]" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-400">
                            ETAPA 0{st.stepNumber}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {st.tag}
                          </span>
                        </div>

                        {/* Status Label Pill */}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-500 text-white text-[11px] font-extrabold shadow-sm animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            Em Execução
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Concluído
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[11px] font-bold text-slate-500">
                            Aguardando
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-base font-extrabold mt-1 tracking-tight leading-tight ${
                          isCurrent
                            ? 'text-white'
                            : isCompleted
                            ? 'text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {st.label}
                      </h4>

                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isCurrent ? 'text-primary-200 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {isCurrent ? st.detail : st.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Galeria de Fotos & Evidências ao Vivo */}
        <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-400" />
                Fotos & Evidências do Serviço
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Transparência total com registros fotográficos do trabalho
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-xl">
              {photos.length} Fotos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {photos.map((photo, i) => (
              <div
                key={photo.id || i}
                onClick={() => setSelectedPhoto({ url: photo.photo_url, caption: photo.caption || 'Foto do Serviço' })}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer hover:border-primary-500/60 transition-all shadow-md"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Evidência'}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div className="min-w-0 pr-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary-600/80 text-[10px] font-extrabold uppercase tracking-wider block mb-0.5 w-fit">
                      {photo.category === 'entry' ? 'Entrada / Vistoria' : 'Execução Técnica'}
                    </span>
                    <p className="text-xs font-bold truncate">{photo.caption || 'Registro de Atendimento'}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:bg-primary-500 transition-colors">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Diagnóstico & Solução Recomendada (Transparência Técnica) */}
        {(os.customer_complaint || os.technical_diagnosis || os.recommended_solution) && (
          <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-400" />
              Laudo & Diagnóstico da Oficina
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {os.customer_complaint && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    1. Relato / Queixa
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {os.customer_complaint}
                  </p>
                </div>
              )}

              {os.technical_diagnosis && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 block">
                    2. Diagnóstico Técnico
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {os.technical_diagnosis}
                  </p>
                </div>
              )}

              {os.recommended_solution && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    3. Solução Aplicada
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {os.recommended_solution}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. Pagamento Pix Facilitado & Garantia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Pix Quick Card */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 p-5 rounded-3xl border border-emerald-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Pagamento Rápido via Pix</h4>
                  <p className="text-xs text-emerald-300/80">Pague sinal ou saldo sem filas</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Pague com segurança via QR Code Pix oficial da oficina com confirmação imediata.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 font-bold shadow-md"
              onClick={() => setShowPixModal(true)}
              leftIcon={<QrCode className="w-4 h-4" />}
            >
              Visualizar QR Code Pix
            </Button>
          </div>

          {/* Warranty & Assurance Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 p-5 rounded-3xl border border-indigo-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Garantia Assegurada</h4>
                  <p className="text-xs text-indigo-300/80">{os.warranty_days || 90} dias de cobertura</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                {os.warranty_notes || 'Garantia legal referente a peças e serviços executados com nota fiscal e laudo.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Peças com procedência e mão de obra qualificada</span>
            </div>
          </div>
        </div>

        {/* 8. Workshop Location & Contact Card */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
              <MapPin className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{company.name}</p>
              <p>{company.address ? `${company.address} • ${company.city}/${company.state}` : `${company.city || 'São Paulo'} - ${company.state || 'SP'}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1 sm:flex-none border-slate-700 text-slate-200 hover:bg-slate-800"
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-[11px] text-slate-500 pt-2 space-y-1">
          <p>Acompanhamento criptografado e seguro emitido por <strong>{company.name}</strong></p>
          <p className="text-slate-600">Tecnologia fornecida por Konnexy OS Auto</p>
        </footer>
      </div>

      {/* Fixed Sticky Action Bar for Mobile & Desktop */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 p-3 sm:p-4 z-40 shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button
            variant="whatsapp"
            size="lg"
            className="flex-1 font-extrabold text-base shadow-elevated"
            onClick={handleOpenWhatsApp}
            leftIcon={<MessageSquare className="w-5 h-5 fill-current" />}
          >
            Falar com a Oficina no WhatsApp
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="hidden sm:inline-flex bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold"
            onClick={() => setShowPixModal(true)}
            leftIcon={<QrCode className="w-5 h-5 text-emerald-400" />}
          >
            Pix
          </Button>
        </div>
      </div>

      {/* Lightbox Modal for Photos */}
      {selectedPhoto && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPhoto(null)}
          title={selectedPhoto.caption}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption}
              className="w-full max-h-[70vh] object-contain rounded-2xl bg-black"
            />
            <p className="text-center text-xs text-slate-500 font-medium">
              {selectedPhoto.caption}
            </p>
          </div>
        </Modal>
      )}

      {/* Pix Payment Modal */}
      <PixModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        amount={
          os.items && os.items.length > 0
            ? os.items.reduce((acc, it) => acc + (it.total_price || it.unit_price * it.quantity), 0)
            : 450
        }
        title={`Pix - OS #${os.os_number}`}
        referenceId={`OS-${os.os_number}`}
      />
    </div>
  );
};
