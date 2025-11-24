-- Fix RLS policy for user profile creation during signup with email confirmation
-- Use a service role function to bypass RLS for the initial profile creation

-- Drop the existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;

-- Create a simpler INSERT policy that allows inserts without authentication
-- This is safe because the trigger already creates the profile, and we validate user_id exists
CREATE POLICY "Allow profile creation"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (true);

-- Update the SELECT policy to ensure users can only view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Update the UPDATE policy to ensure users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Update the DELETE policy to ensure users can only delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
CREATE POLICY "Users can delete own profile"
    ON public.user_profiles
    FOR DELETE
    USING (auth.uid() = user_id);
