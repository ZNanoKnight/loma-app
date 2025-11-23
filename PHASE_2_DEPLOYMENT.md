# Phase 2: Stripe Payment Integration - Deployment Guide

## Overview

Phase 2 implements the complete Stripe payment integration for the LOMA app, including subscription management and token-based recipe generation limits.

## Implementation Summary

### ✅ What's Been Implemented

1. **Stripe SDK Integration**
   - Installed `@stripe/stripe-react-native`
   - Wrapped App with StripeProvider
   - Configured environment variables

2. **Supabase Edge Functions** (5 functions created)
   - `create-payment-intent` - Creates Stripe subscriptions
   - `stripe-webhook-handler` - Processes Stripe webhooks
   - `validate-token-usage` - Server-side token validation
   - `deduct-token` - Server-side token deduction
   - `create-portal-session` - Stripe Customer Portal access

3. **SubscriptionService** - Fully implemented
   - `getSubscription()` - Fetch user subscription
   - `getTokenBalance()` - Get current token balance
   - `validateTokenUsage()` - Validate tokens server-side
   - `deductTokens()` - Deduct tokens securely
   - `addTokens()` - Add tokens (webhook-triggered)
   - `updateSubscriptionStatus()` - Update status
   - `cancelSubscription()` - Cancel subscription
   - `canGenerateRecipe()` - Check if user can generate
   - `getCustomerPortalUrl()` - Get Stripe portal URL

4. **UI Updates**
   - **PaymentScreen**: Full Stripe payment sheet integration
   - **HomeScreen**: Real-time token balance display
   - **SubscriptionScreen**: Real subscription data display
   - Token validation before recipe generation
   - Loading states and error handling

---

## Deployment Steps

### Step 1: Set Up Stripe Account

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a new account
   - Complete business verification (for production)

2. **Get API Keys**
   - Navigate to Dashboard → Developers → API keys
   - Copy **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Copy **Secret key** (starts with `sk_test_` or `sk_live_`)
   - ⚠️ **NEVER** commit secret keys to git

3. **Create Products**

   **Weekly Plan**:
   - Name: Weekly Plan
   - Price: $3.99
   - Billing period: Weekly
   - Copy Price ID (e.g., `price_xxx_weekly`)

   **Monthly Plan**:
   - Name: Monthly Plan
   - Price: $7.99
   - Billing period: Monthly
   - Mark as "Popular" (optional)
   - Copy Price ID (e.g., `price_xxx_monthly`)

   **Yearly Plan**:
   - Name: Yearly Plan
   - Price: $48.99
   - Billing period: Yearly
   - Copy Price ID (e.g., `price_xxx_yearly`)

---

### Step 2: Configure Environment Variables

1. **Update `.env` file** (local development):
   ```env
   # Supabase (already configured)
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key

   # Stripe
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
   STRIPE_PRICE_ID_WEEKLY=price_YOUR_WEEKLY_PRICE_ID
   STRIPE_PRICE_ID_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
   STRIPE_PRICE_ID_YEARLY=price_YOUR_YEARLY_PRICE_ID
   ```

2. **Add Stripe Secrets to Supabase**
   ```bash
   cd loma-app
   npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

   > **Note**: Webhook secret will be generated in Step 3
   > Replace `YOUR_SECRET_KEY_HERE` with your actual Stripe secret key from the dashboard

---

### Step 3: Deploy Edge Functions

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Deploy all Edge Functions**:
   ```bash
   supabase functions deploy create-payment-intent
   supabase functions deploy stripe-webhook-handler
   supabase functions deploy validate-token-usage
   supabase functions deploy deduct-token
   supabase functions deploy create-portal-session
   ```

5. **Verify deployment**:
   ```bash
   supabase functions list
   ```

   You should see all 5 functions listed as deployed.

---

### Step 4: Configure Stripe Webhooks

1. **Get Webhook URL**:
   - Format: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook-handler`
   - Example: `https://abcdefghijk.supabase.co/functions/v1/stripe-webhook-handler`

