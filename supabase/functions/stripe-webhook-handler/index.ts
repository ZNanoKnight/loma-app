import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

// Token allocation by plan
const TOKEN_ALLOCATION = {
  weekly: 5,
  monthly: 20,
  yearly: 240,
}

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`[Webhook] Processing event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log(`[Webhook] Subscription ${subscription.id} - status: ${subscription.status}`)

        // Get user ID from customer metadata
        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as Stripe.Customer).metadata?.supabase_user_id

        if (!userId) {
          console.error('[Webhook] No user ID found in customer metadata')
          break
        }

        // Determine plan type based on price interval
        const priceId = subscription.items.data[0].price.id
        const interval = subscription.items.data[0].price.recurring?.interval
        let planType: 'weekly' | 'monthly' | 'yearly' = 'monthly'

        if (interval === 'week') {
          planType = 'weekly'
        } else if (interval === 'month') {
          planType = 'monthly'
        } else if (interval === 'year') {
          planType = 'yearly'
        }

        // Determine status - map Stripe status to our status
        let dbStatus = subscription.status
        if (subscription.status === 'trialing') {
          dbStatus = 'trialing'
        } else if (subscription.status === 'active') {
          dbStatus = 'active'
        } else if (subscription.status === 'past_due') {
          dbStatus = 'past_due'
        } else if (subscription.status === 'canceled' || subscription.status === 'cancelled') {
          dbStatus = 'cancelled'
        }

        // For trial subscriptions, don't overwrite tokens (already set by create-payment-intent)
        // For active subscriptions after trial, set full token allocation
        const isTrialing = subscription.status === 'trialing'
        const tokensToSet = isTrialing ? undefined : TOKEN_ALLOCATION[planType]

        // Build update object
        const updateData: Record<string, any> = {
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          stripe_price_id: priceId,
          plan: planType,
          status: dbStatus,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Only update tokens if not trialing (to not overwrite trial tokens)
        if (!isTrialing && tokensToSet !== undefined) {
          updateData.tokens_balance = tokensToSet
          updateData.tokens_total = tokensToSet
        }

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update(updateData)
          .eq('user_id', userId)

        if (error) {
          console.error('[Webhook] Error updating subscription:', error)
        } else {
          console.log(`[Webhook] Subscription ${subscription.id} updated for user ${userId} - status: ${dbStatus}, plan: ${planType}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as Stripe.Customer).metadata?.supabase_user_id

        if (!userId) {
          console.error('No user ID found in customer metadata')
          break
        }

        // Mark subscription as cancelled but keep token balance
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (error) {
          console.error('Error cancelling subscription:', error)
        } else {
          console.log(`Subscription cancelled for user ${userId}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        console.log(`[Webhook] Invoice payment succeeded - billing_reason: ${invoice.billing_reason}`)

        if (!invoice.subscription) {
          console.log('[Webhook] No subscription on invoice, skipping')
          break
        }

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as Stripe.Customer).metadata?.supabase_user_id

        if (!userId) {
          console.error('[Webhook] No user ID found in customer metadata')
          break
        }

        // Determine plan type based on price interval
        const interval = subscription.items.data[0].price.recurring?.interval
        let planType: 'weekly' | 'monthly' | 'yearly' = 'monthly'

        if (interval === 'week') {
          planType = 'weekly'
        } else if (interval === 'month') {
          planType = 'monthly'
        } else if (interval === 'year') {
          planType = 'yearly'
        }

        const tokensToAdd = TOKEN_ALLOCATION[planType]

        // Get current subscription data
        const { data: currentSub } = await supabaseAdmin
          .from('subscriptions')
          .select('tokens_balance, tokens_total, status')
          .eq('user_id', userId)
          .single()

        if (!currentSub) {
          console.error('[Webhook] No subscription found for user:', userId)
          break
        }

        // Handle different billing reasons:
        // - 'subscription_create': First payment (after trial or immediate)
        // - 'subscription_cycle': Renewal payment
        // - 'subscription_update': Plan change
        if (invoice.billing_reason === 'subscription_create') {
          // First payment after trial ends - give full token allocation
          // This replaces the trial tokens with the full plan allocation
          console.log(`[Webhook] First payment after trial for user ${userId} - setting ${tokensToAdd} tokens`)

          await supabaseAdmin
            .from('subscriptions')
            .update({
              tokens_balance: tokensToAdd,
              tokens_total: tokensToAdd,
              plan: planType,
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

          console.log(`[Webhook] User ${userId} now has ${tokensToAdd} tokens (${planType} plan activated)`)
        } else if (invoice.billing_reason === 'subscription_cycle') {
          // Renewal - ADD tokens to existing balance
          const newBalance = currentSub.tokens_balance + tokensToAdd
          const newTotal = currentSub.tokens_total + tokensToAdd

          console.log(`[Webhook] Renewal for user ${userId} - adding ${tokensToAdd} tokens (${currentSub.tokens_balance} -> ${newBalance})`)

          await supabaseAdmin
            .from('subscriptions')
            .update({
              tokens_balance: newBalance,
              tokens_total: newTotal,
              plan: planType,
              status: 'active',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

          console.log(`[Webhook] User ${userId} tokens renewed: ${newBalance} total`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        if (!invoice.subscription) {
          break
        }

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as Stripe.Customer).metadata?.supabase_user_id

        if (!userId) {
          console.error('No user ID found in customer metadata')
          break
        }

        // Mark subscription as past_due
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`Payment failed for user ${userId}, status set to past_due`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
