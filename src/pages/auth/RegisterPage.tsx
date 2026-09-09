import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useToast } from '../../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Wrench, Mail, Lock, User, Building, Phone } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { updateCompany } = useTenant();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !companyName || !email || !password) {
      error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, fullName, password);
      updateCompany({
        name: companyName,
        whatsapp: whatsapp || '(11) 99999-9999',
        email,
      });
      success('Conta criada com sucesso! Bem-vindo à sua oficina.');
      navigate('/dashboard');
    } catch {
      error('Falha ao criar conta.');
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
        <div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
            Konnexy OS Auto
          </span>
          <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">
            Criar Nova Oficina
          </span>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-elevated border-slate-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-extrabold">Comece Agora Gratuitamente</CardTitle>
          <CardDescription>
            Organize seus orçamentos e serviços em menos de 2 minutos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Nome da sua Oficina / Estabelecimento *"
              required
              placeholder="Ex: Mecânica Silva ou Auto Detalhe"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
            />

            <Input
              label="Seu Nome Completo *"
              required
              placeholder="Ex: Carlos Silva"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="WhatsApp da Oficina *"
              type="tel"
              required
              placeholder="(11) 98765-4321"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="E-mail *"
              type="email"
              required
              placeholder="contato@suaoficina.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Criar Senha *"
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold mt-2"
              isLoading={isLoading}
            >
              Criar Conta e Acessar
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100 mt-4">
            <p className="text-xs text-slate-500">
              Já possui uma conta?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