2. **Add Webhook in Stripe Dashboard**:
   - Go to Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Paste your webhook URL
   - Select events to send:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click "Add endpoint"

3. **Get Webhook Signing Secret**:
   - Click on your newly created webhook
   - Copy the "Signing secret" (starts with `whsec_`)
   - Add to Supabase secrets:
     ```bash
     npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
     ```

4. **Redeploy webhook handler** (to use new secret):
   ```bash
   supabase functions deploy stripe-webhook-handler
   ```

---

### Step 5: Test Payment Flow

1. **Use Stripe Test Cards**:

   **Successful payment**:
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ZIP: Any 5 digits
   ```

   **Declined payment**:
   ```
   Card: 4000 0000 0000 0002
   ```

   **Requires authentication (3D Secure)**:
   ```
   Card: 4000 0025 0000 3155
   ```

2. **Test User Flow**:
   - Complete onboarding
   - Select a plan on PaymentScreen
   - Enter test card details
   - Complete payment
   - Verify:
     - User is redirected to main app
     - Token balance shows correct amount (5/20/240)
     - Subscription shows as "active" in SubscriptionScreen

3. **Test Webhook Processing**:
   - Go to Stripe Dashboard → Webhooks
   - Click on your webhook endpoint
   - Check "Webhook attempts" tab
   - Verify successful deliveries (200 status code)

4. **Test Token System**:
   - Go to HomeScreen
   - Verify token balance displays correctly
   - Try generating a recipe
   - Verify token validation works

---

### Step 6: Monitor & Debug

#### Check Supabase Edge Function Logs

```bash
supabase functions logs stripe-webhook-handler
supabase functions logs create-payment-intent
supabase functions logs validate-token-usage
supabase functions logs deduct-token
```

#### Check Stripe Logs

- Dashboard → Developers → Events
- Look for webhook events
- Check for errors or failures

#### Common Issues

**Issue**: Payment sheet doesn't open
**Solution**:
- Check `STRIPE_PUBLISHABLE_KEY` is correct
- Verify StripeProvider is wrapping the app
- Check console for errors

**Issue**: Webhook not receiving events
**Solution**:
- Verify webhook URL is correct
- Check webhook signing secret matches
- Ensure events are selected in Stripe
- Check Edge Function logs

**Issue**: Tokens not allocated after payment
**Solution**:
- Check webhook handler logs
- Verify subscription.created event is being sent
- Check `subscriptions` table in Supabase
- Ensure price IDs match (weekly/monthly/yearly logic)

**Issue**: "Subscription not found" error
**Solution**:
- Verify auto-trigger created subscription record on signup
- Check `subscriptions` table has a record for the user
- Ensure RLS policies allow reading own subscription

---

## Production Deployment

### Switch to Live Mode

1. **Stripe Live Mode**:
   - Complete Stripe verification
   - Create live products (same setup as test)
   - Get live API keys (`pk_live_` and `sk_live_`)

2. **Update Environment**:
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
   ```

   ```bash
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
   ```

3. **Update Webhook**:
   - Create new webhook in live mode
   - Use same URL
   - Get live webhook secret (`whsec_` for live)
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
   ```

4. **Redeploy Functions**:
   ```bash
   supabase functions deploy stripe-webhook-handler
   supabase functions deploy create-payment-intent
   ```

---

## Security Checklist

- [x] Stripe secret keys stored in Supabase secrets (NOT in `.env` or code)
- [x] Webhook signature verification implemented
- [x] Token deduction happens server-side (Edge Function)
- [x] RLS policies protect subscription data
- [x] Client can only access own subscription
- [x] No sensitive data in error messages
- [x] Payment processing uses Stripe's secure payment sheet
- [x] All user inputs validated

---

## Database Schema

The `subscriptions` table already exists from Phase 1:

```sql
CREATE TABLE subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT DEFAULT 'active',
  tokens_balance INTEGER DEFAULT 8,
  tokens_used INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 8,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

No database changes required for Phase 2.

---

## API Documentation

