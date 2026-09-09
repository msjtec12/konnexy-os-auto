import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Wrench, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@autoprimeauto.com.br');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Por favor, informe seu e-mail');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        success('Bem-vindo ao Konnexy OS Auto!');
        navigate('/dashboard');
      }
    } catch {
      error('Falha ao autenticar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    await login('admin@autoprimeauto.com.br');
    success('Acessando com oficina modelo AutoPrime!');
    navigate('/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
            Konnexy OS Auto
          </span>
          <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">
            Gestão Automotiva Simplificada
          </span>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-elevated border-slate-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-extrabold">Acessar sua Oficina</CardTitle>
          <CardDescription>
            Entre com suas credenciais para gerenciar seus orçamentos e serviços.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail de Acesso"
              type="email"
              required
              placeholder="seuemail@oficina.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Senha"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                Lembrar neste aparelho
              </label>
              <Link to="/forgot-password" className="text-primary-600 font-semibold hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={isLoading}
            >
              Entrar no Sistema
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-medium">Ou experimente direto</span>
            </div>
          </div>

          {/* Quick Demo Access */}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold"
            onClick={handleQuickDemo}
            leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
          >
            Entrar como Oficina Modelo (Demo)
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Não tem uma conta para sua oficina?{' '}
              <Link to="/register" className="text-primary-600 font-bold hover:underline">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
