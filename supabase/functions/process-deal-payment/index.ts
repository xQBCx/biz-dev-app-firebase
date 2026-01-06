import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  inflow_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: PaymentRequest = await req.json();
    const { inflow_id } = body;

    console.log(`Processing deal payment for inflow: ${inflow_id}`);

    // Fetch the inflow
    const { data: inflow, error: inflowError } = await supabase
      .from('deal_room_inflows')
      .select('*')
      .eq('id', inflow_id)
      .single();

    if (inflowError || !inflow) {
      return new Response(JSON.stringify({ error: 'Inflow not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (inflow.status !== 'confirmed') {
      return new Response(JSON.stringify({ error: 'Inflow not confirmed yet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get deal room participants with wallet connections
    const { data: participants, error: participantsError } = await supabase
      .from('deal_room_participants')
      .select(`
        *,
        participant_wallet_connections(wallet_id)
      `)
      .eq('deal_room_id', inflow.deal_room_id);

    if (participantsError || !participants) {
      return new Response(JSON.stringify({ error: 'No participants found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get formulation for this payment type
    const { data: formulations } = await supabase
      .from('deal_room_formulations')
      .select('*')
      .eq('deal_room_id', inflow.deal_room_id);

    // Calculate distribution based on payment type
    const distributions: Array<{
      participant_id: string;
      wallet_id: string;
      amount: number;
      percentage: number;
      rule: string;
    }> = [];

    const totalAmount = Number(inflow.amount);
    const paymentType = inflow.payment_type;

    // Default split rules based on payment type
    let splitRules: Record<string, number> = {};
    
    if (paymentType === 'meeting_fee') {
      // Check if agents were involved
      const { data: agentActivities } = await supabase
        .from('external_agent_activities')
        .select('*')
        .eq('deal_room_id', inflow.deal_room_id)
        .eq('outcome_type', 'meeting_set')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (agentActivities && agentActivities.length > 0) {
        // Agent was involved: split 3 ways
        splitRules = { 'bill': 0.333, 'harley': 0.333, 'peter': 0.334 };
      } else {
        // No agent: split 2 ways
        splitRules = { 'bill': 0.5, 'harley': 0.5 };
      }
    } else if (paymentType === 'deal_commission') {
      // Commission split logic
      splitRules = { 'bill': 0.333, 'harley': 0.333, 'peter': 0.334 };
    } else if (paymentType === 'retainer') {
      // Retainer: Bill and Harley only
      splitRules = { 'bill': 0.5, 'harley': 0.5 };
    } else {
      // Default equal split
      const equalShare = 1 / participants.length;
      participants.forEach((_, idx) => {
        splitRules[`participant_${idx}`] = equalShare;
      });
    }

    // Map split rules to actual participants and create distributions
    for (const participant of participants) {
      // Find matching split rule by participant name/email
      let sharePercentage = 0;
      
      // Try to match by email or name patterns
      const email = (participant.email || '').toLowerCase();
      const name = (participant.name || '').toLowerCase();
      
      if (email.includes('bill') || name.includes('bill')) {
        sharePercentage = splitRules['bill'] || 0;
      } else if (email.includes('harley') || email.includes('macdonald') || name.includes('harley')) {
        sharePercentage = splitRules['harley'] || 0;
      } else if (email.includes('peter') || email.includes('optimoit') || name.includes('peter')) {
        sharePercentage = splitRules['peter'] || 0;
      }

      if (sharePercentage > 0) {
        const walletConnection = participant.participant_wallet_connections?.[0];
        if (walletConnection?.wallet_id) {
          distributions.push({
            participant_id: participant.id,
            wallet_id: walletConnection.wallet_id,
            amount: totalAmount * sharePercentage,
            percentage: sharePercentage * 100,
            rule: paymentType,
          });
        }
      }
    }

    // Create distribution records
    const distributionInserts = distributions.map(d => ({
      inflow_id,
      deal_room_id: inflow.deal_room_id,
      recipient_participant_id: d.participant_id,
      recipient_wallet_id: d.wallet_id,
      amount: d.amount,
      currency: inflow.currency,
      percentage_share: d.percentage,
      distribution_rule: d.rule,
      status: 'pending',
    }));

    if (distributionInserts.length > 0) {
      const { error: distError } = await supabase
        .from('deal_room_distributions')
        .insert(distributionInserts);

      if (distError) {
        console.error('Error creating distributions:', distError);
        return new Response(JSON.stringify({ error: distError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Update inflow status
    await supabase
      .from('deal_room_inflows')
      .update({ status: 'distributed' })
      .eq('id', inflow_id);

    // Credit participant wallets
    for (const dist of distributions) {
      await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: dist.wallet_id,
          type: 'credit',
          amount: dist.amount,
          currency: inflow.currency,
          description: `Deal payment: ${paymentType} (${dist.percentage.toFixed(1)}%)`,
          status: 'completed',
          metadata: {
            inflow_id,
            deal_room_id: inflow.deal_room_id,
            payment_type: paymentType,
          }
        });

      // Update wallet balance
      await supabase.rpc('increment_wallet_balance', {
        p_wallet_id: dist.wallet_id,
        p_amount: dist.amount
      });
    }

    console.log(`Distribution complete: ${distributions.length} recipients`);

    return new Response(JSON.stringify({
      success: true,
      distributions: distributions.length,
      total_distributed: distributions.reduce((sum, d) => sum + d.amount, 0),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Process deal payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
