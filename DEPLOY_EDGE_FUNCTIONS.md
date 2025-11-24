# EDGE FUNCTIONS DEPLOYMENT GUIDE

## Quick Deployment (15 minutes)

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

### Step 1: Login and Link
```bash
# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Deploy All Functions
```bash
# Navigate to project
cd loma-app

# Deploy all 5 Edge Functions
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook-handler
supabase functions deploy validate-token-usage
supabase functions deploy deduct-token
supabase functions deploy create-portal-session

# Verify deployment
supabase functions list
```

**Expected Output**:
```
┌─────────────────────────┬─────────┬──────────────────────┐
│ NAME                    │ STATUS  │ LAST DEPLOYED        │
├─────────────────────────┼─────────┼──────────────────────┤
│ create-payment-intent   │ ACTIVE  │ 2025-01-23 10:00:00  │
│ stripe-webhook-handler  │ ACTIVE  │ 2025-01-23 10:01:00  │
│ validate-token-usage    │ ACTIVE  │ 2025-01-23 10:02:00  │
│ deduct-token            │ ACTIVE  │ 2025-01-23 10:03:00  │
│ create-portal-session   │ ACTIVE  │ 2025-01-23 10:04:00  │
└─────────────────────────┴─────────┴──────────────────────┘
```

### Step 3: Set Secrets
```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Set webhook secret (get from Stripe Dashboard after configuring webhook)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Verify secrets are set
supabase secrets list
```

**Expected Output**:
```
┌───────────────────────────┐
│ SECRET NAME               │
├───────────────────────────┤
│ STRIPE_SECRET_KEY         │
│ STRIPE_WEBHOOK_SECRET     │
│ SUPABASE_SERVICE_ROLE_KEY │ (automatically set)
│ SUPABASE_URL              │ (automatically set)
└───────────────────────────┘
```

### Step 4: Configure Stripe Webhook

1. **Get your webhook URL**:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook-handler
   ```

2. **In Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Enter webhook URL
   - Select events:
     - ✅ customer.subscription.created
     - ✅ customer.subscription.updated
     - ✅ customer.subscription.deleted
     - ✅ invoice.payment_succeeded
     - ✅ invoice.payment_failed
   - Click "Add endpoint"

3. **Copy webhook signing secret**:
   - Click on webhook endpoint
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_`)

4. **Update Supabase secret**:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET
   ```

5. **Redeploy webhook handler**:
   ```bash
   supabase functions deploy stripe-webhook-handler
   ```

### Step 5: Test Endpoints

**Test create-payment-intent**:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-payment-intent \
  -H "Authorization: Bearer YOUR_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"planType": "monthly", "priceId": "price_YOUR_MONTHLY_PRICE_ID"}'
```

**Test validate-token-usage**:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/validate-token-usage \
  -H "Authorization: Bearer YOUR_USER_JWT"
```

**Test webhook** (using Stripe CLI):
```bash
stripe listen --forward-to YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook-handler
stripe trigger customer.subscription.created
```

### Step 6: Check Logs
```bash
# View webhook logs
supabase functions logs stripe-webhook-handler --limit 50

# View payment intent logs
supabase functions logs create-payment-intent --limit 50

# View all function logs
supabase functions logs --limit 100
```

---

## Troubleshooting

### Issue: Functions not deploying
```bash
# Check if linked to correct project
supabase projects list

# Re-link if needed
supabase link --project-ref YOUR_PROJECT_REF

# Try deploying again
supabase functions deploy FUNCTION_NAME
```

### Issue: Secrets not accessible
```bash
# Verify secrets are set
supabase secrets list

# Set missing secrets
supabase secrets set SECRET_NAME=SECRET_VALUE

# Redeploy functions to pick up new secrets
supabase functions deploy FUNCTION_NAME
```

### Issue: Webhook returns 400 error
```bash
# Check webhook secret is correct
supabase secrets list

# Verify secret matches Stripe
# Redeploy webhook handler
supabase functions deploy stripe-webhook-handler

# Check logs for specific error
supabase functions logs stripe-webhook-handler
```

---

## Production Deployment

When ready for production:

1. **Switch Stripe to Live Mode**:
   - Get live API keys from Stripe Dashboard
   - Update secrets:
     ```bash
     supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
     ```

2. **Create Live Webhook**:
   - Create new webhook endpoint in Stripe live mode
   - Use same URL
   - Copy live webhook secret
   - Update secret:
     ```bash
     supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET
     ```

3. **Redeploy All Functions**:
   ```bash
   supabase functions deploy create-payment-intent
   supabase functions deploy stripe-webhook-handler
   supabase functions deploy validate-token-usage
   supabase functions deploy deduct-token
   supabase functions deploy create-portal-session
   ```

4. **Test Production**:
   - Make real payment (small amount)
   - Verify webhook processes
   - Check token allocation
   - Test all flows

---

## Environment Variables

**In .env file** (client-side):
```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key

STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY (or pk_live_)
STRIPE_PRICE_ID_WEEKLY=price_xxxxx
STRIPE_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_YEARLY=price_xxxxx
```

**In Supabase Secrets** (server-side):
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx (or sk_live_)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx (auto-set)
SUPABASE_URL=https://xxx.supabase.co (auto-set)
```

---

## Deployment Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] All 5 functions deployed
- [ ] Stripe secret key set
- [ ] Webhook configured in Stripe
- [ ] Webhook secret set in Supabase
- [ ] Webhook handler redeployed
- [ ] All endpoints tested
- [ ] Logs checked for errors
- [ ] Ready for manual testing

---

**Deployment Time**: ~15 minutes
**Last Updated**: 2025-01-23
