-- Migration: Deprecate unused columns from user_profiles
-- Date: 2025-01-25
-- Description: Removes 12 columns that are no longer used in the application

-- Step 1: Drop the unused columns from user_profiles table
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS disliked_ingredients,
DROP COLUMN IF EXISTS cuisine_preferences,
DROP COLUMN IF EXISTS meal_prep_interest,
DROP COLUMN IF EXISTS target_weight,
DROP COLUMN IF EXISTS target_protein,
DROP COLUMN IF EXISTS target_calories,
DROP COLUMN IF EXISTS target_carbs,
DROP COLUMN IF EXISTS target_fat,
DROP COLUMN IF EXISTS notifications,
DROP COLUMN IF EXISTS meal_reminders,
DROP COLUMN IF EXISTS weekly_report,
DROP COLUMN IF EXISTS dark_mode;

-- Note: The following columns are being removed because:
-- 1. disliked_ingredients: Not used in recipe generation
-- 2. cuisine_preferences: Removed from Edge Function, not used in onboarding
-- 3. meal_prep_interest: Collected but never used
-- 4. target_weight/protein/calories/carbs/fat: Nutrition targets not implemented
-- 5. notifications/meal_reminders/weekly_report: Settings features not implemented
-- 6. dark_mode: Theme feature not implemented

-- Step 2: Update the create_user_profile function to remove references to deprecated columns
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

  -- Insert the new profile (without deprecated columns)
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
    COALESCE((p_profile_data->'goals')::jsonb, '[]'::jsonb),
    COALESCE((p_profile_data->'dietary_preferences')::jsonb, '[]'::jsonb),
    COALESCE((p_profile_data->'allergens')::jsonb, '[]'::jsonb),
    p_profile_data->>'equipment',
    p_profile_data->>'cooking_frequency',
    COALESCE((p_profile_data->>'default_serving_size')::integer, 2),
    p_profile_data->>'profile_image_url',
    COALESCE((p_profile_data->>'metric_units')::boolean, false),
    COALESCE((p_profile_data->>'has_completed_onboarding')::boolean, false)
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;
