-- Create user_stats table for tracking user progress data
-- This table stores computed progress statistics for each user

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_generation_date DATE,
  recipe_completions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for user_stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats"
  ON user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert user stats"
  ON user_stats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update user stats"
  ON user_stats
  FOR UPDATE
  USING (true);

-- Create user_achievements table for tracking unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  munchies_awarded INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create indexes for user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Enable Row Level Security
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert achievements"
  ON user_achievements
  FOR INSERT
  WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE user_stats IS 'Stores computed progress statistics for each user';
COMMENT ON COLUMN user_stats.current_streak IS 'Current consecutive days with recipe generation';
COMMENT ON COLUMN user_stats.best_streak IS 'Lifetime highest streak achieved';
COMMENT ON COLUMN user_stats.last_generation_date IS 'Date of last recipe generation for streak calculation';
COMMENT ON COLUMN user_stats.recipe_completions IS 'Number of times user completed cooking flow';

COMMENT ON TABLE user_achievements IS 'Tracks which achievements each user has unlocked';
COMMENT ON COLUMN user_achievements.achievement_id IS 'Identifier for the achievement (e.g., recipe_1, streak_7)';
COMMENT ON COLUMN user_achievements.munchies_awarded IS 'Number of munchies awarded for this achievement';

-- Function to update user streak when a recipe is generated
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_streak_val INTEGER;
  best_streak_val INTEGER;
  today DATE := CURRENT_DATE;
BEGIN
  -- Only process successful generations
  IF NEW.success = false THEN
    RETURN NEW;
  END IF;

  -- Get current user stats
  SELECT last_generation_date, current_streak, best_streak
  INTO last_date, current_streak_val, best_streak_val
  FROM user_stats
  WHERE user_id = NEW.user_id;

  -- If no stats exist, create initial record
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, current_streak, best_streak, last_generation_date)
    VALUES (NEW.user_id, 1, 1, today);
    RETURN NEW;
  END IF;

  -- If already generated today, do nothing
  IF last_date = today THEN
    RETURN NEW;
  END IF;

  -- If generated yesterday, increment streak
  IF last_date = today - 1 THEN
    current_streak_val := current_streak_val + 1;
  ELSE
    -- Streak broken, reset to 1
    current_streak_val := 1;
  END IF;

  -- Update best streak if current is higher
  IF current_streak_val > best_streak_val THEN
    best_streak_val := current_streak_val;
  END IF;

  -- Update user stats
  UPDATE user_stats
  SET current_streak = current_streak_val,
      best_streak = best_streak_val,
      last_generation_date = today,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update streak on generation
DROP TRIGGER IF EXISTS trigger_update_user_streak ON generation_logs;
CREATE TRIGGER trigger_update_user_streak
  AFTER INSERT ON generation_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- Function to check if streak needs to be reset (called by scheduled job or on app open)
CREATE OR REPLACE FUNCTION check_streak_reset(p_user_id UUID)
RETURNS void AS $$
DECLARE
  last_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT last_generation_date INTO last_date
  FROM user_stats
  WHERE user_id = p_user_id;

  -- If user hasn't generated in more than 1 day, reset streak
  IF FOUND AND last_date IS NOT NULL AND last_date < today - 1 THEN
    UPDATE user_stats
    SET current_streak = 0,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
