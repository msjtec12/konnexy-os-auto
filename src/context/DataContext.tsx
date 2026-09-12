import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  Company,
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
  DEMO_PLATFORM_COMPANIES,
} from '../lib/demoData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';

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
  isDataLoading: boolean;

  addCustomer: (customerData: Omit<Customer, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => Customer;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string, soft?: boolean) => void;
  getCustomerById: (id: string) => Customer | undefined;

  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => Vehicle;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => void;
  deleteVehicle: (id: string, soft?: boolean) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getVehiclesByCustomer: (customerId: string) => Vehicle[];

  addQuote: (
    quoteData: Omit<Quote, 'id' | 'company_id' | 'quote_number' | 'current_version' | 'public_token' | 'created_at' | 'updated_at'>,
    items: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[],
  ) => Quote;
  updateQuote: (
    id: string,
    quoteData: Partial<Quote>,
    items?: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[],
  ) => boolean;
  createNewQuoteVersion: (
    quoteId: string,
    quoteData: Partial<Quote>,
    items: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[],
    changeSummary?: string,
  ) => Quote;
  duplicateQuote: (quoteId: string) => Quote | null;
  updateQuoteStatus: (id: string, status: QuoteStatus, reason?: string) => void;
  recordQuoteRejection: (id: string, category: RejectionReasonCategory, notes?: string) => void;
  getQuoteById: (id: string) => Quote | undefined;
  getQuoteByToken: (token: string) => Quote | undefined;
  approveQuotePublic: (token: string, approverName?: string, termsAgreed?: boolean, clientIp?: string) => Quote | null;
  rejectQuotePublic: (token: string, category?: RejectionReasonCategory, reason?: string, notes?: string) => Quote | null;
  convertQuoteToServiceOrder: (quoteId: string, responsibleName?: string) => ServiceOrder | null;

  addServiceOrder: (
    osData: Omit<ServiceOrder, 'id' | 'company_id' | 'os_number' | 'public_token' | 'created_at' | 'updated_at'>,
    items?: Omit<ServiceOrderItem, 'id' | 'company_id' | 'service_order_id'>[],
  ) => ServiceOrder;
  updateServiceOrder: (id: string, osData: Partial<ServiceOrder>) => void;
  updateServiceOrderStatus: (id: string, status: ServiceOrderStatus, notes?: string) => void;
  getServiceOrderById: (id: string) => ServiceOrder | undefined;
  getServiceOrderByToken: (token: string) => ServiceOrder | undefined;
  addServiceOrderPhoto: (
    osId: string,
    photo: Omit<ServiceOrderPhoto, 'id' | 'company_id' | 'service_order_id' | 'created_at'>,
  ) => void;
  addAdditionalApproval: (
    osId: string,
    title: string,
    description: string,
    amount: number,
    partsAmount?: number,
    laborAmount?: number,
    photoUrl?: string,
  ) => AdditionalApproval;
  respondAdditionalApproval: (
    approvalToken: string,
    approved: boolean,
    approverName?: string,
    reason?: string,
  ) => boolean;

  addPayment: (paymentData: Omit<Payment, 'id' | 'company_id' | 'created_at'>) => Payment;
  deletePayment: (id: string) => void;
  getPaymentsByOS: (osId: string) => Payment[];

  addReminder: (reminderData: Omit<Reminder, 'id' | 'company_id' | 'created_at'>) => Reminder;
  updateReminderStatus: (id: string, status: Reminder['status']) => void;
  deleteReminder: (id: string) => void;

  addCatalogItem: (item: Omit<ServiceCatalogItem, 'id' | 'company_id' | 'created_at'>) => ServiceCatalogItem;
  toggleFavoriteCatalogItem: (id: string) => void;
  deleteCatalogItem: (id: string) => void;
  addPackage: (pkg: Omit<ServicePackage, 'id' | 'company_id' | 'created_at'>) => ServicePackage;
  deletePackage: (id: string) => void;

  getStagnantQuotes: () => Quote[];
  getLostQuotesBreakdown: () => { category: string; count: number; total: number; percentage: number }[];
  getDashboardMetrics: () => DashboardMetrics;
  logAuditAction: (action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) => void;
  searchGlobal: (query: string) => {
    customers: Customer[];
    vehicles: Vehicle[];
    quotes: Quote[];
    serviceOrders: ServiceOrder[];
  };

  resetAllDataToDemo: () => void;
  reloadData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEMO_STORAGE = {
  customers: 'konnexy_demo_customers',
  vehicles: 'konnexy_demo_vehicles',
  quotes: 'konnexy_demo_quotes',
  serviceOrders: 'konnexy_demo_service_orders',
  payments: 'konnexy_demo_payments',
  reminders: 'konnexy_demo_reminders',
  catalog: 'konnexy_demo_catalog',
  packages: 'konnexy_demo_packages',
  auditLogs: 'konnexy_demo_audit_logs',
};

const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

