import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CLIENT-INVOICE] ${step}${detailsStr}`);
};

interface InvoiceRequest {
  client_id: string;
  client_email: string;
  amount: number;
  currency?: string;
  description: string;
  due_date?: string;
  deal_room_id?: string;
  xdk_recipient_wallet?: string;
  line_items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      logStep("ERROR: Stripe not configured");
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
      logStep("Authentication failed", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creatorId = userData.user.id;
    logStep("Creator authenticated", { creatorId, email: userData.user.email });

    const body: InvoiceRequest = await req.json();
    const {
      client_id,
      client_email,
      amount,
      currency = "USD",
      description,
      due_date,
      deal_room_id,
      xdk_recipient_wallet,
      line_items = [],
    } = body;

    // Validate required fields
    if (!client_id || !client_email || !amount || amount <= 0 || !description) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: client_id, client_email, amount, description" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Creating invoice", { clientId: client_id, amount, currency });

    // Find or create Stripe customer for client
    const customers = await stripe.customers.list({ email: client_email, limit: 1 });
    let customerId: string;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      // Get client profile for name
      const { data: clientProfile } = await supabase
        .from("profiles")
        .select("full_name, company")
        .eq("id", client_id)
        .single();

      const customer = await stripe.customers.create({
        email: client_email,
        name: clientProfile?.full_name || client_email,
        metadata: {
          supabase_user_id: client_id,
          company: clientProfile?.company || "",
        },
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Calculate due date (default 30 days if not specified)
    const dueTimestamp = due_date 
      ? Math.floor(new Date(due_date).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    // Create Stripe Invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      due_date: dueTimestamp,
      description,
      metadata: {
        creator_id: creatorId,
        client_id,
        deal_room_id: deal_room_id || "",
        xdk_recipient_wallet: xdk_recipient_wallet || "",
        platform: "biz_dev_app",
      },
    });

    logStep("Stripe invoice created", { invoiceId: invoice.id });

    // Add line items
    if (line_items.length > 0) {
      for (const item of line_items) {
        await stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          amount: Math.round(item.amount * 100),
          currency: currency.toLowerCase(),
          description: item.description,
          quantity: item.quantity || 1,
        });
      }
    } else {
      // Single line item for the full amount
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        description,
      });
    }

    logStep("Invoice line items added");

    // Finalize the invoice to generate PaymentIntent
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: false, // Don't auto-send, we handle notification
    });

    logStep("Invoice finalized", { 
      status: finalizedInvoice.status,
      paymentIntent: finalizedInvoice.payment_intent,
    });

    // Retrieve the PaymentIntent to get client_secret
    let clientSecret: string | null = null;
    let paymentIntentId: string | null = null;

    if (finalizedInvoice.payment_intent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        typeof finalizedInvoice.payment_intent === 'string' 
          ? finalizedInvoice.payment_intent 
          : finalizedInvoice.payment_intent.id
      );
      clientSecret = paymentIntent.client_secret;
      paymentIntentId = paymentIntent.id;
      logStep("Retrieved PaymentIntent", { paymentIntentId, hasClientSecret: !!clientSecret });
    }

    // Store in platform_invoices table
    const { data: platformInvoice, error: dbError } = await supabase
      .from("platform_invoices")
      .insert({
        stripe_invoice_id: finalizedInvoice.id,
        stripe_payment_intent_id: paymentIntentId,
        stripe_client_secret: clientSecret,
        creator_id: creatorId,
        client_id,
        client_email,
        deal_room_id: deal_room_id || null,
        amount,
        currency: currency.toUpperCase(),
        description,
        line_items: line_items.length > 0 ? line_items : [{ description, amount, quantity: 1 }],
        due_date: due_date || new Date(dueTimestamp * 1000).toISOString().split('T')[0],
        status: "open",
        xdk_recipient_wallet: xdk_recipient_wallet || null,
      })
      .select()
      .single();

    if (dbError) {
      logStep("Database error", { error: dbError });
      throw new Error("Failed to save invoice to database");
    }

    logStep("Platform invoice created", { invoiceId: platformInvoice.id });

    // Create in-app notification for client
    await supabase.from("notifications").insert({
      user_id: client_id,
      type: "invoice",
      title: "New Invoice",
      message: `You have a new invoice for ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}`,
      data: {
        invoice_id: platformInvoice.id,
        amount,
        currency,
        due_date: platformInvoice.due_date,
      },
    });

    logStep("Client notification sent");

    return new Response(
      JSON.stringify({
        success: true,
        invoice_id: platformInvoice.id,
        stripe_invoice_id: finalizedInvoice.id,
        client_secret: clientSecret,
        payment_intent_id: paymentIntentId,
        amount,
        currency,
        status: "open",
        due_date: platformInvoice.due_date,
        hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
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
