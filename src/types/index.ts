export type UserRole = 'owner' | 'admin' | 'attendant' | 'mechanic' | 'financial' | 'superadmin' | 'employee' | 'manager';

export type BusinessType = 
  | 'mechanic' 
  | 'auto_center' 
  | 'electric' 
  | 'detailing' 
  | 'bodywork' 
  | 'car_wash' 
  | 'accessories' 
  | 'oil_change'
  | 'motorcycle' 
  | 'general'
  | 'other';

export interface KanbanStageConfig {
  id: string;
  title: string;
  color: string;
  badgeBg: string;
}

export interface WhatsAppTemplateConfig {
  quoteCreated?: string;
  quote_created?: string;
  quoteReminder?: string;
  quote_reminder?: string;
  serviceStatusUpdate?: string;
  service_status_update?: string;
  serviceReady?: string;
  service_ready?: string;
  additionalApproval?: string;
  additional_approval?: string;
  postSaleReminder?: string;
  post_sale_reminder?: string;
  preventiveReminder?: string;
  [key: string]: string | undefined;
}

export interface Company {
  id: string;
  name: string;
  trade_name?: string;
  document?: string; // CNPJ / CPF
  phone?: string;
  whatsapp: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  logo_url?: string;
  primary_color: string;
  pix_key?: string;
  pix_key_type?: 'cpf_cnpj' | 'phone' | 'email' | 'random';
  business_hours?: string;
  instagram?: string;
  business_type?: BusinessType;
  kanban_stages_config?: KanbanStageConfig[];
  whatsapp_templates_config?: Partial<WhatsAppTemplateConfig>;
  custom_whatsapp_templates?: Partial<WhatsAppTemplateConfig>;
  onboarding_completed?: boolean;
  owner_id?: string;
  plan_id?: string;
  plan?: string;
  is_active?: boolean;
  subscription_status?: 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  company_id?: string;
  is_superadmin?: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  phone?: string;
  whatsapp: string;
  document?: string; // CPF or CNPJ
  email?: string;
  notes?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleChecklist {
  fuel_level?: 'empty' | 'quarter' | 'half' | 'three_quarters' | 'full';
  scratches?: boolean;
  scratches_notes?: string;
  dents?: boolean;
  dents_notes?: string;
  wheels_condition?: string;
  tires_condition?: string;
  mirrors_ok?: boolean;
  glasses_ok?: boolean;
  spare_tire?: boolean;
  jack_wrench?: boolean;
  belongings?: string; // Loose items in the car
  observations?: string;
}

export interface Vehicle {
  id: string;
  company_id: string;
  customer_id: string;
  make: string;
  model: string;
  version?: string;
  year: number;
  license_plate: string;
  mileage: number;
  fuel_type?: string;
  color?: string;
  notes?: string;
  checklist?: VehicleChecklist;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface VehiclePhoto {
  id: string;
  company_id: string;
  vehicle_id: string;
  category: 'entry' | 'scratches' | 'general';
  photo_url: string;
  notes?: string;
  created_at: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'superseded';

export type RejectionReasonCategory = 'price' | 'deadline' | 'later' | 'competitor' | 'not_needed' | 'gave_up' | 'sold_car' | 'other';

export interface QuoteItem {
  id: string;
  company_id?: string;
  quote_id?: string;
  type: 'service' | 'part';
  description: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  total_price: number;
  created_at?: string;
}

export interface QuoteVersion {
  id: string;
  quote_id: string;
  company_id?: string;
  version_number: number;
  subtotal?: number;
  discount?: number;
  total?: number;
  total_amount?: number;
  down_payment?: number;
  balance?: number;
  estimated_days?: number;
  notes?: string;
  change_summary?: string;
  items?: QuoteItem[];
  items_snapshot?: QuoteItem[];
  status?: QuoteStatus;
  created_at: string;
  created_by?: string;
  approved_at?: string;
  approved_name?: string;
}

export interface QuoteApprovalSnapshot {
  approved_at?: string;
  timestamp?: string;
  approved_name?: string;
  approved_by_name?: string;
  approved_total?: number;
  version_number?: number;
  terms_agreed?: boolean;
  terms_accepted?: boolean;
  client_ip?: string;
  ip_address?: string;
  user_agent?: string;
  items_snapshot?: QuoteItem[];
}

export interface QuoteEvent {
  id: string;
  company_id?: string;
  quote_id?: string;
  event_type: 'created' | 'edited' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'superseded' | 'reopened' | 'additional_requested';
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Quote {
  id: string;
  company_id: string;
  customer_id: string;
  vehicle_id: string;
  quote_number: string | number;
  version?: number;
  current_version?: number;
  status: QuoteStatus;
  public_token: string;
  public_token_expires_at?: string;
  public_token_revoked?: boolean;
  
  // Operational Diagnosis Separation
  customer_complaint?: string;
  technical_diagnosis?: string;
  recommended_solution?: string;

  subtotal: number;
  discount: number;
  total: number;
  total_amount?: number;
  down_payment: number;
  balance: number;
  estimated_days: number;
  notes?: string;
  internal_notes?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_category?: RejectionReasonCategory;
  rejection_reason?: string;
  rejection_notes?: string;
  client_ip?: string;
  approval_snapshot?: QuoteApprovalSnapshot;
  versions?: QuoteVersion[];
  is_immutable?: boolean;
  created_by?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  vehicle?: Vehicle;
  items?: QuoteItem[];
  events?: QuoteEvent[];
}

export type ServiceOrderStatus = 
  | 'received' 
  | 'diagnosis' 
  | 'awaiting_approval' 
  | 'in_progress' 
  | 'awaiting_parts' 
  | 'finishing' 
  | 'ready' 
  | 'delivered' 
  | 'cancelled';

export interface ServiceOrderItem {
  id: string;
  company_id?: string;
  service_order_id?: string;
  type: 'service' | 'part';
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface ServiceOrderEvent {
  id: string;
  company_id?: string;
  service_order_id?: string;
  status_from?: ServiceOrderStatus;
  status_to: ServiceOrderStatus;
  notes?: string;
  created_by_name?: string;
  created_at: string;
}

export interface ServiceOrderPhoto {
  id: string;
  company_id?: string;
  service_order_id?: string;
  photo_url: string;
  category: 'entry' | 'diagnosis' | 'during' | 'completion';
  is_client_visible: boolean;
  caption?: string;
  created_at: string;
}

export interface AdditionalApproval {
  id: string;
  company_id?: string;
  service_order_id?: string;
  title: string;
  description: string;
  amount: number;
  parts_amount?: number;
  labor_amount?: number;
  photo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  public_token: string;
  requested_by?: string;
  responded_at?: string;
  responded_by_name?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface ServiceOrder {
  id: string;
  company_id: string;
  quote_id?: string;
  customer_id: string;
  vehicle_id: string;
  os_number: number | string;
  status: ServiceOrderStatus;
  public_token: string;
  responsible_name?: string;
  responsible_id?: string;
  
  // Operational Diagnosis Separation
  customer_complaint?: string;
  technical_diagnosis?: string;
  recommended_solution?: string;
  diagnosed_by?: string;
  diagnosed_at?: string;
  
  // Deadlines & Delivery
  start_date: string;
  estimated_completion_at?: string;
  estimated_completion_date?: string;
  internal_estimated_delivery?: string;
  promised_completion_at?: string;
  promised_client_delivery?: string;
  completed_at?: string;
  delivered_at?: string;
  
  initial_mileage?: number;
  final_mileage?: number;
  warranty_days?: number;
  warranty_notes?: string;
  notes?: string;
  internal_notes?: string;
  created_by?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  
  customer?: Customer;
  vehicle?: Vehicle;
  items?: ServiceOrderItem[];
  events?: ServiceOrderEvent[];
  photos?: ServiceOrderPhoto[];
  additional_approvals?: AdditionalApproval[];
}

export type PaymentType = 'pix' | 'cash' | 'debit' | 'credit' | 'transfer' | 'other';

export interface Payment {
  id: string;
  company_id: string;
  service_order_id?: string;
  quote_id?: string;
  amount: number;
  payment_type: PaymentType;
  is_down_payment: boolean;
  payment_date: string;
  notes?: string;
  deleted_at?: string;
  created_at: string;
}

export type ReminderType = 'oil_change' | 'revision' | 'alignment' | 'detailing' | 'custom';

export interface Reminder {
  id: string;
  company_id: string;
  customer_id: string;
  vehicle_id: string;
  service_order_id?: string;
  type: ReminderType;
  description: string;
  due_date: string;
  due_mileage?: number;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  contacted_at?: string;
  notes?: string;
  deleted_at?: string;
  created_at: string;
  customer?: Customer;
  vehicle?: Vehicle;
}

export interface ServiceCatalogItem {
  id: string;
  company_id: string;
  type: 'service' | 'part';
  name: string;
  default_price: number;
  description?: string;
  is_favorite?: boolean;
  use_count?: number;
  created_at: string;
}

export interface ServicePackageItem {
  name?: string;
  description?: string;
  type: 'service' | 'part';
  default_price?: number;
  unit_price?: number;
  quantity: number;
  total_price?: number;
}

export interface ServicePackage {
  id: string;
  company_id: string;
  name: string;
  description: string;
  items: ServicePackageItem[];
  total_price?: number;
  total_suggested_price?: number;
  estimated_hours?: number;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: 'basic' | 'pro' | 'premium';
  price_monthly: number;
  max_users: number;
  max_orders_monthly: number;
  features: string[];
  active: boolean;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
  trial_started_at: string;
  trial_ends_at: string;
  started_at?: string;
  next_billing_at?: string;
  canceled_at?: string;
  plan?: Plan;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DashboardMetrics {
  activeVehiclesCount: number;
  newQuotesCount: number;
  awaitingApprovalQuotesCount: number;
  awaitingApprovalAmount: number;
  stagnantQuotesCount: number;
  stagnantQuotesAmount: number;
  approvedQuotesCount: number;
  readyServicesCount: number;
  pendingPaymentAmount: number;
  estimatedRevenue: number;
  quoteConversionRate: number;
  totalQuotesSent: number;
  atRiskDeliveriesCount: number;
  lostQuotesAmount: number;
  lostQuotesCount: number;
}
