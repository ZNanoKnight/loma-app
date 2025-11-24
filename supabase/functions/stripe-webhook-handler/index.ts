import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

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

    console.log(`Processing event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user ID from customer metadata
        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as Stripe.Customer).metadata?.supabase_user_id

        if (!userId) {
          console.error('No user ID found in customer metadata')
          break
        }

        // Determine token allocation and plan type based on price ID
        const priceId = subscription.items.data[0].price.id
        let tokensToAdd = 0
        let planType = 'monthly' // default

        // You'll need to replace these with your actual Stripe price IDs
        if (priceId.includes('weekly') || subscription.items.data[0].price.recurring?.interval === 'week') {
          tokensToAdd = 5
          planType = 'weekly'
        } else if (priceId.includes('monthly') || subscription.items.data[0].price.recurring?.interval === 'month') {
          tokensToAdd = 20
          planType = 'monthly'
        } else if (priceId.includes('yearly') || subscription.items.data[0].price.recurring?.interval === 'year') {
          tokensToAdd = 240
          planType = 'yearly'
        }

        // Update subscription record
        // For subscription.created/updated, we SET the token balance (replaces initial 8 free tokens)
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            stripe_price_id: priceId,
            plan: planType,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            tokens_balance: tokensToAdd,
            tokens_total: tokensToAdd,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log(`Subscription ${subscription.id} updated for user ${userId}`)
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

        // Determine token allocation and plan type
        const priceId = subscription.items.data[0].price.id
        let tokensToAdd = 0
        let planType = 'monthly' // default

        if (priceId.includes('weekly') || subscription.items.data[0].price.recurring?.interval === 'week') {
          tokensToAdd = 5
          planType = 'weekly'
        } else if (priceId.includes('monthly') || subscription.items.data[0].price.recurring?.interval === 'month') {
          tokensToAdd = 20
          planType = 'monthly'
        } else if (priceId.includes('yearly') || subscription.items.data[0].price.recurring?.interval === 'year') {
          tokensToAdd = 240
          planType = 'yearly'
        }

        // Add tokens on renewal (only if not first payment)
        if (invoice.billing_reason === 'subscription_cycle') {
          const { data: currentSub } = await supabaseAdmin
            .from('subscriptions')
            .select('tokens_balance, tokens_total')
            .eq('user_id', userId)
            .single()

          if (currentSub) {
            await supabaseAdmin
              .from('subscriptions')
              .update({
                tokens_balance: currentSub.tokens_balance + tokensToAdd,
                tokens_total: currentSub.tokens_total + tokensToAdd,
                plan: planType,
                status: 'active',
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId)

            console.log(`Added ${tokensToAdd} tokens to user ${userId} on renewal`)
          }
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
