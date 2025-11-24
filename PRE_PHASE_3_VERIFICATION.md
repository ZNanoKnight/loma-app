# PRE-PHASE 3 VERIFICATION & DEPLOYMENT GUIDE

## Status: ✅ CRITICAL FIXES APPLIED

**Date**: 2025-01-23
**Version**: 1.0.0

---

## EXECUTIVE SUMMARY

All critical bugs have been fixed and the LOMA app is now ready for final testing and deployment before proceeding to Phase 3 (AI Recipe Generation).

### Fixes Applied:

1. ✅ **Email Query Bug Fixed** - create-payment-intent now uses `user.email` directly
2. ✅ **Token Allocation Logic Fixed** - Webhook replaces initial 8 tokens with plan tokens (5/20/240)
3. ✅ **Plan Field Added** - Webhook now sets subscription plan type (weekly/monthly/yearly)
4. ✅ **Method Names Verified** - getCurrentSession() is correctly named and called

### Remaining Tasks:

1. ⚠️ **Deploy Edge Functions to Supabase**
2. ⚠️ **Run Critical Manual Tests**
3. ⚠️ **Verify Production Readiness**

---

## DEPLOYMENT CHECKLIST

### Step 1: Verify Prerequisites

- [ ] Supabase account created and project active
- [ ] Stripe account created (test mode enabled)
- [ ] Environment variables configured in `.env`
- [ ] Supabase CLI installed: `npm install -g supabase`

### Step 2: Deploy Edge Functions

```bash
# Navigate to project directory
cd loma-app

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all Edge Functions
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook-handler
supabase functions deploy validate-token-usage
supabase functions deploy deduct-token
supabase functions deploy create-portal-session

# Verify deployment
supabase functions list
```

### Step 3: Set Supabase Secrets

```bash
# Set Stripe secret keys (NEVER commit these to git)
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Verify secrets are set
supabase secrets list
```

### Step 4: Configure Stripe Webhooks

1. Get your webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook-handler
   ```

2. In Stripe Dashboard → Developers → Webhooks:
   - Click "Add endpoint"
   - Paste webhook URL
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click "Add endpoint"

3. Copy the webhook signing secret (starts with `whsec_`)

4. Update Supabase secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET
   ```

5. Redeploy webhook handler to use new secret:
   ```bash
   supabase functions deploy stripe-webhook-handler
   ```

---

## CRITICAL MANUAL TESTS

### Test 1: New User Signup with Weekly Plan

**Expected Result**: User receives exactly 5 tokens (NOT 13)

**Steps**:
1. Start app: `npm start`
2. Complete onboarding flow
3. On PaymentScreen, select Weekly plan ($3.99)
4. Enter test card: `4242 4242 4242 4242`
5. Expiry: Any future date (e.g., 12/25)
6. CVC: Any 3 digits (e.g., 123)
7. ZIP: Any 5 digits (e.g., 12345)
8. Tap "Start Free Trial"
9. Wait for payment to complete
10. Navigate to main app

**Verify**:
- [ ] Payment succeeds
- [ ] HomeScreen displays "5 Munchies left"
- [ ] Supabase subscriptions table shows:
  - `tokens_balance = 5`
  - `tokens_total = 5`
  - `plan = 'weekly'`
  - `status = 'active'`
- [ ] Stripe dashboard shows customer and subscription

**SQL Query to Verify**:
```sql
SELECT
  s.user_id,
  s.plan,
  s.status,
  s.tokens_balance,
  s.tokens_total,
  s.stripe_customer_id,
  s.stripe_subscription_id
FROM subscriptions s
WHERE s.user_id = 'USER_ID_HERE';
```

---

### Test 2: New User Signup with Monthly Plan

**Expected Result**: User receives exactly 20 tokens (NOT 28)

**Steps**: Same as Test 1, but select Monthly plan ($7.99)

**Verify**:
- [ ] Payment succeeds
- [ ] HomeScreen displays "20 Munchies left"
- [ ] Supabase shows `tokens_balance = 20`, `plan = 'monthly'`

---

### Test 3: Webhook Processing

**Expected Result**: Webhook successfully updates subscription data

**Steps**:
1. Complete signup flow (any plan)
2. Go to Stripe Dashboard → Developers → Webhooks
3. Click on your webhook endpoint
4. Check "Webhook attempts" tab
5. Verify recent events show 200 status code

**Verify**:
- [ ] `customer.subscription.created` event delivered successfully
- [ ] Response code: 200
- [ ] No errors in webhook logs
- [ ] Supabase subscription record updated with Stripe IDs

