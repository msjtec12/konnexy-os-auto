import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Profile, UserRole } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginDemo: () => void;
  register: (
    email: string,
    fullName: string,
    password: string,
    companyName: string,
    whatsapp: string,
  ) => Promise<'authenticated' | 'confirmation_required' | false>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => void;
  switchRole: (role: UserRole) => void;
  canAccess: (permission: PermissionKey) => boolean;
}

export type PermissionKey =
  | 'manage_users'
  | 'manage_company_settings'
  | 'view_financial_reports'
  | 'create_quotes'
  | 'edit_quotes'
  | 'manage_os'
  | 'view_superadmin';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_SESSION_KEY = 'konnexy_demo_session';

const DEMO_USER: Profile = {
  id: 'demo-user',
  email: 'demo@konnexy.app',
  full_name: 'Oficina Modelo',
  role: 'owner',
  phone: '(11) 98765-4321',
  is_superadmin: false,
  created_at: new Date().toISOString(),
};

const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadProfile = useCallback(async (userId: string, fallbackEmail?: string): Promise<Profile | null> => {
    if (!supabase) return null;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,full_name,phone,avatar_url,role,company_id,is_superadmin,created_at')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) return data as Profile;
      if (attempt < 3) await sleep(250 * (attempt + 1));
    }

    console.error('Não foi possível carregar o perfil autenticado.', { userId, fallbackEmail });
    return null;
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const demoRequested = localStorage.getItem(DEMO_SESSION_KEY) === '1';
      if (demoRequested) {
        if (active) {
          setUser(DEMO_USER);
          setIsDemoMode(true);
          setIsLoading(false);
        }
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        if (active) {
          setUser(null);
          setIsDemoMode(false);
          setIsLoading(false);
        }
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) console.error('Falha ao restaurar sessão Supabase.', error);

      if (data.session?.user && active) {
        const profile = await loadProfile(data.session.user.id, data.session.user.email);
        if (active) setUser(profile);
      }

      if (active) setIsLoading(false);
    };

    void initialize();

    const authSubscription = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!active || isDemoMode) return;

      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      void loadProfile(session.user.id, session.user.email).then(profile => {
        if (!active) return;
        setUser(profile);
        setIsLoading(false);
      });
    });

    return () => {
      active = false;
      authSubscription?.data.subscription.unsubscribe();
    };
  }, [isDemoMode, loadProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !email || !password) return false;

    setIsLoading(true);
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setIsDemoMode(false);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return false;

      const profile = await loadProfile(data.user.id, data.user.email);
      if (!profile) {
        await supabase.auth.signOut();
        return false;
      }

      setUser(profile);
      return true;
    } catch (error) {
      console.error('Falha ao autenticar.', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = () => {
    if (supabase) void supabase.auth.signOut();
    localStorage.setItem(DEMO_SESSION_KEY, '1');
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setIsLoading(false);
  };

  const register = async (
    email: string,
    fullName: string,
    password: string,
    companyName: string,
    whatsapp: string,
  ): Promise<'authenticated' | 'confirmation_required' | false> => {
    if (!isSupabaseConfigured || !supabase) return false;
    if (!email || !fullName || !password || !companyName || !whatsapp) return false;

    setIsLoading(true);
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setIsDemoMode(false);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
            whatsapp: whatsapp.trim(),
            role: 'owner',
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error || !data.user) {
        if (error) console.error('Falha no cadastro Supabase.', error);
        return false;
      }

      if (!data.session) return 'confirmation_required';

      const profile = await loadProfile(data.user.id, data.user.email);
      if (!profile) return false;
      setUser(profile);
      return 'authenticated';
    } catch (error) {
      console.error('Falha ao criar conta.', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !email) return false;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      console.error('Falha ao solicitar recuperação de senha.', error);
      return false;
    }
    return true;
  };

  const logout = () => {
    localStorage.removeItem(DEMO_SESSION_KEY);
    setIsDemoMode(false);
    setUser(null);
    if (supabase) void supabase.auth.signOut();
  };

  const updateProfile = (data: Partial<Profile>) => {
    if (!user) return;

    // Security-sensitive fields are never mutable from the client profile editor.
    const safePatch: Partial<Profile> = {
      full_name: data.full_name,
      phone: data.phone,
      avatar_url: data.avatar_url,
    };
    Object.keys(safePatch).forEach(key => {
      if (safePatch[key as keyof Profile] === undefined) delete safePatch[key as keyof Profile];
    });

    const updated = { ...user, ...safePatch };
    setUser(updated);

    if (!isDemoMode && supabase) {
      void supabase.from('profiles').update(safePatch).eq('id', user.id).then(({ error }) => {
        if (error) console.error('Falha ao atualizar perfil.', error);
      });
    }
  };

  const switchRole = (role: UserRole) => {
    // Role switching is intentionally restricted to the local demo. Production roles come from PostgreSQL/RLS.
    if (!user || !isDemoMode) return;
    setUser({ ...user, role });
  };

  const canAccess = useCallback((permission: PermissionKey): boolean => {
    if (!user) return false;
    if (user.role === 'superadmin' || Boolean(user.is_superadmin)) return true;

    switch (permission) {
      case 'manage_users':
        return user.role === 'owner';
      case 'manage_company_settings':
        return user.role === 'owner' || user.role === 'admin';
      case 'view_financial_reports':
        return user.role === 'owner' || user.role === 'admin' || user.role === 'financial';
      case 'create_quotes':
      case 'edit_quotes':
        return user.role === 'owner' || user.role === 'admin' || user.role === 'attendant';
      case 'manage_os':
        return ['owner', 'admin', 'attendant', 'mechanic'].includes(user.role);
      case 'view_superadmin':
        return false;
      default:
        return false;
    }
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    isDemoMode,
    login,
    loginDemo,
    register,
    forgotPassword,
    logout,
    updateProfile,
    switchRole,
    canAccess,
  }), [user, isLoading, isDemoMode, canAccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
