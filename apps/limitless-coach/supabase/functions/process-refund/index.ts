// Stripe Refund Processing Edge Function
// This function will be activated once Stripe API keys are configured

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { bookingId } = await req.json();

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*, businesses!inner(*)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Calculate refund based on cancellation policy
    const now = new Date();
    const appointmentDate = new Date(booking.preferred_date);
    const hoursUntilAppt = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercent = 0;
    const cancellationHours = booking.cancellation_hours || 24;
    const cancellationRefundPercent = booking.cancellation_refund_percent || 100;
    const partialHours = booking.cancellation_partial_hours || 24;
    const partialRefundPercent = booking.cancellation_partial_refund_percent || 50;

    if (hoursUntilAppt >= cancellationHours) {
      refundPercent = cancellationRefundPercent;
    } else if (hoursUntilAppt >= partialHours) {
      refundPercent = partialRefundPercent;
    }

    const refundAmount = (booking.payment_amount || 0) * (refundPercent / 100);

    // TODO: Process refund through Stripe when configured
    // const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
    // const refund = await stripe.refunds.create({
    //   payment_intent: booking.payment_intent_id,
    //   amount: Math.round(refundAmount * 100),
    // });

    // Update booking
    await supabaseClient
      .from("bookings")
      .update({
        status: "cancelled",
        refund_status: "pending",
        refund_amount: refundAmount,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    // Create transaction record
    await supabaseClient.from("transactions").insert({
      booking_id: bookingId,
      partner_business_id: booking.business_id,
      amount: refundAmount,
      transaction_type: "refund",
      status: "pending",
      net_amount: refundAmount,
    });

    console.log(`Refund calculated: ${refundPercent}% = $${refundAmount}`);

    return new Response(
      JSON.stringify({
        message: "Stripe not configured. Refund calculated but not processed.",
        refundPercent,
        refundAmount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});