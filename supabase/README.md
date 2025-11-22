# Loma App Database Schema

This directory contains the database schema and migration files for the Loma App.

## Schema Overview

The database consists of 5 main tables:

### 1. **user_profiles**
Extends Supabase's built-in `auth.users` with app-specific data from onboarding.

**Key Fields:**
- Personal info: `first_name`, `last_name`, `age`, `weight`, `height_*`, `gender`
- Activity: `activity_level`, `goals[]`
- Dietary: `dietary_preferences[]`, `allergens[]`, `disliked_ingredients[]`
- Cooking: `equipment`, `cooking_frequency`, `default_serving_size`
- Targets: `target_weight`, `target_protein`, `target_calories`
- Settings: `notifications`, `dark_mode`, `metric_units`

**Relationship:** One-to-one with `auth.users`

---

### 2. **recipes**
Stores all AI-generated recipes.

**Key Fields:**
- Basic: `title`, `description`, `emoji`, `meal_type`
- Timing: `prep_time`, `cook_time`, `total_time`
- Nutrition: `calories`, `protein`, `carbs`, `fats`, etc.
- Content: `ingredients` (JSONB), `instructions` (JSONB), `equipment` (JSONB)
- Generation: `generated_by_user_id`, `ai_model`, `generation_prompt`

**JSONB Structures:**
```json
// ingredients
[
  { "name": "Chicken Breast", "amount": "2", "unit": "pieces" },
  { "name": "Olive Oil", "amount": "1", "unit": "tbsp" }
]

// instructions
[
  { "step": 1, "description": "Preheat oven...", "time": 5 },
  { "step": 2, "description": "Season chicken...", "time": 3 }
]

// equipment
[
  { "name": "Oven", "required": true },
  { "name": "Baking sheet", "required": true }
]
```

**Relationship:** Many-to-many with users via `user_recipes`

---

### 3. **user_recipes**
Junction table linking users to their saved/favorited recipes.

**Key Fields:**
- Links: `user_id`, `recipe_id`
- Interactions: `is_favorite`, `is_saved`, `rating`, `notes`
- Tracking: `cooked_count`, `last_cooked_at`

**Relationship:** Many-to-many between `auth.users` and `recipes`

---

### 4. **subscriptions**
Manages user subscriptions and token ("Munchies") balances.

**Key Fields:**
- Plan: `plan` (weekly/monthly/yearly), `status`
- Tokens: `tokens_balance`, `tokens_used`, `tokens_total`
- Stripe: `stripe_customer_id`, `stripe_subscription_id`
- Timing: `current_period_start`, `current_period_end`

**Relationship:** One-to-one with `auth.users`

**Token Plans:**
- Weekly: 5 Munchies
- Monthly: 20 Munchies
- Yearly: 240 Munchies

---

### 5. **progress_tracking**
Tracks user progress, streaks, achievements.

**Key Fields:**
- Streaks: `current_streak`, `longest_streak`, `last_activity_date`
- Weekly: `weekly_progress` (JSONB array), `week_start_date`
- Metrics: `total_recipes_generated`, `total_recipes_saved`, `total_recipes_cooked`
- Savings: `hours_saved`, `money_saved`
- Achievements: `achievements` (JSONB array)

**Relationship:** One-to-one with `auth.users`

---

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **user_profiles**: Users can only access their own profile
- **recipes**: Users can read all recipes, but only update ones they generated
- **user_recipes**: Users can only access their own saved recipes
- **subscriptions**: Users can read their own; only service role can update (for webhooks)
- **progress_tracking**: Users can only access their own progress

---

## Automatic Initialization

When a new user signs up via Supabase Auth:
1. A trigger automatically creates:
   - Default subscription record (8 free tokens)
   - Default progress tracking record
2. The app creates the user_profile record after onboarding

---

## How to Apply This Schema

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/rxiaamsmhezlmdbwzmgx
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `schema.sql`
5. Paste into the editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for "Success. No rows returned" message

### Option 2: Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref rxiaamsmhezlmdbwzmgx

# Apply migration
supabase db push
```

---

## Verifying the Schema

After running the SQL:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see 5 new tables:
   - `user_profiles`
   - `recipes`
   - `user_recipes`
   - `subscriptions`
   - `progress_tracking`

3. Click on each table to see:
   - Columns and data types
   - RLS policies (in the "Policies" tab)
   - Indexes

---

## Next Steps

After schema is created:
1. ✅ Test authentication (sign up a test user)
2. ✅ Verify automatic subscription + progress creation
3. ✅ Test creating a user profile
4. ✅ Implement data migration for existing local users

---

## Maintenance

### Adding a new column
```sql
ALTER TABLE user_profiles
ADD COLUMN new_field TEXT;
```

### Updating RLS policy
```sql
DROP POLICY "policy_name" ON table_name;
CREATE POLICY "new_policy_name" ON table_name ...;
```

### Viewing all policies
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## Common Queries

### Get user's complete profile
```sql
SELECT
  u.email,
  p.*,
  s.tokens_balance,
  pr.current_streak
FROM auth.users u
LEFT JOIN user_profiles p ON p.user_id = u.id
LEFT JOIN subscriptions s ON s.user_id = u.id
LEFT JOIN progress_tracking pr ON pr.user_id = u.id
WHERE u.id = 'user-uuid-here';
```

### Get user's saved recipes with details
```sql
SELECT
  r.*,
  ur.is_favorite,
  ur.rating,
  ur.cooked_count,
  ur.last_cooked_at
FROM user_recipes ur
JOIN recipes r ON r.id = ur.recipe_id
WHERE ur.user_id = 'user-uuid-here'
  AND ur.is_saved = true
ORDER BY ur.saved_at DESC;
```

### Check token balance
```sql
SELECT tokens_balance, plan, status
FROM subscriptions
WHERE user_id = 'user-uuid-here';
```

---

## Troubleshooting

### "permission denied for schema auth"
- This is normal if running from client
- The trigger on `auth.users` requires service role
- Apply via Supabase Dashboard instead

### "relation already exists"
- Tables already created
- Either DROP tables first or use `CREATE TABLE IF NOT EXISTS`

### RLS blocking queries
- Check you're authenticated: `SELECT auth.uid();`
- Should return your user UUID
- If null, you're not authenticated

---

## Support

For database questions:
- Supabase Docs: https://supabase.com/docs/guides/database
- Supabase Discord: https://discord.supabase.com
