import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
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
    console.log('[create-portal-session] Starting portal session creation...')

    // Check for Stripe key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      console.error('[create-portal-session] STRIPE_SECRET_KEY not configured')
      throw new Error('Stripe not configured')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[create-portal-session] Missing authorization header')
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('[create-portal-session] Auth error:', authError?.message)
      throw new Error('Unauthorized')
    }

    console.log('[create-portal-session] User authenticated:', user.id)

    // Get user's Stripe customer ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subError) {
      console.error('[create-portal-session] Subscription fetch error:', subError.message)
      throw new Error('Failed to fetch subscription')
    }

    if (!subscription?.stripe_customer_id) {
      console.error('[create-portal-session] No stripe_customer_id found for user:', user.id)
      throw new Error('No Stripe customer found. Please subscribe first.')
    }

    console.log('[create-portal-session] Found Stripe customer:', subscription.stripe_customer_id)

    // Parse return URL from request
    const { returnUrl } = await req.json()

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl || 'lomaapp://settings',
    })

    console.log('[create-portal-session] Portal session created successfully')

    return new Response(
      JSON.stringify({
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('[create-portal-session] Error:', error.message)
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
