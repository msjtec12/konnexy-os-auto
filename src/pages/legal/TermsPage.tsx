import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const TermsPage: React.FC = () => {
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
            Termos de Uso • Konnexy OS Auto
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Documento Legal e Condições Gerais de Uso
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Termos e Condições de Uso da Plataforma
          </h1>
          <p className="text-xs text-slate-400">Última atualização: Novembro de 2026 • Versão 1.0</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">1. Objeto e Aceitação dos Termos</h2>
            <p>
              O presente instrumento regula o acesso e a utilização do software como serviço (SaaS) denominado <strong>Konnexy OS Auto</strong>, disponibilizado para gestão de oficinas mecânicas, centros automotivos e estabelecimentos de estética automotiva.
            </p>
            <p>
              Ao cadastrar sua empresa, criar orçamentos ou utilizar qualquer funcionalidade do sistema, o estabelecimento cliente declara ciência e integral concordância com estes Termos de Uso.
            </p>
          </section>

          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">2. Papéis e Responsabilidades (CDC & Relação com Consumidores)</h2>
            <p>
              O <strong>Konnexy OS Auto</strong> atua exclusivamente como provedor de tecnologia e ferramenta de gestão operacional. Toda e qualquer relação de consumo, precificação de serviços, fornecimento de peças, laudo mecânico e garantia prestada ao consumidor final é de integral e exclusiva responsabilidade da <strong>oficina contratante</strong>, nos termos da Lei nº 8.078/1990 (Código de Defesa do Consumidor).
            </p>
            <p>
              A oficina se compromete a emitir orçamentos fidedignos, obter autorização expressa do consumidor prévia à execução de serviços e cumprir a garantia legal de 90 dias referente a peças e mão de obra (art. 26 do CDC).
            </p>
          </section>

          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">3. Planos, Assinatura e Cancelamento (Direito de Arrependimento)</h2>
            <p>
              O serviço é contratado no modelo de assinatura recorrente (mensal ou anual). Conforme estabelece o artigo 49 do Código de Defesa do Consumidor e o Decreto nº 7.962/2013, o contratante poderá exercer seu direito de arrependimento no prazo de até 7 (sete) dias corridos a contar da contratação inicial, com devolução integral dos valores pagos.
            </p>
            <p>
              O cancelamento pode ser solicitado a qualquer momento diretamente pelo painel administrativo, mantendo-se o acesso ativo até o término do ciclo de faturamento já quitado, sem multas rescisórias para planos mensais.
            </p>
          </section>

          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">4. Disponibilidade (SLA) e Continuidade</h2>
            <p>
              A plataforma envidará seus melhores esforços comerciais para manter disponibilidade mínima de 99,5% (noventa e nove vírgula cinco por cento) ao mês, ressalvadas janelas de manutenção preventiva devidamente comunicadas ou indisponibilidades de infraestruturas terceiras (como operadoras de telecomunicação ou provedores de nuvem).
            </p>
          </section>

          <section className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">5. Foro de Eleição</h2>
            <p>
              Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas do presente instrumento, com expressa renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
