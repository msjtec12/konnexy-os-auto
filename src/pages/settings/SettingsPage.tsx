import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  Building, 
  Settings, 
  DollarSign, 
  Palette, 
  RefreshCw, 
  Upload, 
  Save, 
  Sparkles,
  QrCode,
  MessageCircle,
  Zap,
  Shield,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { BusinessType, UserRole } from '../../types';
import { applyPrimaryTheme } from '../../lib/theme';

export const SettingsPage: React.FC = () => {
  const { company, updateCompany, resetToDemoCompany, changeBusinessType } = useTenant();
  const { resetAllDataToDemo } = useData();
  const { user, switchRole } = useAuth();
  const { success, info } = useToast();

  const [name, setName] = useState(company.name);
  const [tradeName, setTradeName] = useState(company.trade_name || '');
  const [businessType, setBusinessType] = useState<BusinessType>(company.business_type || 'mechanic');
  const [doc, setDoc] = useState(company.document || '');
  const [phone, setPhone] = useState(company.phone || '');
  const [whatsapp, setWhatsapp] = useState(company.whatsapp);
  const [email, setEmail] = useState(company.email || '');
  const [address, setAddress] = useState(company.address || '');
  const [city, setCity] = useState(company.city || '');
  const [state, setState] = useState(company.state || 'SP');
  const [logoUrl, setLogoUrl] = useState(company.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(company.primary_color || '#2563EB');
  const [pixKey, setPixKey] = useState(company.pix_key || '');
  const [pixKeyType, setPixKeyType] = useState<any>(company.pix_key_type || 'cpf_cnpj');
  const [businessHours, setBusinessHours] = useState(company.business_hours || '');
  const [instagram, setInstagram] = useState(company.instagram || '');

  // Custom WhatsApp Templates Editor
  const [quoteTemplate, setQuoteTemplate] = useState(
    company.custom_whatsapp_templates?.quote_created || 
    'Olá, {{cliente}}! Aqui está o orçamento do seu {{veiculo}} (Placa: {{placa}}). Valor total: {{valor}}. Acesse o link seguro para aprovação: {{link}}'
  );

  const [serviceReadyTemplate, setServiceReadyTemplate] = useState(
    company.custom_whatsapp_templates?.service_ready || 
    'Olá, {{cliente}}! O serviço no seu {{veiculo}} foi concluído com sucesso e o veículo já está pronto para retirada na {{empresa}}. Veja o relatório de entrega: {{link}}'
  );

  const [postSaleTemplate, setPostSaleTemplate] = useState(
    company.custom_whatsapp_templates?.post_sale_reminder || 
    'Olá, {{cliente}}! Passando para checar como está o seu {{veiculo}} após a revisão na {{empresa}}. Lembre-se que você conta com garantia legal!'
  );

  const colorOptions = [
    { name: 'Azul Konnexy (Padrão)', value: '#2563EB', bg: 'bg-blue-600' },
    { name: 'Verde Esmeralda', value: '#16A34A', bg: 'bg-emerald-600' },
    { name: 'Índigo Profissional', value: '#4F46E5', bg: 'bg-indigo-600' },
    { name: 'Laranja Premium', value: '#EA580C', bg: 'bg-orange-600' },
    { name: 'Preto Grafite', value: '#18181B', bg: 'bg-zinc-900' },
    { name: 'Roxo Detailing', value: '#9333EA', bg: 'bg-purple-600' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany({
      name,
      trade_name: tradeName,
      business_type: businessType,
      document: doc,
      phone,
      whatsapp,
      email,
      address,
      city,
      state,
      logo_url: logoUrl,
      primary_color: primaryColor,
      pix_key: pixKey,
      pix_key_type: pixKeyType,
      business_hours: businessHours,
      instagram,
      custom_whatsapp_templates: {
        quote_created: quoteTemplate,
        service_ready: serviceReadyTemplate,
        post_sale_reminder: postSaleTemplate,
      }
    });
    success('Configurações da oficina atualizadas com sucesso!');
  };

  const handleResetDemo = () => {
    resetAllDataToDemo();
    resetToDemoCompany();
    setName('AutoPrime Centro Automotivo');
    setWhatsapp('(11) 98765-4321');
    setPixKey('12345678000190');
    setPrimaryColor('#2563EB');
    applyPrimaryTheme('#2563EB');
    success('Dados de demonstração restaurados para AutoPrime Centro Automotivo!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Configurações da Oficina & Assinatura
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Personalize os dados da empresa, templates do WhatsApp assistido, chave Pix e permissões de equipe.
        </p>
      </div>

      {/* Role Switcher Demo Bar (For Multi-Role Testing) */}
      <Card className="bg-slate-900 text-white p-4 rounded-3xl border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Alternador de Perfil em Tempo Real</p>
              <p className="text-[11px] text-slate-400">Usuário atual: <span className="font-bold text-primary-300">{user?.full_name}</span> ({user?.role})</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['owner', 'admin', 'attendant', 'mechanic', 'financial'] as UserRole[]).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  switchRole(role);
                  success(`Perfil alterado para: ${role.toUpperCase()}`);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                  user?.role === role
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {role === 'owner' ? 'Dono/Owner' :
                 role === 'admin' ? 'Gerente' :
                 role === 'attendant' ? 'Atendente' :
                 role === 'mechanic' ? 'Mecânico' : 'Financeiro'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Dados da Empresa */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="w-4 h-4 text-primary-600" />
              Identificação do Estabelecimento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nome Fantasia da Oficina *"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Segmento / Especialidade *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => {
                    const newType = e.target.value as BusinessType;
                    setBusinessType(newType);
                    changeBusinessType(newType);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="mechanic">Oficina Mecânica Geral</option>
                  <option value="detailing">Estética Automotiva / Detailing</option>
                  <option value="bodywork">Funilaria & Pintura</option>
                  <option value="electric">Autoelétrica & Baterias</option>
                  <option value="oil_change">Troca de Óleo Rápida</option>
                  <option value="motorcycle">Oficina de Motos</option>
                  <option value="general">Geral / Centro Automotivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="CNPJ / CPF"
                value={doc}
                onChange={(e) => setDoc(e.target.value)}
              />
              <Input
                label="WhatsApp Principal *"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <Input
                label="Telefone Fixo"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Endereço (Rua, Número e Bairro)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="UF"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Pós-Venda Assistido & Modelos de WhatsApp com Variáveis (Topic 27 & 28) */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Pós-Venda Assistido & Mensagens WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-1">Variáveis dinâmicas aceitas nos modelos:</span>
              <code className="text-primary-700 font-mono text-[11px]">
                &#123;&#123;cliente&#125;&#125; • &#123;&#123;veiculo&#125;&#125; • &#123;&#123;placa&#125;&#125; • &#123;&#123;valor&#125;&#125; • &#123;&#123;link&#125;&#125; • &#123;&#123;empresa&#125;&#125;
              </code>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                1. Mensagem de Envio de Orçamento
              </label>
              <Textarea
                rows={2}
                value={quoteTemplate}
                onChange={e => setQuoteTemplate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                2. Mensagem de Veículo Pronto para Retirada
              </label>
              <Textarea
                rows={2}
                value={serviceReadyTemplate}
                onChange={e => setServiceReadyTemplate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                3. Mensagem de Pós-Venda Assistido & Lembretes
              </label>
              <Textarea
                rows={2}
                value={postSaleTemplate}
                onChange={e => setPostSaleTemplate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Configuração do Pix */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              Chave Pix da Oficina para Recebimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Tipo de Chave Pix"
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value)}
              >
                <option value="cpf_cnpj">CNPJ / CPF</option>
                <option value="phone">Celular (com DDD)</option>
                <option value="email">E-mail</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </Select>

              <div className="sm:col-span-2">
                <Input
                  label="Chave Pix Cadastrada"
                  placeholder="Ex: 12345678000190 ou pix@oficina.com.br"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  helperText="Utilizada para gerar o QR Code Pix automático nas propostas e ordens de serviço."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Personalização Visual & Marca */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              Identidade Visual & Logotipo (White-Label)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <Input
              label="URL do Logotipo da Oficina"
              placeholder="https://suaoficina.com.br/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Cor Principal do Tema (White-Label em Tempo Real)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                {colorOptions.map(c => {
                  const isSelected = primaryColor.toLowerCase() === c.value.toLowerCase();
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(c.value);
                        applyPrimaryTheme(c.value);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-primary-50 border-primary-500 text-primary-900 ring-2 ring-primary-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.bg} shrink-0 shadow-xs`} />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color & Color Picker */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor.startsWith('#') ? primaryColor : '#2563EB'}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      applyPrimaryTheme(e.target.value);
                    }}
                    className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                    title="Escolher cor personalizada"
                  />
                  <span className="text-xs font-bold text-slate-700">Cor Personalizada:</span>
                </div>
                <input
                  type="text"
                  value={primaryColor}
                  placeholder="#2563EB"
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrimaryColor(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
                      applyPrimaryTheme(val);
                    }
                  }}
                  className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Altera botões, destaques, links e página pública do cliente instantaneamente)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Plano & Assinatura Konnexy SaaS */}
        <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Plano da Assinatura Konnexy SaaS
            </CardTitle>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              Plano {company.plan?.toUpperCase() || 'PRO'} Ativo
            </span>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Orçamentos</span>
                <span className="text-lg font-black text-white">Ilimitados</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Usuários Ativos</span>
                <span className="text-lg font-black text-white">Até 5 colaboradores</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Renovação</span>
                <span className="text-lg font-black text-emerald-400">Mensal (R$ 147,00)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="font-bold shadow-elevated px-8"
            leftIcon={<Save className="w-5 h-5" />}
          >
            Salvar Configurações
          </Button>
        </div>
      </form>

      {/* Danger Zone: Demo data reset */}
      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Restaurar Dados de Demonstração</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Reinicie os dados para a oficina modelo <strong>AutoPrime Centro Automotivo</strong>.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleResetDemo}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Restaurar Demonstração
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
