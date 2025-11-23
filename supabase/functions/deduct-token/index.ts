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
    // Initialize Supabase client with service role for transaction
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Initialize client for auth
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

    // Parse request body
    const { amount = 1 } = await req.json()

    if (amount < 1 || amount > 10) {
      throw new Error('Invalid amount. Must be between 1 and 10')
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('tokens_balance, tokens_used, status')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      throw new Error('Subscription not found')
    }

    // Check if user has enough tokens
    if (subscription.tokens_balance < amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Insufficient tokens',
          balance: subscription.tokens_balance,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if subscription is active
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Subscription is not active',
          status: subscription.status,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Deduct tokens (atomic operation)
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        tokens_balance: subscription.tokens_balance - amount,
        tokens_used: subscription.tokens_used + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('tokens_balance', subscription.tokens_balance) // Optimistic locking
      .select('tokens_balance, tokens_used')
      .single()

    if (updateError || !updated) {
      // Token balance changed during operation (race condition)
      throw new Error('Token deduction failed. Please try again')
    }

    console.log(`Deducted ${amount} token(s) from user ${user.id}. New balance: ${updated.tokens_balance}`)

    return new Response(
      JSON.stringify({
        success: true,
        balance: updated.tokens_balance,
        used: updated.tokens_used,
        deducted: amount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
