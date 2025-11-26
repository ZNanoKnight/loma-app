import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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
    console.log('[validate-token-usage] Starting validation...')

    // Check for Authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('[validate-token-usage] Auth header present:', !!authHeader)

    if (!authHeader) {
      console.log('[validate-token-usage] No Authorization header provided')
      throw new Error('Missing authorization header')
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')

    // Initialize Supabase admin client with service role for querying subscriptions (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the JWT token using the admin client
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.log('[validate-token-usage] Auth error:', authError?.message || 'No user found')
      throw new Error('Unauthorized: ' + (authError?.message || 'Invalid token'))
    }

    console.log('[validate-token-usage] User authenticated:', user.id)

    // Get subscription data using admin client (bypasses RLS)
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('tokens_balance, status, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (subError) {
      console.log('[validate-token-usage] Subscription query error:', subError.message, subError.code)
    }

    if (subError || !subscription) {
      console.log('[validate-token-usage] No subscription found for user:', user.id)
      return new Response(
        JSON.stringify({
          hasTokens: false,
          balance: 0,
          status: 'no_subscription',
          message: 'No subscription found',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log('[validate-token-usage] Subscription found:', { status: subscription.status, balance: subscription.tokens_balance })

    // Check if subscription is active
    const isActive = subscription.status === 'active' || subscription.status === 'trialing'
    const hasTokens = subscription.tokens_balance > 0

    let message = ''
    if (!isActive) {
      message = 'Subscription is not active'
    } else if (!hasTokens) {
      message = 'No tokens available'
    } else {
      message = 'Tokens available'
    }

    return new Response(
      JSON.stringify({
        hasTokens: hasTokens && isActive,
        balance: subscription.tokens_balance,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
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
