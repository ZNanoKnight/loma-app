-- Migration: Add 'trialing' status to subscriptions table
-- Date: 2025-01-25
-- Description: Adds 'trialing' status to support 7-day free trial flow

-- Update the status constraint to include 'trialing'
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_status_check
CHECK (status IN ('incomplete', 'trialing', 'active', 'cancelled', 'expired', 'past_due'));

COMMENT ON TABLE public.subscriptions IS 'Stores user subscription and Stripe payment information. Status can be: incomplete (signup started), trialing (7-day free trial), active (paid), cancelled, expired, or past_due.';
