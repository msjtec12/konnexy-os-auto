import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Company, BusinessType, KanbanStageConfig, WhatsAppTemplateConfig } from '../types';
import { DEMO_COMPANY, BUSINESS_TYPE_PRESETS } from '../lib/demoData';
import { DefaultWhatsAppTemplates } from '../lib/whatsapp';
import { applyPrimaryTheme } from '../lib/theme';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface TenantContextType {
  company: Company;
  isCompanyLoading: boolean;
  currentKanbanStages: KanbanStageConfig[];
  whatsappTemplates: WhatsAppTemplateConfig;
  setCompany: (company: Company) => void;
  updateCompany: (data: Partial<Company>) => void;
  updateKanbanStages: (stages: KanbanStageConfig[]) => void;
  updateWhatsAppTemplates: (templates: Partial<WhatsAppTemplateConfig>) => void;
  applyBusinessTypePreset: (type: BusinessType) => void;
  changeBusinessType: (type: BusinessType) => void;
  completeOnboarding: (companyData: Partial<Company>) => void;
  resetToDemoCompany: () => void;
  reloadCompany: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);
const DEMO_COMPANY_KEY = 'konnexy_demo_company';

const readDemoCompany = (): Company => {
  const raw = localStorage.getItem(DEMO_COMPANY_KEY);
  if (!raw) return DEMO_COMPANY;
  try {
    return JSON.parse(raw) as Company;
  } catch {
    return DEMO_COMPANY;
  }
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode, isLoading: isAuthLoading } = useAuth();
  const [company, setCompanyState] = useState<Company>(DEMO_COMPANY);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);

  const reloadCompany = useCallback(async () => {
    if (isDemoMode) {
      setCompanyState(readDemoCompany());
      return;
    }

    if (!supabase || !user?.company_id) return;

    setIsCompanyLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.company_id)
        .single();

      if (error) throw error;
      if (data) setCompanyState(data as Company);
    } catch (error) {
      console.error('Falha ao carregar empresa do usuário.', error);
    } finally {
      setIsCompanyLoading(false);
    }
  }, [isDemoMode, user?.company_id]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (isDemoMode) {
      setCompanyState(readDemoCompany());
      return;
    }

    if (user?.company_id) {
      void reloadCompany();
    }
  }, [isAuthLoading, isDemoMode, user?.company_id, reloadCompany]);

  useEffect(() => {
    applyPrimaryTheme(company.primary_color || '#2563EB');
    if (isDemoMode) localStorage.setItem(DEMO_COMPANY_KEY, JSON.stringify(company));
  }, [company, isDemoMode]);

  const setCompany = useCallback((comp: Company) => {
    // Public token pages may set a read-only company payload while unauthenticated.
    if (!user) {
      setCompanyState(comp);
      return;
    }

    if (isDemoMode || user.is_superadmin || user.role === 'superadmin' || comp.id === user.company_id) {
      setCompanyState(comp);
      if (isDemoMode) localStorage.setItem(DEMO_COMPANY_KEY, JSON.stringify(comp));
    }
  }, [isDemoMode, user]);

  const updateCompany = useCallback((data: Partial<Company>) => {
    const protectedKeys = new Set([
      'id',
      'owner_id',
      'plan_id',
      'plan',
      'subscription_status',
      'is_active',
      'created_at',
    ]);

    const safeData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => !protectedKeys.has(key) && value !== undefined),
    ) as Partial<Company>;

    setCompanyState(prev => ({
      ...prev,
      ...safeData,
      updated_at: new Date().toISOString(),
    }));

    if (!isDemoMode && user?.company_id && supabase) {
      void supabase
        .from('companies')
        .update({ ...safeData, updated_at: new Date().toISOString() })
        .eq('id', user.company_id)
        .then(({ error }) => {
          if (error) console.error('Falha ao persistir configurações da empresa.', error);
        });
    }
  }, [isDemoMode, user?.company_id]);

  const currentBusinessType = company.business_type || 'mechanic';
  const currentKanbanStages: KanbanStageConfig[] =
    company.kanban_stages_config && company.kanban_stages_config.length > 0
      ? company.kanban_stages_config
      : (BUSINESS_TYPE_PRESETS[currentBusinessType]?.stages || BUSINESS_TYPE_PRESETS.mechanic.stages);

  const whatsappTemplates: WhatsAppTemplateConfig = {
    ...DefaultWhatsAppTemplates,
    ...(company.whatsapp_templates_config || {}),
  };

  const updateKanbanStages = (stages: KanbanStageConfig[]) => {
    updateCompany({ kanban_stages_config: stages });
  };

  const updateWhatsAppTemplates = (templates: Partial<WhatsAppTemplateConfig>) => {
    updateCompany({
      whatsapp_templates_config: {
        ...(company.whatsapp_templates_config || {}),
        ...templates,
      },
    });
  };

  const applyBusinessTypePreset = (type: BusinessType) => {
    const preset = BUSINESS_TYPE_PRESETS[type] || BUSINESS_TYPE_PRESETS.mechanic;
    updateCompany({ business_type: type, kanban_stages_config: preset.stages });
  };

  const changeBusinessType = (type: BusinessType) => applyBusinessTypePreset(type);

  const completeOnboarding = (companyData: Partial<Company>) => {
    const businessType = companyData.business_type || 'mechanic';
    const preset = BUSINESS_TYPE_PRESETS[businessType] || BUSINESS_TYPE_PRESETS.mechanic;
    updateCompany({
      ...companyData,
      business_type: businessType,
      kanban_stages_config: preset.stages,
      onboarding_completed: true,
    });
  };

  const resetToDemoCompany = () => {
    if (!isDemoMode) return;
    localStorage.removeItem(DEMO_COMPANY_KEY);
    setCompanyState(DEMO_COMPANY);
  };

  const value = useMemo<TenantContextType>(() => ({
    company,
    isCompanyLoading,
    currentKanbanStages,
    whatsappTemplates,
    setCompany,
    updateCompany,
    updateKanbanStages,
    updateWhatsAppTemplates,
    applyBusinessTypePreset,
    changeBusinessType,
    completeOnboarding,
    resetToDemoCompany,
    reloadCompany,
  }), [company, isCompanyLoading, currentKanbanStages, setCompany, updateCompany, reloadCompany]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
