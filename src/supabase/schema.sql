-- ==============================================================================
-- KONNEXY OS AUTO - HARDENED MULTI-TENANT SQL SCHEMA & RLS POLICIES
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    document VARCHAR(30), -- CNPJ / CPF
    phone VARCHAR(30),
    whatsapp VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    logo_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#2563EB',
    pix_key VARCHAR(100),
    pix_key_type VARCHAR(20) DEFAULT 'cpf_cnpj', -- cpf_cnpj, phone, email, random
    business_hours VARCHAR(255) DEFAULT 'Seg - Sex: 08h às 18h | Sáb: 08h às 12h',
    instagram VARCHAR(100),
    business_type VARCHAR(50) DEFAULT 'mechanic', -- mechanic, auto_center, detailing, etc.
    kanban_stages_config JSONB DEFAULT '[]'::jsonb,
    whatsapp_templates_config JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    owner_id UUID,
    plan_id VARCHAR(50) DEFAULT 'pro',
    subscription_status VARCHAR(30) DEFAULT 'trial',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'attendant', -- 'owner', 'admin', 'attendant', 'mechanic', 'financial', 'superadmin'
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    is_superadmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPANY USERS
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'attendant',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- 4. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    whatsapp VARCHAR(30) NOT NULL,
    document VARCHAR(30), -- CPF or CNPJ
    email VARCHAR(255),
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    version VARCHAR(100),
    year INTEGER NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    mileage INTEGER DEFAULT 0,
    fuel_type VARCHAR(50) DEFAULT 'Flex',
    color VARCHAR(50),
    notes TEXT,
    checklist JSONB DEFAULT '{}'::jsonb,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SERVICES CATALOG & PACKAGES
CREATE TABLE IF NOT EXISTS services_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'service', -- 'service' or 'part'
    name VARCHAR(255) NOT NULL,
    default_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_suggested_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUOTES (ORÇAMENTOS) & VERSIONING
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    quote_number SERIAL,
    current_version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'superseded'
    public_token VARCHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    public_token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    public_token_revoked BOOLEAN DEFAULT FALSE,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    down_payment NUMERIC(10, 2) DEFAULT 0.00,
    balance NUMERIC(10, 2) DEFAULT 0.00,
    estimated_days INTEGER DEFAULT 1,
    notes TEXT,
    internal_notes TEXT,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_category VARCHAR(50), -- price, deadline, later, competitor, not_needed, other
    rejection_reason TEXT,
    rejection_notes TEXT,
    approval_snapshot JSONB,
    is_immutable BOOLEAN DEFAULT FALSE,
    client_ip VARCHAR(50),
    created_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    down_payment NUMERIC(10, 2) DEFAULT 0.00,
    balance NUMERIC(10, 2) DEFAULT 0.00,
    estimated_days INTEGER DEFAULT 1,
    notes TEXT,
    items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    approved_at TIMESTAMPTZ,
    approved_name VARCHAR(255),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quote_id, version_number)
);

CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'service',
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- created, edited, sent, viewed, approved, rejected, expired, superseded, reopened, additional_requested
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SERVICE ORDERS (ORDENS DE SERVIÇO)
CREATE TABLE IF NOT EXISTS service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    os_number SERIAL,
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    public_token VARCHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    responsible_name VARCHAR(255),
    responsible_id UUID REFERENCES profiles(id),
    
    -- Operational Diagnosis Separation
    customer_complaint TEXT,
    technical_diagnosis TEXT,
    recommended_solution TEXT,
    diagnosed_by VARCHAR(255),
    diagnosed_at TIMESTAMPTZ,
    
    -- Deadlines & Delivery
    start_date TIMESTAMPTZ DEFAULT NOW(),
    estimated_completion_at TIMESTAMPTZ,
    promised_completion_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    initial_mileage INTEGER,
    final_mileage INTEGER,
    warranty_days INTEGER DEFAULT 90,
    warranty_notes TEXT DEFAULT 'Garantia legal de 90 dias referente a serviços prestados e peças aplicadas.',
    notes TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'service',
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    status_from VARCHAR(50),
    status_to VARCHAR(50) NOT NULL,
    notes TEXT,
    created_by_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_order_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'during', -- entry, diagnosis, during, completion
    is_client_visible BOOLEAN DEFAULT TRUE,
    caption VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS additional_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    parts_amount NUMERIC(10, 2) DEFAULT 0.00,
    labor_amount NUMERIC(10, 2) DEFAULT 0.00,
    photo_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    public_token VARCHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    requested_by VARCHAR(255),
    responded_at TIMESTAMPTZ,
    responded_by_name VARCHAR(255),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENTS & AUDIT
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL DEFAULT 'pix',
    is_down_payment BOOLEAN DEFAULT FALSE,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_order_id UUID REFERENCES service_orders(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'oil_change',
    description VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    due_mileage INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    contacted_at TIMESTAMPTZ,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SAAS PLANS & SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    price_monthly NUMERIC(10, 2) NOT NULL,
    max_users INTEGER DEFAULT 5,
    max_orders_monthly INTEGER DEFAULT 100,
    features JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES plans(id),
    status VARCHAR(30) NOT NULL DEFAULT 'trial',
    trial_started_at TIMESTAMPTZ DEFAULT NOW(),
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    started_at TIMESTAMPTZ,
    next_billing_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM SPEED & MULTI-TENANT QUERY HARDENING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_company_active ON customers(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_company_active ON vehicles(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_quotes_company_active ON quotes(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_token ON quotes(public_token);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_os_company_active ON service_orders(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_os_token ON service_orders(public_token);
CREATE INDEX IF NOT EXISTS idx_os_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_os_promised_at ON service_orders(promised_completion_at);
CREATE INDEX IF NOT EXISTS idx_payments_company_active ON payments(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reminders_company_active ON reminders(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_company_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT company_id FROM company_users WHERE user_id = auth.uid();
$$;

-- Standard tenant isolation policies for all tenant tables
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'customers', 'vehicles', 'services_catalog', 'service_packages',
            'quotes', 'quote_versions', 'quote_items', 'quote_events', 'service_orders',
            'service_order_items', 'service_order_events', 'service_order_photos',
            'additional_approvals', 'payments', 'reminders', 'audit_logs', 'subscriptions'
        ])
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "%s_tenant_isolation" ON %I;
            CREATE POLICY "%s_tenant_isolation" ON %I
            FOR ALL
            USING (company_id IN (SELECT get_user_company_ids()))
            WITH CHECK (company_id IN (SELECT get_user_company_ids()));
        ', t, t, t, t);
    END LOOP;
END $$;

-- Public safe tokenized access policies
CREATE POLICY "public_quotes_read" ON quotes FOR SELECT USING (public_token_revoked = false);
CREATE POLICY "public_quotes_update" ON quotes FOR UPDATE USING (public_token_revoked = false) WITH CHECK (public_token_revoked = false);
CREATE POLICY "public_quote_versions_read" ON quote_versions FOR SELECT USING (true);
CREATE POLICY "public_quote_items_read" ON quote_items FOR SELECT USING (true);
CREATE POLICY "public_quote_events_insert" ON quote_events FOR INSERT WITH CHECK (true);

CREATE POLICY "public_os_read" ON service_orders FOR SELECT USING (true);
CREATE POLICY "public_os_items_read" ON service_order_items FOR SELECT USING (true);
CREATE POLICY "public_os_photos_read" ON service_order_photos FOR SELECT USING (is_client_visible = true);
CREATE POLICY "public_additional_approvals_read" ON additional_approvals FOR SELECT USING (true);
CREATE POLICY "public_additional_approvals_update" ON additional_approvals FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "public_companies_read" ON companies FOR SELECT USING (true);
