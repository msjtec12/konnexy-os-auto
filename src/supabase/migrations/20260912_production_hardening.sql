-- Konnexy OS Auto - production hardening migration
-- Apply once to an existing Supabase project after src/supabase/schema.sql.

BEGIN;

-- Columns required by the production data layer.
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS customer_complaint TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS technical_diagnosis TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS recommended_solution TEXT;

ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS internal_estimated_delivery TIMESTAMPTZ;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS promised_client_delivery TIMESTAMPTZ;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS public_token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days');
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS public_token_revoked BOOLEAN DEFAULT FALSE;

ALTER TABLE additional_approvals ADD COLUMN IF NOT EXISTS public_token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
ALTER TABLE additional_approvals ADD COLUMN IF NOT EXISTS public_token_revoked BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_os_public_token_validity
    ON service_orders(public_token, public_token_expires_at)
    WHERE public_token_revoked = FALSE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_additional_approval_public_token_validity
    ON additional_approvals(public_token, public_token_expires_at)
    WHERE public_token_revoked = FALSE;

-- ------------------------------------------------------------------------------
-- Auth/bootstrap
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_company_id UUID;
    v_full_name TEXT;
    v_company_name TEXT;
    v_whatsapp TEXT;
BEGIN
    v_full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''), split_part(COALESCE(NEW.email, ''), '@', 1), 'Usuário');
    v_company_name := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'company_name'), '');
    v_whatsapp := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'whatsapp'), ''), 'Não informado');

    IF v_company_name IS NOT NULL THEN
        INSERT INTO public.companies (
            name,
            whatsapp,
            email,
            owner_id,
            onboarding_completed,
            subscription_status
        )
        VALUES (
            v_company_name,
            v_whatsapp,
            NEW.email,
            NEW.id,
            FALSE,
            'trial'
        )
        RETURNING id INTO v_company_id;

        INSERT INTO public.profiles (
            id, email, full_name, role, company_id, is_superadmin
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.email, ''),
            v_full_name,
            'owner',
            v_company_id,
            FALSE
        );

        INSERT INTO public.company_users (company_id, user_id, role)
        VALUES (v_company_id, NEW.id, 'owner');
    ELSE
        INSERT INTO public.profiles (
            id, email, full_name, role, company_id, is_superadmin
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.email, ''),
            v_full_name,
            'attendant',
            NULL,
            FALSE
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- Security helper functions
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_current_user_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT COALESCE((
        SELECT p.is_superadmin OR p.role = 'superadmin'
        FROM public.profiles p
        WHERE p.id = auth.uid()
    ), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT cu.company_id
    FROM public.company_users cu
    WHERE cu.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_has_company_role(p_company_id UUID, p_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT public.is_current_user_superadmin()
        OR EXISTS (
            SELECT 1
            FROM public.company_users cu
            WHERE cu.company_id = p_company_id
              AND cu.user_id = auth.uid()
              AND cu.role = ANY(p_roles)
        );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_superadmin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_company_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.user_has_company_role(UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_company_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_company_role(UUID, TEXT[]) TO authenticated;

-- ------------------------------------------------------------------------------
-- RLS: remove permissive anonymous policies and enforce tenant isolation
-- ------------------------------------------------------------------------------
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

DROP POLICY IF EXISTS public_quotes_read ON quotes;
DROP POLICY IF EXISTS public_quotes_update ON quotes;
DROP POLICY IF EXISTS public_quote_versions_read ON quote_versions;
DROP POLICY IF EXISTS public_quote_items_read ON quote_items;
DROP POLICY IF EXISTS public_quote_events_insert ON quote_events;
DROP POLICY IF EXISTS public_os_read ON service_orders;
DROP POLICY IF EXISTS public_os_items_read ON service_order_items;
DROP POLICY IF EXISTS public_os_photos_read ON service_order_photos;
DROP POLICY IF EXISTS public_additional_approvals_read ON additional_approvals;
DROP POLICY IF EXISTS public_additional_approvals_update ON additional_approvals;
DROP POLICY IF EXISTS public_companies_read ON companies;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'customers', 'vehicles', 'services_catalog', 'service_packages',
        'quotes', 'quote_versions', 'quote_items', 'quote_events',
        'service_orders', 'service_order_items', 'service_order_events',
        'service_order_photos', 'additional_approvals', 'payments',
        'reminders', 'audit_logs', 'subscriptions'
    ]
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_isolation', t);
        EXECUTE format(
            'CREATE POLICY %I ON %I FOR ALL TO authenticated USING (public.is_current_user_superadmin() OR company_id IN (SELECT public.get_user_company_ids())) WITH CHECK (public.is_current_user_superadmin() OR company_id IN (SELECT public.get_user_company_ids()))',
            t || '_tenant_isolation', t
        );
    END LOOP;
END $$;

DROP POLICY IF EXISTS companies_tenant_select ON companies;
CREATE POLICY companies_tenant_select ON companies
FOR SELECT TO authenticated
USING (public.is_current_user_superadmin() OR id IN (SELECT public.get_user_company_ids()));

DROP POLICY IF EXISTS companies_tenant_update ON companies;
CREATE POLICY companies_tenant_update ON companies
FOR UPDATE TO authenticated
USING (public.user_has_company_role(id, ARRAY['owner','admin']))
WITH CHECK (public.user_has_company_role(id, ARRAY['owner','admin']));

DROP POLICY IF EXISTS profiles_company_select ON profiles;
CREATE POLICY profiles_company_select ON profiles
FOR SELECT TO authenticated
USING (
    id = auth.uid()
    OR public.is_current_user_superadmin()
    OR company_id IN (SELECT public.get_user_company_ids())
);

DROP POLICY IF EXISTS profiles_self_update ON profiles;
CREATE POLICY profiles_self_update ON profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS company_users_company_select ON company_users;
CREATE POLICY company_users_company_select ON company_users
FOR SELECT TO authenticated
USING (
    public.is_current_user_superadmin()
    OR user_id = auth.uid()
    OR company_id IN (SELECT public.get_user_company_ids())
);

-- Restrict security-sensitive columns even when a user crafts direct PostgREST calls.
REVOKE INSERT, DELETE ON TABLE companies FROM anon, authenticated;
REVOKE UPDATE ON TABLE companies FROM authenticated;
GRANT UPDATE (
    name, trade_name, document, phone, whatsapp, email, address, city, state,
    logo_url, primary_color, pix_key, pix_key_type, business_hours, instagram,
    business_type, kanban_stages_config, whatsapp_templates_config,
    onboarding_completed, updated_at
) ON TABLE companies TO authenticated;

REVOKE INSERT, DELETE ON TABLE profiles FROM anon, authenticated;
REVOKE UPDATE ON TABLE profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url, updated_at) ON TABLE profiles TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON TABLE company_users FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- Approved quote immutability
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_immutable_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.is_immutable THEN
        IF NOT (
            NEW.current_version > OLD.current_version
            AND NEW.status = 'sent'
            AND NEW.is_immutable = FALSE
        ) THEN
            IF NEW.subtotal IS DISTINCT FROM OLD.subtotal
               OR NEW.discount IS DISTINCT FROM OLD.discount
               OR NEW.total IS DISTINCT FROM OLD.total
               OR NEW.down_payment IS DISTINCT FROM OLD.down_payment
               OR NEW.balance IS DISTINCT FROM OLD.balance
               OR NEW.estimated_days IS DISTINCT FROM OLD.estimated_days
               OR NEW.notes IS DISTINCT FROM OLD.notes
               OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
               OR NEW.vehicle_id IS DISTINCT FROM OLD.vehicle_id
               OR NEW.approval_snapshot IS DISTINCT FROM OLD.approval_snapshot
               OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
               OR NEW.status IS DISTINCT FROM OLD.status
            THEN
                RAISE EXCEPTION 'Approved quote is immutable; create a new version instead.' USING ERRCODE = '42501';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_immutable_quote_trigger ON quotes;
CREATE TRIGGER protect_immutable_quote_trigger
BEFORE UPDATE ON quotes
FOR EACH ROW EXECUTE FUNCTION public.protect_immutable_quote();

CREATE OR REPLACE FUNCTION public.protect_approved_quote_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_quote_id UUID;
    v_immutable BOOLEAN;
BEGIN
    v_quote_id := COALESCE(NEW.quote_id, OLD.quote_id);
    SELECT q.is_immutable INTO v_immutable FROM public.quotes q WHERE q.id = v_quote_id;
    IF COALESCE(v_immutable, FALSE) THEN
        RAISE EXCEPTION 'Items from an approved quote are immutable; create a new quote version.' USING ERRCODE = '42501';
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS protect_approved_quote_items_trigger ON quote_items;
CREATE TRIGGER protect_approved_quote_items_trigger
BEFORE INSERT OR UPDATE OR DELETE ON quote_items
FOR EACH ROW EXECUTE FUNCTION public.protect_approved_quote_items();

CREATE OR REPLACE FUNCTION public.protect_approved_quote_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.status = 'approved' THEN
        RAISE EXCEPTION 'Approved quote versions cannot be changed or deleted.' USING ERRCODE = '42501';
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS protect_approved_quote_version_trigger ON quote_versions;
CREATE TRIGGER protect_approved_quote_version_trigger
BEFORE UPDATE OR DELETE ON quote_versions
FOR EACH ROW EXECUTE FUNCTION public.protect_approved_quote_version();

-- ------------------------------------------------------------------------------
-- Public RPCs: bearer token is validated inside SECURITY DEFINER functions.
-- No anonymous table policy is required.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_quote(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    q public.quotes%ROWTYPE;
    result JSONB;
BEGIN
    SELECT * INTO q
    FROM public.quotes
    WHERE public_token = p_token
      AND public_token_revoked = FALSE
      AND deleted_at IS NULL
      AND (public_token_expires_at IS NULL OR public_token_expires_at > NOW())
    LIMIT 1;

    IF q.id IS NULL THEN RETURN NULL; END IF;

    IF q.status = 'sent' THEN
        UPDATE public.quotes SET status = 'viewed', updated_at = NOW() WHERE id = q.id;
        INSERT INTO public.quote_events (company_id, quote_id, event_type, description)
        VALUES (q.company_id, q.id, 'viewed', 'Orçamento visualizado pelo link público');
        SELECT * INTO q FROM public.quotes WHERE id = q.id;
    END IF;

    SELECT jsonb_build_object(
        'quote',
        (to_jsonb(q) - 'internal_notes' - 'client_ip' - 'created_by' - 'deleted_at') || jsonb_build_object(
            'version', q.current_version,
            'customer', jsonb_build_object(
                'id', c.id,
                'company_id', c.company_id,
                'name', c.name,
                'phone', c.phone,
                'whatsapp', c.whatsapp,
                'created_at', c.created_at,
                'updated_at', c.updated_at
            ),
            'vehicle', jsonb_build_object(
                'id', v.id,
                'company_id', v.company_id,
                'customer_id', v.customer_id,
                'make', v.make,
                'model', v.model,
                'version', v.version,
                'year', v.year,
                'license_plate', v.license_plate,
                'mileage', v.mileage,
                'fuel_type', v.fuel_type,
                'color', v.color,
                'created_at', v.created_at,
                'updated_at', v.updated_at
            ),
            'items', COALESCE((
                SELECT jsonb_agg(to_jsonb(qi) ORDER BY qi.created_at)
                FROM public.quote_items qi WHERE qi.quote_id = q.id
            ), '[]'::jsonb),
            'versions', COALESCE((
                SELECT jsonb_agg(to_jsonb(qv) ORDER BY qv.version_number)
                FROM public.quote_versions qv WHERE qv.quote_id = q.id
            ), '[]'::jsonb)
        ),
        'company', jsonb_build_object(
            'id', co.id,
            'name', co.name,
            'trade_name', co.trade_name,
            'phone', co.phone,
            'whatsapp', co.whatsapp,
            'email', co.email,
            'address', co.address,
            'city', co.city,
            'state', co.state,
            'logo_url', co.logo_url,
            'primary_color', co.primary_color,
            'pix_key', co.pix_key,
            'pix_key_type', co.pix_key_type,
            'business_hours', co.business_hours,
            'instagram', co.instagram,
            'business_type', co.business_type,
            'created_at', co.created_at,
            'updated_at', co.updated_at
        )
    ) INTO result
    FROM public.customers c
    JOIN public.vehicles v ON v.id = q.vehicle_id
    JOIN public.companies co ON co.id = q.company_id
    WHERE c.id = q.customer_id;

    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_public_quote(
    p_token TEXT,
    p_approver_name TEXT,
    p_terms_agreed BOOLEAN,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    q public.quotes%ROWTYPE;
    v_ip TEXT;
    v_headers JSONB;
    v_snapshot JSONB;
BEGIN
    IF NOT p_terms_agreed OR NULLIF(TRIM(p_approver_name), '') IS NULL THEN
        RAISE EXCEPTION 'Approval requires name and accepted terms.' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO q
    FROM public.quotes
    WHERE public_token = p_token
      AND public_token_revoked = FALSE
      AND deleted_at IS NULL
      AND (public_token_expires_at IS NULL OR public_token_expires_at > NOW())
    FOR UPDATE;

    IF q.id IS NULL THEN RETURN FALSE; END IF;
    IF q.status = 'approved' THEN RETURN TRUE; END IF;
    IF q.status IN ('rejected', 'expired', 'superseded') THEN
        RAISE EXCEPTION 'Quote is no longer approvable.' USING ERRCODE = '22023';
    END IF;

    BEGIN
        v_headers := NULLIF(current_setting('request.headers', TRUE), '')::JSONB;
        v_ip := COALESCE(v_headers ->> 'x-forwarded-for', v_headers ->> 'cf-connecting-ip');
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;

    v_snapshot := jsonb_build_object(
        'approved_at', NOW(),
        'timestamp', NOW(),
        'approved_name', LEFT(TRIM(p_approver_name), 255),
        'approved_by_name', LEFT(TRIM(p_approver_name), 255),
        'approved_total', q.total,
        'version_number', q.current_version,
        'terms_agreed', TRUE,
        'terms_accepted', TRUE,
        'client_ip', v_ip,
        'ip_address', v_ip,
        'user_agent', LEFT(COALESCE(p_user_agent, ''), 1000),
        'items_snapshot', COALESCE((SELECT jsonb_agg(to_jsonb(qi) ORDER BY qi.created_at) FROM public.quote_items qi WHERE qi.quote_id = q.id), '[]'::jsonb)
    );

    UPDATE public.quotes
    SET status = 'approved',
        approved_at = NOW(),
        is_immutable = TRUE,
        approval_snapshot = v_snapshot,
        client_ip = v_ip,
        updated_at = NOW()
    WHERE id = q.id;

    UPDATE public.quote_versions
    SET status = 'approved', approved_at = NOW(), approved_name = LEFT(TRIM(p_approver_name), 255)
    WHERE quote_id = q.id AND version_number = q.current_version;

    INSERT INTO public.quote_events (company_id, quote_id, event_type, description, metadata)
    VALUES (
        q.company_id,
        q.id,
        'approved',
        'Orçamento aprovado pelo link público',
        jsonb_build_object('approver_name', LEFT(TRIM(p_approver_name), 255), 'version', q.current_version)
    );

    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_public_quote(
    p_token TEXT,
    p_category TEXT DEFAULT 'other',
    p_reason TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    q public.quotes%ROWTYPE;
BEGIN
    SELECT * INTO q
    FROM public.quotes
    WHERE public_token = p_token
      AND public_token_revoked = FALSE
      AND deleted_at IS NULL
      AND (public_token_expires_at IS NULL OR public_token_expires_at > NOW())
    FOR UPDATE;

    IF q.id IS NULL THEN RETURN FALSE; END IF;
    IF q.status = 'approved' OR q.is_immutable THEN
        RAISE EXCEPTION 'Approved quote cannot be rejected.' USING ERRCODE = '22023';
    END IF;

    UPDATE public.quotes
    SET status = 'rejected',
        rejected_at = NOW(),
        rejection_category = LEFT(COALESCE(p_category, 'other'), 50),
        rejection_reason = LEFT(p_reason, 2000),
        rejection_notes = LEFT(p_notes, 4000),
        updated_at = NOW()
    WHERE id = q.id;

    INSERT INTO public.quote_events (company_id, quote_id, event_type, description, metadata)
    VALUES (
        q.company_id,
        q.id,
        'rejected',
        'Orçamento recusado pelo link público',
        jsonb_build_object('category', COALESCE(p_category, 'other'))
    );

    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_service_order(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    o public.service_orders%ROWTYPE;
    result JSONB;
BEGIN
    SELECT * INTO o
    FROM public.service_orders
    WHERE public_token = p_token
      AND public_token_revoked = FALSE
      AND deleted_at IS NULL
      AND (public_token_expires_at IS NULL OR public_token_expires_at > NOW())
    LIMIT 1;

    IF o.id IS NULL THEN RETURN NULL; END IF;

    SELECT jsonb_build_object(
        'service_order',
        (to_jsonb(o) - 'internal_notes' - 'created_by' - 'responsible_id' - 'deleted_at') || jsonb_build_object(
            'customer', jsonb_build_object(
                'id', c.id,
                'company_id', c.company_id,
                'name', c.name,
                'phone', c.phone,
                'whatsapp', c.whatsapp,
                'created_at', c.created_at,
                'updated_at', c.updated_at
            ),
            'vehicle', jsonb_build_object(
                'id', v.id,
                'company_id', v.company_id,
                'customer_id', v.customer_id,
                'make', v.make,
                'model', v.model,
                'version', v.version,
                'year', v.year,
                'license_plate', v.license_plate,
                'mileage', v.mileage,
                'fuel_type', v.fuel_type,
                'color', v.color,
                'created_at', v.created_at,
                'updated_at', v.updated_at
            ),
            'items', COALESCE((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.created_at) FROM public.service_order_items i WHERE i.service_order_id = o.id), '[]'::jsonb),
            'photos', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.created_at) FROM public.service_order_photos p WHERE p.service_order_id = o.id AND p.is_client_visible = TRUE), '[]'::jsonb),
            'additional_approvals', COALESCE((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.created_at) FROM public.additional_approvals a WHERE a.service_order_id = o.id AND a.public_token_revoked = FALSE), '[]'::jsonb)
        ),
        'company', jsonb_build_object(
            'id', co.id,
            'name', co.name,
            'trade_name', co.trade_name,
            'phone', co.phone,
            'whatsapp', co.whatsapp,
            'email', co.email,
            'address', co.address,
            'city', co.city,
            'state', co.state,
            'logo_url', co.logo_url,
            'primary_color', co.primary_color,
            'pix_key', co.pix_key,
            'pix_key_type', co.pix_key_type,
            'business_hours', co.business_hours,
            'instagram', co.instagram,
            'business_type', co.business_type,
            'created_at', co.created_at,
            'updated_at', co.updated_at
        )
    ) INTO result
    FROM public.customers c
    JOIN public.vehicles v ON v.id = o.vehicle_id
    JOIN public.companies co ON co.id = o.company_id
    WHERE c.id = o.customer_id;

    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_public_additional_approval(
    p_token TEXT,
    p_approved BOOLEAN,
    p_approver_name TEXT,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    a public.additional_approvals%ROWTYPE;
BEGIN
    IF NULLIF(TRIM(p_approver_name), '') IS NULL THEN
        RAISE EXCEPTION 'Approver name is required.' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO a
    FROM public.additional_approvals
    WHERE public_token = p_token
      AND public_token_revoked = FALSE
      AND status = 'pending'
      AND (public_token_expires_at IS NULL OR public_token_expires_at > NOW())
    FOR UPDATE;

    IF a.id IS NULL THEN RETURN FALSE; END IF;

    UPDATE public.additional_approvals
    SET status = CASE WHEN p_approved THEN 'approved' ELSE 'rejected' END,
        responded_at = NOW(),
        responded_by_name = LEFT(TRIM(p_approver_name), 255),
        rejection_reason = CASE WHEN p_approved THEN NULL ELSE LEFT(p_reason, 2000) END
    WHERE id = a.id;

    INSERT INTO public.audit_logs (company_id, user_name, action, entity_type, entity_id, metadata)
    VALUES (
        a.company_id,
        LEFT(TRIM(p_approver_name), 255),
        CASE WHEN p_approved THEN 'additional_approval.approved_public' ELSE 'additional_approval.rejected_public' END,
        'additional_approval',
        a.id::TEXT,
        jsonb_build_object('service_order_id', a.service_order_id)
    );

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_quote(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_public_quote(TEXT, TEXT, BOOLEAN, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_public_quote(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_service_order(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_public_additional_approval(TEXT, BOOLEAN, TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_public_quote(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_public_quote(TEXT, TEXT, BOOLEAN, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reject_public_quote(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_service_order(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_public_additional_approval(TEXT, BOOLEAN, TEXT, TEXT) TO anon, authenticated;

COMMIT;
