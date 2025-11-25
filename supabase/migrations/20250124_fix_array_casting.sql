-- Migration: Fix Array Casting in Profile Creation Function
-- Date: 2025-01-24
-- Issue: JSONB to TEXT[] casting was malformed
-- Solution: Use proper JSONB array extraction and conversion

-- Drop and recreate the function with correct array handling
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_profile_data JSONB
)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
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
  -- For arrays: Use -> to get JSONB, then cast with jsonb_array_elements_text
  -- Or use array constructors with proper conversion
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
    -- Array fields: Convert JSONB arrays to TEXT[]
    CASE
      WHEN p_profile_data->'goals' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'goals'))
      ELSE ARRAY[]::TEXT[]
    END,
    CASE
      WHEN p_profile_data->'dietary_preferences' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'dietary_preferences'))
      ELSE ARRAY[]::TEXT[]
    END,
    CASE
      WHEN p_profile_data->'allergens' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'allergens'))
      ELSE ARRAY[]::TEXT[]
    END,
    p_profile_data->>'equipment',
    p_profile_data->>'cooking_frequency',
    p_profile_data->>'meal_prep_interest',
    p_profile_data->>'target_weight',
    p_profile_data->>'target_protein',
    p_profile_data->>'target_calories',
    p_profile_data->>'target_carbs',
    p_profile_data->>'target_fat',
    CASE
      WHEN p_profile_data->'disliked_ingredients' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'disliked_ingredients'))
      ELSE ARRAY[]::TEXT[]
    END,
    CASE
      WHEN p_profile_data->'cuisine_preferences' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'cuisine_preferences'))
      ELSE ARRAY[]::TEXT[]
    END,
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

  -- Create initial subscription record for the user
  -- Using existing table structure with plan field required
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    tokens_balance,
    tokens_used,
    tokens_total
  )
  VALUES (
    p_user_id,
    'monthly', -- Default plan, will be updated after payment
    'incomplete',
    0, -- No tokens until payment completes
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN v_profile;
END;
$$;

COMMENT ON FUNCTION public.create_user_profile IS
  'Securely creates a user profile during signup, bypassing RLS. Includes validation to prevent duplicate profiles and ensure user exists in auth.users. Fixed array casting from JSONB.';