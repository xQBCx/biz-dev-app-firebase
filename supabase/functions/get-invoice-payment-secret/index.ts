import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-INVOICE-PAYMENT-SECRET] ${step}${detailsStr}`);
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

    // Authenticate user
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

    const userId = userData.user.id;
    const { invoice_id } = await req.json();

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: "invoice_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Fetching invoice", { invoiceId: invoice_id, userId });

    // Get invoice from database - verify user is the client
    const { data: invoice, error: invoiceError } = await supabase
      .from("platform_invoices")
      .select("*")
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify access - must be client or creator
    if (invoice.client_id !== userId && invoice.creator_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If already paid, return error
    if (invoice.status === "paid") {
      return new Response(
        JSON.stringify({ error: "Invoice already paid", status: "paid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If we have a stored client_secret, verify it's still valid
    let clientSecret = invoice.stripe_client_secret;
    let paymentIntentId = invoice.stripe_payment_intent_id;

    if (paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // If payment intent is still valid
        if (paymentIntent.status === "requires_payment_method" || 
            paymentIntent.status === "requires_confirmation") {
          clientSecret = paymentIntent.client_secret;
          logStep("Using existing PaymentIntent", { status: paymentIntent.status });
        } else if (paymentIntent.status === "succeeded") {
          // Update invoice as paid
          await supabase
            .from("platform_invoices")
            .update({ status: "paid", paid_at: new Date().toISOString() })
            .eq("id", invoice_id);
          
          return new Response(
            JSON.stringify({ error: "Invoice already paid", status: "paid" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          // Payment intent in unexpected state - get fresh one from Stripe invoice
          logStep("PaymentIntent in unexpected state", { status: paymentIntent.status });
          clientSecret = null;
        }
      } catch (e) {
        logStep("Error retrieving PaymentIntent", { error: e instanceof Error ? e.message : "unknown" });
        clientSecret = null;
      }
    }

    // If no valid client_secret, get from Stripe invoice
    if (!clientSecret && invoice.stripe_invoice_id) {
      const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
      
      if (stripeInvoice.payment_intent) {
        const pi = await stripe.paymentIntents.retrieve(
          typeof stripeInvoice.payment_intent === 'string' 
            ? stripeInvoice.payment_intent 
            : stripeInvoice.payment_intent.id
        );
        clientSecret = pi.client_secret;
        paymentIntentId = pi.id;

        // Update stored values
        await supabase
          .from("platform_invoices")
          .update({ 
            stripe_client_secret: clientSecret,
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq("id", invoice_id);

        logStep("Retrieved fresh PaymentIntent from Stripe invoice", { paymentIntentId });
      }
    }

    if (!clientSecret) {
      return new Response(
        JSON.stringify({ error: "Unable to retrieve payment information" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        client_secret: clientSecret,
        payment_intent_id: paymentIntentId,
        invoice_id: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        description: invoice.description,
        status: invoice.status,
        due_date: invoice.due_date,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
