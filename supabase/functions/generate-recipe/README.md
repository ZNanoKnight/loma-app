# generate-recipe Edge Function

## Overview

This Supabase Edge Function generates 4 personalized recipe variants using OpenAI's GPT-4o-mini model. It incorporates comprehensive user preferences including dietary restrictions, allergens, cuisine preferences, health goals, and available equipment.

## Features

- **Full Personalization**: Uses all user profile data for tailored recipes
- **4 Recipe Variants**: Generates 4 diverse options per request
- **Cost Tracking**: Logs token usage and estimated costs
- **Error Handling**: Comprehensive error handling with detailed logging
- **Database Integration**: Automatically stores recipes and links to user
- **Nutritional Accuracy**: Provides detailed nutritional information

## Prerequisites

1. OpenAI API key (GPT-4o-mini access)
2. Supabase project with database schema deployed
3. User profile with preferences populated

## Deployment

### Step 1: Set OpenAI API Key

```bash
# Set the OpenAI API key as a Supabase secret
supabase secrets set OPENAI_API_KEY=sk-xxxxx

# Verify the secret is set
supabase secrets list
```

### Step 2: Deploy the Edge Function

```bash
# Navigate to project root
cd loma-app

# Deploy the function
supabase functions deploy generate-recipe

# Verify deployment
supabase functions list
```

### Step 3: Create Database Table

```bash
# Run the migration to create generation_logs table
supabase migration up
```

Alternatively, run the SQL manually:
```bash
psql -h YOUR_DB_HOST -U postgres -d postgres -f supabase/migrations/20250123_create_generation_logs.sql
```

## API Reference

### Endpoint

```
POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-recipe
```

### Headers

```
Authorization: Bearer USER_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
  "custom_request": "Optional custom request string"
}
```

### Response (Success)

```json
{
  "success": true,
  "recipes": [
    {
      "id": "uuid",
      "title": "Recipe Title",
      "description": "Brief description",
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

### Response (Error)

```json
{
  "success": false,
  "error": "Error message"
}
```

## Testing

### Test with curl

```bash
# Get your user JWT token from Supabase dashboard or login response
export USER_TOKEN="your-jwt-token"

# Test breakfast generation
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-recipe \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_type": "breakfast",
    "custom_request": "Something quick and healthy"
  }'
```

### Test with Postman

1. Create new POST request
2. URL: `https://YOUR_PROJECT.supabase.co/functions/v1/generate-recipe`
3. Headers:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
   - `Content-Type`: `application/json`
4. Body (raw JSON):
```json
{
  "meal_type": "dinner",
  "custom_request": "Family-friendly Italian meal"
}
```

### Expected Behavior

✅ **Success Criteria:**
- Returns exactly 4 recipes
- Each recipe has all required fields
- Recipes respect dietary restrictions
- Recipes avoid allergens
- Generation completes in <15 seconds
- Cost is logged to database
- Recipes are stored in `recipes` table
- User links created in `user_recipes` table

❌ **Error Scenarios:**
- Missing authorization → 401 error
- Invalid meal_type → 500 error with message
- OpenAI API timeout → 500 error with retry suggestion
- Malformed AI response → 500 error logged

## Cost Monitoring

### Check Recent Generations

```sql
SELECT
  timestamp,
  meal_type,
  success,
  estimated_cost,
  token_count,
  error_message
FROM generation_logs
ORDER BY timestamp DESC
LIMIT 20;
```

### Daily Cost Summary

```sql
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_generations,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(estimated_cost) as total_cost,
  AVG(estimated_cost) as avg_cost_per_gen
FROM generation_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Top Users by Cost

```sql
SELECT
  user_id,
  COUNT(*) as generations,
  SUM(estimated_cost) as total_cost
FROM generation_logs
WHERE success = true
GROUP BY user_id
ORDER BY total_cost DESC
LIMIT 10;
```

## Cost Estimates

**GPT-4o-mini Pricing:**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Typical Generation:**
- Prompt tokens: ~1,100
- Completion tokens: ~3,500
- Total tokens: ~4,600
- **Cost per generation**: ~$0.0023 (4 recipes)

**Monthly Projections:**
- 1,000 users × 10 generations = 10,000 generations = ~$23/month
- 10,000 users × 10 generations = 100,000 generations = ~$230/month

## Troubleshooting

### Issue: "OPENAI_API_KEY not configured"

**Solution:**
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
supabase functions deploy generate-recipe
```

### Issue: "Failed to fetch user profile"

**Cause**: User profile doesn't exist or RLS policy blocking access

**Solution:**
1. Verify user has a profile in `user_profiles` table
2. Check RLS policies allow service role access
3. Ensure user completed onboarding

### Issue: "AI returned invalid JSON response"

**Cause**: OpenAI returned malformed JSON (rare but possible)

**Solution:**
- Check OpenAI dashboard for API status
- Review prompt template for issues
- Retry the request (usually succeeds on second attempt)

### Issue: High costs

**Solution:**
1. Check for abusive users in `generation_logs`
2. Implement rate limiting (future enhancement)
3. Consider switching to lower temperature for more consistent output
4. Review prompt length - optimize if too long

### Issue: Recipes don't match preferences

**Solution:**
1. Verify user profile has correct preferences
2. Test prompt template with OpenAI Playground
3. Adjust system prompt for stronger enforcement
4. Check generation_logs for error patterns

## Logs

View function logs:
```bash
supabase functions logs generate-recipe --limit 100
```

Filter for errors:
```bash
supabase functions logs generate-recipe --limit 100 | grep -i error
```

## Performance

**Target Performance:**
- Generation time: <10 seconds (95th percentile)
- Success rate: >95%
- Error rate: <5%
- Cost per generation: <$0.003

**Actual Performance** (monitor via logs):
- Check `generation_logs` table for metrics
- Review error rates daily
- Monitor OpenAI dashboard for usage trends

## Security

**Implemented:**
- ✅ JWT authentication required
- ✅ RLS policies on database tables
- ✅ CORS headers configured
- ✅ Service role key for database operations
- ✅ OpenAI API key in secrets (not in code)

**Best Practices:**
- Never commit API keys to git
- Rotate OpenAI API key periodically
- Monitor for unusual usage patterns
- Set OpenAI account budget limits

## Future Enhancements

Potential improvements for future versions:

1. **Caching**: Cache common recipe patterns to reduce costs
2. **Rate Limiting**: Prevent abuse with per-user rate limits
3. **Batch Processing**: Generate multiple meal plans at once
4. **Image Generation**: Add recipe images via DALL-E
5. **Nutrition Database**: Validate AI nutrition data against USDA database
6. **User Feedback**: Incorporate recipe ratings into future generations
7. **Prompt Optimization**: A/B test different prompts for quality
8. **Cost Optimization**: Implement prompt caching for system prompt

## Support

For issues or questions:
1. Check function logs: `supabase functions logs generate-recipe`
2. Review `generation_logs` table for error patterns
3. Test with Postman to isolate client vs server issues
4. Check OpenAI dashboard for API status