### Edge Functions

#### `create-payment-intent`

**Purpose**: Create Stripe subscription and return client secret

**Request**:
```typescript
POST /functions/v1/create-payment-intent
Authorization: Bearer <user_jwt_token>

{
  planType: 'weekly' | 'monthly' | 'yearly',
  priceId: 'price_xxxxxxxx'
}
```

**Response**:
```typescript
{
  clientSecret: 'pi_xxxxx_secret_xxxxx',
  subscriptionId: 'sub_xxxxx',
  customerId: 'cus_xxxxx'
}
```

---

#### `stripe-webhook-handler`

**Purpose**: Process Stripe webhook events

**Events Handled**:
- `customer.subscription.created` → Activate subscription, add tokens
- `customer.subscription.updated` → Update subscription status
- `customer.subscription.deleted` → Mark as cancelled
- `invoice.payment_succeeded` → Add tokens on renewal
- `invoice.payment_failed` → Mark as past_due

---

#### `validate-token-usage`

**Purpose**: Check if user has tokens available

**Request**:
```typescript
POST /functions/v1/validate-token-usage
Authorization: Bearer <user_jwt_token>
```

**Response**:
```typescript
{
  hasTokens: true,
  balance: 15,
  status: 'active',
  currentPeriodEnd: '2025-02-01T00:00:00Z',
  message: 'Tokens available'
}
```

---

#### `deduct-token`

**Purpose**: Deduct tokens from user balance

**Request**:
```typescript
POST /functions/v1/deduct-token
Authorization: Bearer <user_jwt_token>

{
  amount: 1
}
```

**Response**:
```typescript
{
  success: true,
  balance: 14,
  used: 6,
  deducted: 1
}
```

---

#### `create-portal-session`

**Purpose**: Get Stripe Customer Portal URL

**Request**:
```typescript
POST /functions/v1/create-portal-session
Authorization: Bearer <user_jwt_token>

{
  returnUrl: 'lomaapp://settings'
}
```

**Response**:
```typescript
{
  url: 'https://billing.stripe.com/session/xxxxx'
}
```

---

## Cost Estimates

### Stripe Fees

- **Transaction**: 2.9% + $0.30 per successful charge
- **Subscription**: No additional fee (included in transaction fee)

**Example** (Monthly plan @ $7.99):
- Gross: $7.99
- Stripe fee: $0.53 (6.6%)
- Net: $7.46

### Infrastructure

- **Supabase Free Tier**: 2M Edge Function invocations/month
- **Expected usage** (1,000 users):
  - Payment intent creation: ~1,000/month
  - Webhook events: ~5,000/month
  - Token validation: ~10,000/month
  - Token deduction: ~10,000/month
  - **Total**: ~26,000/month (well within free tier)

### Scaling Considerations

- **At 10,000 users**: ~260,000 invocations/month
  - Still within Supabase free tier
  - Stripe fees: ~$500-1,000/month
  - Net revenue: $70,000+/month (assuming $7.99/mo plan)

---

## Next Steps: Phase 3

After Phase 2 is tested and deployed, proceed to Phase 3: AI Recipe Generation

**Phase 3 Requirements**:
1. OpenAI API integration
2. Recipe generation Edge Function
3. Update HomeScreen to call AI API
4. Token deduction after successful generation
5. Recipe storage in database

**Estimated Timeline**: 30-40 hours

---

## Support & Troubleshooting

### Get Help

- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **React Native Stripe**: https://stripe.dev/stripe-react-native

### Contact

For deployment issues or questions:
- Review Edge Function logs: `supabase functions logs <function-name>`
- Check Stripe webhook attempts in Dashboard
- Verify environment variables are set correctly

---

## Conclusion

Phase 2 is now complete with:
- ✅ Full Stripe payment integration
- ✅ Secure token-based system
- ✅ Subscription lifecycle management
- ✅ Real-time token balance display
- ✅ Server-side security validation
- ✅ Comprehensive error handling

The app is now ready for beta testing with real payment processing.