const secureToken = (prefix: string) => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const value = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${prefix}-${value}`;
};

const readDemo = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const numericQuoteNumber = (value: string | number) => {
  if (typeof value === 'number') return value;
  const last = value.match(/(\d+)$/)?.[1];
  return Number(last || 0);
};

const persistError = (operation: string, error: unknown) => {
  if (error) console.error(`[Supabase] ${operation}`, error);
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const { company, setCompany } = useTenant();
  const tenantId = user?.company_id || (isDemoMode ? company.id : undefined);
  const productionMode = Boolean(isSupabaseConfigured && supabase && user && !isDemoMode && user.company_id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [platformCompanies, setPlatformCompanies] = useState<Company[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const loadDemoData = () => {
    setCustomers(readDemo(DEMO_STORAGE.customers, DEMO_CUSTOMERS));
    setVehicles(readDemo(DEMO_STORAGE.vehicles, DEMO_VEHICLES));
    setQuotes(readDemo(DEMO_STORAGE.quotes, DEMO_QUOTES));
    setServiceOrders(readDemo(DEMO_STORAGE.serviceOrders, DEMO_SERVICE_ORDERS));
    setPayments(readDemo(DEMO_STORAGE.payments, DEMO_PAYMENTS));
    setReminders(readDemo(DEMO_STORAGE.reminders, DEMO_REMINDERS));
    setCatalog(readDemo(DEMO_STORAGE.catalog, DEMO_CATALOG));
    setPackages(readDemo(DEMO_STORAGE.packages, DEMO_PACKAGES));
    setAuditLogs(readDemo(DEMO_STORAGE.auditLogs, DEMO_AUDIT_LOGS));
    setPlatformCompanies(DEMO_PLATFORM_COMPANIES);
  };

  const reloadData = async () => {
    if (isDemoMode) {
      loadDemoData();
      return;
    }
    if (!supabase || !user?.company_id) return;

    setIsDataLoading(true);
    const companyId = user.company_id;

    try {
      const [
        customersResult,
        vehiclesResult,
        quotesResult,
        quoteItemsResult,
        quoteVersionsResult,
        quoteEventsResult,
        serviceOrdersResult,
        serviceOrderItemsResult,
        serviceOrderEventsResult,
        serviceOrderPhotosResult,
        approvalsResult,
        paymentsResult,
        remindersResult,
        catalogResult,
        packagesResult,
        auditResult,
      ] = await Promise.all([
        supabase.from('customers').select('*').eq('company_id', companyId).is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('vehicles').select('*').eq('company_id', companyId).is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('quotes').select('*').eq('company_id', companyId).is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('quote_items').select('*').eq('company_id', companyId),
        supabase.from('quote_versions').select('*').eq('company_id', companyId).order('version_number'),
        supabase.from('quote_events').select('*').eq('company_id', companyId).order('created_at'),
        supabase.from('service_orders').select('*').eq('company_id', companyId).is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('service_order_items').select('*').eq('company_id', companyId),
        supabase.from('service_order_events').select('*').eq('company_id', companyId).order('created_at'),
        supabase.from('service_order_photos').select('*').eq('company_id', companyId).order('created_at'),
        supabase.from('additional_approvals').select('*').eq('company_id', companyId).order('created_at'),
        supabase.from('payments').select('*').eq('company_id', companyId).is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('company_id', companyId).is('deleted_at', null).order('due_date'),
        supabase.from('services_catalog').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('service_packages').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(250),
      ]);

      const results = [
        customersResult,
        vehiclesResult,
        quotesResult,
        quoteItemsResult,
        quoteVersionsResult,
        quoteEventsResult,
        serviceOrdersResult,
        serviceOrderItemsResult,
        serviceOrderEventsResult,
        serviceOrderPhotosResult,
        approvalsResult,
        paymentsResult,
        remindersResult,
        catalogResult,
        packagesResult,
        auditResult,
      ];
      const firstError = results.find(result => result.error)?.error;
      if (firstError) throw firstError;

      const loadedCustomers = (customersResult.data || []) as Customer[];
      const loadedVehicles = (vehiclesResult.data || []) as Vehicle[];
      const loadedQuoteItems = (quoteItemsResult.data || []) as QuoteItem[];
      const loadedQuoteVersions = (quoteVersionsResult.data || []) as QuoteVersion[];
      const loadedServiceItems = (serviceOrderItemsResult.data || []) as ServiceOrderItem[];
      const loadedServicePhotos = (serviceOrderPhotosResult.data || []) as ServiceOrderPhoto[];
      const loadedApprovals = (approvalsResult.data || []) as AdditionalApproval[];

      setCustomers(loadedCustomers);
      setVehicles(loadedVehicles);
      setQuotes(((quotesResult.data || []) as Quote[]).map(q => ({
        ...q,
        version: q.current_version || 1,
        items: loadedQuoteItems.filter(item => item.quote_id === q.id),
        versions: loadedQuoteVersions.filter(version => version.quote_id === q.id),
        events: (quoteEventsResult.data || []).filter((event: { quote_id: string }) => event.quote_id === q.id),
      })));
      setServiceOrders(((serviceOrdersResult.data || []) as ServiceOrder[]).map(order => ({
        ...order,
        items: loadedServiceItems.filter(item => item.service_order_id === order.id),
        events: (serviceOrderEventsResult.data || []).filter((event: { service_order_id: string }) => event.service_order_id === order.id),
        photos: loadedServicePhotos.filter(photo => photo.service_order_id === order.id),
        additional_approvals: loadedApprovals.filter(approval => approval.service_order_id === order.id),
      })));
      setPayments((paymentsResult.data || []) as Payment[]);
      setReminders(((remindersResult.data || []) as Reminder[]).map(reminder => ({
        ...reminder,
        customer: loadedCustomers.find(customer => customer.id === reminder.customer_id),
        vehicle: loadedVehicles.find(vehicle => vehicle.id === reminder.vehicle_id),
      })));
      setCatalog((catalogResult.data || []) as ServiceCatalogItem[]);
      setPackages((packagesResult.data || []) as ServicePackage[]);
      setAuditLogs((auditResult.data || []) as AuditLog[]);

      if (user.is_superadmin || user.role === 'superadmin') {
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });
        if (companiesError) throw companiesError;
        setPlatformCompanies((companiesData || []) as Company[]);
      } else {
        setPlatformCompanies([]);
      }
    } catch (error) {
      persistError('Falha ao carregar dados do tenant.', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
      return;
    }

    if (productionMode) void reloadData();
  }, [isDemoMode, productionMode, user?.company_id]);

  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.customers, JSON.stringify(customers));
  }, [customers, isDemoMode]);
  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.vehicles, JSON.stringify(vehicles));
  }, [vehicles, isDemoMode]);
  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.quotes, JSON.stringify(quotes));
  }, [quotes, isDemoMode]);
  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.serviceOrders, JSON.stringify(serviceOrders));
  }, [serviceOrders, isDemoMode]);
  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.payments, JSON.stringify(payments));
  }, [payments, isDemoMode]);
  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.reminders, JSON.stringify(reminders));
  }, [reminders, isDemoMode]);
  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.catalog, JSON.stringify(catalog));
  }, [catalog, isDemoMode]);
  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.packages, JSON.stringify(packages));
  }, [packages, isDemoMode]);
  useEffect(() => {
    if (!isDemoMode) return;
    localStorage.setItem(DEMO_STORAGE.auditLogs, JSON.stringify(auditLogs));
  }, [auditLogs, isDemoMode]);

  // Public pages receive only a sanitized payload from SECURITY DEFINER RPCs.
  useEffect(() => {
    if (!supabase || isDemoMode) return;

    const quoteMatch = window.location.pathname.match(/^\/orcamento\/([^/]+)$/);
    const trackingMatch = window.location.pathname.match(/^\/acompanhar\/([^/]+)$/);

    if (quoteMatch) {
      const token = decodeURIComponent(quoteMatch[1]);
      void supabase.rpc('get_public_quote', { p_token: token }).then(({ data, error }) => {
        if (error || !data) {
          persistError('Falha ao carregar orçamento público.', error);
          return;
        }
        const payload = data as { quote?: Quote; company?: Company };
        if (!payload.quote) return;
        const publicQuote = payload.quote;
        setQuotes([publicQuote]);
        if (publicQuote.customer) setCustomers([publicQuote.customer]);
        if (publicQuote.vehicle) setVehicles([publicQuote.vehicle]);
        if (payload.company) setCompany(payload.company);
      });
    }

    if (trackingMatch) {
      const token = decodeURIComponent(trackingMatch[1]);
      void supabase.rpc('get_public_service_order', { p_token: token }).then(({ data, error }) => {
        if (error || !data) {
          persistError('Falha ao carregar acompanhamento público.', error);
          return;
        }
        const payload = data as { service_order?: ServiceOrder; company?: Company };
        if (!payload.service_order) return;
        const order = payload.service_order;
        setServiceOrders([order]);
        if (order.customer) setCustomers([order.customer]);
        if (order.vehicle) setVehicles([order.vehicle]);
        if (payload.company) setCompany(payload.company);
      });
    }
  }, [isDemoMode, setCompany]);

  const activeCompanyId = () => tenantId || company.id || DEMO_COMPANY.id;

  const logAuditAction = (
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ) => {
    const log: AuditLog = {
      id: uuid(),
      company_id: activeCompanyId(),
      user_id: user?.id,
      user_name: user?.full_name || 'Sistema',
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: nowIso(),
    };
    setAuditLogs(prev => [log, ...prev]);

    if (productionMode && supabase) {
      void supabase.from('audit_logs').insert(log).then(({ error }) => persistError('audit_logs.insert', error));
    }
  };

  const enrichVehicle = (vehicle: Vehicle): Vehicle => ({
    ...vehicle,
    customer: customers.find(customer => customer.id === vehicle.customer_id),
  });

  const enrichQuote = (quote: Quote): Quote => ({
    ...quote,
    version: quote.current_version || quote.version || 1,
    customer: customers.find(customer => customer.id === quote.customer_id) || quote.customer,
    vehicle: vehicles.find(vehicle => vehicle.id === quote.vehicle_id) || quote.vehicle,
  });

  const addCustomer = (customerData: Omit<Customer, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Customer => {
    const customer: Customer = {
      ...customerData,
      id: uuid(),
      company_id: activeCompanyId(),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    setCustomers(prev => [customer, ...prev]);
    if (productionMode && supabase) {
      void supabase.from('customers').insert(customer).then(({ error }) => persistError('customers.insert', error));
    }
    logAuditAction('customer.created', 'customer', customer.id, { name: customer.name });
    return customer;
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    const safe = { ...customerData, id: undefined, company_id: undefined, updated_at: nowIso() };
    delete safe.id;
    delete safe.company_id;
    setCustomers(prev => prev.map(customer => customer.id === id ? { ...customer, ...safe } : customer));
    if (productionMode && supabase) {
      void supabase.from('customers').update(safe).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('customers.update', error));
    }
    logAuditAction('customer.updated', 'customer', id, customerData as Record<string, unknown>);
  };

  const deleteCustomer = (id: string, soft = true) => {
    if (soft) {
      const deletedAt = nowIso();
      setCustomers(prev => prev.map(customer => customer.id === id ? { ...customer, deleted_at: deletedAt } : customer));
      if (productionMode && supabase) {
        void supabase.from('customers').update({ deleted_at: deletedAt }).eq('id', id).eq('company_id', activeCompanyId())
          .then(({ error }) => persistError('customers.soft_delete', error));
      }
    } else {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      if (productionMode && supabase) {
        void supabase.from('customers').delete().eq('id', id).eq('company_id', activeCompanyId())
          .then(({ error }) => persistError('customers.delete', error));
      }
    }
    logAuditAction('customer.deleted', 'customer', id);
  };

  const getCustomerById = (id: string) => customers.find(customer => customer.id === id && !customer.deleted_at);

  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Vehicle => {
    const { customer: _customer, ...dbData } = vehicleData;
    const vehicle: Vehicle = {
      ...dbData,
      id: uuid(),
      company_id: activeCompanyId(),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    setVehicles(prev => [vehicle, ...prev]);
    if (productionMode && supabase) {
      void supabase.from('vehicles').insert(vehicle).then(({ error }) => persistError('vehicles.insert', error));
    }
    logAuditAction('vehicle.created', 'vehicle', vehicle.id, { plate: vehicle.license_plate });
    return enrichVehicle(vehicle);
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    const { customer: _customer, id: _id, company_id: _companyId, ...safe } = vehicleData;
    const patch = { ...safe, updated_at: nowIso() };
    setVehicles(prev => prev.map(vehicle => vehicle.id === id ? { ...vehicle, ...patch } : vehicle));
    if (productionMode && supabase) {
      void supabase.from('vehicles').update(patch).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('vehicles.update', error));
    }
    logAuditAction('vehicle.updated', 'vehicle', id, safe as Record<string, unknown>);
  };

  const deleteVehicle = (id: string, soft = true) => {
    if (soft) {
      const deletedAt = nowIso();
      setVehicles(prev => prev.map(vehicle => vehicle.id === id ? { ...vehicle, deleted_at: deletedAt } : vehicle));
      if (productionMode && supabase) {
        void supabase.from('vehicles').update({ deleted_at: deletedAt }).eq('id', id).eq('company_id', activeCompanyId())
          .then(({ error }) => persistError('vehicles.soft_delete', error));
      }
    } else {
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      if (productionMode && supabase) {
        void supabase.from('vehicles').delete().eq('id', id).eq('company_id', activeCompanyId())
          .then(({ error }) => persistError('vehicles.delete', error));
      }
    }
    logAuditAction('vehicle.deleted', 'vehicle', id);
  };

  const getVehicleById = (id: string) => {
    const vehicle = vehicles.find(item => item.id === id && !item.deleted_at);
    return vehicle ? enrichVehicle(vehicle) : undefined;
  };
  const getVehiclesByCustomer = (customerId: string) => vehicles
    .filter(vehicle => vehicle.customer_id === customerId && !vehicle.deleted_at)
    .map(enrichVehicle);

  const quoteDbRow = (quote: Quote, includeNumber = true) => {
    const {
      customer: _customer,
      vehicle: _vehicle,
      items: _items,
      versions: _versions,
      events: _events,
      version: _version,
      total_amount: _totalAmount,
      ...row
    } = quote;
    if (!includeNumber) delete (row as Partial<Quote>).quote_number;
    return row;
  };

  const addQuote = (
    quoteData: Omit<Quote, 'id' | 'company_id' | 'quote_number' | 'current_version' | 'public_token' | 'created_at' | 'updated_at'>,
    items: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[],
  ): Quote => {
    const companyId = activeCompanyId();
    const id = uuid();
    const maxNumber = quotes.reduce((max, quote) => Math.max(max, numericQuoteNumber(quote.quote_number)), 1000);
    const formattedItems: QuoteItem[] = items.map(item => ({ ...item, id: uuid(), company_id: companyId, quote_id: id }));
    const version: QuoteVersion = {
      id: uuid(),
      quote_id: id,
      company_id: companyId,
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
      created_at: nowIso(),
      created_by: user?.id,
    };
    const event = {
      id: uuid(),
      company_id: companyId,
      quote_id: id,
      event_type: 'created' as const,
      description: 'Orçamento versão v1 gerado',
      created_at: nowIso(),
    };
    const quote: Quote = {
      ...quoteData,
      id,
      company_id: companyId,
      quote_number: maxNumber + 1,
      current_version: 1,
      version: 1,
      public_token: secureToken('quote'),
      public_token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      public_token_revoked: false,
      items: formattedItems,
      versions: [version],
      events: [event],
      is_immutable: false,
      created_by: user?.id,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    setQuotes(prev => [quote, ...prev]);

    if (productionMode && supabase) {
      void supabase.from('quotes').insert(quoteDbRow(quote, false)).select('quote_number').single().then(async ({ data, error }) => {
        if (error) {
          persistError('quotes.insert', error);
          return;
        }
        if (data?.quote_number) {
          setQuotes(prev => prev.map(item => item.id === id ? { ...item, quote_number: data.quote_number } : item));
        }
        const [itemsInsert, versionInsert, eventInsert] = await Promise.all([
          supabase.from('quote_items').insert(formattedItems),
          supabase.from('quote_versions').insert({
            id: version.id,
            quote_id: id,
            company_id: companyId,
            version_number: 1,
            subtotal: version.subtotal,
            discount: version.discount,
            total: version.total,
            down_payment: version.down_payment,
            balance: version.balance,
            estimated_days: version.estimated_days,
            notes: version.notes,
            items_snapshot: formattedItems,
            status: version.status,
            created_by: user?.id,
            created_at: version.created_at,
          }),
          supabase.from('quote_events').insert(event),
        ]);
        persistError('quote_items.insert', itemsInsert.error);
        persistError('quote_versions.insert', versionInsert.error);
        persistError('quote_events.insert', eventInsert.error);
      });
    }

    logAuditAction('quote.created', 'quote', id, { total: quote.total });
    return enrichQuote(quote);
  };

  const updateQuote = (
    id: string,
    quoteData: Partial<Quote>,
    items?: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[],
  ): boolean => {
    const existing = quotes.find(quote => quote.id === id);
    if (!existing || existing.status === 'approved' || existing.is_immutable) return false;

    const formattedItems = items?.map(item => ({
      ...item,
      id: (item as QuoteItem).id || uuid(),
      company_id: activeCompanyId(),
      quote_id: id,
    }));
    const { customer: _customer, vehicle: _vehicle, versions: _versions, events: _events, items: _oldItems, ...safeData } = quoteData;
    const patch = { ...safeData, updated_at: nowIso() };
    setQuotes(prev => prev.map(quote => quote.id === id ? { ...quote, ...patch, items: formattedItems || quote.items } : quote));

    if (productionMode && supabase) {
      void supabase.from('quotes').update(patch).eq('id', id).eq('company_id', activeCompanyId()).then(async ({ error }) => {
        persistError('quotes.update', error);
        if (!error && formattedItems) {
          const deleted = await supabase.from('quote_items').delete().eq('quote_id', id).eq('company_id', activeCompanyId());
          persistError('quote_items.replace.delete', deleted.error);
          const inserted = await supabase.from('quote_items').insert(formattedItems);
          persistError('quote_items.replace.insert', inserted.error);
        }
      });
    }
    logAuditAction('quote.updated', 'quote', id, safeData as Record<string, unknown>);
    return true;
  };

  const createNewQuoteVersion = (
    quoteId: string,
    quoteData: Partial<Quote>,
    items: Omit<QuoteItem, 'id' | 'company_id' | 'quote_id'>[],
    changeSummary?: string,
  ): Quote => {
    const existing = quotes.find(quote => quote.id === quoteId);
    if (!existing) throw new Error('Orçamento não encontrado.');

    const companyId = activeCompanyId();
    const nextVersion = (existing.current_version || existing.version || 1) + 1;
    const formattedItems: QuoteItem[] = items.map(item => ({ ...item, id: uuid(), company_id: companyId, quote_id: quoteId }));
    const version: QuoteVersion = {
      id: uuid(),
      quote_id: quoteId,
      company_id: companyId,
      version_number: nextVersion,
      subtotal: quoteData.subtotal ?? existing.subtotal,
      discount: quoteData.discount ?? existing.discount,
      total: quoteData.total ?? existing.total,
      total_amount: quoteData.total ?? existing.total,
      down_payment: quoteData.down_payment ?? existing.down_payment,
      balance: quoteData.balance ?? existing.balance,
      estimated_days: quoteData.estimated_days ?? existing.estimated_days,
      notes: quoteData.notes ?? existing.notes,
      change_summary: changeSummary || `Revisão v${nextVersion}`,
      items: formattedItems,
      items_snapshot: formattedItems,
      status: 'sent',
      created_at: nowIso(),
      created_by: user?.id,
    };
    const event = {
      id: uuid(),
      company_id: companyId,
      quote_id: quoteId,
      event_type: 'edited' as const,
      description: `Nova versão v${nextVersion} gerada`,
      created_at: nowIso(),
    };
    const updated: Quote = {
      ...existing,
      ...quoteData,
      current_version: nextVersion,
      version: nextVersion,
      status: 'sent',
      is_immutable: false,
      approved_at: undefined,
      approval_snapshot: undefined,
      items: formattedItems,
      versions: [...(existing.versions || []), version],
      events: [...(existing.events || []), event],
      updated_at: nowIso(),
    };
    setQuotes(prev => prev.map(quote => quote.id === quoteId ? updated : quote));

    if (productionMode && supabase) {
      const row = quoteDbRow(updated);
      void supabase.from('quotes').update(row).eq('id', quoteId).eq('company_id', companyId).then(async ({ error }) => {
        persistError('quotes.new_version.update', error);
        if (error) return;
        const deleted = await supabase.from('quote_items').delete().eq('quote_id', quoteId).eq('company_id', companyId);
        persistError('quote_items.new_version.delete', deleted.error);
        const [itemsInsert, versionInsert, eventInsert] = await Promise.all([
          supabase.from('quote_items').insert(formattedItems),
          supabase.from('quote_versions').insert({
            id: version.id,
            quote_id: quoteId,
            company_id: companyId,
            version_number: nextVersion,
            subtotal: version.subtotal,
            discount: version.discount,
            total: version.total,
            down_payment: version.down_payment,
            balance: version.balance,
            estimated_days: version.estimated_days,
            notes: version.notes,
            items_snapshot: formattedItems,
            status: 'sent',
            created_by: user?.id,
            created_at: version.created_at,
          }),
          supabase.from('quote_events').insert(event),
        ]);
        persistError('quote_items.new_version.insert', itemsInsert.error);
        persistError('quote_versions.new_version.insert', versionInsert.error);
        persistError('quote_events.new_version.insert', eventInsert.error);
      });
    }
    logAuditAction('quote.version_created', 'quote', quoteId, { version: nextVersion });
    return enrichQuote(updated);
  };

  const duplicateQuote = (quoteId: string): Quote | null => {
    const original = quotes.find(quote => quote.id === quoteId);
    if (!original) return null;
    return addQuote({
      customer_id: original.customer_id,
      vehicle_id: original.vehicle_id,
      status: 'draft',
      subtotal: original.subtotal,
      discount: original.discount,
      total: original.total,
      down_payment: original.down_payment,
      balance: original.balance,
      estimated_days: original.estimated_days,
      notes: original.notes,
      internal_notes: original.internal_notes,
      customer_complaint: original.customer_complaint,
      technical_diagnosis: original.technical_diagnosis,
      recommended_solution: original.recommended_solution,
      version: 1,
      is_immutable: false,
      public_token_expires_at: undefined,
      public_token_revoked: false,
      approved_at: undefined,
      rejected_at: undefined,
      rejection_category: undefined,
      rejection_reason: undefined,
      rejection_notes: undefined,
      client_ip: undefined,
      approval_snapshot: undefined,
      created_by: user?.id,
      deleted_at: undefined,
      customer: undefined,
      vehicle: undefined,
      items: undefined,
      versions: undefined,
      events: undefined,
      total_amount: original.total,
    }, (original.items || []).map(item => ({
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      total_price: item.total_price,
      created_at: undefined,
    })));
  };

  const updateQuoteStatus = (id: string, status: QuoteStatus, reason?: string) => {
    const patch: Partial<Quote> = { status, updated_at: nowIso() };
    if (status === 'rejected') {
      patch.rejected_at = nowIso();
      if (reason) patch.rejection_reason = reason;
    }
    setQuotes(prev => prev.map(quote => quote.id === id ? { ...quote, ...patch } : quote));
    if (productionMode && supabase) {
      void supabase.from('quotes').update(patch).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('quotes.status', error));
    }
    logAuditAction('quote.status_changed', 'quote', id, { status, reason });
  };

  const recordQuoteRejection = (id: string, category: RejectionReasonCategory, notes?: string) => {
    const patch = {
      status: 'rejected' as QuoteStatus,
      rejected_at: nowIso(),
      rejection_category: category,
      rejection_reason: notes,
      rejection_notes: notes,
      updated_at: nowIso(),
    };
    setQuotes(prev => prev.map(quote => quote.id === id ? { ...quote, ...patch } : quote));
    if (productionMode && supabase) {
      void supabase.from('quotes').update(patch).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('quotes.reject', error));
    }
    logAuditAction('quote.rejected', 'quote', id, { category, notes });
  };

  const getQuoteById = (id: string) => {
    const quote = quotes.find(item => item.id === id && !item.deleted_at);
    return quote ? enrichQuote(quote) : undefined;
  };
  const getQuoteByToken = (token: string) => {
    const quote = quotes.find(item => item.public_token === token && !item.public_token_revoked);
    if (!quote) return undefined;
    if (quote.public_token_expires_at && new Date(quote.public_token_expires_at).getTime() < Date.now()) return undefined;
    return enrichQuote(quote);
  };

  const approveQuotePublic = (
    token: string,
    approverName = 'Cliente',
    termsAgreed = true,
    _clientIp?: string,
  ): Quote | null => {
    const existing = getQuoteByToken(token);
    if (!existing || !termsAgreed) return null;

    const snapshot: QuoteApprovalSnapshot = {
      approved_at: nowIso(),
      timestamp: nowIso(),
      approved_name: approverName,
      approved_by_name: approverName,
      approved_total: existing.total,
      version_number: existing.current_version || existing.version || 1,
      terms_agreed: true,
      terms_accepted: true,
      user_agent: navigator.userAgent,
      items_snapshot: existing.items || [],
    };
    const updated: Quote = {
      ...existing,
      status: 'approved',
      approved_at: nowIso(),
      is_immutable: true,
      approval_snapshot: snapshot,
      updated_at: nowIso(),
    };
    setQuotes(prev => prev.map(quote => quote.public_token === token ? updated : quote));

    if (!isDemoMode && supabase) {
      void supabase.rpc('approve_public_quote', {
        p_token: token,
        p_approver_name: approverName,
        p_terms_agreed: true,
        p_user_agent: navigator.userAgent,
      }).then(({ error }) => persistError('approve_public_quote', error));
    }
    return enrichQuote(updated);
  };

  const rejectQuotePublic = (
    token: string,
    category: RejectionReasonCategory = 'other',
    reason?: string,
    notes?: string,
  ): Quote | null => {
    const existing = getQuoteByToken(token);
    if (!existing) return null;
    const updated: Quote = {
      ...existing,
      status: 'rejected',
      rejected_at: nowIso(),
      rejection_category: category,
      rejection_reason: reason,
      rejection_notes: notes,
      updated_at: nowIso(),
    };
    setQuotes(prev => prev.map(quote => quote.public_token === token ? updated : quote));

    if (!isDemoMode && supabase) {
      void supabase.rpc('reject_public_quote', {
        p_token: token,
        p_category: category,
        p_reason: reason || null,
        p_notes: notes || null,
      }).then(({ error }) => persistError('reject_public_quote', error));
    }
    return enrichQuote(updated);
  };

  const serviceOrderDbRow = (order: ServiceOrder, includeNumber = true) => {
    const {
      customer: _customer,
      vehicle: _vehicle,
      items: _items,
      events: _events,
      photos: _photos,
      additional_approvals: _approvals,
      estimated_completion_date: _estimatedCompletionDate,
      ...row
    } = order;
    if (!includeNumber) delete (row as Partial<ServiceOrder>).os_number;
    return row;
  };

  const addServiceOrder = (
    osData: Omit<ServiceOrder, 'id' | 'company_id' | 'os_number' | 'public_token' | 'created_at' | 'updated_at'>,
    items: Omit<ServiceOrderItem, 'id' | 'company_id' | 'service_order_id'>[] = [],
  ): ServiceOrder => {
    const companyId = activeCompanyId();
    const id = uuid();
    const nextNumber = serviceOrders.reduce((max, order) => Math.max(max, Number(order.os_number) || 0), 200) + 1;
    const formattedItems: ServiceOrderItem[] = items.map(item => ({ ...item, id: uuid(), company_id: companyId, service_order_id: id }));
    const order: ServiceOrder = {
      ...osData,
      id,
      company_id: companyId,
      os_number: nextNumber,
      public_token: secureToken('os'),
      items: formattedItems,
      created_by: user?.id,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    setServiceOrders(prev => [order, ...prev]);

    if (productionMode && supabase) {
      void supabase.from('service_orders').insert(serviceOrderDbRow(order, false)).select('os_number').single().then(async ({ data, error }) => {
        if (error) {
          persistError('service_orders.insert', error);
          return;
        }
        if (data?.os_number) setServiceOrders(prev => prev.map(item => item.id === id ? { ...item, os_number: data.os_number } : item));
        if (formattedItems.length) {
          const result = await supabase.from('service_order_items').insert(formattedItems);
          persistError('service_order_items.insert', result.error);
        }
      });
    }
    logAuditAction('service_order.created', 'service_order', id, { os_number: nextNumber });
    return order;
  };

  const convertQuoteToServiceOrder = (quoteId: string, responsibleName = 'Equipe Técnica'): ServiceOrder | null => {
    const quote = quotes.find(item => item.id === quoteId);
    if (!quote) return null;
    const order = addServiceOrder({
      quote_id: quote.id,
      customer_id: quote.customer_id,
      vehicle_id: quote.vehicle_id,
      status: 'received',
      responsible_name: responsibleName,
      customer_complaint: quote.customer_complaint || quote.notes,
      technical_diagnosis: quote.technical_diagnosis,
      recommended_solution: quote.recommended_solution,
      start_date: nowIso(),
      estimated_completion_at: new Date(Date.now() + (quote.estimated_days || 1) * 86_400_000).toISOString(),
      promised_completion_at: new Date(Date.now() + (quote.estimated_days || 1) * 86_400_000 + 14_400_000).toISOString(),
      initial_mileage: vehicles.find(vehicle => vehicle.id === quote.vehicle_id)?.mileage || 0,
      warranty_days: 90,
      warranty_notes: 'Garantia legal aplicável conforme o serviço executado e a legislação vigente.',
      notes: quote.notes,
      internal_notes: quote.internal_notes,
      created_by: user?.id,
      deleted_at: undefined,
      customer: undefined,
      vehicle: undefined,
      items: undefined,
      events: undefined,
      photos: undefined,
      additional_approvals: undefined,
      responsible_id: undefined,
      diagnosed_by: undefined,
      diagnosed_at: undefined,
      estimated_completion_date: undefined,
      internal_estimated_delivery: undefined,
      promised_client_delivery: undefined,
      completed_at: undefined,
      delivered_at: undefined,
      final_mileage: undefined,
    }, (quote.items || []).map(item => ({
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      created_at: undefined,
    })));

    if (quote.down_payment && quote.down_payment > 0) {
      addPayment({
        service_order_id: order.id,
        quote_id: quote.id,
        amount: quote.down_payment,
        payment_type: 'pix',
        is_down_payment: true,
        payment_date: nowIso(),
        notes: 'Sinal registrado na aprovação do orçamento',
        deleted_at: undefined,
      });
    }
    updateQuoteStatus(quoteId, 'approved', `Convertido na OS #${order.os_number}`);
    return order;
  };

  const updateServiceOrder = (id: string, osData: Partial<ServiceOrder>) => {
    const { customer: _customer, vehicle: _vehicle, items: _items, events: _events, photos: _photos, additional_approvals: _approvals, ...safe } = osData;
    const patch = { ...safe, updated_at: nowIso() };
    setServiceOrders(prev => prev.map(order => order.id === id ? { ...order, ...patch } : order));
    if (productionMode && supabase) {
      void supabase.from('service_orders').update(patch).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('service_orders.update', error));
    }
    logAuditAction('service_order.updated', 'service_order', id, safe as Record<string, unknown>);
  };

  const updateServiceOrderStatus = (id: string, status: ServiceOrderStatus, notes?: string) => {
    const existing = serviceOrders.find(order => order.id === id);
    if (!existing) return;
    const patch: Partial<ServiceOrder> = { status, updated_at: nowIso() };
    if (status === 'ready' && !existing.completed_at) patch.completed_at = nowIso();
    if (status === 'delivered' && !existing.delivered_at) patch.delivered_at = nowIso();
    if (notes) patch.internal_notes = existing.internal_notes ? `${existing.internal_notes}\n[${new Date().toLocaleString('pt-BR')}]: ${notes}` : notes;
    setServiceOrders(prev => prev.map(order => order.id === id ? { ...order, ...patch } : order));

    if (productionMode && supabase) {
      void supabase.from('service_orders').update(patch).eq('id', id).eq('company_id', activeCompanyId()).then(async ({ error }) => {
        persistError('service_orders.status', error);
        if (!error) {
          const event = await supabase.from('service_order_events').insert({
            id: uuid(),
            company_id: activeCompanyId(),
            service_order_id: id,
            status_from: existing.status,
            status_to: status,
            notes,
            created_by_name: user?.full_name,
            created_at: nowIso(),
          });
          persistError('service_order_events.insert', event.error);
        }
      });
    }
    logAuditAction('service_order.status_changed', 'service_order', id, { status, notes });
  };

  const getServiceOrderById = (id: string) => serviceOrders.find(order => order.id === id && !order.deleted_at);
  const getServiceOrderByToken = (token: string) => serviceOrders.find(order => order.public_token === token && !order.deleted_at);

  const addServiceOrderPhoto = (
    osId: string,
    photoData: Omit<ServiceOrderPhoto, 'id' | 'company_id' | 'service_order_id' | 'created_at'>,
  ) => {
    const photo: ServiceOrderPhoto = {
      ...photoData,
      id: uuid(),
      company_id: activeCompanyId(),
      service_order_id: osId,
      created_at: nowIso(),
    };
    setServiceOrders(prev => prev.map(order => order.id === osId ? { ...order, photos: [...(order.photos || []), photo] } : order));
    if (productionMode && supabase) {
      void supabase.from('service_order_photos').insert(photo).then(({ error }) => persistError('service_order_photos.insert', error));
    }
    logAuditAction('service_order.photo_added', 'service_order', osId, { category: photo.category });
  };

  const addAdditionalApproval = (
    osId: string,
    title: string,
    description: string,
    amount: number,
    partsAmount = 0,
    laborAmount = 0,
    photoUrl?: string,
  ): AdditionalApproval => {
    const approval: AdditionalApproval = {
      id: uuid(),
      company_id: activeCompanyId(),
      service_order_id: osId,
      title,
      description,
      amount,
      parts_amount: partsAmount,
      labor_amount: laborAmount,
      photo_url: photoUrl,
      status: 'pending',
      public_token: secureToken('extra'),
      requested_by: user?.full_name || 'Equipe Técnica',
      created_at: nowIso(),
    };
    setServiceOrders(prev => prev.map(order => order.id === osId ? {
      ...order,
      additional_approvals: [...(order.additional_approvals || []), approval],
    } : order));
    if (productionMode && supabase) {
      void supabase.from('additional_approvals').insert(approval).then(({ error }) => persistError('additional_approvals.insert', error));
    }
    logAuditAction('additional_approval.created', 'service_order', osId, { title, amount });
    return approval;
  };

  const respondAdditionalApproval = (
    approvalToken: string,
    approved: boolean,
    approverName = 'Cliente',
    reason?: string,
  ): boolean => {
    let found = false;
    setServiceOrders(prev => prev.map(order => {
      if (!(order.additional_approvals || []).some(approval => approval.public_token === approvalToken)) return order;
      found = true;
      return {
        ...order,
        additional_approvals: (order.additional_approvals || []).map(approval => approval.public_token === approvalToken ? {
          ...approval,
          status: approved ? 'approved' : 'rejected',
          responded_at: nowIso(),
          responded_by_name: approverName,
          rejection_reason: reason,
        } : approval),
      };
    }));

    if (!isDemoMode && supabase) {
      if (user) {
        void supabase.from('additional_approvals').update({
          status: approved ? 'approved' : 'rejected',
          responded_at: nowIso(),
          responded_by_name: approverName,
          rejection_reason: reason,
        }).eq('public_token', approvalToken).eq('company_id', activeCompanyId())
          .then(({ error }) => persistError('additional_approvals.update', error));
      } else {
        void supabase.rpc('respond_public_additional_approval', {
          p_token: approvalToken,
          p_approved: approved,
          p_approver_name: approverName,
          p_reason: reason || null,
        }).then(({ error }) => persistError('respond_public_additional_approval', error));
      }
    }
    if (found) logAuditAction(approved ? 'additional_approval.approved' : 'additional_approval.rejected', 'additional_approval', approvalToken, { approverName });
    return found;
  };

  const addPayment = (paymentData: Omit<Payment, 'id' | 'company_id' | 'created_at'>): Payment => {
    const payment: Payment = { ...paymentData, id: uuid(), company_id: activeCompanyId(), created_at: nowIso() };
    setPayments(prev => [payment, ...prev]);
    if (productionMode && supabase) {
      void supabase.from('payments').insert(payment).then(({ error }) => persistError('payments.insert', error));
    }
    logAuditAction('payment.created', 'payment', payment.id, { amount: payment.amount, type: payment.payment_type });
    return payment;
  };

  const deletePayment = (id: string) => {
    const deletedAt = nowIso();
    setPayments(prev => prev.map(payment => payment.id === id ? { ...payment, deleted_at: deletedAt } : payment));
    if (productionMode && supabase) {
      void supabase.from('payments').update({ deleted_at: deletedAt }).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('payments.soft_delete', error));
    }
    logAuditAction('payment.deleted', 'payment', id);
  };
  const getPaymentsByOS = (osId: string) => payments.filter(payment => payment.service_order_id === osId && !payment.deleted_at);

  const addReminder = (reminderData: Omit<Reminder, 'id' | 'company_id' | 'created_at'>): Reminder => {
    const { customer: _customer, vehicle: _vehicle, ...data } = reminderData;
    const reminder: Reminder = { ...data, id: uuid(), company_id: activeCompanyId(), created_at: nowIso() };
    setReminders(prev => [reminder, ...prev]);
    if (productionMode && supabase) {
      void supabase.from('reminders').insert(reminder).then(({ error }) => persistError('reminders.insert', error));
    }
    logAuditAction('reminder.created', 'reminder', reminder.id, { type: reminder.type });
    return reminder;
  };

  const updateReminderStatus = (id: string, status: Reminder['status']) => {
    const patch = { status, contacted_at: status === 'contacted' ? nowIso() : undefined };
    setReminders(prev => prev.map(reminder => reminder.id === id ? { ...reminder, ...patch } : reminder));
    if (productionMode && supabase) {
      void supabase.from('reminders').update(patch).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('reminders.update', error));
    }
    logAuditAction('reminder.status_updated', 'reminder', id, { status });
  };

  const deleteReminder = (id: string) => {
    const deletedAt = nowIso();
    setReminders(prev => prev.map(reminder => reminder.id === id ? { ...reminder, deleted_at: deletedAt } : reminder));
    if (productionMode && supabase) {
      void supabase.from('reminders').update({ deleted_at: deletedAt }).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('reminders.soft_delete', error));
    }
  };

  const addCatalogItem = (item: Omit<ServiceCatalogItem, 'id' | 'company_id' | 'created_at'>): ServiceCatalogItem => {
    const catalogItem: ServiceCatalogItem = { ...item, id: uuid(), company_id: activeCompanyId(), created_at: nowIso() };
    setCatalog(prev => [catalogItem, ...prev]);
    if (productionMode && supabase) {
      void supabase.from('services_catalog').insert(catalogItem).then(({ error }) => persistError('services_catalog.insert', error));
    }
    return catalogItem;
  };

  const toggleFavoriteCatalogItem = (id: string) => {
    const existing = catalog.find(item => item.id === id);
    if (!existing) return;
    const isFavorite = !existing.is_favorite;
    setCatalog(prev => prev.map(item => item.id === id ? { ...item, is_favorite: isFavorite } : item));
    if (productionMode && supabase) {
      void supabase.from('services_catalog').update({ is_favorite: isFavorite }).eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('services_catalog.favorite', error));
    }
  };

  const deleteCatalogItem = (id: string) => {
    setCatalog(prev => prev.filter(item => item.id !== id));
    if (productionMode && supabase) {
      void supabase.from('services_catalog').delete().eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('services_catalog.delete', error));
    }
  };

  const addPackage = (pkg: Omit<ServicePackage, 'id' | 'company_id' | 'created_at'>): ServicePackage => {
    const servicePackage: ServicePackage = { ...pkg, id: uuid(), company_id: activeCompanyId(), created_at: nowIso() };
    setPackages(prev => [servicePackage, ...prev]);
    if (productionMode && supabase) {
      const row = {
        id: servicePackage.id,
        company_id: servicePackage.company_id,
        name: servicePackage.name,
        description: servicePackage.description,
        items: servicePackage.items,
        total_suggested_price: servicePackage.total_suggested_price ?? servicePackage.total_price ?? 0,
        created_at: servicePackage.created_at,
      };
      void supabase.from('service_packages').insert(row).then(({ error }) => persistError('service_packages.insert', error));
    }
    return servicePackage;
  };

  const deletePackage = (id: string) => {
    setPackages(prev => prev.filter(item => item.id !== id));
    if (productionMode && supabase) {
      void supabase.from('service_packages').delete().eq('id', id).eq('company_id', activeCompanyId())
        .then(({ error }) => persistError('service_packages.delete', error));
    }
  };

  const getStagnantQuotes = () => {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    return quotes.filter(quote => ['sent', 'viewed'].includes(quote.status) && !quote.deleted_at && new Date(quote.updated_at || quote.created_at).getTime() <= cutoff);
  };

  const getLostQuotesBreakdown = () => {
    const rejected = quotes.filter(quote => quote.status === 'rejected' && !quote.deleted_at);
    const map: Record<string, { count: number; total: number }> = {};
    rejected.forEach(quote => {
      const category = quote.rejection_category || 'other';
      map[category] ||= { count: 0, total: 0 };
      map[category].count += 1;
      map[category].total += quote.total || 0;
    });
    const denominator = rejected.length || 1;
    return Object.entries(map).map(([category, value]) => ({
      category,
      count: value.count,
      total: value.total,
      percentage: (value.count / denominator) * 100,
    }));
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const activeOrders = serviceOrders.filter(order => !['delivered', 'cancelled'].includes(order.status) && !order.deleted_at);
    const liveQuotes = quotes.filter(quote => !quote.deleted_at);
    const awaiting = liveQuotes.filter(quote => ['sent', 'viewed'].includes(quote.status));
    const stagnant = getStagnantQuotes();
    const approved = liveQuotes.filter(quote => quote.status === 'approved');
    const sent = liveQuotes.filter(quote => quote.status !== 'draft');
    const rejected = liveQuotes.filter(quote => quote.status === 'rejected');
    const paid = payments.filter(payment => !payment.deleted_at).reduce((total, payment) => total + payment.amount, 0);
    const approvedValue = approved.reduce((total, quote) => total + quote.total, 0);
    const now = Date.now();
    const atRisk = activeOrders.filter(order => {
      const deadline = order.promised_client_delivery || order.promised_completion_at || order.estimated_completion_at;
      if (!deadline || order.status === 'ready') return false;
      const remaining = new Date(deadline).getTime() - now;
      return remaining <= 24 * 60 * 60 * 1000;
    });

    return {
      activeVehiclesCount: activeOrders.length,
      newQuotesCount: liveQuotes.filter(quote => ['draft', 'sent'].includes(quote.status)).length,
      awaitingApprovalQuotesCount: awaiting.length,
      awaitingApprovalAmount: awaiting.reduce((total, quote) => total + quote.total, 0),
      stagnantQuotesCount: stagnant.length,
      stagnantQuotesAmount: stagnant.reduce((total, quote) => total + quote.total, 0),
      approvedQuotesCount: approved.length,
      readyServicesCount: serviceOrders.filter(order => order.status === 'ready' && !order.deleted_at).length,
      pendingPaymentAmount: Math.max(approvedValue - paid, 0),
      estimatedRevenue: approvedValue,
      quoteConversionRate: sent.length ? (approved.length / sent.length) * 100 : 0,
      totalQuotesSent: sent.length,
      atRiskDeliveriesCount: atRisk.length,
      lostQuotesAmount: rejected.reduce((total, quote) => total + quote.total, 0),
      lostQuotesCount: rejected.length,
    };
  };

  const searchGlobal = (query: string) => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return { customers: [], vehicles: [], quotes: [], serviceOrders: [] };
    return {
      customers: customers.filter(customer => [customer.name, customer.whatsapp, customer.phone, customer.document, customer.email]
        .some(value => value?.toLocaleLowerCase('pt-BR').includes(normalized))),
      vehicles: vehicles.filter(vehicle => [vehicle.make, vehicle.model, vehicle.version, vehicle.license_plate, vehicle.color]
        .some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(normalized))),
      quotes: quotes.filter(quote => String(quote.quote_number).toLocaleLowerCase('pt-BR').includes(normalized) || quote.customer?.name?.toLocaleLowerCase('pt-BR').includes(normalized)),
      serviceOrders: serviceOrders.filter(order => String(order.os_number).toLocaleLowerCase('pt-BR').includes(normalized)),
    };
  };

  const resetAllDataToDemo = () => {
    if (!isDemoMode) return;
    Object.values(DEMO_STORAGE).forEach(key => localStorage.removeItem(key));
    loadDemoData();
  };

  const value = useMemo<DataContextType>(() => ({
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
    isDataLoading,
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
    resetAllDataToDemo,
    reloadData,
  }), [
    customers,
    vehicles,
    quotes,
    serviceOrders,
    payments,
    reminders,
    catalog,
    packages,
    auditLogs,
    platformCompanies,
    isDataLoading,
    user,
    isDemoMode,
    company,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
