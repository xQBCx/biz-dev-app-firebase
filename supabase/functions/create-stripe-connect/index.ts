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
    const userEmail = userData.user.email;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already has a Stripe Connect account
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_account_id, full_name, email")
      .eq("id", userId)
      .single();

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

    let accountId = profile?.stripe_connect_account_id;

    // Create new Stripe Express account if none exists
    if (!accountId) {
      console.log("[STRIPE-CONNECT] Creating new Express account for user:", userId);
      
      const account = await stripe.accounts.create({
        type: "express",
        email: userEmail || profile?.email,
        metadata: {
          user_id: userId,
          platform: "xodiak"
        },
        capabilities: {
          transfers: { requested: true }
        },
        business_type: "individual",
        business_profile: {
          name: profile?.full_name || undefined,
          product_description: "XDK Token Withdrawals"
        }
      });

      accountId = account.id;

      // Save to profile
      await supabase
        .from("profiles")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", userId);

      console.log("[STRIPE-CONNECT] Created account:", accountId);
    }

    // Parse request body for return URLs
    const body = await req.json().catch(() => ({}));
    const origin = body.origin || req.headers.get("origin") || "https://app.example.com";

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      return_url: `${origin}/profile?stripe_connect=complete`,
      refresh_url: `${origin}/profile?stripe_connect=refresh`,
      type: "account_onboarding",
    });

    console.log("[STRIPE-CONNECT] Generated onboarding link for account:", accountId);

    return new Response(
      JSON.stringify({
        success: true,
        url: accountLink.url,
        account_id: accountId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("[STRIPE-CONNECT] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
