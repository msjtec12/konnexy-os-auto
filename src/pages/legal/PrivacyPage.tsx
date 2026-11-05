import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-primary-500 selection:text-white pb-20">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-300 hover:text-white"
          >
            Voltar
          </Button>
          <span className="font-extrabold text-base tracking-tight text-white">
            Privacidade & LGPD • Konnexy OS Auto
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Política de Privacidade e Proteção de Dados Pessoais
          </h1>
          <p className="text-xs text-slate-400">Última atualização: Novembro de 2026 • Versão 1.0</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">1. Enquadramento Legal (Controlador vs. Operador)</h2>
            <p>
              Nos termos da Lei Geral de Proteção de Dados Pessoais (LGPD):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>A Oficina Cliente é a Controladora:</strong> compete a ela tomar as decisões referentes ao tratamento de dados pessoais de seus clientes finais (nome, CPF, placa, telefone, endereço e fotos de vistorias).
              </li>
              <li>
                <strong>A Konnexy é a Operadora:</strong> realiza o tratamento dos dados pessoais unicamente em nome da oficina contratante e estritamente para a finalidade de execução das funcionalidades do software (orçamentos, ordens de serviço, notificações WhatsApp e cobrança Pix).
              </li>
            </ul>
          </section>

          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">2. Dados Coletados e Finalidades do Tratamento</h2>
            <p>Os dados tratados na plataforma incluem:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Dados de Identificação de Usuários da Oficina:</strong> Nome completo, e-mail corporativo, telefone e senha criptografada (para autenticação, rastreabilidade e controle de acesso RBAC).</li>
              <li><strong>Dados de Clientes e Proprietários de Veículos:</strong> Nome, WhatsApp, CPF/CNPJ opcional, modelo do veículo e placa Mercosul (para emissão de orçamentos, link seguro e histórico de manutenções).</li>
              <li><strong>Registros Fotográficos de Veículos:</strong> Imagens de avarias de entrada e peças substituídas para transparência e respaldo de garantia.</li>
            </ul>
          </section>

          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">3. Segurança, Criptografia e Isolamento Multi-Tenant</h2>
            <p>
              Adotamos medidas técnicas e organizacionais rigorosas para proteção dos dados pessoais contra acessos não autorizados, destruição ou vazamento:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Isolamento Multi-Tenant por RLS (Row Level Security):</strong> Nenhuma oficina tem acesso lógico ou visual aos clientes, ordens de serviço ou registros financeiros de outro estabelecimento.</li>
              <li><strong>Links de Clientes com Tokens Criptográficos:</strong> Os links de orçamento e acompanhamento utilizam identificadores aleatórios de alta entropia, com possibilidade de expiração e revogação.</li>
              <li><strong>Criptografia em Trânsito:</strong> Todo o tráfego é transmitido via HTTPS/TLS 1.3 com proteção HSTS.</li>
            </ul>
          </section>

          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">4. Direitos dos Titulares de Dados (Canal do DPO)</h2>
            <p>
              Em conformidade com o artigo 18 da LGPD, os titulares de dados pessoais podem a qualquer momento solicitar confirmação da existência de tratamento, acesso, retificação, anonimização, portabilidade ou eliminação de seus dados pessoais.
            </p>
            <div className="flex items-center gap-3 p-3.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-200">
              <Mail className="w-5 h-5 text-primary-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Encarregado de Proteção de Dados (DPO):</span>
                <span>Contato exclusivo para requisições de privacidade: <strong>privacidade@konnexy.com.br</strong></span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
