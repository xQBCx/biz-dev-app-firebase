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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !userData.user) {
      throw new Error("Unauthorized");
    }

    const userId = userData.user.id;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's Stripe Connect account ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_connect_account_id) {
      return new Response(
        JSON.stringify({
          connected: false,
          payouts_enabled: false,
          details_submitted: false,
          account_id: null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve account status from Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);

    const payoutsEnabled = account.payouts_enabled === true;
    const detailsSubmitted = account.details_submitted === true;

    // Update profile if payouts status changed
    if (payoutsEnabled !== profile.stripe_connect_payouts_enabled) {
      await supabase
        .from("profiles")
        .update({ 
          stripe_connect_payouts_enabled: payoutsEnabled,
          stripe_connect_onboarded_at: detailsSubmitted ? new Date().toISOString() : null
        })
        .eq("id", userId);
    }

    return new Response(
      JSON.stringify({
        connected: true,
        payouts_enabled: payoutsEnabled,
        details_submitted: detailsSubmitted,
        account_id: profile.stripe_connect_account_id,
        charges_enabled: account.charges_enabled,
        country: account.country,
        default_currency: account.default_currency
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("[CHECK-STRIPE-CONNECT] Error:", error);
    return new Response(
      JSON.stringify({ 
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
