# Stripe Setup - Quick Start Guide

This guide walks you through setting up your Stripe account for the LOMA app.

---

## Prerequisites

- Completed Phase 1 (Authentication & Database)
- Supabase project configured
- Supabase CLI installed

---

## Part 1: Create Stripe Account & Products (15 min)

### 1.1 Sign Up for Stripe

1. Go to [stripe.com](https://stripe.com)
2. Click "Start now" or "Sign in"
3. Create account with email
4. Complete email verification
5. You'll start in **Test mode** (perfect for development)

### 1.2 Create Subscription Products

**Navigate to**: Dashboard → Products → "+ Add product"

#### Product 1: Weekly Plan

- **Name**: LOMA Weekly
- **Description**: 5 Munchies per week
- **Pricing model**: Standard pricing
- **Price**: $3.99
- **Billing period**: Weekly
- **Currency**: USD
- Click "Save product"
- **Copy the Price ID** (looks like `price_1Abc...`)
- Save it as: `STRIPE_PRICE_ID_WEEKLY`

#### Product 2: Monthly Plan

- **Name**: LOMA Monthly
- **Description**: 20 Munchies per month
- **Pricing model**: Standard pricing
- **Price**: $7.99
- **Billing period**: Monthly
- **Currency**: USD
- Click "Save product"
- **Copy the Price ID**
- Save it as: `STRIPE_PRICE_ID_MONTHLY`

#### Product 3: Yearly Plan

- **Name**: LOMA Yearly
- **Description**: 240 Munchies per year
- **Pricing model**: Standard pricing
- **Price**: $48.99
- **Billing period**: Yearly
- **Currency**: USD
- Click "Save product"
- **Copy the Price ID**
- Save it as: `STRIPE_PRICE_ID_YEARLY`

### 1.3 Get API Keys

1. **Navigate to**: Dashboard → Developers → API keys
2. Under "Standard keys", you'll see:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`, click "Reveal" to see)
3. Copy both keys and save securely

---

## Part 2: Configure Environment Variables (5 min)

### 2.1 Update Local `.env` File

```bash
cd loma-app
```

Create or update `.env`:

```env
# Supabase (already configured from Phase 1)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Stripe - ADD THESE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_PRICE_ID_WEEKLY=price_YOUR_WEEKLY_PRICE_ID
STRIPE_PRICE_ID_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
STRIPE_PRICE_ID_YEARLY=price_YOUR_YEARLY_PRICE_ID
```

### 2.2 Add Secrets to Supabase

⚠️ **NEVER** put secret keys in `.env` or commit them to git!

Store Stripe secret key in Supabase:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

> Webhook secret will be added later after creating the webhook

---

## Part 3: Deploy Edge Functions (10 min)

### 3.1 Login to Supabase

```bash
npx supabase login
```

### 3.2 Link Your Project

Find your project ref:
- Go to Supabase Dashboard
- Project Settings → General
- Copy "Reference ID"

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 3.3 Deploy Functions

```bash
# Deploy all functions
npx supabase functions deploy create-payment-intent
npx supabase functions deploy stripe-webhook-handler
npx supabase functions deploy validate-token-usage
npx supabase functions deploy deduct-token
npx supabase functions deploy create-portal-session
```

### 3.4 Verify Deployment

```bash
npx supabase functions list
```

Expected output:
```
NAME                      VERSION  CREATED AT
create-payment-intent     1        2025-01-XX...
stripe-webhook-handler    1        2025-01-XX...
validate-token-usage      1        2025-01-XX...
deduct-token              1        2025-01-XX...
create-portal-session     1        2025-01-XX...
```

---

## Part 4: Configure Stripe Webhooks (10 min)

### 4.1 Get Your Webhook URL

Format:
```
https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/stripe-webhook-handler
```

Example:
```
https://abcdefghijk.supabase.co/functions/v1/stripe-webhook-handler
```

To find your project ref:
- Supabase Dashboard → Project Settings → API
- Look for "Project URL", extract the subdomain

### 4.2 Create Webhook in Stripe

1. **Navigate to**: Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. **Endpoint URL**: Paste your webhook URL
4. **Description**: "LOMA Subscription Events"
5. **Events to send**: Click "Select events"
6. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
7. Click "Add events"
8. Click "Add endpoint"

### 4.3 Get Webhook Signing Secret

1. Click on your newly created webhook endpoint
2. Under "Signing secret", click "Reveal"
3. Copy the secret (starts with `whsec_`)

### 4.4 Add Webhook Secret to Supabase

```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 4.5 Redeploy Webhook Handler

```bash
npx supabase functions deploy stripe-webhook-handler
```

---

## Part 5: Test the Integration (15 min)

### 5.1 Stripe Test Cards

Use these test cards for different scenarios:

**Successful Payment**:
```
Card number: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

**Declined Card**:
```
Card number: 4000 0000 0000 0002
Expiry: 12/34
CVC: 123
ZIP: 12345
```

**Requires 3D Secure**:
```
Card number: 4000 0025 0000 3155
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### 5.2 Test User Flow

1. **Run the app**:
   ```bash
   npm start
   ```

2. **Complete onboarding**:
   - Go through all 10 onboarding screens
   - Fill in user preferences

3. **Select a plan** (Payment screen):
   - Choose "Monthly Plan" ($7.99/month)
   - Enter email and password
   - Click "Start Free Trial"

4. **Enter test card**:
   - Use `4242 4242 4242 4242`
   - Complete payment

5. **Verify success**:
   - Should see "Welcome to LOMA!" alert
   - App navigates to HomeScreen
   - Token balance shows "20 Munchies"

### 5.3 Verify in Stripe Dashboard

1. **Check Customers**:
   - Dashboard → Customers
   - Your test user should appear

2. **Check Subscriptions**:
   - Dashboard → Subscriptions
   - Status should be "Active"
   - Next payment date should be shown

3. **Check Webhooks**:
   - Dashboard → Developers → Webhooks
   - Click your webhook
   - Check "Attempts" tab
   - Should see successful deliveries (200 status)

### 5.4 Verify in Supabase

1. **Check subscriptions table**:
   - Supabase Dashboard → Table Editor → `subscriptions`
   - Find your test user
   - Verify:
     - `stripe_customer_id` is populated
     - `stripe_subscription_id` is populated
     - `status` = 'active'
     - `tokens_balance` = 20
     - `tokens_total` = 20

### 5.5 Test Token Display

1. Open the app
2. Go to HomeScreen
3. Verify: "🍪 You have 20 Munchies!"
4. Go to Settings → Subscription
5. Verify:
   - Plan shows "Monthly Plan"
   - Price shows "$7.99/month"
   - Status badge shows "ACTIVE"
   - Token balance shows correctly

---

## Part 6: Enable Stripe Customer Portal (5 min)

The Customer Portal allows users to:
- Update payment methods
- View billing history
- Cancel subscriptions
- Download invoices

### 6.1 Activate Customer Portal

1. **Navigate to**: Dashboard → Settings → Billing → Customer portal
2. Click "Activate" button
3. Configure settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update billing email
   - ✅ Allow customers to view billing history
   - ✅ Allow customers to cancel subscriptions
4. **Cancellation behavior**:
   - Select "Cancel at end of billing period"
   - ✅ Enable "Proration" (optional)
5. Click "Save changes"

### 6.2 Test Customer Portal

1. In the app, go to Settings → Subscription
2. Tap "Manage Subscription"
3. Should open Stripe Customer Portal in browser
4. Verify you can:
   - See subscription details
   - View payment history
   - Update payment method
   - Cancel subscription (don't actually cancel)

---

## Troubleshooting

### Payment Sheet Doesn't Open

**Check**:
- `STRIPE_PUBLISHABLE_KEY` is correct in `.env`
- Restart app after updating `.env`
- Check console for errors

**Solution**:
```bash
# Verify env is loaded
cd loma-app
cat .env | grep STRIPE

# Restart metro bundler
npm start -- --reset-cache
```

### "No client secret" Error

**Check**:
- Edge Functions are deployed
- `STRIPE_SECRET_KEY` is set in Supabase secrets
- User is authenticated (has session)

**Solution**:
```bash
# Check secrets
npx supabase secrets list

# Redeploy function
npx supabase functions deploy create-payment-intent

# Check logs
npx supabase functions logs create-payment-intent
```

### Webhooks Not Receiving Events

**Check**:
- Webhook URL is correct
- Webhook secret is set
- Events are selected in Stripe

**Solution**:
```bash
# Verify webhook secret
npx supabase secrets list

# Check webhook handler logs
npx supabase functions logs stripe-webhook-handler

# Test webhook manually in Stripe Dashboard
# Go to Webhooks → Your webhook → "Send test webhook"
```

### Tokens Not Allocated After Payment

**Check**:
- Webhook received event
- Webhook handler processed successfully
- Database updated

**Solution**:
1. Check Stripe webhook attempts
2. Check Edge Function logs:
   ```bash
   npx supabase functions logs stripe-webhook-handler
   ```
3. Check `subscriptions` table in Supabase

---

## Production Checklist

Before going live with real payments:

- [ ] Complete Stripe business verification
- [ ] Update to live API keys (`pk_live_` and `sk_live_`)
- [ ] Create live products (same as test)
- [ ] Update webhook to use live mode
- [ ] Test with real card (small amount)
- [ ] Set up Stripe Radar (fraud prevention)
- [ ] Configure email receipts
- [ ] Set up Stripe monitoring alerts
- [ ] Review tax settings (if applicable)
- [ ] Set up bank account for payouts

---

## Quick Commands Reference

```bash
# Deploy Edge Functions
npx supabase functions deploy <function-name>

# View logs
npx supabase functions logs <function-name>

# Set secrets
npx supabase secrets set KEY=value

# List secrets
npx supabase secrets list

# Test locally
npm start

# Reset cache
npm start -- --reset-cache
```

---

## Next Steps

After Stripe is set up and tested:

1. ✅ Test all payment flows (success, decline, 3DS)
2. ✅ Verify webhooks are working
3. ✅ Test subscription management
4. ✅ Test token system
5. ➡️ Proceed to Phase 3: AI Recipe Generation

---

## Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **React Native Stripe**: https://stripe.dev/stripe-react-native

---

**Estimated Setup Time**: 45-60 minutes

Good luck! 🚀
