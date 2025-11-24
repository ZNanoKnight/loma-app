# Phase 3 AI Recipe Generation - Deployment Guide

## Overview

This guide covers the deployment and testing of Phase 3: AI Recipe Generation. All code has been implemented and is ready for deployment.

**Status**: ✅ Code Complete - Ready for Deployment

---

## Pre-Deployment Checklist

### ✅ Code Implementation Complete

- [x] Prompt template and JSON schema created
- [x] generate-recipe Edge Function implemented
- [x] generation_logs table migration created
- [x] Data transformation layer (recipeTransformers.ts)
- [x] RecipeService.generateRecipe() updated
- [x] HomeScreen token deduction integrated
- [x] RecipeGeneratedScreen updated for AI recipes

### ⚠️ Deployment Tasks Remaining

- [ ] Obtain OpenAI API key
- [ ] Run database migration (generation_logs table)
- [ ] Set Supabase secrets
- [ ] Deploy Edge Function
- [ ] Run end-to-end tests

---

## Step 1: Obtain OpenAI API Key (5-10 minutes)

### Create OpenAI Account

1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Sign up with email or Google account
3. Verify your email address
4. Add payment method (credit card required)

### Generate API Key

1. Navigate to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it: `loma-app-production` (or `loma-app-development` for testing)
4. Copy the key immediately (starts with `sk-`)
5. **IMPORTANT**: Save the key securely - you won't be able to see it again

### Set Budget Limits (Recommended)