**Check Supabase Logs**:
```bash
supabase functions logs stripe-webhook-handler --limit 50
```

---

### Test 4: Token Validation (Zero Tokens)

**Expected Result**: Generation blocked when tokens = 0

**Steps**:
1. Manually update subscription in Supabase:
   ```sql
   UPDATE subscriptions SET tokens_balance = 0 WHERE user_id = 'USER_ID';
   ```
2. Go to HomeScreen
3. Tap "Generate My Meal"

**Verify**:
- [ ] Alert appears: "You're out of Munchies!"
- [ ] Generation is blocked
- [ ] Prompt to upgrade subscription

---

### Test 5: Session Persistence

**Expected Result**: Auto-login after app restart

**Steps**:
1. Sign in to app
2. Navigate to HomeScreen
3. Force close app completely (swipe away from recent apps)
4. Reopen app

**Verify**:
- [ ] No login screen shown
- [ ] Loading indicator appears briefly
- [ ] User automatically logged in
- [ ] Profile data loaded
- [ ] Token balance displays correctly

---

### Test 6: Payment Failure Handling

**Expected Result**: Failed payment handled gracefully

**Steps**:
1. Start signup flow
2. Use declined test card: `4000 0000 0000 0002`
3. Complete payment flow

**Verify**:
- [ ] Payment fails with clear error message
- [ ] User can retry with different card
- [ ] No orphaned data in database

---

### Test 7: Subscription Screen Display

**Expected Result**: Real subscription data displays correctly

**Steps**:
1. Sign in with existing user
2. Navigate to Settings → Subscription

**Verify**:
- [ ] Plan name displays correctly (Weekly/Monthly/Yearly)
- [ ] Token balance matches database
- [ ] Status shows "Active"
- [ ] Renewal date displays
- [ ] "Manage Subscription" button works
- [ ] Clicking opens Stripe Customer Portal

---

### Test 8: Edge Function Endpoints

**Expected Result**: All endpoints return 200 OK

**Test create-payment-intent**:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-payment-intent \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planType": "monthly", "priceId": "price_YOUR_MONTHLY_PRICE_ID"}'
```

**Expected Response**:
```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "subscriptionId": "sub_xxxxx",
  "customerId": "cus_xxxxx"
}
```

**Test validate-token-usage**:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/validate-token-usage \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "hasTokens": true,
  "balance": 20,
  "status": "active",
  "currentPeriodEnd": "2025-02-23T00:00:00Z",
  "message": "Tokens available"
}
```

---

## KNOWN LIMITATIONS (Intentional for Phase 2)

### 🟡 Deferred to Phase 3

1. **Token Deduction Not Implemented**
   - **Location**: HomeScreen.tsx line 114
   - **Current Behavior**: Tokens validated but NOT deducted on recipe generation
   - **Reason**: AI integration not implemented yet (Phase 3)
   - **Phase 3 Fix**: Call `SubscriptionService.deductTokens()` after successful AI generation

2. **AI Recipe Generation Mock**
   - **Location**: RecipeService.generateRecipe()
   - **Current Behavior**: Throws "Not implemented" error
   - **Phase 3 Fix**: Implement OpenAI API integration

### 🟡 Future Enhancements (Post-Phase 3)

3. **Subscription Cancellation API**
   - **Location**: SubscriptionService.cancelSubscription()
   - **Current Behavior**: Only updates database status
   - **Workaround**: User must use Stripe Customer Portal
   - **Future Fix**: Create Edge Function to call Stripe cancellation API

4. **Payment Method Update**
   - **Current**: No in-app update
   - **Workaround**: Use Stripe Customer Portal

5. **Rate Limiting**
   - **Status**: Not implemented
   - **Risk**: Low (Supabase has default limits)
   - **Future**: Add custom rate limiting to Edge Functions

6. **Webhook Retry Mechanism**
   - **Status**: Relies on Stripe's built-in retries
   - **Future**: Add manual reconciliation script

7. **Token Audit Log**
   - **Status**: Not implemented
   - **Future**: Track all token changes for debugging

---

## PRODUCTION READINESS CHECKLIST

### Database
- [ ] All 5 tables created with correct schema
- [ ] RLS policies enabled and tested
- [ ] Triggers working (auto-initialization on signup)
- [ ] Indexes created for performance

### Authentication
- [ ] User signup flow working end-to-end
- [ ] User login working
- [ ] Password reset functional
- [ ] Session persistence tested
- [ ] Email verification working

