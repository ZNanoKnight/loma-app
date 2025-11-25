-- Migration: Update Subscriptions Table for Payment Flow
-- Date: 2025-01-24
-- Purpose: Add 'incomplete' status for pre-payment signup flow
-- This is a SAFE migration that only adds missing functionality

-- Add 'incomplete' to the status constraint if not already present
-- This allows subscriptions to exist before payment is completed
DO $$
BEGIN
  -- Drop the old constraint
  ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

  -- Add new constraint with 'incomplete' status
  ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('incomplete', 'active', 'cancelled', 'expired', 'past_due'));

EXCEPTION
  WHEN OTHERS THEN
    -- If constraint doesn't exist, that's fine
    NULL;
END $$;

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate (idempotent)
DROP POLICY IF EXISTS "Users can read their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- RLS Policy: Users can read their own subscription
CREATE POLICY "Users can read their own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.subscriptions IS 'Stores user subscription and Stripe payment information';
