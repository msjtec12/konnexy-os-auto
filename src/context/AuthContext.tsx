import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, fullName: string, password?: string, role?: UserRole) => Promise<boolean>;
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

const DEMO_USER: Profile = {
  id: 'user-admin-1',
  email: 'admin@autoprimeauto.com.br',
  full_name: 'Carlos Gerente (Owner)',
  role: 'owner',
  phone: '(11) 98765-4321',
  is_superadmin: true,
  created_at: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('konnexy_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(DEMO_USER);
      }
    } else {
      setUser(DEMO_USER);
      localStorage.setItem('konnexy_user', JSON.stringify(DEMO_USER));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'password123',
        });
        if (error) throw error;
        if (data.user) {
          const profile: Profile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || 'owner',
            is_superadmin: data.user.email?.includes('superadmin') || false,
            created_at: data.user.created_at,
          };
          setUser(profile);
          localStorage.setItem('konnexy_user', JSON.stringify(profile));
          setIsLoading(false);
          return true;
        }
      } catch (err) {
        console.warn('Supabase signin failed, continuing with local session:', err);
      }
    }

    const isSuper = email.includes('superadmin') || email.includes('konnexy');
    const loggedUser: Profile = {
      ...DEMO_USER,
      email,
      full_name: email.split('@')[0].toUpperCase() || 'Administrador',
      role: isSuper ? 'superadmin' : 'owner',
      is_superadmin: isSuper,
    };
    setUser(loggedUser);
    localStorage.setItem('konnexy_user', JSON.stringify(loggedUser));
    setIsLoading(false);
    return true;
  };

  const register = async (email: string, fullName: string, _password?: string, role: UserRole = 'owner'): Promise<boolean> => {
    setIsLoading(true);
    const newUser: Profile = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName,
      role,
      is_superadmin: email.includes('superadmin'),
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('konnexy_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('konnexy_user');
  };

  const updateProfile = (data: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('konnexy_user', JSON.stringify(updated));
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updated: Profile = { ...user, role };
    setUser(updated);
    localStorage.setItem('konnexy_user', JSON.stringify(updated));
  };

  const canAccess = (permission: PermissionKey): boolean => {
    if (!user) return false;
    if ((user.role as string) === 'superadmin' || Boolean(user.is_superadmin)) return true;

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
        return user.role === 'owner' || user.role === 'admin' || user.role === 'attendant' || user.role === 'mechanic';
      case 'view_superadmin':
        return (user.role as string) === 'superadmin' || Boolean(user.is_superadmin);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        switchRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
