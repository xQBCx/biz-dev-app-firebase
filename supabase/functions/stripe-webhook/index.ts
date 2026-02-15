import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (handler: string, step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK][${handler}] ${step}${d}`);
};

/* ───────────────────────────── helpers ───────────────────────────── */

function txHash(): string {
  return `0x${crypto.randomUUID().replace(/-/g, "")}`;
}

async function getXdkRate(supabase: ReturnType<typeof createClient>): Promise<number> {
  const { data } = await supabase
    .from("xdk_exchange_rates")
    .select("xdk_rate")
    .eq("base_currency", "USD")
    .order("effective_from", { ascending: false })
    .limit(1)
    .single();
  return data?.xdk_rate || 1;
}

async function ensureUserXdkAccount(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("xodiak_accounts")
    .select("address")
    .eq("user_id", userId)
    .eq("account_type", "user")
    .single();

  if (existing) return existing.address;

  const { data: addr } = await supabase.rpc("generate_xdk_address");
  const address = addr || `xdk1user${userId.replace(/-/g, "").slice(0, 30)}`;

  await supabase.from("xodiak_accounts").insert({
    user_id: userId,
    address,
    balance: 0,
    account_type: "user",
  });

  return address;
}

async function ensureTreasuryAccount(
  supabase: ReturnType<typeof createClient>,
  dealRoomId: string,
  accountType = "treasury"
): Promise<string> {
  const { data: existing } = await supabase
    .from("xodiak_accounts")
    .select("address")
    .eq("deal_room_id", dealRoomId)
    .eq("account_type", accountType)
    .single();

  if (existing) return existing.address;

  const { data: addr } = await supabase.rpc("generate_xdk_address");
  const address = addr || `xdk1treasury${dealRoomId.replace(/-/g, "").slice(0, 26)}`;

  await supabase.from("xodiak_accounts").insert({
    deal_room_id: dealRoomId,
    address,
    balance: 0,
    account_type: accountType,
  });

  return address;
}

/* ──────────────── HANDLER: payment_intent.succeeded ──────────────── */

async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  paymentIntent: Stripe.PaymentIntent
) {
  // Only process fund contributions here
  if (paymentIntent.metadata?.type !== "fund_contribution") {
    log("payment_intent.succeeded", "Skipping non-fund-contribution", { type: paymentIntent.metadata?.type });
    return { processed: false, reason: "not_fund_contribution" };
  }

  const fundRequestId = paymentIntent.metadata.fund_request_id;
  const dealRoomId = paymentIntent.metadata.deal_room_id;
  const userId = paymentIntent.metadata.user_id;
  const grossAmount = paymentIntent.amount_received / 100;

  log("payment_intent.succeeded", "Processing fund contribution", { fundRequestId, dealRoomId, userId, grossAmount });

  // Get fee breakdown
  const expanded = await stripe.paymentIntents.retrieve(paymentIntent.id, {
    expand: ["latest_charge.balance_transaction"],
  });

  const charge = expanded.latest_charge as Stripe.Charge | null;
  const balanceTx = charge?.balance_transaction as Stripe.BalanceTransaction | null;

  let stripeFee = 0;
  let netAmount = grossAmount;

  if (balanceTx) {
    stripeFee = balanceTx.fee / 100;
    netAmount = balanceTx.net / 100;
    log("payment_intent.succeeded", "Fee breakdown", { grossAmount, stripeFee, netAmount });
  }

  // Verify fund request exists and not already processed
  const { data: fundRequest, error: frErr } = await supabase
    .from("fund_contribution_requests")
    .select("*, deal_rooms(name, created_by)")
    .eq("id", fundRequestId)
    .single();

  if (frErr || !fundRequest) {
    log("payment_intent.succeeded", "Fund request not found", { fundRequestId });
    return { processed: false, reason: "fund_request_not_found" };
  }

  if (fundRequest.status === "paid") {
    log("payment_intent.succeeded", "Already processed", { fundRequestId });
    return { processed: false, reason: "already_processed" };
  }

  const rate = await getXdkRate(supabase);
  const xdkAmount = netAmount * rate;

  // Get or create treasury
  const treasuryAddress = await ensureTreasuryAccount(supabase, dealRoomId);

  // Create XDK transaction
  const hash = txHash();
  await supabase.from("xodiak_transactions").insert({
    tx_hash: hash,
    from_address: "stripe_payment",
    to_address: treasuryAddress,
    amount: xdkAmount,
    tx_type: "fund_contribution",
    status: "confirmed",
    data: {
      fund_request_id: fundRequestId,
      deal_room_id: dealRoomId,
      user_id: userId,
      gross_amount: grossAmount,
      stripe_fee: stripeFee,
      net_amount: netAmount,
      exchange_rate: rate,
      stripe_payment_intent_id: paymentIntent.id,
    },
  });

  // Increment balance
  await supabase.rpc("increment_xdk_balance", { p_address: treasuryAddress, p_amount: xdkAmount });

  // Update fund request
  await supabase.from("fund_contribution_requests").update({
    status: "paid",
    paid_at: new Date().toISOString(),
    gross_amount: grossAmount,
    stripe_fee: stripeFee,
    net_amount: netAmount,
    xdk_amount: xdkAmount,
    xdk_tx_hash: hash,
    stripe_payment_intent_id: paymentIntent.id,
  }).eq("id", fundRequestId);

  // Get user profile for ledger
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", userId)
    .single();

  const userName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email
    : "Unknown User";

  const feeNote = stripeFee > 0
    ? ` (Gross: $${grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Fee: $${stripeFee.toFixed(2)})`
    : "";

  await supabase.from("value_ledger_entries").insert({
    deal_room_id: dealRoomId,
    entity_type: "user",
    entity_id: userId,
    entry_type: "fund_contribution",
    amount: netAmount,
    currency: "XDK",
    gross_amount: grossAmount,
    processing_fee: stripeFee,
    narrative: `${userName} contributed $${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${xdkAmount.toFixed(2)} XDK) to the treasury${feeNote}`,
    metadata: {
      fund_request_id: fundRequestId,
      purpose: fundRequest.purpose,
      gross_amount: grossAmount,
      stripe_fee: stripeFee,
      net_amount: netAmount,
      xdk_amount: xdkAmount,
      exchange_rate: rate,
      stripe_payment_intent_id: paymentIntent.id,
      tx_hash: hash,
    },
  });

  // Notify deal room admin
  const adminId = fundRequest.deal_rooms?.created_by;
  if (adminId) {
    await supabase.from("notifications").insert({
      user_id: adminId,
      type: "fund_contribution_received",
      title: "Fund Contribution Received",
      message: `${userName} contributed $${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${fundRequest.deal_rooms?.name || "your deal room"} treasury`,
      metadata: {
        deal_room_id: dealRoomId,
        fund_request_id: fundRequestId,
        gross_amount: grossAmount,
        stripe_fee: stripeFee,
        net_amount: netAmount,
        xdk_amount: xdkAmount,
        contributor_id: userId,
      },
    });
  }

  log("payment_intent.succeeded", "Fund contribution processed", { fundRequestId, xdkAmount, hash });
  return { processed: true, xdk_minted: xdkAmount, tx_hash: hash };
}

/* ─────────── HANDLER: payment_intent.payment_failed ─────────── */

async function handlePaymentIntentFailed(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent
) {
  log("payment_intent.payment_failed", "Payment failed", { id: paymentIntent.id });

  // If it was a fund contribution, update status
  if (paymentIntent.metadata?.type === "fund_contribution") {
    const fundRequestId = paymentIntent.metadata.fund_request_id;
    if (fundRequestId) {
      await supabase.from("fund_contribution_requests")
        .update({ status: "failed" })
        .eq("id", fundRequestId);
    }
  }

  return { processed: true };
}

/* ───────────────────── HANDLER: invoice.paid ───────────────────── */

async function handleInvoicePaid(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  if (invoice.metadata?.platform !== "biz_dev_app") {
    log("invoice.paid", "Not a platform invoice, skipping");
    return { processed: false, reason: "not_platform_invoice" };
  }

  log("invoice.paid", "Processing", { stripeInvoiceId: invoice.id, amount: invoice.amount_paid });

  const { data: platformInvoice, error: findError } = await supabase
    .from("platform_invoices")
    .select("*")
    .eq("stripe_invoice_id", invoice.id)
    .single();

  if (findError || !platformInvoice) {
    log("invoice.paid", "Platform invoice not found", { stripeInvoiceId: invoice.id });
    return { processed: false, reason: "not_found" };
  }

  if (platformInvoice.status === "paid" && platformInvoice.xdk_credited) {
    log("invoice.paid", "Already processed", { invoiceId: platformInvoice.id });
    return { processed: false, reason: "already_processed" };
  }

  const amount = invoice.amount_paid / 100;
  const creatorId = invoice.metadata?.creator_id || platformInvoice.creator_id;
  const xdkRecipientWallet = invoice.metadata?.xdk_recipient_wallet || platformInvoice.xdk_recipient_wallet;

  const rate = await getXdkRate(supabase);
  const xdkAmount = amount * rate;

  // Determine recipient
  let recipientAddress = xdkRecipientWallet;
  if (!recipientAddress) {
    recipientAddress = await ensureUserXdkAccount(supabase, creatorId);
  }

  // Create XDK mint transaction
  const hash = txHash();
  const { error: xdkTxError } = await supabase.from("xodiak_transactions").insert({
    tx_hash: hash,
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

  if (!xdkTxError) {
    await supabase.rpc("increment_xdk_balance", { p_address: recipientAddress, p_amount: xdkAmount });
    log("invoice.paid", "XDK minted", { hash, recipientAddress, xdkAmount });
  }

  // Treasury routing
  let treasuryTxHash: string | null = null;
  let treasuryXdkAmount: number | null = null;

  if (platformInvoice.route_to_treasury && platformInvoice.deal_room_id) {
    const treasuryAddress = await ensureTreasuryAccount(supabase, platformInvoice.deal_room_id, "deal_room_treasury");

    treasuryTxHash = txHash();
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

    await supabase.rpc("increment_xdk_balance", { p_address: treasuryAddress, p_amount: treasuryXdkAmount });
    log("invoice.paid", "Treasury XDK minted", { treasuryTxHash, treasuryAddress, treasuryXdkAmount });
  }

  // Update platform invoice
  await supabase.from("platform_invoices").update({
    status: "paid",
    paid_at: new Date().toISOString(),
    xdk_credited: true,
    xdk_amount: xdkAmount,
    xdk_tx_hash: hash,
    treasury_credited: !!treasuryTxHash,
    treasury_xdk_amount: treasuryXdkAmount,
  }).eq("id", platformInvoice.id);

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
      tx_hash: hash,
    },
  });

  // Value ledger entry
  const { data: dealRoom } = await supabase.from("deal_rooms").select("name").eq("id", platformInvoice.deal_room_id).single();
  const { data: client } = await supabase.from("clients").select("name, domain").eq("id", platformInvoice.client_id).single();
  const { data: creatorProfile } = await supabase.from("profiles").select("full_name, company").eq("id", creatorId).single();

  const clientName = client?.name || "Client";
  const creatorName = creatorProfile?.company || creatorProfile?.full_name || "Creator";
  const timestamp = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  await supabase.from("value_ledger_entries").insert({
    deal_room_id: platformInvoice.deal_room_id,
    source_user_id: null,
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
    xdk_tx_hash: hash,
    narrative: `${clientName} paid $${amount.toFixed(2)} invoice to ${creatorName} on ${timestamp}. ${xdkAmount.toFixed(2)} XDK credited.`,
    metadata: {
      invoice_number: platformInvoice.invoice_number,
      client_id: platformInvoice.client_id,
    },
  });

  log("invoice.paid", "Fully processed", { invoiceId: platformInvoice.id, xdkAmount, hash });
  return { processed: true, xdk_amount: xdkAmount, tx_hash: hash };
}

/* ─────────── HANDLER: invoice.payment_failed ─────────── */

async function handleInvoicePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  if (invoice.metadata?.platform === "biz_dev_app") {
    await supabase.from("platform_invoices").update({ status: "open" }).eq("stripe_invoice_id", invoice.id);
    log("invoice.payment_failed", "Invoice kept open for retry", { stripeInvoiceId: invoice.id });
  }
  return { processed: true };
}

/* ─────────── HANDLER: invoice.voided ─────────── */

async function handleInvoiceVoided(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  if (invoice.metadata?.platform === "biz_dev_app") {
    await supabase.from("platform_invoices").update({ status: "void" }).eq("stripe_invoice_id", invoice.id);
    log("invoice.voided", "Invoice voided", { stripeInvoiceId: invoice.id });
  }
  return { processed: true };
}

/* ─────────── HANDLER: charge.refunded ─────────── */

async function handleChargeRefunded(
  supabase: ReturnType<typeof createClient>,
  charge: Stripe.Charge
) {
  log("charge.refunded", "Charge refunded", { chargeId: charge.id, amount_refunded: charge.amount_refunded });

  // TODO: Implement XDK reversal logic if applicable based on charge metadata
  // For now, log the event for admin review

  return { processed: true, action: "logged_for_review" };
}

/* ─────────── HANDLER: charge.dispute.created / closed ─────────── */

async function handleDisputeCreated(
  supabase: ReturnType<typeof createClient>,
  dispute: Stripe.Dispute
) {
  log("charge.dispute.created", "Dispute opened", {
    disputeId: dispute.id,
    amount: dispute.amount,
    reason: dispute.reason,
    chargeId: dispute.charge,
  });

  // Create admin notification for dispute
  // Get platform admin (first user with admin role)
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("account_level", "owner")
    .limit(1);

  if (admins && admins.length > 0) {
    await supabase.from("notifications").insert({
      user_id: admins[0].id,
      type: "dispute_opened",
      title: "⚠️ Chargeback Opened",
      message: `A dispute for $${(dispute.amount / 100).toFixed(2)} has been opened. Reason: ${dispute.reason}`,
      metadata: {
        dispute_id: dispute.id,
        amount: dispute.amount / 100,
        reason: dispute.reason,
        charge_id: dispute.charge,
      },
    });
  }

  return { processed: true };
}

async function handleDisputeClosed(
  supabase: ReturnType<typeof createClient>,
  dispute: Stripe.Dispute
) {
  log("charge.dispute.closed", "Dispute resolved", {
    disputeId: dispute.id,
    status: dispute.status,
  });

  return { processed: true };
}

/* ─────── HANDLER: transfer.created / failed / reversed ─────── */

async function findWithdrawalId(
  supabase: ReturnType<typeof createClient>,
  transfer: Stripe.Transfer
): Promise<string | null> {
  const metaId = transfer.metadata?.withdrawal_request_id;
  if (metaId) return metaId;

  const { data } = await supabase
    .from("xdk_withdrawal_requests")
    .select("id")
    .eq("external_payout_id", transfer.id)
    .single();

  return data?.id || null;
}

async function handleTransferCreated(
  supabase: ReturnType<typeof createClient>,
  transfer: Stripe.Transfer
) {
  const withdrawalId = await findWithdrawalId(supabase, transfer);
  log("transfer.created", "Transfer initiated", { transfer_id: transfer.id, withdrawalId, amount: transfer.amount });

  if (withdrawalId) {
    await supabase.from("xdk_withdrawal_requests")
      .update({ status: "processing", external_payout_id: transfer.id })
      .eq("id", withdrawalId);
  }

  return { processed: true, matched: !!withdrawalId };
}

async function handleTransferFailed(
  supabase: ReturnType<typeof createClient>,
  transfer: Stripe.Transfer,
  errorMsg: string
) {
  const withdrawalId = await findWithdrawalId(supabase, transfer);
  log("transfer.failed/reversed", "Transfer failed", { transfer_id: transfer.id, withdrawalId });

  if (!withdrawalId) return { processed: false, matched: false };

  await supabase.from("xdk_withdrawal_requests")
    .update({ status: "failed", payout_error: errorMsg })
    .eq("id", withdrawalId);

  // Update xodiak_transactions
  await supabase.from("xodiak_transactions")
    .update({ status: "failed" })
    .eq("data->withdrawal_request_id", withdrawalId);

  // Refund XDK balance
  const { data: withdrawal } = await supabase
    .from("xdk_withdrawal_requests")
    .select("user_id, xdk_amount")
    .eq("id", withdrawalId)
    .single();

  if (withdrawal) {
    const { data: userAccount } = await supabase
      .from("xodiak_accounts")
      .select("address")
      .eq("user_id", withdrawal.user_id)
      .eq("account_type", "user")
      .single();

    if (userAccount) {
      await supabase.rpc("increment_xdk_balance", {
        p_address: userAccount.address,
        p_amount: Number(withdrawal.xdk_amount),
      });
      log("transfer.failed", "XDK refunded", { user_id: withdrawal.user_id, amount: withdrawal.xdk_amount });
    }
  }

  return { processed: true, matched: true, status: "failed" };
}

/* ─────── HANDLER: payout.paid / payout.failed ─────── */

async function handlePayoutPaid(
  supabase: ReturnType<typeof createClient>,
  payout: Stripe.Payout
) {
  log("payout.paid", "Payout landed in bank", { payoutId: payout.id, amount: payout.amount });

  // payout.paid confirms money landed in the partner's bank
  // Look for withdrawal requests that have matching external_payout_id or
  // where status is "processing" for the connected account
  // Note: Stripe Payout objects don't directly reference our transfer,
  // so we log for audit and mark as completed if we can match
  
  return { processed: true, action: "bank_deposit_confirmed" };
}

async function handlePayoutFailed(
  supabase: ReturnType<typeof createClient>,
  payout: Stripe.Payout
) {
  log("payout.failed", "Payout failed", { payoutId: payout.id, amount: payout.amount });

  // Notify admin
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("account_level", "owner")
    .limit(1);

  if (admins && admins.length > 0) {
    await supabase.from("notifications").insert({
      user_id: admins[0].id,
      type: "payout_failed",
      title: "⚠️ Bank Payout Failed",
      message: `A payout of $${(payout.amount / 100).toFixed(2)} failed to deposit. Review required.`,
      metadata: {
        payout_id: payout.id,
        amount: payout.amount / 100,
        failure_code: payout.failure_code,
        failure_message: payout.failure_message,
      },
    });
  }

  return { processed: true };
}

/* ─────── HANDLER: account.updated ─────── */

async function handleAccountUpdated(
  supabase: ReturnType<typeof createClient>,
  account: Stripe.Account
) {
  log("account.updated", "Connect account updated", {
    accountId: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
  });

  // Sync status to profiles table
  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_connect_charges_enabled: account.charges_enabled,
      stripe_connect_payouts_enabled: account.payouts_enabled,
      stripe_connect_details_submitted: account.details_submitted,
    })
    .eq("stripe_connect_account_id", account.id);

  if (error) {
    log("account.updated", "Failed to sync profile", { error });
  }

  return { processed: true };
}

/* ═══════════════════════════ MAIN ROUTER ═══════════════════════════ */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_UNIFIED_WEBHOOK_SECRET") || Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    log("MAIN", "ERROR: Missing Stripe configuration");
    return new Response(
      JSON.stringify({ error: "Stripe not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      log("MAIN", "ERROR: Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      log("MAIN", "Signature verification failed", { error: err instanceof Error ? err.message : "Unknown" });
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("MAIN", "Event received", { type: event.type, id: event.id });

    let result: Record<string, unknown> = { received: true };

    switch (event.type) {
      /* ── Money IN ── */
      case "payment_intent.succeeded":
        result = await handlePaymentIntentSucceeded(supabase, stripe, event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        result = await handlePaymentIntentFailed(supabase, event.data.object as Stripe.PaymentIntent);
        break;

      case "invoice.paid":
        result = await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        result = await handleInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;

      case "invoice.voided":
        result = await handleInvoiceVoided(supabase, event.data.object as Stripe.Invoice);
        break;

      case "charge.refunded":
        result = await handleChargeRefunded(supabase, event.data.object as Stripe.Charge);
        break;

      case "charge.dispute.created":
        result = await handleDisputeCreated(supabase, event.data.object as Stripe.Dispute);
        break;

      case "charge.dispute.closed":
        result = await handleDisputeClosed(supabase, event.data.object as Stripe.Dispute);
        break;

      /* ── Money OUT ── */
      case "transfer.created":
        result = await handleTransferCreated(supabase, event.data.object as Stripe.Transfer);
        break;

      case "transfer.failed":
        result = await handleTransferFailed(supabase, event.data.object as Stripe.Transfer, "Stripe transfer failed");
        break;

      case "transfer.reversed":
        result = await handleTransferFailed(supabase, event.data.object as Stripe.Transfer, "Stripe transfer was reversed");
        break;

      case "payout.paid":
        result = await handlePayoutPaid(supabase, event.data.object as Stripe.Payout);
        break;

      case "payout.failed":
        result = await handlePayoutFailed(supabase, event.data.object as Stripe.Payout);
        break;

      /* ── Connect ── */
      case "account.updated":
        result = await handleAccountUpdated(supabase, event.data.object as Stripe.Account);
        break;

      default:
        log("MAIN", "Unhandled event type", { type: event.type });
        break;
    }

    return new Response(
      JSON.stringify({ received: true, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    log("MAIN", "ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
