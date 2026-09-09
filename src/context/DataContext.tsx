import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Customer, 
  Vehicle, 
  Quote, 
  QuoteItem, 
  QuoteStatus, 
  QuoteVersion,
  QuoteApprovalSnapshot,
  RejectionReasonCategory,
  ServiceOrder, 
  ServiceOrderStatus, 
  ServiceOrderItem, 
  ServiceOrderPhoto, 
  AdditionalApproval, 
  Payment, 
  Reminder, 
  ServiceCatalogItem,
  ServicePackage,
  AuditLog,
  DashboardMetrics,
  Company
} from '../types';
import { 
  DEMO_COMPANY, 
  DEMO_CUSTOMERS, 
  DEMO_VEHICLES, 
  DEMO_QUOTES, 
  DEMO_SERVICE_ORDERS, 
  DEMO_PAYMENTS, 
  DEMO_REMINDERS, 
  DEMO_CATALOG,
  DEMO_PACKAGES,
  DEMO_AUDIT_LOGS,
  DEMO_PLATFORM_COMPANIES
} from '../lib/demoData';

interface DataContextType {
  customers: Customer[];
  vehicles: Vehicle[];
  quotes: Quote[];
  serviceOrders: ServiceOrder[];
  payments: Payment[];
  reminders: Reminder[];
  catalog: ServiceCatalogItem[];
  packages: ServicePackage[];
  servicePackages: ServicePackage[];
  auditLogs: AuditLog[];
  platformCompanies: Company[];
  
  // Customers & Vehicles
  addCustomer: (customerData: Omit<Customer, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => Customer;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string, soft?: boolean) => void;
  getCustomerById: (id: string) => Customer | undefined;
  
  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => Vehicle;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => void;
  deleteVehicle: (id: string, soft?: boolean) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getVehiclesByCustomer: (customerId: string) => Vehicle[];
  
  // Quotes & Versioning
  addQuote: (quoteData: Omit<Quote, 'id' | 'company_id' | 'quote_number' | 'current_version' | 'public_token' | 'created_at' | 'updated_at'>, items: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[]) => Quote;
  updateQuote: (id: string, quoteData: Partial<Quote>, items?: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[]) => boolean;
  createNewQuoteVersion: (quoteId: string, quoteData: Partial<Quote>, items: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[], changeSummary?: string) => Quote;
  duplicateQuote: (quoteId: string) => Quote | null;
  updateQuoteStatus: (id: string, status: QuoteStatus, reason?: string) => void;
  recordQuoteRejection: (id: string, category: RejectionReasonCategory, notes?: string) => void;
  getQuoteById: (id: string) => Quote | undefined;
  getQuoteByToken: (token: string) => Quote | undefined;
  approveQuotePublic: (token: string, approverName?: string, termsAgreed?: boolean, clientIp?: string) => Quote | null;
  rejectQuotePublic: (token: string, category?: RejectionReasonCategory, reason?: string, notes?: string) => Quote | null;
  convertQuoteToServiceOrder: (quoteId: string, responsibleName?: string) => ServiceOrder | null;
  
  // Service Orders & Operations
  addServiceOrder: (osData: Omit<ServiceOrder, 'id' | 'company_id' | 'os_number' | 'public_token' | 'created_at' | 'updated_at'>, items?: Omit<ServiceOrderItem, 'id' | 'company_id' | 'service_order_id'>[]) => ServiceOrder;
  updateServiceOrder: (id: string, osData: Partial<ServiceOrder>) => void;
  updateServiceOrderStatus: (id: string, status: ServiceOrderStatus, notes?: string) => void;
  getServiceOrderById: (id: string) => ServiceOrder | undefined;
  getServiceOrderByToken: (token: string) => ServiceOrder | undefined;
  addServiceOrderPhoto: (osId: string, photo: Omit<ServiceOrderPhoto, 'id' | 'company_id' | 'service_order_id' | 'created_at'>) => void;
  addAdditionalApproval: (osId: string, title: string, description: string, amount: number, partsAmount?: number, laborAmount?: number, photoUrl?: string) => AdditionalApproval;
  respondAdditionalApproval: (approvalToken: string, approved: boolean, approverName?: string, reason?: string) => boolean;
  
  // Payments
  addPayment: (paymentData: Omit<Payment, 'id' | 'company_id' | 'created_at'>) => Payment;
  deletePayment: (id: string) => void;
  getPaymentsByOS: (osId: string) => Payment[];
  
  // Reminders
  addReminder: (reminderData: Omit<Reminder, 'id' | 'company_id' | 'created_at'>) => Reminder;
  updateReminderStatus: (id: string, status: Reminder['status']) => void;
  deleteReminder: (id: string) => void;
  
