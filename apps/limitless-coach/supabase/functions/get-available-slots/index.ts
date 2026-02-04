// Get Available Time Slots Edge Function
// Calculates available booking slots based on business hours and existing bookings

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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { businessId, date } = await req.json();
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Check for date-specific override
    const { data: override } = await supabaseClient
      .from("availability_overrides")
      .select("*")
      .eq("business_id", businessId)
      .eq("specific_date", date)
      .maybeSingle();

    if (override && !override.is_available) {
      return new Response(
        JSON.stringify({ availableSlots: [], reason: override.reason || "Unavailable" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get weekly schedule
    const { data: schedule } = await supabaseClient
      .from("business_availability")
      .select("*")
      .eq("business_id", businessId)
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    if (!schedule || !schedule.is_available) {
      return new Response(
        JSON.stringify({ availableSlots: [], reason: "Not available on this day" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get existing bookings for this date
    const { data: existingBookings } = await supabaseClient
      .from("bookings")
      .select("preferred_time")
      .eq("business_id", businessId)
      .eq("preferred_date", date)
      .neq("status", "cancelled");

    const bookedTimes = new Set(existingBookings?.map((b) => b.preferred_time) || []);

    // Generate available slots
    const startTime = override?.start_time || schedule.start_time;
    const endTime = override?.end_time || schedule.end_time;

    const slots = [];
    let currentHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);

    while (currentHour < endHour) {
      const timeSlot = `${currentHour.toString().padStart(2, "0")}:00`;
      if (!bookedTimes.has(timeSlot)) {
        slots.push(timeSlot);
      }
      currentHour++;
    }

    return new Response(
      JSON.stringify({ availableSlots: slots }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error getting available slots:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});