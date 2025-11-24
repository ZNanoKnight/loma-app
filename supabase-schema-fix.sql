-- Fix RLS policy for user profile creation during signup with email confirmation
-- When email confirmation is required, there's no session yet, so we need a different approach

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;

-- Create a more permissive INSERT policy that allows profile creation during signup
-- This checks if the user exists in auth.users table instead of checking auth.uid()
CREATE POLICY "Users can create own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (
        -- Allow if authenticated user matches
        (auth.uid() = user_id)
        OR
        -- Allow if user_id exists in auth.users (for email confirmation flow)
        (EXISTS (SELECT 1 FROM auth.users WHERE id = user_id))
    );
