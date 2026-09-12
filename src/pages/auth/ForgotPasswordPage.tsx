import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Wrench, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const ok = await forgotPassword(email.trim());
      if (!ok) {
        error('Não foi possível solicitar a recuperação de senha.');
        return;
      }
      setSent(true);
      success('Se o e-mail estiver cadastrado, você receberá o link de recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
          <Wrench className="w-6 h-6" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-slate-900">Konnexy OS Auto</span>
      </div>

      <Card className="w-full max-w-md shadow-elevated border-slate-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-extrabold">Recuperação de Senha</CardTitle>
          <CardDescription>Digite o e-mail cadastrado da sua oficina para redefinir o acesso.</CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Confira sua caixa de entrada e a pasta de spam.</p>
              <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border">{email}</p>
              <Link to="/login" className="inline-block pt-2"><Button variant="outline" size="md">Voltar para o Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Seu E-mail Cadastrado"
                type="email"
                required
                autoComplete="email"
                placeholder="seuemail@oficina.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isLoading}>
                Enviar Link de Recuperação
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold hover:text-slate-900">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
