-- ============================================================================
-- ADD TERMS ACCEPTANCE TRACKING
-- ============================================================================
-- Adds columns to track when users accepted Terms of Service and Privacy Policy
-- This is important for legal compliance and audit trails
-- ============================================================================

-- Add terms_accepted_at column to track ToS acceptance
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add privacy_accepted_at column to track Privacy Policy acceptance
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add a comment for documentation
COMMENT ON COLUMN user_profiles.terms_accepted_at IS 'Timestamp when user accepted Terms of Service during onboarding';
COMMENT ON COLUMN user_profiles.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy during onboarding';

-- ============================================================================
-- DONE!
-- ============================================================================
-- To apply this migration:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"
-- ============================================================================
