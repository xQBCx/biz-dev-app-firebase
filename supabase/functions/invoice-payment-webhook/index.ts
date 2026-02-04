import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INVOICE-PAYMENT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err instanceof Error ? err.message : "unknown" });
        return new Response(
          JSON.stringify({ error: "Webhook signature verification failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // For development, parse without verification
      event = JSON.parse(body);
    }

    logStep("Received webhook event", { type: event.type, id: event.id });

    // Handle invoice.paid event
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Check if this is a platform invoice
      if (invoice.metadata?.platform !== "biz_dev_app") {
        logStep("Not a platform invoice, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      logStep("Processing paid invoice", { 
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
      });

      // Find the platform invoice
      const { data: platformInvoice, error: findError } = await supabase
        .from("platform_invoices")
        .select("*")
        .eq("stripe_invoice_id", invoice.id)
        .single();

      if (findError || !platformInvoice) {
        logStep("Platform invoice not found", { stripeInvoiceId: invoice.id });
        return new Response(
          JSON.stringify({ error: "Platform invoice not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Already processed?
      if (platformInvoice.status === "paid" && platformInvoice.xdk_credited) {
        logStep("Invoice already processed", { invoiceId: platformInvoice.id });
        return new Response(JSON.stringify({ received: true, already_processed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const amount = invoice.amount_paid / 100; // Convert from cents
      const creatorId = invoice.metadata?.creator_id || platformInvoice.creator_id;
      const xdkRecipientWallet = invoice.metadata?.xdk_recipient_wallet || platformInvoice.xdk_recipient_wallet;

      // Get XDK exchange rate
      const { data: exchangeRate } = await supabase
        .from("xdk_exchange_rates")
        .select("xdk_rate")
        .eq("base_currency", "USD")
        .order("effective_from", { ascending: false })
        .limit(1)
        .single();

      const rate = exchangeRate?.xdk_rate || 1;
      const xdkAmount = amount * rate;

      logStep("Minting XDK", { usdAmount: amount, xdkAmount, rate });

      // Determine recipient wallet
      let recipientAddress = xdkRecipientWallet;

      if (!recipientAddress) {
        // Default to creator's XDK account
        const { data: creatorAccount } = await supabase
          .from("xodiak_accounts")
          .select("address")
          .eq("user_id", creatorId)
          .eq("account_type", "user")
          .single();

        if (creatorAccount) {
          recipientAddress = creatorAccount.address;
        } else {
          // Generate address for creator
          const { data: addressData } = await supabase.rpc("generate_xdk_address");
          recipientAddress = addressData || `xdk1user${creatorId.replace(/-/g, "").slice(0, 30)}`;
          
          // Create XODIAK account
          await supabase.from("xodiak_accounts").insert({
            user_id: creatorId,
            address: recipientAddress,
            balance: 0,
            account_type: "user",
          });
        }
      }

      // Create XDK mint transaction
      const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;

      const { error: xdkTxError } = await supabase
        .from("xodiak_transactions")
        .insert({
          tx_hash: txHash,
          from_address: "xdk1treasury000000000000000000000000000000",
          to_address: recipientAddress,
          amount: xdkAmount,
          tx_type: "mint_invoice_payment",
          status: "confirmed",
          data: {
            platform_invoice_id: platformInvoice.id,
            stripe_invoice_id: invoice.id,
            usd_amount: amount,
            exchange_rate: rate,
            client_id: platformInvoice.client_id,
          },
        });

      if (xdkTxError) {
        logStep("XDK transaction error", { error: xdkTxError });
      } else {
        // Update recipient's XDK balance
        await supabase.rpc("increment_xdk_balance", {
          p_address: recipientAddress,
          p_amount: xdkAmount,
        });

        logStep("XDK minted and credited", { txHash, recipientAddress, xdkAmount });
      }

      // Handle treasury routing if enabled
      let treasuryTxHash: string | null = null;
      let treasuryXdkAmount: number | null = null;

      if (platformInvoice.route_to_treasury && platformInvoice.deal_room_id) {
        logStep("Routing to deal room treasury", { dealRoomId: platformInvoice.deal_room_id });

        // Get or create deal room treasury
        const { data: treasuryAccount } = await supabase
          .from("xodiak_accounts")
          .select("address, balance")
          .eq("deal_room_id", platformInvoice.deal_room_id)
          .eq("account_type", "deal_room_treasury")
          .single();

        let treasuryAddress = treasuryAccount?.address;

        if (!treasuryAddress) {
          const { data: newAddress } = await supabase.rpc("generate_xdk_address");
          treasuryAddress = newAddress || `xdk1treasury${platformInvoice.deal_room_id.replace(/-/g, "").slice(0, 26)}`;
          
          await supabase.from("xodiak_accounts").insert({
            deal_room_id: platformInvoice.deal_room_id,
            address: treasuryAddress,
            balance: 0,
            account_type: "deal_room_treasury",
          });
        }

        // Mint XDK directly to treasury
        treasuryTxHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;
        treasuryXdkAmount = xdkAmount;

        await supabase.from("xodiak_transactions").insert({
          tx_hash: treasuryTxHash,
          from_address: "xdk1treasury000000000000000000000000000000",
          to_address: treasuryAddress,
          amount: treasuryXdkAmount,
          tx_type: "mint_treasury_routing",
          status: "confirmed",
          data: {
            platform_invoice_id: platformInvoice.id,
            stripe_invoice_id: invoice.id,
            usd_amount: amount,
            exchange_rate: rate,
            routed_from_invoice: true,
          },
        });

        await supabase.rpc("increment_xdk_balance", {
          p_address: treasuryAddress,
          p_amount: treasuryXdkAmount,
        });

        logStep("Treasury XDK minted", { treasuryTxHash, treasuryAddress, treasuryXdkAmount });
      }

      // Update platform invoice
      await supabase
        .from("platform_invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          xdk_credited: true,
          xdk_amount: xdkAmount,
          xdk_tx_hash: txHash,
          treasury_credited: !!treasuryTxHash,
          treasury_xdk_amount: treasuryXdkAmount,
        })
        .eq("id", platformInvoice.id);

      // Notify creator
      await supabase.from("notifications").insert({
        user_id: creatorId,
        type: "payment_received",
        title: "Invoice Paid",
        message: `Payment of $${amount.toFixed(2)} received. ${xdkAmount.toFixed(2)} XDK credited to your wallet.`,
        data: {
          invoice_id: platformInvoice.id,
          amount,
          xdk_amount: xdkAmount,
          tx_hash: txHash,
        },
      });

      // Get deal room and client info for ledger narrative
      const { data: dealRoom } = await supabase
        .from("deal_rooms")
        .select("name")
        .eq("id", platformInvoice.deal_room_id)
        .single();

      const { data: client } = await supabase
        .from("clients")
        .select("name, domain")
        .eq("id", platformInvoice.client_id)
        .single();

      const { data: creatorProfile } = await supabase
        .from("profiles")
        .select("full_name, company")
        .eq("id", creatorId)
        .single();

      const clientName = client?.name || "Client";
      const creatorName = creatorProfile?.company || creatorProfile?.full_name || "Creator";
      const dealRoomName = dealRoom?.name || "Deal Room";
      const timestamp = new Date().toLocaleString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });

      // Create value ledger entry for invoice payment
      const narrative = `${clientName} paid $${amount.toFixed(2)} invoice to ${creatorName} on ${timestamp}. ${xdkAmount.toFixed(2)} XDK credited.`;

      await supabase.from("value_ledger_entries").insert({
        deal_room_id: platformInvoice.deal_room_id,
        source_user_id: null, // Client may not have user account
        source_entity_type: "company",
        source_entity_name: clientName,
        destination_user_id: creatorId,
        destination_entity_type: creatorProfile?.company ? "company" : "individual",
        destination_entity_name: creatorName,
        entry_type: "invoice_payment",
        amount,
        currency: "USD",
        xdk_amount: xdkAmount,
        purpose: platformInvoice.description || "Invoice payment",
        reference_type: "platform_invoice",
        reference_id: platformInvoice.id,
        contribution_credits: Math.round(amount / 10),
        credit_category: "funding",
        verification_source: "stripe",
        verification_id: invoice.id,
        verified_at: new Date().toISOString(),
        xdk_tx_hash: txHash,
        narrative,
        metadata: {
          invoice_number: platformInvoice.invoice_number,
          client_id: platformInvoice.client_id,
        },
      });

      logStep("Invoice payment processed successfully", { 
        invoiceId: platformInvoice.id,
        xdkAmount,
        txHash,
      });

      return new Response(
        JSON.stringify({ 
          received: true, 
          processed: true,
          xdk_amount: xdkAmount,
          tx_hash: txHash,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle invoice.payment_failed
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      
      if (invoice.metadata?.platform === "biz_dev_app") {
        await supabase
          .from("platform_invoices")
          .update({ status: "open" }) // Keep as open for retry
          .eq("stripe_invoice_id", invoice.id);

        logStep("Payment failed, invoice kept open for retry", { stripeInvoiceId: invoice.id });
      }
    }

    // Handle invoice.voided
    if (event.type === "invoice.voided") {
      const invoice = event.data.object as Stripe.Invoice;
      
      if (invoice.metadata?.platform === "biz_dev_app") {
        await supabase
          .from("platform_invoices")
          .update({ status: "void" })
          .eq("stripe_invoice_id", invoice.id);

        logStep("Invoice voided", { stripeInvoiceId: invoice.id });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
