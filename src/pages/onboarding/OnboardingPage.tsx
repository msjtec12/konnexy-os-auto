import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BusinessType } from '../../types';
import { BUSINESS_TYPE_PRESETS } from '../../lib/demoData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  Building, 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Palette, 
  QrCode, 
  PackageCheck,
  ShieldCheck 
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding, company } = useTenant();
  const { user } = useAuth();
  const { addCatalogItem } = useData();
  const { success } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Info
  const [name, setName] = useState(company.name || '');
  const [whatsapp, setWhatsapp] = useState(company.whatsapp || '');
  const [phone, setPhone] = useState(company.phone || '');
  const [city, setCity] = useState(company.city || 'São Paulo');
  const [state, setState] = useState(company.state || 'SP');

  // Step 2: Segment / Business Type
  const [businessType, setBusinessType] = useState<BusinessType>('mechanic');

  // Step 3: Identity & Pix
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'cpf_cnpj' | 'phone' | 'email' | 'random'>('cpf_cnpj');
  const [importSuggestedServices, setImportSuggestedServices] = useState(true);

  const businessTypesList: { id: BusinessType; title: string; desc: string; icon: string }[] = [
    { id: 'mechanic', title: 'Oficina Mecânica', desc: 'Motor, suspensão, freios, injeção e revisões gerais', icon: '🔧' },
    { id: 'auto_center', title: 'Centro Automotivo', desc: 'Pneus, alinhamento 3D, balanceamento e manutenção', icon: '🚗' },
    { id: 'detailing', title: 'Estética Automotiva', desc: 'Polimento técnico, vitrificação, higienização e PPF', icon: '✨' },
    { id: 'bodywork', title: 'Funilaria e Pintura', desc: 'Reparação de lataria, pintura em estufa e martelinho', icon: '🎨' },
    { id: 'electric', title: 'Autoelétrica & Ar Cond.', desc: 'Alternador, partida, carga de gás e injeção eletrônica', icon: '⚡' },
    { id: 'car_wash', title: 'Lava-Rápido Premium', desc: 'Lavagem técnica, aspiração, chassi e ceras', icon: '🧼' },
    { id: 'accessories', title: 'Acessórios & Som', desc: 'Multimídia, películas solares, alarmes e alto-falantes', icon: '🔊' },
    { id: 'motorcycle', title: 'Oficina de Motos', desc: 'Revisões, relação, freios e preparação de motocicletas', icon: '🏍️' },
    { id: 'other', title: 'Outro Segmento', desc: 'Serviços especializados no setor automotivo', icon: '⚙️' },
  ];

  const colorOptions = [
    { name: 'Azul Konnexy', value: '#2563EB', bg: 'bg-blue-600' },
    { name: 'Verde Esmeralda', value: '#16A34A', bg: 'bg-emerald-600' },
    { name: 'Índigo Profissional', value: '#4F46E5', bg: 'bg-indigo-600' },
    { name: 'Laranja Racing', value: '#EA580C', bg: 'bg-orange-600' },
    { name: 'Roxo Detailing', value: '#9333EA', bg: 'bg-purple-600' },
    { name: 'Preto Grafite', value: '#18181B', bg: 'bg-zinc-900' },
  ];

  const handleFinish = () => {
    // Import suggested services for the business type
    if (importSuggestedServices) {
      const preset = BUSINESS_TYPE_PRESETS[businessType];
      if (preset?.defaultServices) {
        preset.defaultServices.forEach(s => {
          addCatalogItem({
            name: s.name,
            type: s.type,
            default_price: s.price,
            is_favorite: true
          });
        });
      }
    }

    completeOnboarding({
      name: name || 'Minha Oficina',
      whatsapp: whatsapp || '(11) 99999-9999',
      phone,
      city,
      state,
      business_type: businessType,
      primary_color: primaryColor,
      pix_key: pixKey,
      pix_key_type: pixKeyType,
      owner_id: user?.id,
    });

    success('Oficina configurada com sucesso! Bem-vindo ao seu painel.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 py-12">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
            Konnexy OS Auto
          </span>
          <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">
            Configuração Inicial Rápida
          </span>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6 text-xs font-bold text-slate-600">
        <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
          1. Sua Oficina
        </span>
        <span className="text-slate-300">→</span>
        <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
          2. Tipo de Negócio
        </span>
        <span className="text-slate-300">→</span>
        <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
          3. Identidade & Catálogo
        </span>
      </div>

      <Card className="w-full max-w-xl shadow-elevated border-slate-200">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div>
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-xl font-extrabold">Crie sua Oficina</CardTitle>
              <CardDescription>
                Informe os dados principais do seu estabelecimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <Input
                label="Nome Fantasia do Estabelecimento *"
                required
                placeholder="Ex: Auto Mecânica Rocha ou Studio Car Detailing"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="WhatsApp da Oficina *"
                  required
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
                <Input
                  label="Telefone Fixo / Recado"
                  placeholder="(11) 3344-5566"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    label="Cidade"
                    placeholder="São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="UF"
                    maxLength={2}
                    placeholder="SP"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold mt-3"
                onClick={() => {
                  if (!name || !whatsapp) {
                    alert('Informe o nome da oficina e o WhatsApp.');
                    return;
                  }
                  setStep(2);
                }}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Continuar
              </Button>
            </CardContent>
          </div>
        )}

        {/* Step 2: Segment selection */}
        {step === 2 && (
          <div>
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-xl font-extrabold">Qual o seu tipo de negócio?</CardTitle>
              <CardDescription>
                Configuraremos o quadro Kanban e serviços adequados ao seu segmento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {businessTypesList.map(bt => {
                  const isSelected = businessType === bt.id;
                  return (
                    <div
                      key={bt.id}
                      onClick={() => setBusinessType(bt.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1.5">{bt.icon}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{bt.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{bt.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="lg" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Voltar
                </Button>
                <Button variant="primary" size="lg" className="flex-1 font-bold" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Continuar
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {/* Step 3: Identity & Initial Catalog */}
        {step === 3 && (
          <div>
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-xl font-extrabold">Identidade & Chave Pix</CardTitle>
              <CardDescription>
                Personalize as cores e configure sua chave Pix para receber pagamentos rápidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Cor Principal da Oficina</label>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setPrimaryColor(c.value)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold ${
                        primaryColor === c.value ? 'bg-primary-50 border-primary-500' : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.bg}`} />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Tipo Pix"
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value as any)}
                >
                  <option value="cpf_cnpj">CNPJ / CPF</option>
                  <option value="phone">Celular</option>
                  <option value="email">E-mail</option>
                  <option value="random">Aleatória</option>
                </Select>
                <div className="col-span-2">
                  <Input
                    label="Chave Pix (opcional)"
                    placeholder="12345678000190"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                  />
                </div>
              </div>

              {/* Import preset services */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="import-services"
                  checked={importSuggestedServices}
                  onChange={(e) => setImportSuggestedServices(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="import-services" className="text-xs text-emerald-950 font-medium cursor-pointer">
                  <strong>Importar catálogo de serviços sugeridos</strong> para {BUSINESS_TYPE_PRESETS[businessType].label} (você poderá editar ou apagar a qualquer momento).
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="lg" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Voltar
                </Button>
                <Button variant="success" size="lg" className="flex-1 font-bold shadow-elevated" onClick={handleFinish} rightIcon={<CheckCircle2 className="w-5 h-5" />}>
                  Concluir & Entrar na Oficina
                </Button>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
};