### Payments
- [ ] Stripe test mode working
- [ ] All 3 plan tiers tested (Weekly/Monthly/Yearly)
- [ ] Webhook processing verified
- [ ] Token allocation correct
- [ ] Payment failure handling tested

### Edge Functions
- [ ] All 5 functions deployed
- [ ] All secrets configured
- [ ] Endpoints tested with curl
- [ ] Logs show no errors
- [ ] CORS configured correctly

### Security
- [ ] No secrets in source code
- [ ] RLS policies enforce user isolation
- [ ] Webhook signature verification working
- [ ] JWT authentication on all endpoints
- [ ] Optimistic locking prevents race conditions

### UI
- [ ] Token balance displays correctly
- [ ] Subscription screen shows real data
- [ ] Payment flow completes successfully
- [ ] Error messages user-friendly
- [ ] Loading states prevent confusion

---

## PHASE 3 REQUIREMENTS

Before starting Phase 3 AI integration, ensure:

### ✅ Prerequisites Met
- [ ] All manual tests passed
- [ ] Edge Functions deployed and tested
- [ ] Webhook processing verified
- [ ] Token system working correctly
- [ ] Session management reliable

### 📋 Phase 3 Implementation Checklist

1. **OpenAI API Setup**
   - Create OpenAI account
   - Obtain API key
   - Add to `.env`: `OPENAI_API_KEY=sk-xxxxx`
   - Add to Supabase secrets

2. **Create generate-recipe Edge Function**
   - Implement AI API call
   - Parse and validate AI response
   - Store recipe in `recipes` table
   - Link to user via `user_recipes` table
   - Return recipe data to client

3. **Update HomeScreen.tsx**
   - Replace mock generation with real API call
   - Add loading state (5-10 seconds)
   - Call `SubscriptionService.deductTokens()` AFTER successful generation
   - Handle insufficient tokens error
   - Update token balance display

4. **Update RecipeService.generateRecipe()**
   - Call generate-recipe Edge Function
   - Pass user preferences
   - Handle errors gracefully
   - Return generated recipes

5. **Error Handling**
   - AI generation failures don't deduct tokens
   - Network errors show retry option
   - Invalid responses logged to Sentry
   - User-friendly error messages

6. **Testing**
   - Generate recipe successfully
   - Verify token deducted
   - Verify recipe stored in database
   - Test with 0 tokens (should block)
   - Test AI failures (no token deduction)

---

## TROUBLESHOOTING

### Issue: Payment succeeds but tokens show wrong amount

**Solution**:
1. Check Stripe webhook logs:
   ```bash
   supabase functions logs stripe-webhook-handler
   ```
2. Verify webhook event delivered (Stripe Dashboard)
3. Manually update subscription if needed:
   ```sql
   UPDATE subscriptions
   SET tokens_balance = 20, tokens_total = 20, plan = 'monthly'
   WHERE user_id = 'USER_ID';
   ```

### Issue: Webhook returns 400 error

**Solution**:
1. Verify webhook secret is correct
2. Check signature verification logs
3. Redeploy webhook handler:
   ```bash
   supabase functions deploy stripe-webhook-handler
   ```

### Issue: Auto-login fails

**Solution**:
1. Check SecureStorage has valid token
2. Verify token not expired (>7 days)
3. Check Supabase logs for auth errors
4. Clear app data and sign in again

### Issue: Edge Function timeout

**Solution**:
1. Check function logs for errors
2. Verify Supabase service role key is set
3. Increase timeout in function config
4. Check database connection

---

## FINAL VERIFICATION QUERY

Run this SQL query to verify everything is set up correctly:

```sql
-- Verify subscription configuration
SELECT
  u.id as user_id,
  u.email,
  p.first_name,
  p.last_name,
  s.plan,
  s.status,
  s.tokens_balance,
  s.tokens_total,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.current_period_end,
  pt.current_streak,
  pt.total_recipes_generated
FROM auth.users u
JOIN user_profiles p ON p.user_id = u.id
JOIN subscriptions s ON s.user_id = u.id
JOIN progress_tracking pt ON pt.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;
```

---

## APPROVAL TO PROCEED TO PHASE 3

**Conditions**:
- ✅ All 8 critical fixes applied
- ⚠️ All Edge Functions deployed
- ⚠️ All manual tests passed
- ⚠️ Production readiness checklist complete

**Current Status**: 🟡 TESTING REQUIRED

Complete deployment and testing, then Phase 3 can begin.

---

**Document Generated**: 2025-01-23
**Last Updated**: 2025-01-23
**Version**: 1.0.0
**Status**: ✅ FIXES COMPLETE, AWAITING DEPLOYMENT & TESTING
