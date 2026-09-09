import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, BusinessType, KanbanStageConfig, WhatsAppTemplateConfig } from '../types';
import { DEMO_COMPANY, BUSINESS_TYPE_PRESETS } from '../lib/demoData';
import { DefaultWhatsAppTemplates } from '../lib/whatsapp';
import { applyPrimaryTheme } from '../lib/theme';

interface TenantContextType {
  company: Company;
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
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompanyState] = useState<Company>(() => {
    const saved = localStorage.getItem('konnexy_company');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_COMPANY;
      }
    }
    return DEMO_COMPANY;
  });

  useEffect(() => {
    localStorage.setItem('konnexy_company', JSON.stringify(company));
    applyPrimaryTheme(company.primary_color || '#2563EB');
  }, [company]);

  const setCompany = (comp: Company) => {
    setCompanyState(comp);
    localStorage.setItem('konnexy_company', JSON.stringify(comp));
  };

  const currentBusinessType = company.business_type || 'mechanic';
  const currentKanbanStages: KanbanStageConfig[] = 
    company.kanban_stages_config && company.kanban_stages_config.length > 0
      ? company.kanban_stages_config
      : (BUSINESS_TYPE_PRESETS[currentBusinessType]?.stages || BUSINESS_TYPE_PRESETS.mechanic.stages);

  const whatsappTemplates: WhatsAppTemplateConfig = {
    ...DefaultWhatsAppTemplates,
    ...(company.whatsapp_templates_config || {}),
  };

  const updateCompany = (data: Partial<Company>) => {
    setCompanyState(prev => ({
      ...prev,
      ...data,
      updated_at: new Date().toISOString()
    }));
  };

  const updateKanbanStages = (stages: KanbanStageConfig[]) => {
    updateCompany({ kanban_stages_config: stages });
  };

  const updateWhatsAppTemplates = (templates: Partial<WhatsAppTemplateConfig>) => {
    updateCompany({
      whatsapp_templates_config: {
        ...(company.whatsapp_templates_config || {}),
        ...templates,
      }
    });
  };

  const applyBusinessTypePreset = (type: BusinessType) => {
    const preset = BUSINESS_TYPE_PRESETS[type] || BUSINESS_TYPE_PRESETS.mechanic;
    updateCompany({
      business_type: type,
      kanban_stages_config: preset.stages,
    });
  };

  const changeBusinessType = (type: BusinessType) => {
    applyBusinessTypePreset(type);
  };

  const completeOnboarding = (companyData: Partial<Company>) => {
    const bType = companyData.business_type || 'mechanic';
    const preset = BUSINESS_TYPE_PRESETS[bType] || BUSINESS_TYPE_PRESETS.mechanic;

    updateCompany({
      ...companyData,
      business_type: bType,
      kanban_stages_config: preset.stages,
      onboarding_completed: true,
      subscription_status: 'trial',
    });
  };

  const resetToDemoCompany = () => {
    setCompanyState(DEMO_COMPANY);
    localStorage.setItem('konnexy_company', JSON.stringify(DEMO_COMPANY));
  };

  return (
    <TenantContext.Provider 
      value={{ 
        company, 
        currentKanbanStages,
        whatsappTemplates,
        setCompany,
        updateCompany, 
        updateKanbanStages,
        updateWhatsAppTemplates,
        applyBusinessTypePreset,
        changeBusinessType,
        completeOnboarding,
        resetToDemoCompany 
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
