-- Create generation_logs table for AI cost monitoring and analytics
-- This table tracks every recipe generation attempt (successful or failed)

CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  ai_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  estimated_cost DECIMAL(10,6) NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_generation_logs_user_id ON generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_timestamp ON generation_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_success ON generation_logs(success);
CREATE INDEX IF NOT EXISTS idx_generation_logs_meal_type ON generation_logs(meal_type);

-- Enable Row Level Security
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own generation logs
CREATE POLICY "Users can view own generation logs"
  ON generation_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert generation logs
CREATE POLICY "Service role can insert generation logs"
  ON generation_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Service role can update generation logs
CREATE POLICY "Service role can update generation logs"
  ON generation_logs
  FOR UPDATE
  USING (true);

-- Add helpful comments
COMMENT ON TABLE generation_logs IS 'Tracks all AI recipe generation attempts for cost monitoring and analytics';
COMMENT ON COLUMN generation_logs.user_id IS 'User who requested the generation';
COMMENT ON COLUMN generation_logs.timestamp IS 'When the generation was attempted';
COMMENT ON COLUMN generation_logs.meal_type IS 'Type of meal requested (breakfast, lunch, dinner, snack)';
COMMENT ON COLUMN generation_logs.success IS 'Whether the generation succeeded';
COMMENT ON COLUMN generation_logs.error_message IS 'Error message if generation failed';
COMMENT ON COLUMN generation_logs.ai_model IS 'AI model used (e.g., gpt-4o-mini)';
COMMENT ON COLUMN generation_logs.estimated_cost IS 'Estimated cost in USD for this generation';
COMMENT ON COLUMN generation_logs.token_count IS 'Total tokens used (prompt + completion)';
COMMENT ON COLUMN generation_logs.prompt_tokens IS 'Tokens in the input prompt';
COMMENT ON COLUMN generation_logs.completion_tokens IS 'Tokens in the AI response';

-- Useful admin queries for cost monitoring

-- Query 1: Daily cost summary
-- SELECT
--   DATE(timestamp) as date,
--   COUNT(*) as total_generations,
--   SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
--   SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed,
--   SUM(estimated_cost) as total_cost,
--   AVG(estimated_cost) as avg_cost,
--   SUM(token_count) as total_tokens
-- FROM generation_logs
-- GROUP BY DATE(timestamp)
-- ORDER BY date DESC;

-- Query 2: Top users by cost
-- SELECT
--   user_id,
--   COUNT(*) as generations,
--   SUM(estimated_cost) as total_cost,
--   AVG(estimated_cost) as avg_cost_per_gen,
--   SUM(token_count) as total_tokens
-- FROM generation_logs
-- WHERE success = true
-- GROUP BY user_id
-- ORDER BY total_cost DESC
-- LIMIT 20;

-- Query 3: Error rate analysis
-- SELECT
--   DATE(timestamp) as date,
--   meal_type,
--   COUNT(*) as total_attempts,
--   SUM(CASE WHEN success THEN 0 ELSE 1 END) as errors,
--   ROUND(100.0 * SUM(CASE WHEN success THEN 0 ELSE 1 END) / COUNT(*), 2) as error_rate_pct
-- FROM generation_logs
-- GROUP BY DATE(timestamp), meal_type
-- ORDER BY date DESC, meal_type;

-- Query 4: Cost breakdown by meal type
-- SELECT
--   meal_type,
--   COUNT(*) as generations,
--   SUM(estimated_cost) as total_cost,
--   AVG(estimated_cost) as avg_cost,
--   AVG(token_count) as avg_tokens
-- FROM generation_logs
-- WHERE success = true
-- GROUP BY meal_type
-- ORDER BY total_cost DESC;

-- Query 5: Recent generation activity
-- SELECT
--   gl.timestamp,
--   gl.meal_type,
--   gl.success,
--   gl.error_message,
--   gl.estimated_cost,
--   gl.token_count,
--   u.email as user_email
-- FROM generation_logs gl
-- JOIN auth.users u ON u.id = gl.user_id
-- ORDER BY gl.timestamp DESC
-- LIMIT 50;