1. Go to [https://platform.openAI.com/account/billing/limits](https://platform.openai.com/account/billing/limits)
2. Set monthly budget: $100 (adjust based on user base)
3. Set email alerts at: 50%, 75%, 90%, 100%
4. Save settings

### Test API Key

```bash
# Test the API key works
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

Expected: List of available models including `gpt-4o-mini`

---

## Step 2: Run Database Migration (5 minutes)

### Option A: Using Supabase CLI

```bash
# Navigate to project directory
cd loma-app

# Apply the migration
supabase db push

# Verify table was created
supabase db list
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click "New Query"
4. Copy the contents of `supabase/migrations/20250123_create_generation_logs.sql`
5. Paste into the query editor
6. Click "Run"
7. Verify success message

### Verify Table Creation

Run this query in SQL Editor:

```sql
SELECT * FROM generation_logs LIMIT 1;
```

Expected: Empty table with correct columns

### Verify RLS Policies

```sql
SELECT * FROM pg_policies WHERE tablename = 'generation_logs';
```

Expected: 3 policies (SELECT for users, INSERT for service, UPDATE for service)

---

## Step 3: Set Supabase Secrets (5 minutes)

### Set OpenAI API Key

```bash
# Set the OpenAI API key as a Supabase secret
supabase secrets set OPENAI_API_KEY=sk-your-actual-key-here

# Verify it was set (will show <redacted> for security)
supabase secrets list
```

Expected output:
```
NAME               VALUE
OPENAI_API_KEY     <redacted>
```

### Verify Existing Secrets

```bash
supabase secrets list
```

Expected secrets:
- `OPENAI_API_KEY` (new)
- `STRIPE_SECRET_KEY` (from Phase 2)
- `STRIPE_WEBHOOK_SECRET` (from Phase 2)
- `SUPABASE_URL` (automatic)
- `SUPABASE_SERVICE_ROLE_KEY` (automatic)

---

## Step 4: Deploy Edge Function (10 minutes)

### Deploy generate-recipe Function

```bash
# Navigate to project directory
cd loma-app

# Deploy the function
supabase functions deploy generate-recipe

# Verify deployment
supabase functions list
```

Expected output:
```
┌──────────────────────┬────────┬───────────────────────┐
│ Name                 │ Status │ Updated               │
├──────────────────────┼────────┼───────────────────────┤
│ generate-recipe      │ ACTIVE │ 2025-01-23 12:00:00   │
│ create-payment-intent│ ACTIVE │ 2025-01-xx xx:xx:xx   │
│ stripe-webhook-handler│ACTIVE │ 2025-01-xx xx:xx:xx   │
│ validate-token-usage │ ACTIVE │ 2025-01-xx xx:xx:xx   │
│ deduct-token         │ ACTIVE │ 2025-01-xx xx:xx:xx   │
│ create-portal-session│ ACTIVE │ 2025-01-xx xx:xx:xx   │
└──────────────────────┴────────┴───────────────────────┘
```

### View Function Logs

```bash
# View recent logs
supabase functions logs generate-recipe --limit 50

# Follow logs in real-time
supabase functions logs generate-recipe --tail
```

---

## Step 5: Test Edge Function (15 minutes)

### Get User JWT Token

**Option A - From Supabase Dashboard:**
1. Go to Supabase Dashboard → Authentication → Users
2. Click on a test user
3. Copy the JWT token

**Option B - From App Login:**
1. Log in to the app
2. Check console logs for JWT token
3. Or use: `await AuthService.getSession()` in app

### Test with curl

```bash
# Set variables
export USER_TOKEN="your-jwt-token-here"
export PROJECT_REF="your-project-ref"

# Test breakfast generation
curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/generate-recipe \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_type": "breakfast",
    "custom_request": "Quick and healthy"
  }'
```

### Expected Response

```json
{
  "success": true,
  "recipes": [
    {
      "id": "uuid-here",
      "title": "Recipe Title 1",
      "description": "...",
      "emoji": "🥗",
      "meal_type": "breakfast",
      "prep_time": 15,
      "cook_time": 20,
      "total_time": 35,
      "servings": 2,
      "difficulty": "easy",
      "calories": 420,
      "protein": 15,
      "carbs": 52,
      "fats": 18,
      "fiber": 12,
      "sugar": 6,
      "sodium": 340,
      "cholesterol": 0,
      "ingredients": [...],
      "instructions": [...],
      "equipment": [...],
      "tags": [...],
      "created_at": "2025-01-23T12:00:00Z"
    },
    // ... 3 more recipes
  ],
  "metadata": {
    "tokens_used": 4200,
    "estimated_cost": 0.0023,
    "generation_time": "2025-01-23T12:00:00Z"
  }
}
```

### Verify in Database

```sql
-- Check recipes were created
SELECT id, title, meal_type, created_at
FROM recipes
ORDER BY created_at DESC
LIMIT 10;

-- Check user_recipes links
SELECT ur.*, r.title
FROM user_recipes ur
JOIN recipes r ON r.id = ur.recipe_id
ORDER BY ur.created_at DESC
LIMIT 10;

-- Check generation log
SELECT *
FROM generation_logs
ORDER BY timestamp DESC
LIMIT 10;
```

### Test All Meal Types

```bash
# Test lunch
curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/generate-recipe \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meal_type": "lunch"}'

# Test dinner
curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/generate-recipe \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meal_type": "dinner"}'

# Test snack
curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/generate-recipe \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type": application/json" \
  -d '{"meal_type": "snack"}'
```

---

## Step 6: Test Client Integration (30 minutes)

### Prepare Test Environment

1. Ensure you're running the latest code:
   ```bash
   git pull
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open the app on iOS simulator or Android emulator

### Test Scenario 1: Happy Path

**Prerequisites**: User has at least 1 token

1. Log in to the app
2. Navigate to HomeScreen
3. Verify token balance displays (e.g., "5 Munchies left")
4. Select a meal type (e.g., Breakfast)
5. Optionally add custom request
6. Tap "Generate 4 Recipes"
7. Wait 5-10 seconds (loading indicator should show)
8. Verify RecipeGeneratedScreen appears with 4 recipes
9. Verify each recipe has:
   - Title
   - Emoji
   - Calories, Protein, Carbs, Fats
10. Select one recipe
11. Tap "Select Meal"
12. Verify navigation to RecipeReviewScreen
13. Go back to HomeScreen
14. Verify token balance decreased by 1

**Expected Result**: ✅ All steps complete successfully

### Test Scenario 2: Zero Tokens

**Prerequisites**: User has 0 tokens

1. Manually set tokens to 0 in database:
   ```sql
   UPDATE subscriptions SET tokens_balance = 0 WHERE user_id = 'USER_ID';
   ```

2. Navigate to HomeScreen
3. Select a meal type
4. Tap "Generate 4 Recipes"
5. Verify alert appears: "Out of Munchies 🍪"
6. Verify "Manage Subscription" option
7. Verify generation is blocked

**Expected Result**: ✅ Generation blocked, user directed to subscription

### Test Scenario 3: Network Error / AI Failure

**Temporarily disable internet or OpenAI API key to simulate failure**

1. Navigate to HomeScreen
2. Select a meal type
3. Tap "Generate 4 Recipes"
4. Wait for error
5. Verify alert: "Generation Failed"
6. Verify "Retry" option available
7. Tap "Retry"
8. Re-enable internet
9. Verify generation succeeds on retry

**Expected Result**: ✅ No token deducted on failure, free retry works

### Test Scenario 4: Personalization

**Prerequisites**: User profile has dietary restrictions and allergens set

1. Update user profile to include:
   - Dietary restrictions: Vegetarian
   - Allergens: Nuts, Dairy
   - Goals: Weight Loss
   - Equipment: Oven, Blender

2. Generate breakfast recipes
3. Verify generated recipes:
   - Contain no meat/fish
   - Contain no nuts or dairy
   - Are suitable for weight loss (lower calories)
   - Use available equipment

**Expected Result**: ✅ Recipes match user preferences

### Test Scenario 5: Regeneration

1. Generate 4 recipes
2. On RecipeGeneratedScreen, tap "Generate Different Options"
3. Verify confirmation alert
4. Tap "Generate"
5. Verify navigation back to HomeScreen
6. Tap "Generate 4 Recipes" again
7. Verify new set of 4 recipes generated
8. Verify token deducted again (total 2 tokens used)

**Expected Result**: ✅ Can regenerate for additional token

---

## Step 7: Monitor Costs (Ongoing)

### Check OpenAI Dashboard

1. Go to [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. View usage for today
3. Verify cost per request matches expectations (~$0.002-$0.003)

### Check generation_logs Table

```sql
-- Daily cost summary
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_generations,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(estimated_cost) as total_cost,
  AVG(estimated_cost) as avg_cost_per_gen,
  AVG(token_count) as avg_tokens
FROM generation_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

Expected for testing:
- 5-10 test generations
- Success rate: 90-100%
- Cost per generation: $0.002-$0.003
- Tokens per generation: 4,000-5,000

### Set Up Monitoring

```sql
-- Create a view for easy monitoring
CREATE VIEW generation_stats AS
SELECT
  DATE(timestamp) as date,
  COUNT(*) as generations,
  SUM(estimated_cost) as cost,
  AVG(token_count) as avg_tokens,
  SUM(CASE WHEN success THEN 0 ELSE 1 END) as errors
FROM generation_logs
GROUP BY DATE(timestamp);

-- Query the view
SELECT * FROM generation_stats ORDER BY date DESC LIMIT 7;
```

---

## Troubleshooting

### Issue: "OPENAI_API_KEY not configured"

**Cause**: Secret not set or function not redeployed after setting

**Solution**:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase functions deploy generate-recipe
```

### Issue: "Failed to fetch user profile"

**Cause**: User profile missing or RLS policy blocking

**Solution**:
1. Verify user has profile:
   ```sql
   SELECT * FROM user_profiles WHERE user_id = 'USER_ID';
   ```
2. If missing, create profile via onboarding flow
3. Check RLS allows service role access

### Issue: "AI returned invalid JSON response"

**Cause**: OpenAI returned malformed JSON (rare)

**Solution**:
- Check OpenAI status page
- Review function logs for exact response
- Retry usually succeeds

### Issue: High Costs

**Solution**:
1. Check for abusive users:
   ```sql
   SELECT user_id, COUNT(*) as gens, SUM(estimated_cost) as cost
   FROM generation_logs
   WHERE timestamp > NOW() - INTERVAL '24 hours'
   GROUP BY user_id
   ORDER BY cost DESC
   LIMIT 10;
   ```

2. Implement rate limiting (future enhancement)
3. Review prompt length for optimization

### Issue: Recipes Don't Match Preferences

**Solution**:
1. Verify user profile data is correct
2. Test prompt in OpenAI Playground
3. Adjust system prompt for stronger enforcement
4. Check generation logs for patterns

---

## Success Criteria

### Technical Metrics

- [ ] Recipe generation completes in <10 seconds (95th percentile)
- [ ] Success rate >95%
- [ ] Cost per generation <$0.003
- [ ] Token count per generation: 4,000-5,000
- [ ] All 4 recipes returned every time
- [ ] No token deduction on failures

### Quality Metrics

- [ ] Recipes match dietary restrictions 100%
- [ ] Recipes avoid allergens 100%
- [ ] Recipes include all required fields
- [ ] Nutritional data is realistic
- [ ] Instructions are clear and actionable
- [ ] Recipe quality rating (user feedback) >4/5 stars

### User Experience Metrics

- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Free retry works on failures
- [ ] Token balance updates immediately
- [ ] Regeneration works correctly
- [ ] Recipe selection and navigation works

---

## Post-Deployment Checklist

### Immediate (Day 1)

- [ ] Monitor OpenAI costs hourly
- [ ] Check error rates in generation_logs
- [ ] Verify all test scenarios pass
- [ ] Review first 10-20 generated recipes for quality
- [ ] Collect initial user feedback

### Short-term (Week 1)

- [ ] Daily cost monitoring
- [ ] Review generation_logs for patterns
- [ ] Iterate on prompt based on quality feedback
- [ ] Monitor token deduction accuracy
- [ ] Check for edge cases or bugs

### Medium-term (Month 1)

- [ ] Set up automated cost alerts
- [ ] Implement prompt caching (optional)
- [ ] A/B test different prompts
- [ ] Analyze user preferences vs generation patterns
- [ ] Consider recipe caching for cost optimization

---

## Next Steps

After successful deployment and testing:

1. **Phase 4: Data Persistence & Progress Tracking**
   - Real streak tracking
   - Cooking session tracking
   - Achievement system
   - Analytics & insights

2. **Future Enhancements**
   - Recipe images (DALL-E integration)
   - Batch meal planning
   - Nutrition database validation
   - User feedback loop for AI improvement
   - Cost optimization (caching, etc.)

---

## Support & Resources

### Documentation
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [generate-recipe README](./supabase/functions/generate-recipe/README.md)

### Command Reference

```bash
# View function logs
supabase functions logs generate-recipe --limit 100

# View secrets
supabase secrets list

# Redeploy function
supabase functions deploy generate-recipe

# Test API
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-recipe \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meal_type": "breakfast"}'
```

### SQL Queries

```sql
-- Recent generations
SELECT * FROM generation_logs ORDER BY timestamp DESC LIMIT 20;

-- Daily stats
SELECT DATE(timestamp), COUNT(*), SUM(estimated_cost)
FROM generation_logs
GROUP BY DATE(timestamp);

-- Error analysis
SELECT error_message, COUNT(*)
FROM generation_logs
WHERE success = false
GROUP BY error_message;
```

---

**Status**: ✅ Ready for Deployment

**Next Action**: Obtain OpenAI API key and begin Step 1

**Estimated Deployment Time**: 1-2 hours (including testing)

**Questions or Issues**: Check troubleshooting section or review function logs
