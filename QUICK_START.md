# Phase 2: Quick Start Guide

Deploy Stripe payment integration in 30 minutes.

---

## Prerequisites Checklist

- [x] Phase 1 completed (Auth & Database)
- [ ] Stripe account created
- [ ] Supabase CLI installed
- [ ] Project linked to Supabase

---

## Step 1: Stripe Setup (10 min)

### Create Account & Products

1. Sign up at [stripe.com](https://stripe.com)
2. Stay in **Test Mode**
3. Create 3 products:
   - **Weekly**: $3.99/week → Copy price ID
   - **Monthly**: $7.99/month → Copy price ID
   - **Yearly**: $48.99/year → Copy price ID
4. Get API keys: Dashboard → Developers → API keys
   - Copy **Publishable key** (pk_test_...)
   - Copy **Secret key** (sk_test_...)

---

## Step 2: Environment Setup (5 min)

### Update `.env`

```env
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_PRICE_ID_WEEKLY=price_YOUR_WEEKLY_ID
STRIPE_PRICE_ID_MONTHLY=price_YOUR_MONTHLY_ID
STRIPE_PRICE_ID_YEARLY=price_YOUR_YEARLY_ID
```

### Add Secrets to Supabase

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
```

---

## Step 3: Deploy Edge Functions (5 min)

```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
npx supabase functions deploy create-payment-intent
npx supabase functions deploy stripe-webhook-handler
npx supabase functions deploy validate-token-usage
npx supabase functions deploy deduct-token
npx supabase functions deploy create-portal-session
```

---

## Step 4: Configure Webhook (5 min)

### Get Webhook URL

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook-handler
```

### Add in Stripe

1. Dashboard → Developers → Webhooks → "+ Add endpoint"
2. Paste webhook URL
3. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
4. Save and copy **Signing secret** (whsec_...)

### Add Webhook Secret

```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
npx supabase functions deploy stripe-webhook-handler
```

---

## Step 5: Test (5 min)

### Test Card

```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### Test Flow

1. Run app: `npm start`
2. Complete onboarding
3. Select Monthly Plan
4. Enter test card
5. Complete payment
6. Verify: 20 Munchies appear

### Verify Success

- ✅ Payment succeeds
- ✅ User navigated to HomeScreen
- ✅ Token balance shows "20 Munchies"
- ✅ Stripe dashboard shows customer
- ✅ Stripe webhook shows successful delivery
- ✅ Supabase subscriptions table updated

---

## Troubleshooting

### Payment sheet doesn't open
```bash
# Restart with cache clear
npm start -- --reset-cache
```

### Tokens not allocated
```bash
# Check webhook logs
npx supabase functions logs stripe-webhook-handler
```

### "No client secret" error
```bash
# Check Edge Function logs
npx supabase functions logs create-payment-intent
```

---

## Production Deployment

### Switch to Live Mode

1. Complete Stripe verification
2. Create live products (same setup)
3. Get live keys (pk_live_ and sk_live_)
4. Update environment:
   ```bash
   # Update .env with pk_live_
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
   ```
5. Create live webhook, get live secret
6. Update webhook secret:
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET
   ```
7. Redeploy functions

---

## Quick Commands

```bash
# Deploy function
npx supabase functions deploy <name>

# View logs
npx supabase functions logs <name>

# Set secret
npx supabase secrets set KEY=value

# List secrets
npx supabase secrets list
```

---

## Next Steps

1. ✅ Test all payment scenarios
2. ✅ Verify webhooks working
3. ✅ Test subscription management
4. ➡️ Proceed to Phase 3: AI Recipe Generation

---

## Full Documentation

- [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md) - Detailed Stripe setup
- [PHASE_2_DEPLOYMENT.md](PHASE_2_DEPLOYMENT.md) - Complete deployment guide
- [PHASE_2_SUMMARY.md](PHASE_2_SUMMARY.md) - Implementation summary

---

**Time to Deploy**: 30 minutes
**Status**: Ready to ship! 🚀
