import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  consultantSlug: string;
  bookerEmail: string;
  bookerName: string;
  bookerCompany?: string;
  bookerPhone?: string;
  startTime: string;
  durationMinutes: number;
  accessCode?: string;
  bookingNotes?: string;
  ndaAccepted: boolean;
  timezone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      consultantSlug,
      bookerEmail,
      bookerName,
      bookerCompany,
      bookerPhone,
      startTime,
      durationMinutes,
      accessCode,
      bookingNotes,
      ndaAccepted,
      timezone,
    }: CheckoutRequest = await req.json();

    // Validate required fields
    if (!consultantSlug || !bookerEmail || !bookerName || !startTime || !durationMinutes) {
      throw new Error("Missing required fields");
    }

    // Get consultant profile
    const { data: consultant, error: consultantError } = await supabase
      .from("consultant_profiles")
      .select("*")
      .eq("booking_page_slug", consultantSlug)
      .eq("is_active", true)
      .single();

    if (consultantError || !consultant) {
      throw new Error("Consultant not found");
    }

    // Check NDA requirement
    if (consultant.nda_required && !ndaAccepted) {
      throw new Error("NDA acceptance is required to book this consultation");
    }

    // Calculate end time
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    // Check for first-time caller
    const { count: previousBookings } = await supabase
      .from("consultation_bookings")
      .select("*", { count: "exact", head: true })
      .eq("consultant_id", consultant.id)
      .eq("booker_email", bookerEmail)
      .in("status", ["confirmed", "completed"]);

    const isFirstTimeCaller = (previousBookings || 0) === 0;

    // Check for custom client rate
    const { data: clientRate } = await supabase
      .from("consultant_client_rates")
      .select("*")
      .eq("consultant_id", consultant.id)
      .eq("client_email", bookerEmail)
      .eq("is_active", true)
      .single();

    // Calculate base price
    let originalAmount: number;
    if (clientRate) {
      // Use custom client rate
      if (durationMinutes <= 30 && clientRate.custom_rate_30min) {
        originalAmount = Number(clientRate.custom_rate_30min);
      } else if (clientRate.custom_rate_hourly) {
        originalAmount = (Number(clientRate.custom_rate_hourly) / 60) * durationMinutes;
      } else {
        originalAmount = (Number(consultant.default_rate_hourly) / 60) * durationMinutes;
      }
    } else if (isFirstTimeCaller && durationMinutes <= 30) {
      // First-time caller rate for 30 min
      originalAmount = Number(consultant.first_call_rate);
    } else if (durationMinutes <= 30) {
      originalAmount = Number(consultant.default_rate_30min);
    } else {
      // Hourly rate for longer durations
      originalAmount = (Number(consultant.default_rate_hourly) / 60) * durationMinutes;
    }

    // Apply access code discount if provided
    let discountAmount = 0;
    let validatedAccessCode: string | null = null;

    if (accessCode) {
      const { data: codeData, error: codeError } = await supabase
        .from("booking_access_codes")
        .select("*")
        .eq("consultant_id", consultant.id)
        .eq("code", accessCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (codeError || !codeData) {
        throw new Error("Invalid access code");
      }

      // Check if code is valid
      const now = new Date();
      if (codeData.valid_from && new Date(codeData.valid_from) > now) {
        throw new Error("Access code is not yet valid");
      }
      if (codeData.valid_until && new Date(codeData.valid_until) < now) {
        throw new Error("Access code has expired");
      }
      if (codeData.max_uses && codeData.uses_count >= codeData.max_uses) {
        throw new Error("Access code has reached maximum uses");
      }
      if (codeData.assigned_email && codeData.assigned_email.toLowerCase() !== bookerEmail.toLowerCase()) {
        throw new Error("Access code is not valid for this email");
      }

      validatedAccessCode = accessCode.toUpperCase();

      // Calculate discount
      if (codeData.discount_type === "free") {
        discountAmount = originalAmount;
      } else if (codeData.discount_type === "percentage") {
        discountAmount = (originalAmount * Number(codeData.discount_value)) / 100;
      } else if (codeData.discount_type === "fixed") {
        discountAmount = Math.min(Number(codeData.discount_value), originalAmount);
      }

      // Increment uses count
      await supabase
        .from("booking_access_codes")
        .update({ uses_count: codeData.uses_count + 1 })
        .eq("id", codeData.id);
    }

    const amountCharged = Math.max(0, originalAmount - discountAmount);

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from("consultation_bookings")
      .insert({
        consultant_id: consultant.id,
        booker_email: bookerEmail,
        booker_name: bookerName,
        booker_company: bookerCompany,
        booker_phone: bookerPhone,
        duration_minutes: durationMinutes,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        timezone: timezone,
        status: amountCharged > 0 ? "pending_payment" : "confirmed",
        original_amount: originalAmount,
        discount_amount: discountAmount,
        amount_charged: amountCharged,
        access_code_used: validatedAccessCode,
        is_first_time_caller: isFirstTimeCaller,
        nda_accepted_at: ndaAccepted ? new Date().toISOString() : null,
        booking_notes: bookingNotes,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Booking creation error:", bookingError);
      throw new Error("Failed to create booking");
    }

    // If free (after discount), return success without payment
    if (amountCharged === 0) {
      // TODO: Send confirmation email and create meeting link
      return new Response(
        JSON.stringify({
          success: true,
          bookingId: booking.id,
          status: "confirmed",
          message: "Booking confirmed! Check your email for details.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: bookerEmail, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : bookerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Consultation with ${consultant.display_name}`,
              description: `${durationMinutes}-minute ${isFirstTimeCaller ? "introductory " : ""}consultation`,
            },
            unit_amount: Math.round(amountCharged * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/book/${consultantSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/book/${consultantSlug}?cancelled=true`,
      metadata: {
        booking_id: booking.id,
        consultant_id: consultant.id,
        booker_email: bookerEmail,
        start_time: startDateTime.toISOString(),
        duration_minutes: String(durationMinutes),
      },
    });

    // Update booking with Stripe session ID
    await supabase
      .from("consultation_bookings")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        checkoutUrl: session.url,
        originalAmount,
        discountAmount,
        amountCharged,
        isFirstTimeCaller,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
