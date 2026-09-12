-- Follow-up guard for approved quote versioning.
-- Run after 20260912_production_hardening.sql.

BEGIN;

CREATE OR REPLACE FUNCTION public.protect_immutable_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.is_immutable THEN
        IF NEW.current_version > OLD.current_version
           AND NEW.status = 'sent'
           AND NEW.is_immutable = FALSE
        THEN
            -- A new version is a fresh approval cycle. Never carry legal/audit
            -- evidence from the previously approved version into the new one.
            NEW.approved_at := NULL;
            NEW.approval_snapshot := NULL;
            NEW.client_ip := NULL;
            NEW.rejected_at := NULL;
            NEW.rejection_category := NULL;
            NEW.rejection_reason := NULL;
            NEW.rejection_notes := NULL;
            NEW.updated_at := NOW();
            RETURN NEW;
        END IF;

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
           OR NEW.current_version IS DISTINCT FROM OLD.current_version
           OR NEW.is_immutable IS DISTINCT FROM OLD.is_immutable
        THEN
            RAISE EXCEPTION 'Approved quote is immutable; create a new version instead.' USING ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_approved_quote_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_quote_id UUID;
    v_immutable BOOLEAN;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_quote_id := OLD.quote_id;
    ELSE
        v_quote_id := NEW.quote_id;
    END IF;

    SELECT q.is_immutable
    INTO v_immutable
    FROM public.quotes q
    WHERE q.id = v_quote_id;

    IF COALESCE(v_immutable, FALSE) THEN
        RAISE EXCEPTION 'Items from an approved quote are immutable; create a new quote version.' USING ERRCODE = '42501';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_approved_quote_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.status = 'approved' THEN
        RAISE EXCEPTION 'Approved quote versions cannot be changed or deleted.' USING ERRCODE = '42501';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

COMMIT;
