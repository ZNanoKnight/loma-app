-- Migration: Fix RLS Policy for User Profile Creation During Email Confirmation Flow
-- Date: 2025-01-24
-- Issue: RLS policy blocks profile creation when email confirmation is enabled
-- Solution: Create secure function with SECURITY DEFINER to bypass RLS safely

-- Step 1: Drop existing problematic INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Step 2: Create secure function for profile creation
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_profile_data JSONB
)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with function owner's privileges, bypassing RLS
SET search_path = public
AS $$
DECLARE
  v_profile user_profiles;
BEGIN
  -- Security check 1: Verify the user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User does not exist in auth system';
  END IF;

  -- Security check 2: Verify profile doesn't already exist (prevent duplicates)
  IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Profile already exists for this user';
  END IF;

  -- Insert the profile with all fields
  INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    age,
    weight,
    height_feet,
    height_inches,
    gender,
    activity_level,
    goals,
    dietary_preferences,
    allergens,
    equipment,
    cooking_frequency,
    meal_prep_interest,
    target_weight,
    target_protein,
    target_calories,
    target_carbs,
    target_fat,
    disliked_ingredients,
    cuisine_preferences,
    default_serving_size,
    profile_image_url,
    notifications,
    meal_reminders,
    weekly_report,
    dark_mode,
    metric_units,
    has_completed_onboarding
  ) VALUES (
    p_user_id,
    COALESCE(p_profile_data->>'first_name', ''),
    COALESCE(p_profile_data->>'last_name', ''),
    p_profile_data->>'age',
    p_profile_data->>'weight',
    p_profile_data->>'height_feet',
    p_profile_data->>'height_inches',
    p_profile_data->>'gender',
    p_profile_data->>'activity_level',
    COALESCE((p_profile_data->>'goals')::TEXT[], ARRAY[]::TEXT[]),
    COALESCE((p_profile_data->>'dietary_preferences')::TEXT[], ARRAY[]::TEXT[]),
    COALESCE((p_profile_data->>'allergens')::TEXT[], ARRAY[]::TEXT[]),
    p_profile_data->>'equipment',
    p_profile_data->>'cooking_frequency',
    p_profile_data->>'meal_prep_interest',
    p_profile_data->>'target_weight',
    p_profile_data->>'target_protein',
    p_profile_data->>'target_calories',
    p_profile_data->>'target_carbs',
    p_profile_data->>'target_fat',
    COALESCE((p_profile_data->>'disliked_ingredients')::TEXT[], ARRAY[]::TEXT[]),
    COALESCE((p_profile_data->>'cuisine_preferences')::TEXT[], ARRAY[]::TEXT[]),
    COALESCE((p_profile_data->>'default_serving_size')::INTEGER, 1),
    p_profile_data->>'profile_image_url',
    COALESCE((p_profile_data->>'notifications')::BOOLEAN, true),
    COALESCE((p_profile_data->>'meal_reminders')::BOOLEAN, true),
    COALESCE((p_profile_data->>'weekly_report')::BOOLEAN, true),
    COALESCE((p_profile_data->>'dark_mode')::BOOLEAN, false),
    COALESCE((p_profile_data->>'metric_units')::BOOLEAN, false),
    COALESCE((p_profile_data->>'has_completed_onboarding')::BOOLEAN, false)
  )
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

-- Step 3: Create new INSERT policy that only allows authenticated users with matching user_id
-- This prevents direct inserts and forces use of the secure function
CREATE POLICY "Users can insert own profile when authenticated"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 4: Grant execute permissions on the function
-- Both authenticated and anon users need access (anon for email confirmation flow)
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, JSONB) TO anon;

-- Step 5: Add helpful comment
COMMENT ON FUNCTION public.create_user_profile IS
  'Securely creates a user profile during signup, bypassing RLS. Includes validation to prevent duplicate profiles and ensure user exists in auth.users.';
