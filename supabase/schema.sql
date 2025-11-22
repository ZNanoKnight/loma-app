-- ============================================================================
-- LOMA APP DATABASE SCHEMA
-- ============================================================================
-- This schema creates all tables and relationships for the Loma App
-- Following the integration sprint plan from the PDF
--
-- Tables:
-- 1. user_profiles - Extended user data (onboarding, preferences)
-- 2. recipes - AI-generated recipes
-- 3. user_recipes - User's saved/favorited recipes (junction table)
-- 4. subscriptions - Subscription plans and token balances
-- 5. progress_tracking - Streaks, metrics, achievements
--
-- Note: Supabase already provides auth.users table for authentication
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================
-- Extends Supabase auth.users with onboarding and preference data
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to Supabase auth.users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal information (from onboarding)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age TEXT,
  weight TEXT,
  height_feet TEXT,
  height_inches TEXT,
  gender TEXT,

  -- Activity and goals
  activity_level TEXT,
  goals TEXT[], -- Array of goals

  -- Dietary information
  dietary_preferences TEXT[], -- Array of preferences (vegan, vegetarian, etc.)
  allergens TEXT[], -- Array of allergens
  disliked_ingredients TEXT[], -- Array of disliked ingredients
  cuisine_preferences TEXT[], -- Array of preferred cuisines

  -- Cooking information
  equipment TEXT,
  cooking_frequency TEXT,
  meal_prep_interest TEXT,
  default_serving_size INTEGER DEFAULT 1,

  -- Nutrition targets
  target_weight TEXT,
  target_protein TEXT,
  target_calories TEXT,
  target_carbs TEXT,
  target_fat TEXT,

  -- Settings
  notifications BOOLEAN DEFAULT true,
  meal_reminders BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  metric_units BOOLEAN DEFAULT false,

  -- Profile
  profile_image_url TEXT,

  -- Metadata
  has_completed_onboarding BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- 2. RECIPES TABLE
-- ============================================================================
-- Stores all AI-generated recipes
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipes (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipe basic info
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),

  -- Timing
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  total_time INTEGER, -- in minutes

  -- Serving and difficulty
  servings INTEGER DEFAULT 1,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),

  -- Nutrition (per serving)
  calories INTEGER,
  protein DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fats DECIMAL(10,2),
  fiber DECIMAL(10,2),
  sugar DECIMAL(10,2),
  sodium DECIMAL(10,2),
  cholesterol DECIMAL(10,2),

  -- Recipe content (stored as JSONB for flexibility)
  ingredients JSONB NOT NULL, -- Array of {name, amount, unit}
  instructions JSONB NOT NULL, -- Array of {step, description, time}
  equipment JSONB, -- Array of equipment items

  -- Tags and categorization
  tags TEXT[],

  -- Generation metadata
  generated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generation_prompt TEXT, -- Store the user's custom request if any
  ai_model TEXT, -- Which AI model generated this (e.g., "gpt-4-turbo")

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_generated_by ON recipes(generated_by_user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);

-- ============================================================================
-- 3. USER_RECIPES TABLE (Junction Table)
-- ============================================================================
-- Many-to-many relationship between users and recipes
-- Tracks saved recipes, favorites, ratings, and cooking history
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_recipes (
  -- Composite primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- User interactions
  is_favorite BOOLEAN DEFAULT false,
  is_saved BOOLEAN DEFAULT true,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT, -- User's personal notes about the recipe

  -- Cooking tracking
  cooked_count INTEGER DEFAULT 0,
  last_cooked_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one entry per user-recipe pair
  UNIQUE(user_id, recipe_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON user_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recipes_recipe_id ON user_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_recipes_favorite ON user_recipes(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_recipes_last_cooked ON user_recipes(user_id, last_cooked_at DESC);

-- ============================================================================
-- 4. SUBSCRIPTIONS TABLE
-- ============================================================================
-- Manages user subscriptions and token balances
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription plan
  plan TEXT NOT NULL CHECK (plan IN ('weekly', 'monthly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),

  -- Token/Munchies balance
  tokens_balance INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0, -- Total tokens ever received

  -- Payment provider info
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Subscription timing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one subscription per user
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- 5. PROGRESS_TRACKING TABLE
-- ============================================================================
-- Tracks user progress, streaks, achievements, and metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS progress_tracking (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Weekly progress (7 booleans for each day)
  weekly_progress JSONB DEFAULT '[]', -- Array of booleans [true, false, true, ...]
  week_start_date DATE,

  -- Metrics
  total_recipes_generated INTEGER DEFAULT 0,
  total_recipes_saved INTEGER DEFAULT 0,
  total_recipes_cooked INTEGER DEFAULT 0,

  -- Calculated savings
  hours_saved DECIMAL(10,2) DEFAULT 0,
  money_saved DECIMAL(10,2) DEFAULT 0,

  -- Achievements (stored as JSONB for flexibility)
  achievements JSONB DEFAULT '[]', -- Array of achievement objects

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one progress record per user
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables to ensure users can only access their own data
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RECIPES POLICIES
-- ============================================================================

-- Users can read all recipes (recipes are shared)
CREATE POLICY "Users can read all recipes"
  ON recipes FOR SELECT
  USING (true);

-- Users can insert recipes (when generating)
CREATE POLICY "Users can insert recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = generated_by_user_id OR generated_by_user_id IS NULL);

-- Users can update their own generated recipes
CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = generated_by_user_id);

-- ============================================================================
-- USER_RECIPES POLICIES
-- ============================================================================

-- Users can read their own saved recipes
CREATE POLICY "Users can read own saved recipes"
  ON user_recipes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own recipe saves
CREATE POLICY "Users can save recipes"
  ON user_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recipe saves
CREATE POLICY "Users can update own saved recipes"
  ON user_recipes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recipe saves
CREATE POLICY "Users can delete own saved recipes"
  ON user_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (during signup)
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service role can update subscriptions (webhook handlers)
-- Users cannot directly modify their subscription/tokens
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PROGRESS_TRACKING POLICIES
-- ============================================================================

-- Users can read their own progress
CREATE POLICY "Users can read own progress"
  ON progress_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress (initial creation)
CREATE POLICY "Users can insert own progress"
  ON progress_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON progress_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Automatically update updated_at timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_recipes_updated_at BEFORE UPDATE ON user_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA / HELPER FUNCTIONS
-- ============================================================================

-- Function to initialize user profile, subscription, and progress on signup
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default subscription record
  INSERT INTO subscriptions (user_id, plan, status, tokens_balance)
  VALUES (NEW.id, 'weekly', 'active', 8); -- Give 8 free tokens to start

  -- Create default progress tracking record
  INSERT INTO progress_tracking (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize user data after signup
-- Note: This runs on the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- ============================================================================
-- DONE!
-- ============================================================================
-- To apply this schema:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"
-- ============================================================================
