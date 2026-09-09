import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  CheckCircle2, 
  Smartphone, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  ArrowRight,
  Car,
  QrCode
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-primary-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
              Konnexy OS Auto
            </span>
            <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">
              Gestão Automotiva Inteligente
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Entrar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Testar Agora
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/80 border border-primary-500/30 text-primary-300 text-xs font-bold mb-8 animate-in fade-in">
          <Zap className="w-3.5 h-3.5 text-primary-400" />
          Desenvolvido para oficinas mecânicas e estética automotiva do Brasil
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight mb-6">
          Orçamentos, serviços e clientes organizados em um só lugar.
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Pare de perder orçamentos no WhatsApp. Envie propostas profissionais com aprovação em 1 clique, acompanhe seus serviços e organize sua oficina direto pelo celular.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 shadow-elevated text-base font-bold"
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Acessar Demonstração Grátis
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
            onClick={() => navigate('/login')}
          >
            Fazer Login
          </Button>
        </div>

        {/* Value promise pill */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem complicação de ERP antigo</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% no celular ou computador</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Integração direta com WhatsApp</span>
        </div>
      </section>

      {/* Main Flow Highlights */}
      <section className="py-16 bg-slate-850 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-2">
              Fluxo Sem Fricção
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Do orçamento ao pós-venda em poucos cliques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-card">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Orçamento no WhatsApp</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Monte serviços e peças rapidamente e envie um link profissional no WhatsApp. O cliente confere fotos, valores e aprova na hora.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-card">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Ordem de Serviço & Kanban</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                O orçamento aprovado vira OS automaticamente. Acompanhe pelo quadro da oficina (Entrada, Diagnóstico, Em Serviço, Peça e Pronto).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-card">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Sinal, Pix & Pós-Venda</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receba pagamentos com QR Code Pix instantâneo, emita resumo de garantia e receba alertas para futuras revisões e trocas de óleo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Konnexy OS Auto. Todos os direitos reservados.</p>
        <p className="mt-1">Feito para centros automotivos, oficinas mecânicas, autoelétricas e estética automotiva.</p>
      </footer>
    </div>
  );
};
