import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.user;
    const { deal_room_id, amount, currency = "USD", xdk_conversion = true, description } = await req.json();

    if (!deal_room_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: deal_room_id and amount required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating escrow funding checkout for Deal Room: ${deal_room_id}, Amount: $${amount}`);

    // Verify user has access to this deal room
    const { data: participant } = await supabase
      .from("deal_room_participants")
      .select("id")
      .eq("deal_room_id", deal_room_id)
      .eq("user_id", user.id)
      .single();

    const { data: dealRoom } = await supabase
      .from("deal_rooms")
      .select("id, name, created_by")
      .eq("id", deal_room_id)
      .single();

    if (!participant && dealRoom?.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied to this deal room" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create escrow funding request record
    const { data: fundingRequest, error: fundingError } = await supabase
      .from("escrow_funding_requests")
      .insert({
        deal_room_id,
        user_id: user.id,
        amount,
        currency,
        xdk_conversion,
        status: "pending",
        metadata: {
          description: description || `Escrow funding for ${dealRoom?.name || 'Deal Room'}`,
          initiated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (fundingError) {
      console.error("Failed to create funding request:", fundingError);
      throw fundingError;
    }

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe Checkout Session
    const origin = req.headers.get("origin") || "https://biz-dev-app.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Deal Room Escrow Funding",
              description: `${xdk_conversion ? "XDK-backed escrow deposit" : "USD escrow deposit"} for ${dealRoom?.name || 'Deal Room'}`,
              metadata: {
                deal_room_id,
                funding_request_id: fundingRequest.id,
              },
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/deal-room/${deal_room_id}?funding=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/deal-room/${deal_room_id}?funding=cancelled`,
      metadata: {
        deal_room_id,
        funding_request_id: fundingRequest.id,
        user_id: user.id,
        xdk_conversion: xdk_conversion.toString(),
        type: "escrow_funding",
      },
    });

    // Update funding request with Stripe session ID
    await supabase
      .from("escrow_funding_requests")
      .update({ stripe_session_id: session.id })
      .eq("id", fundingRequest.id);

    console.log(`Created Stripe checkout session: ${session.id}`);

    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id,
        funding_request_id: fundingRequest.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Escrow funding checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
