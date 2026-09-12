import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Lock, Wrench } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      error('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      error('As senhas não coincidem.');
      return;
    }
    if (!supabase) {
      error('Serviço de autenticação indisponível.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      success('Senha alterada com sucesso.');
      navigate('/login');
    } catch {
      error('O link pode ter expirado. Solicite uma nova recuperação de senha.');
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
          <CardTitle className="text-xl font-extrabold">Definir nova senha</CardTitle>
          <CardDescription>Crie uma nova senha para sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nova senha"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isLoading}>
              Alterar senha
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-xs text-primary-600 font-semibold hover:underline">Voltar ao login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
