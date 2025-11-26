import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Edge Function] create-payment-intent invoked - VERSION 4.0 (with 7-day trial)')
    console.log('[Edge Function] Request method:', req.method)

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('[Edge Function] Authorization header present:', !!authHeader)

    if (!authHeader) {
      console.error('[Edge Function] No Authorization header found')
      throw new Error('Unauthorized: No authorization header provided')
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable not set')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create Supabase client with service role to bypass RLS
    // We'll verify the user separately using the JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    console.log('[Edge Function] Supabase client created, getting user...')

    // Extract the JWT token from the Authorization header
    const jwt = authHeader.replace('Bearer ', '')
    console.log('[Edge Function] JWT token extracted, length:', jwt.length)

    // Verify the JWT and get the authenticated user by passing the token explicitly
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(jwt)

    console.log('[Edge Function] getUser result:', {
      hasUser: !!user,
      hasError: !!authError,
      userId: user?.id,
      errorCode: authError?.code,
      errorMessage: authError?.message,
      errorStatus: authError?.status,
    })

    if (authError) {
      console.error('[Edge Function] Auth error details:', JSON.stringify(authError))
      throw new Error(`Authentication failed: ${authError.message}`)
    }

    if (!user) {
      console.error('[Edge Function] No user returned from getUser()')
      throw new Error('No authenticated user found')
    }

    console.log('[Edge Function] ✓ User authenticated successfully:', user.id)

    // Parse request body
    const { planType, priceId } = await req.json()

    if (!planType || !priceId) {
      throw new Error('planType and priceId are required')
    }

    console.log('[Edge Function] Request params:', { planType, priceId, userId: user.id })

    // Check if user already has a Stripe customer ID
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    // If subscription doesn't exist or there's an error, throw detailed error
    if (subscriptionError) {
      console.error('Subscription query error:', subscriptionError)
      throw new Error(`Failed to fetch subscription: ${subscriptionError.message} (code: ${subscriptionError.code})`)
    }

    if (!subscription) {
      throw new Error('No subscription record found for user. Please complete signup first.')
    }

    let customerId = subscription?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log('[Edge Function] Creating new Stripe customer for user:', user.id)
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
      console.log('[Edge Function] Stripe customer created:', customerId)

      // Update subscription record with customer ID
      const { error: updateError1 } = await supabaseClient
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)

      if (updateError1) {
        console.error('[Edge Function] Failed to update subscription with customer ID:', updateError1)
        throw new Error(`Failed to save Stripe customer ID: ${updateError1.message}`)
      }
      console.log('[Edge Function] Subscription updated with customer ID')
    } else {
      console.log('[Edge Function] Using existing Stripe customer:', customerId)
    }

    // Create subscription with 7-day free trial
    // Trial allows users to try the app before being charged
    const TRIAL_PERIOD_DAYS = 7
    const TRIAL_MUNCHIES = 2 // Munchies given during trial period

    console.log('[Edge Function] Creating Stripe subscription with 7-day trial...')
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: TRIAL_PERIOD_DAYS,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
    })
    console.log('[Edge Function] Stripe subscription created:', stripeSubscription.id)
    console.log('[Edge Function] Subscription status:', stripeSubscription.status)
    console.log('[Edge Function] Trial end:', stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : 'none')

    // With trials, there's no immediate payment - we get a SetupIntent instead of PaymentIntent
    // The SetupIntent collects payment details to charge after the trial ends
    const invoice = stripeSubscription.latest_invoice as Stripe.Invoice
    let clientSecret: string | null = null

    if (stripeSubscription.pending_setup_intent) {
      // Trial subscription - use SetupIntent to collect payment method
      const setupIntent = stripeSubscription.pending_setup_intent as Stripe.SetupIntent
      clientSecret = setupIntent.client_secret
      console.log('[Edge Function] Using SetupIntent for trial:', setupIntent.id)
    } else if (invoice?.payment_intent) {
      // No trial (fallback) - use PaymentIntent
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
      clientSecret = paymentIntent.client_secret
      console.log('[Edge Function] Using PaymentIntent:', paymentIntent.id)
    }

    if (!clientSecret) {
      throw new Error('Failed to get client secret from Stripe subscription')
    }

    // Calculate trial end date
    const trialEndDate = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000).toISOString()
      : null

    // Update subscription record with trial info
    // Status is 'trialing' during the trial period
    const { error: updateError2 } = await supabaseClient
      .from('subscriptions')
      .update({
        plan: planType,
        status: 'trialing',
        stripe_subscription_id: stripeSubscription.id,
        stripe_price_id: priceId,
        tokens_balance: TRIAL_MUNCHIES,
        tokens_total: TRIAL_MUNCHIES,
        current_period_end: trialEndDate,
      })
      .eq('user_id', user.id)

    if (updateError2) {
      console.error('[Edge Function] Failed to update subscription:', updateError2)
      throw new Error(`Failed to save subscription: ${updateError2.message}`)
    }

    console.log('[Edge Function] Subscription updated - status: trialing, munchies:', TRIAL_MUNCHIES)
    console.log('[Edge Function] Success! Returning client secret')

    return new Response(
      JSON.stringify({
        clientSecret: clientSecret,
        subscriptionId: stripeSubscription.id,
        customerId: customerId,
        trialEnd: trialEndDate,
        trialMunchies: TRIAL_MUNCHIES,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('[Edge Function] Error occurred:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