  // Catalog & Packages
  addCatalogItem: (item: Omit<ServiceCatalogItem, 'id' | 'company_id' | 'created_at'>) => ServiceCatalogItem;
  toggleFavoriteCatalogItem: (id: string) => void;
  deleteCatalogItem: (id: string) => void;
  addPackage: (pkg: Omit<ServicePackage, 'id' | 'company_id' | 'created_at'>) => ServicePackage;
  deletePackage: (id: string) => void;
  
  // Intelligence, Follow-up & Audit
  getStagnantQuotes: () => Quote[];
  getLostQuotesBreakdown: () => { category: string; count: number; total: number; percentage: number }[];
  getDashboardMetrics: () => DashboardMetrics;
  logAuditAction: (action: string, entityType: string, entityId: string, metadata?: Record<string, any>) => void;
  searchGlobal: (query: string) => {
    customers: Customer[];
    vehicles: Vehicle[];
    quotes: Quote[];
    serviceOrders: ServiceOrder[];
  };
  
  // Reset
  resetAllDataToDemo: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('konnexy_customers');
    return saved ? JSON.parse(saved) : DEMO_CUSTOMERS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('konnexy_vehicles');
    return saved ? JSON.parse(saved) : DEMO_VEHICLES;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('konnexy_quotes');
    return saved ? JSON.parse(saved) : DEMO_QUOTES;
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('konnexy_service_orders');
    return saved ? JSON.parse(saved) : DEMO_SERVICE_ORDERS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('konnexy_payments');
    return saved ? JSON.parse(saved) : DEMO_PAYMENTS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('konnexy_reminders');
    return saved ? JSON.parse(saved) : DEMO_REMINDERS;
  });

  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>(() => {
    const saved = localStorage.getItem('konnexy_catalog');
    return saved ? JSON.parse(saved) : DEMO_CATALOG;
  });

  const [packages, setPackages] = useState<ServicePackage[]>(() => {
    const saved = localStorage.getItem('konnexy_packages');
    return saved ? JSON.parse(saved) : DEMO_PACKAGES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('konnexy_audit_logs');
    return saved ? JSON.parse(saved) : DEMO_AUDIT_LOGS;
  });

  const [platformCompanies] = useState<Company[]>(DEMO_PLATFORM_COMPANIES);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('konnexy_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('konnexy_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('konnexy_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('konnexy_service_orders', JSON.stringify(serviceOrders));
  }, [serviceOrders]);

  useEffect(() => {
    localStorage.setItem('konnexy_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('konnexy_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('konnexy_catalog', JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem('konnexy_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('konnexy_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helpers
  const logAuditAction = (action: string, entityType: string, entityId: string, metadata?: Record<string, any>) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      company_id: DEMO_COMPANY.id,
      user_name: 'Usuário Ativo',
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const enrichQuote = (q: Quote): Quote => {
    const customer = customers.find(c => c.id === q.customer_id);
    const vehicle = vehicles.find(v => v.id === q.vehicle_id);
    return { ...q, customer, vehicle, version: q.current_version || q.version || 1 };
  };

  const enrichVehicle = (v: Vehicle): Vehicle => {
    const customer = customers.find(c => c.id === v.customer_id);
    return { ...v, customer };
  };

  // 1. CUSTOMERS
  const addCustomer = (customerData: Omit<Customer, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      company_id: DEMO_COMPANY.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
    logAuditAction('customer.created', 'customer', newCustomer.id, { name: newCustomer.name });
    return newCustomer;
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData, updated_at: new Date().toISOString() } : c));
    logAuditAction('customer.updated', 'customer', id, customerData);
  };

  const deleteCustomer = (id: string, soft: boolean = true) => {
    if (soft) {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, deleted_at: new Date().toISOString() } : c));
    } else {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
    logAuditAction('customer.deleted', 'customer', id);
  };

  const getCustomerById = (id: string) => customers.find(c => c.id === id && !c.deleted_at);

  // 2. VEHICLES
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      company_id: DEMO_COMPANY.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setVehicles(prev => [newVehicle, ...prev]);
    logAuditAction('vehicle.created', 'vehicle', newVehicle.id, { plate: newVehicle.license_plate });
    return enrichVehicle(newVehicle);
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicleData, updated_at: new Date().toISOString() } : v));
    logAuditAction('vehicle.updated', 'vehicle', id, vehicleData);
  };

  const deleteVehicle = (id: string, soft: boolean = true) => {
    if (soft) {
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, deleted_at: new Date().toISOString() } : v));
    } else {
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
    logAuditAction('vehicle.deleted', 'vehicle', id);
  };

  const getVehicleById = (id: string) => {
    const veh = vehicles.find(v => v.id === id && !v.deleted_at);
    return veh ? enrichVehicle(veh) : undefined;
  };

  const getVehiclesByCustomer = (customerId: string) => {
    return vehicles.filter(v => v.customer_id === customerId && !v.deleted_at).map(enrichVehicle);
  };

  // 3. QUOTES & VERSIONING
  const addQuote = (
    quoteData: Omit<Quote, 'id' | 'company_id' | 'quote_number' | 'current_version' | 'public_token' | 'created_at' | 'updated_at'>,
    items: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[]
  ): Quote => {
    const maxNum = quotes.reduce((max, q) => {
      const n = typeof q.quote_number === 'number' ? q.quote_number : parseInt(String(q.quote_number).replace(/\D/g, ''), 10) || 1000;
      return Math.max(max, n);
    }, 1000);
    const nextNumber = maxNum + 1;
    const token = `quote-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36).substring(4)}`;
    const quoteId = `quote-${Date.now()}`;

    const formattedItems: QuoteItem[] = items.map((it, idx) => ({
      ...it,
      id: `qi-${Date.now()}-${idx}`,
      company_id: DEMO_COMPANY.id,
      quote_id: quoteId,
    }));

    const initialVersion: QuoteVersion = {
      id: `qv-${Date.now()}-1`,
      quote_id: quoteId,
      company_id: DEMO_COMPANY.id,
      version_number: 1,
      subtotal: quoteData.subtotal,
      discount: quoteData.discount,
      total: quoteData.total,
      total_amount: quoteData.total,
      down_payment: quoteData.down_payment,
      balance: quoteData.balance,
      estimated_days: quoteData.estimated_days,
      notes: quoteData.notes,
      change_summary: 'Versão inicial gerada',
      items: formattedItems,
      items_snapshot: formattedItems,
      status: quoteData.status || 'draft',
      created_at: new Date().toISOString()
    };

    const newQuote: Quote = {
      ...quoteData,
      id: quoteId,
      company_id: DEMO_COMPANY.id,
      quote_number: `ORC-2026-${nextNumber}`,
      current_version: 1,
      version: 1,
      public_token: token,
      items: formattedItems,
      versions: [initialVersion],
      is_immutable: false,
      events: [
        {
          id: `qe-${Date.now()}`,
          company_id: DEMO_COMPANY.id,
          quote_id: quoteId,
          event_type: 'created',
          description: 'Orçamento versão v1 gerado',
          created_at: new Date().toISOString(),
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setQuotes(prev => [newQuote, ...prev]);
    logAuditAction('quote.created', 'quote', newQuote.id, { quote_number: newQuote.quote_number, total: newQuote.total });
    return enrichQuote(newQuote);
  };

  const updateQuote = (
    id: string,
    quoteData: Partial<Quote>,
    items?: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[]
  ): boolean => {
    const existing = quotes.find(q => q.id === id);
    if (!existing) return false;

    if (existing.status === 'approved' || existing.is_immutable) {
      console.warn('Orçamento aprovado é imutável. Crie uma nova versão para alterar.');
      return false;
    }

    setQuotes(prev => prev.map(q => {
      if (q.id !== id) return q;
      const formattedItems: QuoteItem[] | undefined = items ? items.map((it, idx) => ({
        ...it,
        id: (it as any).id || `qi-${Date.now()}-${idx}`,
        company_id: DEMO_COMPANY.id,
        quote_id: id,
      })) : q.items;

      return {
        ...q,
        ...quoteData,
        items: formattedItems,
        updated_at: new Date().toISOString(),
      };
    }));
    logAuditAction('quote.updated', 'quote', id, quoteData);
    return true;
  };

  const createNewQuoteVersion = (
    quoteId: string,
    quoteData: Partial<Quote>,
    items: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[],
    changeSummary?: string
  ): Quote => {
    const quote = quotes.find(q => q.id === quoteId);
    const nextVersionNum = ((quote?.current_version || quote?.version || 1) + 1);
    
    const formattedItems: QuoteItem[] = items.map((it, idx) => ({
      ...it,
      id: `qi-${Date.now()}-${idx}`,
      company_id: DEMO_COMPANY.id,
      quote_id: quoteId,
    }));

    const newVersion: QuoteVersion = {
      id: `qv-${Date.now()}-${nextVersionNum}`,
      quote_id: quoteId,
      company_id: DEMO_COMPANY.id,
      version_number: nextVersionNum,
      subtotal: quoteData.subtotal || quote?.subtotal || 0,
      discount: quoteData.discount || 0,
      total: quoteData.total || quote?.total || 0,
      total_amount: quoteData.total || quote?.total || 0,
      down_payment: quoteData.down_payment || 0,
      balance: quoteData.balance || 0,
      estimated_days: quoteData.estimated_days || 1,
      notes: quoteData.notes || quote?.notes,
      change_summary: changeSummary || `Revisão de valores / versão v${nextVersionNum}`,
      items: formattedItems,
      items_snapshot: formattedItems,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    let updatedQuote: Quote | null = null;
    setQuotes(prev => prev.map(q => {
      if (q.id !== quoteId) return q;
      const newEvent = {
        id: `qe-${Date.now()}`,
        company_id: DEMO_COMPANY.id,
        quote_id: quoteId,
        event_type: 'edited' as const,
        description: `Nova versão v${nextVersionNum} gerada (substitui v${q.current_version || 1})`,
        created_at: new Date().toISOString()
      };

      updatedQuote = {
        ...q,
        ...quoteData,
        current_version: nextVersionNum,
        version: nextVersionNum,
        status: 'sent',
        is_immutable: false,
        items: formattedItems,
        versions: [...(q.versions || []), newVersion],
        events: [...(q.events || []), newEvent],
        updated_at: new Date().toISOString()
      };
      return updatedQuote;
    }));

    logAuditAction('quote.version_created', 'quote', quoteId, { version: nextVersionNum });
    return updatedQuote ? enrichQuote(updatedQuote) : (quote as Quote);
  };

  const duplicateQuote = (quoteId: string): Quote | null => {
    const original = quotes.find(q => q.id === quoteId);
    if (!original) return null;

    const maxNum = quotes.reduce((max, q) => {
      const n = typeof q.quote_number === 'number' ? q.quote_number : parseInt(String(q.quote_number).replace(/\D/g, ''), 10) || 1000;
      return Math.max(max, n);
    }, 1000);
    const nextNumber = maxNum + 1;
    const token = `quote-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36).substring(4)}`;
    const newId = `quote-${Date.now()}`;

    const newQuote: Quote = {
      ...original,
      id: newId,
      quote_number: `ORC-2026-${nextNumber}`,
      current_version: 1,
      version: 1,
      status: 'draft',
      public_token: token,
      is_immutable: false,
      approved_at: undefined,
      rejected_at: undefined,
      approval_snapshot: undefined,
      events: [
        {
          id: `qe-${Date.now()}`,
          company_id: DEMO_COMPANY.id,
          quote_id: newId,
          event_type: 'created',
          description: `Orçamento duplicado a partir do #${original.quote_number}`,
          created_at: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setQuotes(prev => [newQuote, ...prev]);
    logAuditAction('quote.duplicated', 'quote', newId, { from_quote_number: original.quote_number });
    return enrichQuote(newQuote);
  };

  const updateQuoteStatus = (id: string, status: QuoteStatus, reason?: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id !== id) return q;
      const newEvent = {
        id: `qe-${Date.now()}`,
        company_id: DEMO_COMPANY.id,
        quote_id: id,
        event_type: status as any,
        description: `Status alterado para ${status}${reason ? `: ${reason}` : ''}`,
        created_at: new Date().toISOString(),
      };
      return {
        ...q,
        status,
        rejection_reason: reason || q.rejection_reason,
        events: [...(q.events || []), newEvent],
        updated_at: new Date().toISOString(),
      };
    }));
  };

  const recordQuoteRejection = (id: string, category: RejectionReasonCategory, notes?: string) => {
    updateQuoteStatus(id, 'rejected', notes || `Recusado: ${category}`);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, rejection_category: category, rejection_notes: notes } : q));
  };

  const getQuoteById = (id: string) => {
    const q = quotes.find(quote => quote.id === id && !quote.deleted_at);
    return q ? enrichQuote(q) : undefined;
  };

  const getQuoteByToken = (token: string) => {
    const q = quotes.find(quote => quote.public_token === token && !quote.public_token_revoked);
    return q ? enrichQuote(q) : undefined;
  };

  const approveQuotePublic = (token: string, approverName: string = 'Cliente', termsAgreed: boolean = true, clientIp?: string): Quote | null => {
    let updatedQuote: Quote | null = null;
    setQuotes(prev => prev.map(q => {
      if (q.public_token !== token) return q;
      
      const approvalSnapshot: QuoteApprovalSnapshot = {
        approved_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        approved_name: approverName,
        approved_by_name: approverName,
        approved_total: q.total,
        version_number: q.current_version || q.version || 1,
        terms_agreed: termsAgreed,
        terms_accepted: termsAgreed,
        client_ip: clientIp || '127.0.0.1',
        ip_address: clientIp || '127.0.0.1',
        user_agent: navigator.userAgent,
        items_snapshot: q.items || []
      };

      const newEvent = {
        id: `qe-${Date.now()}`,
        company_id: DEMO_COMPANY.id,
        quote_id: q.id,
        event_type: 'approved' as const,
        description: `Orçamento v${q.current_version || 1} aprovado por ${approverName} via link público`,
        metadata: { client_ip: clientIp || 'auto', approverName },
        created_at: new Date().toISOString(),
      };

      updatedQuote = {
        ...q,
        status: 'approved',
        approved_at: new Date().toISOString(),
        is_immutable: true,
        approval_snapshot: approvalSnapshot,
        client_ip: clientIp,
        events: [...(q.events || []), newEvent],
        updated_at: new Date().toISOString(),
      };
      return updatedQuote;
    }));

    if (updatedQuote) {
      logAuditAction('quote.approved', 'quote', (updatedQuote as any).id, { approver: approverName, total: (updatedQuote as any).total });
    }
    return updatedQuote ? enrichQuote(updatedQuote) : null;
  };

  const rejectQuotePublic = (token: string, category?: RejectionReasonCategory, reason?: string, notes?: string): Quote | null => {
    let updatedQuote: Quote | null = null;
    setQuotes(prev => prev.map(q => {
      if (q.public_token !== token) return q;
      const newEvent = {
        id: `qe-${Date.now()}`,
        company_id: DEMO_COMPANY.id,
        quote_id: q.id,
        event_type: 'rejected' as const,
        description: `Orçamento recusado pelo cliente (${category || 'Motivo geral'}: ${reason || 'Não informado'})`,
        created_at: new Date().toISOString(),
      };
      updatedQuote = {
        ...q,
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_category: category,
        rejection_reason: reason,
        rejection_notes: notes,
        events: [...(q.events || []), newEvent],
        updated_at: new Date().toISOString(),
      };
      return updatedQuote;
    }));

    if (updatedQuote) {
      logAuditAction('quote.rejected', 'quote', (updatedQuote as any).id, { category, reason });
    }
    return updatedQuote ? enrichQuote(updatedQuote) : null;
  };

  const convertQuoteToServiceOrder = (quoteId: string, responsibleName: string = 'Equipe Técnica'): ServiceOrder | null => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return null;

    const maxOS = serviceOrders.reduce((max, o) => {
      const n = typeof o.os_number === 'number' ? o.os_number : parseInt(String(o.os_number).replace(/\D/g, ''), 10) || 200;
      return Math.max(max, n);
    }, 200);
    const nextOSNumber = maxOS + 1;
    const token = `os-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36).substring(4)}`;
    const osId = `os-${Date.now()}`;

    const newOS: ServiceOrder = {
      id: osId,
      company_id: DEMO_COMPANY.id,
      quote_id: quote.id,
      customer_id: quote.customer_id,
      vehicle_id: quote.vehicle_id,
      os_number: nextOSNumber,
      status: 'received',
      public_token: token,
      responsible_name: responsibleName,
      customer_complaint: quote.customer_complaint || quote.notes || 'Serviço originado a partir do orçamento aprovado.',
      technical_diagnosis: quote.technical_diagnosis || quote.internal_notes || 'Inspeção aprovada conforme proposta.',
      recommended_solution: quote.recommended_solution || quote.items?.map(it => it.description).join(', '),
      start_date: new Date().toISOString(),
      estimated_completion_at: new Date(Date.now() + (quote.estimated_days || 1) * 24 * 60 * 60 * 1000).toISOString(),
      internal_estimated_delivery: new Date(Date.now() + (quote.estimated_days || 1) * 24 * 60 * 60 * 1000).toISOString(),
      promised_completion_at: new Date(Date.now() + (quote.estimated_days || 1) * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      promised_client_delivery: new Date(Date.now() + (quote.estimated_days || 1) * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      initial_mileage: vehicles.find(v => v.id === quote.vehicle_id)?.mileage || 0,
      warranty_days: 90,
      warranty_notes: 'Garantia legal de 90 dias referente a serviços prestados e peças aplicadas.',
      notes: quote.notes,
      internal_notes: quote.internal_notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setServiceOrders(prev => [newOS, ...prev]);

    if (quote.down_payment && quote.down_payment > 0) {
      addPayment({
        service_order_id: osId,
        quote_id: quote.id,
        amount: quote.down_payment,
        payment_type: 'pix',
        is_down_payment: true,
        payment_date: new Date().toISOString(),
        notes: 'Sinal registrado na aprovação do orçamento',
      });
    }

    updateQuoteStatus(quoteId, 'approved', `Convertido na OS #${nextOSNumber}`);
    logAuditAction('service_order.created_from_quote', 'service_order', osId, { quote_id: quoteId, os_number: nextOSNumber });
    return newOS;
  };

  // 4. SERVICE ORDERS
  const addServiceOrder = (
    osData: Omit<ServiceOrder, 'id' | 'company_id' | 'os_number' | 'public_token' | 'created_at' | 'updated_at'>
  ): ServiceOrder => {
    const maxOS = serviceOrders.reduce((max, o) => {
      const n = typeof o.os_number === 'number' ? o.os_number : parseInt(String(o.os_number).replace(/\D/g, ''), 10) || 200;
      return Math.max(max, n);
    }, 200);
    const nextOSNumber = maxOS + 1;
    const token = `os-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36).substring(4)}`;
    const newOS: ServiceOrder = {
      ...osData,
      id: `os-${Date.now()}`,
      company_id: DEMO_COMPANY.id,
      os_number: nextOSNumber,
      public_token: token,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setServiceOrders(prev => [newOS, ...prev]);
    logAuditAction('service_order.created', 'service_order', newOS.id, { os_number: nextOSNumber });
    return newOS;
  };

  const updateServiceOrder = (id: string, osData: Partial<ServiceOrder>) => {
    setServiceOrders(prev => prev.map(o => o.id === id ? { ...o, ...osData, updated_at: new Date().toISOString() } : o));
    logAuditAction('service_order.updated', 'service_order', id, osData);
  };

  const updateServiceOrderStatus = (id: string, status: ServiceOrderStatus, notes?: string) => {
    setServiceOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const updates: Partial<ServiceOrder> = { status, updated_at: new Date().toISOString() };
      if (status === 'ready' && !o.completed_at) {
        updates.completed_at = new Date().toISOString();
      }
      if (status === 'delivered' && !o.delivered_at) {
        updates.delivered_at = new Date().toISOString();
      }
      if (notes) {
        updates.internal_notes = o.internal_notes ? `${o.internal_notes}\n[${new Date().toLocaleTimeString()}]: ${notes}` : notes;
      }
      return { ...o, ...updates };
    }));
    logAuditAction('service_order.status_changed', 'service_order', id, { status, notes });
  };

  const getServiceOrderById = (id: string) => serviceOrders.find(o => o.id === id && !o.deleted_at);
  const getServiceOrderByToken = (token: string) => serviceOrders.find(o => o.public_token === token);

  const addServiceOrderPhoto = (osId: string, photo: Omit<ServiceOrderPhoto, 'id' | 'company_id' | 'service_order_id' | 'created_at'>) => {
    logAuditAction('service_order.photo_added', 'service_order', osId, { category: photo.category });
  };

  const addAdditionalApproval = (
    osId: string, 
    title: string, 
    description: string, 
    amount: number,
    partsAmount: number = 0,
    laborAmount: number = 0,
    photoUrl?: string
  ): AdditionalApproval => {
    const approval: AdditionalApproval = {
      id: `appr-${Date.now()}`,
      company_id: DEMO_COMPANY.id,
      service_order_id: osId,
      title,
      description,
      amount,
      parts_amount: partsAmount,
      labor_amount: laborAmount,
      photo_url: photoUrl,
      status: 'pending',
      public_token: `extra-${Math.random().toString(36).substring(2, 10)}`,
      requested_by: 'Mecânico Técnico',
      created_at: new Date().toISOString()
    };

    setServiceOrders(prev => prev.map(os => {
      if (os.id !== osId) return os;
      return {
        ...os,
        additional_approvals: [...(os.additional_approvals || []), approval]
      };
    }));

    logAuditAction('additional_approval.created', 'service_order', osId, { title, amount });
    return approval;
  };

  const respondAdditionalApproval = (approvalToken: string, approved: boolean, approverName: string = 'Cliente', reason?: string): boolean => {
    let found = false;
    setServiceOrders(prev => prev.map(os => {
      if (!os.additional_approvals) return os;
      const updatedApprovals = os.additional_approvals.map(appr => {
        if (appr.public_token === approvalToken) {
          found = true;
          return {
            ...appr,
            status: approved ? ('approved' as const) : ('rejected' as const),
            responded_at: new Date().toISOString(),
            responded_by_name: approverName,
            rejection_reason: reason
          };
        }
        return appr;
      });
      return { ...os, additional_approvals: updatedApprovals };
    }));

    if (found) {
      logAuditAction(approved ? 'additional_approval.approved' : 'additional_approval.rejected', 'additional_approval', approvalToken, { approver: approverName });
    }
    return found;
  };

  // 5. PAYMENTS
  const addPayment = (paymentData: Omit<Payment, 'id' | 'company_id' | 'created_at'>): Payment => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      company_id: DEMO_COMPANY.id,
      created_at: new Date().toISOString(),
    };
    setPayments(prev => [newPayment, ...prev]);
    logAuditAction('payment.created', 'payment', newPayment.id, { amount: newPayment.amount, type: newPayment.payment_type });
    return newPayment;
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, deleted_at: new Date().toISOString() } : p));
    logAuditAction('payment.deleted', 'payment', id);
  };

  const getPaymentsByOS = (osId: string) => {
    return payments.filter(p => p.service_order_id === osId && !p.deleted_at);
  };

  // 6. REMINDERS
  const addReminder = (reminderData: Omit<Reminder, 'id' | 'company_id' | 'created_at'>): Reminder => {
    const newReminder: Reminder = {
      ...reminderData,
      id: `rem-${Date.now()}`,
      company_id: DEMO_COMPANY.id,
      created_at: new Date().toISOString(),
    };
    setReminders(prev => [newReminder, ...prev]);
    logAuditAction('reminder.created', 'reminder', newReminder.id, { type: newReminder.type });
    return newReminder;
  };

  const updateReminderStatus = (id: string, status: Reminder['status']) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status, contacted_at: status === 'contacted' ? new Date().toISOString() : r.contacted_at } : r));
    logAuditAction('reminder.status_updated', 'reminder', id, { status });
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, deleted_at: new Date().toISOString() } : r));
  };

  // 7. CATALOG & PACKAGES
  const addCatalogItem = (item: Omit<ServiceCatalogItem, 'id' | 'company_id' | 'created_at'>): ServiceCatalogItem => {
    const newItem: ServiceCatalogItem = {
      ...item,
      id: `cat-${Date.now()}`,
      company_id: DEMO_COMPANY.id,
      use_count: 1,
      created_at: new Date().toISOString(),
    };
    setCatalog(prev => [...prev, newItem]);
    return newItem;
  };

  const toggleFavoriteCatalogItem = (id: string) => {
    setCatalog(prev => prev.map(c => c.id === id ? { ...c, is_favorite: !c.is_favorite } : c));
  };

  const deleteCatalogItem = (id: string) => {
    setCatalog(prev => prev.filter(c => c.id !== id));
  };

  const addPackage = (pkg: Omit<ServicePackage, 'id' | 'company_id' | 'created_at'>): ServicePackage => {
    const newPkg: ServicePackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      company_id: DEMO_COMPANY.id,
      created_at: new Date().toISOString()
    };
    setPackages(prev => [...prev, newPkg]);
    return newPkg;
  };

  const deletePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  // 8. FOLLOW-UP & DASHBOARD METRICS
  const getStagnantQuotes = (): Quote[] => {
    const twoDaysMs = 48 * 60 * 60 * 1000;
    return quotes.filter(q => {
      if (q.status !== 'sent' && q.status !== 'viewed') return false;
      const elapsed = Date.now() - new Date(q.created_at).getTime();
      return elapsed >= twoDaysMs && !q.deleted_at;
    });
  };

  const getLostQuotesBreakdown = () => {
    const rejected = quotes.filter(q => q.status === 'rejected' && !q.deleted_at);
    const categoryMap: Record<string, { count: number; total: number }> = {
      price: { count: 0, total: 0 },
      deadline: { count: 0, total: 0 },
      competitor: { count: 0, total: 0 },
      later: { count: 0, total: 0 },
      not_needed: { count: 0, total: 0 },
      gave_up: { count: 0, total: 0 },
      sold_car: { count: 0, total: 0 },
      other: { count: 0, total: 0 }
    };

    rejected.forEach(q => {
      const cat = q.rejection_category || 'other';
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, total: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].total += (q.total || 0);
    });

    const totalCount = rejected.length || 1;
    return Object.entries(categoryMap).map(([category, val]) => ({
      category,
      count: val.count,
      total: val.total,
      percentage: (val.count / totalCount) * 100
    }));
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const activeVehiclesCount = serviceOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && !o.deleted_at).length;
    const newQuotesCount = quotes.filter(q => (q.status === 'draft' || q.status === 'sent') && !q.deleted_at).length;
    
    const awaitingQuotes = quotes.filter(q => (q.status === 'sent' || q.status === 'viewed') && !q.deleted_at);
    const awaitingApprovalQuotesCount = awaitingQuotes.length;
    const awaitingApprovalAmount = awaitingQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

    const stagnant = getStagnantQuotes();
    const stagnantQuotesCount = stagnant.length;
    const stagnantQuotesAmount = stagnant.reduce((acc, q) => acc + (q.total || 0), 0);

    const approvedQuotes = quotes.filter(q => q.status === 'approved' && !q.deleted_at);
    const approvedQuotesCount = approvedQuotes.length;
    const totalQuotesSent = quotes.filter(q => q.status !== 'draft' && !q.deleted_at).length;
    const quoteConversionRate = totalQuotesSent > 0 ? (approvedQuotesCount / totalQuotesSent) * 100 : 0;

    const readyServicesCount = serviceOrders.filter(o => o.status === 'ready' && !o.deleted_at).length;

    const now = Date.now();
    const atRiskDeliveriesCount = serviceOrders.filter(o => {
      if (o.status === 'ready' || o.status === 'delivered' || o.status === 'cancelled' || o.deleted_at) return false;
      const targetTime = o.promised_client_delivery ? new Date(o.promised_client_delivery).getTime() : 
        o.promised_completion_at ? new Date(o.promised_completion_at).getTime() : null;
      if (!targetTime) return false;
      return targetTime - now <= 4 * 60 * 60 * 1000;
    }).length;

    const totalOSValue = serviceOrders.filter(o => !o.deleted_at).reduce((acc, os) => {
      const quote = quotes.find(q => q.id === os.quote_id);
      return acc + (quote?.total || 0);
    }, 0);
    const totalPaymentsReceived = payments.filter(p => !p.deleted_at).reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingPaymentAmount = Math.max(0, totalOSValue - totalPaymentsReceived);
    const estimatedRevenue = approvedQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

    const lostQuotes = quotes.filter(q => q.status === 'rejected' && !q.deleted_at);
    const lostQuotesCount = lostQuotes.length;
    const lostQuotesAmount = lostQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

    return {
      activeVehiclesCount,
      newQuotesCount,
      awaitingApprovalQuotesCount,
      awaitingApprovalAmount,
      stagnantQuotesCount,
      stagnantQuotesAmount,
      approvedQuotesCount,
      readyServicesCount,
      pendingPaymentAmount,
      estimatedRevenue,
      quoteConversionRate,
      totalQuotesSent,
      atRiskDeliveriesCount,
      lostQuotesAmount,
      lostQuotesCount
    };
  };

  // 9. GLOBAL SEARCH
  const searchGlobal = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return { customers: [], vehicles: [], quotes: [], serviceOrders: [] };

    const matchedCustomers = customers.filter(c => 
      !c.deleted_at && (
        c.name.toLowerCase().includes(q) || 
        c.phone?.toLowerCase().includes(q) || 
        c.whatsapp.toLowerCase().includes(q) ||
        c.document?.toLowerCase().includes(q)
      )
    );

    const matchedVehicles = vehicles.filter(v => 
      !v.deleted_at && (
        v.license_plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q)
      )
    );

    const matchedQuotes = quotes.filter(quote => 
      !quote.deleted_at && (
        quote.quote_number.toString().includes(q) ||
        quote.customer?.name.toLowerCase().includes(q) ||
        quote.vehicle?.license_plate.toLowerCase().includes(q)
      )
    );

    const matchedServiceOrders = serviceOrders.filter(os => 
      !os.deleted_at && (
        os.os_number.toString().includes(q) ||
        os.responsible_name?.toLowerCase().includes(q)
      )
    );

    return {
      customers: matchedCustomers,
      vehicles: matchedVehicles,
      quotes: matchedQuotes,
      serviceOrders: matchedServiceOrders
    };
  };

  // 10. RESET TO DEMO
  const resetAllDataToDemo = () => {
    setCustomers(DEMO_CUSTOMERS);
    setVehicles(DEMO_VEHICLES);
    setQuotes(DEMO_QUOTES);
    setServiceOrders(DEMO_SERVICE_ORDERS);
    setPayments(DEMO_PAYMENTS);
    setReminders(DEMO_REMINDERS);
    setCatalog(DEMO_CATALOG);
    setPackages(DEMO_PACKAGES);
    setAuditLogs(DEMO_AUDIT_LOGS);
    localStorage.removeItem('konnexy_customers');
    localStorage.removeItem('konnexy_vehicles');
    localStorage.removeItem('konnexy_quotes');
    localStorage.removeItem('konnexy_service_orders');
    localStorage.removeItem('konnexy_payments');
    localStorage.removeItem('konnexy_reminders');
    localStorage.removeItem('konnexy_catalog');
    localStorage.removeItem('konnexy_packages');
    localStorage.removeItem('konnexy_audit_logs');
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        vehicles,
        quotes,
        serviceOrders,
        payments,
        reminders,
        catalog,
        packages,
        servicePackages: packages,
        auditLogs,
        platformCompanies,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicleById,
        getVehiclesByCustomer,
        addQuote,
        updateQuote,
        createNewQuoteVersion,
        duplicateQuote,
        updateQuoteStatus,
        recordQuoteRejection,
        getQuoteById,
        getQuoteByToken,
        approveQuotePublic,
        rejectQuotePublic,
        convertQuoteToServiceOrder,
        addServiceOrder,
        updateServiceOrder,
        updateServiceOrderStatus,
        getServiceOrderById,
        getServiceOrderByToken,
        addServiceOrderPhoto,
        addAdditionalApproval,
        respondAdditionalApproval,
        addPayment,
        deletePayment,
        getPaymentsByOS,
        addReminder,
        updateReminderStatus,
        deleteReminder,
        addCatalogItem,
        toggleFavoriteCatalogItem,
        deleteCatalogItem,
        addPackage,
        deletePackage,
        getStagnantQuotes,
        getLostQuotesBreakdown,
        getDashboardMetrics,
        logAuditAction,
        searchGlobal,
        resetAllDataToDemo
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
