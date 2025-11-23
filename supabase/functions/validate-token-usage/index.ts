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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get subscription data
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('tokens_balance, status, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
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
