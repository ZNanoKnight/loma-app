# Edge Function Deployment Guide

## What Was Fixed

The Edge Function had poor error handling that was hiding the actual error. I've added:

1. **Detailed error capture** - Now captures and logs all Supabase query errors
2. **Better logging** - Console logs at each step to track progress
3. **Validation** - Checks for STRIPE_SECRET_KEY and subscription record existence
4. **Descriptive errors** - Returns specific error messages instead of generic "non-2xx" errors

## Changes Made

### Error Handling
- **Line 52-78**: Added error capture for subscription query with `.single()`
- **Line 81-104**: Added error handling for customer ID update
- **Line 107-138**: Added error handling for subscription ID update

### Logging
- All major operations now log to console
- Errors include full error messages and codes
- Success path is clearly logged

### Validation
- Checks if `STRIPE_SECRET_KEY` is set (line 20-23)
- Validates subscription record exists before proceeding (line 64-66)
- Validates auth token and user (line 47-50)

## Deployment Instructions

### Option 1: Deploy via Supabase CLI (Recommended)

```bash
cd loma-app

# Set your Supabase access token
set SUPABASE_ACCESS_TOKEN=your_access_token_here

# Deploy the function
npx supabase functions deploy create-payment-intent --project-ref rxiaamsmhezlmdbwzmgx
```

### Option 2: Deploy via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/rxiaamsmhezlmdbwzmgx/functions
2. Click on "create-payment-intent" function
3. Click "Deploy new version"
4. Copy the entire contents of `supabase/functions/create-payment-intent/index.ts`
5. Paste into the editor
6. Click "Deploy"

### Option 3: Deploy via REST API

```bash
# Create a zip of the function
cd supabase/functions/create-payment-intent
tar -czf function.tar.gz index.ts

# Upload via API (requires access token)
curl -X POST \
  "https://api.supabase.com/v1/projects/rxiaamsmhezlmdbwzmgx/functions/create-payment-intent/deploy" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@function.tar.gz"
```

## Verify Deployment

After deployment, test the function:

```bash
# Test with a real user token
curl -X POST https://rxiaamsmhezlmdbwzmgx.supabase.co/functions/v1/create-payment-intent \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planType": "monthly", "priceId": "price_1QfLXZF5X2M5UEkNq9fFHZ8g"}'
```

## Check Logs

After the function runs (either via app or curl test):

1. Go to https://supabase.com/dashboard/project/rxiaamsmhezlmdbwzmgx/logs/edge-functions
2. Filter by function: "create-payment-intent"
3. Look for detailed logs like:
   - `[Edge Function] create-payment-intent invoked`
   - `[Edge Function] User authenticated: <user_id>`
   - `[Edge Function] Request params: {...}`
   - Any error messages with full details

## Expected Error Messages (Now Detailed)

Before this fix, you saw:
```
Edge Function returned a non-2xx status code
```

Now you'll see specific errors like:
- `STRIPE_SECRET_KEY environment variable not set`
- `Unauthorized: Invalid JWT token`
- `Failed to fetch subscription: [specific Postgres error] (code: PGRST116)`
- `No subscription record found for user. Please complete signup first.`
- `Failed to save Stripe customer ID: [specific error]`
- `Failed to save Stripe subscription ID: [specific error]`

## Environment Variables to Verify

In Supabase Dashboard → Edge Functions → create-payment-intent → Settings:

- ✅ `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- ✅ `SUPABASE_URL` - Auto-populated by Supabase
- ✅ `SUPABASE_ANON_KEY` - Auto-populated by Supabase

## Next Steps

1. Deploy the updated function
2. Test the payment flow in the app
3. Check logs if error occurs - you'll now see the exact error
4. Share the error message with me if needed
