-- Migration: Fix JSONB to text[] casting in create_user_profile function
-- Date: 2025-01-25
-- Description: Fixes the type mismatch error where JSONB arrays were being inserted into text[] columns
-- Also ensures subscription record is created for the user (required for payment flow)

-- The goals, dietary_preferences, and allergens columns are text[] type,
-- but the previous migration was trying to insert JSONB values.
-- This migration fixes the casting to properly convert JSONB arrays to text[].

CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_profile_data JSONB
)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result user_profiles;
BEGIN
  -- Verify the user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User does not exist in auth system';
  END IF;

  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Profile already exists for this user';
  END IF;

  -- Insert the new profile
  -- Note: goals, dietary_preferences, and allergens are text[] columns
  -- We use ARRAY(SELECT jsonb_array_elements_text(...)) to convert JSONB arrays to text[]
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
    default_serving_size,
    profile_image_url,
    metric_units,
    has_completed_onboarding
  )
  VALUES (
    p_user_id,
    COALESCE(p_profile_data->>'first_name', ''),
    COALESCE(p_profile_data->>'last_name', ''),
    p_profile_data->>'age',
    p_profile_data->>'weight',
    p_profile_data->>'height_feet',
    p_profile_data->>'height_inches',
    p_profile_data->>'gender',
    p_profile_data->>'activity_level',
    -- Convert JSONB arrays to text[] using ARRAY(SELECT jsonb_array_elements_text(...))
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'goals')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'dietary_preferences')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'allergens')), ARRAY[]::text[]),
    p_profile_data->>'equipment',
    p_profile_data->>'cooking_frequency',
    COALESCE((p_profile_data->>'default_serving_size')::integer, 2),
    p_profile_data->>'profile_image_url',
    COALESCE((p_profile_data->>'metric_units')::boolean, false),
    COALESCE((p_profile_data->>'has_completed_onboarding')::boolean, false)
  )
  RETURNING * INTO v_result;

  -- Create initial subscription record for the user (required for payment flow)
  -- Status is 'incomplete' until payment is processed
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

  RETURN v_result;
END;
$$;
