import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AvailabilityRequest {
  consultantSlug: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
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

    const { consultantSlug, startDate, endDate }: AvailabilityRequest = await req.json();

    if (!consultantSlug || !startDate || !endDate) {
      throw new Error("Missing required fields: consultantSlug, startDate, endDate");
    }

    // Get consultant profile
    const { data: consultant, error: consultantError } = await supabase
      .from("consultant_profiles")
      .select("*")
      .eq("booking_page_slug", consultantSlug)
      .eq("is_active", true)
      .single();

    if (consultantError || !consultant) {
      throw new Error("Consultant not found or inactive");
    }

    // Get recurring availability
    const { data: availability, error: availError } = await supabase
      .from("consultant_availability")
      .select("*")
      .eq("consultant_id", consultant.id)
      .eq("is_available", true);

    if (availError) {
      throw new Error("Failed to fetch availability");
    }

    // Get blocked times in date range
    const { data: blockedTimes, error: blockedError } = await supabase
      .from("consultant_blocked_times")
      .select("*")
      .eq("consultant_id", consultant.id)
      .gte("end_datetime", startDate)
      .lte("start_datetime", endDate);

    if (blockedError) {
      throw new Error("Failed to fetch blocked times");
    }

    // Get existing bookings in date range
    const { data: existingBookings, error: bookingsError } = await supabase
      .from("consultation_bookings")
      .select("*")
      .eq("consultant_id", consultant.id)
      .in("status", ["confirmed", "pending_payment"])
      .gte("end_time", startDate)
      .lte("start_time", endDate);

    if (bookingsError) {
      throw new Error("Failed to fetch existing bookings");
    }

    // Generate available slots
    const slots: TimeSlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const minAdvanceTime = new Date(now.getTime() + consultant.min_advance_hours * 60 * 60 * 1000);

    // Iterate through each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      
      // Find availability for this day
      const dayAvailability = availability?.filter(a => a.day_of_week === dayOfWeek) || [];

      for (const avail of dayAvailability) {
        // Parse start and end times
        const [startHour, startMin] = avail.start_time.split(":").map(Number);
        const [endHour, endMin] = avail.end_time.split(":").map(Number);

        // Generate 30-minute slots
        let slotStart = new Date(date);
        slotStart.setHours(startHour, startMin, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(endHour, endMin, 0, 0);

        while (slotStart < dayEnd) {
          const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
          
          // Check if slot is in the future (with min advance time)
          if (slotStart < minAdvanceTime) {
            slotStart = slotEnd;
            continue;
          }

          // Check if slot conflicts with blocked times
          const isBlocked = blockedTimes?.some(bt => {
            const blockStart = new Date(bt.start_datetime);
            const blockEnd = new Date(bt.end_datetime);
            return slotStart < blockEnd && slotEnd > blockStart;
          });

          // Check if slot conflicts with existing bookings (including buffer)
          const bufferMs = consultant.calendar_buffer_minutes * 60 * 1000;
          const isBooked = existingBookings?.some(booking => {
            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);
            const bufferedStart = new Date(bookingStart.getTime() - bufferMs);
            const bufferedEnd = new Date(bookingEnd.getTime() + bufferMs);
            return slotStart < bufferedEnd && slotEnd > bufferedStart;
          });

          if (!isBlocked && !isBooked) {
            slots.push({
              date: date.toISOString().split("T")[0],
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              available: true,
            });
          }

          slotStart = slotEnd;
        }
      }
    }

    return new Response(
      JSON.stringify({
        consultant: {
          id: consultant.id,
          displayName: consultant.display_name,
          title: consultant.title,
          bio: consultant.bio,
          avatarUrl: consultant.avatar_url,
          timezone: consultant.timezone,
          defaultRate30min: consultant.default_rate_30min,
          defaultRateHourly: consultant.default_rate_hourly,
          firstCallRate: consultant.first_call_rate,
          minBookingDuration: consultant.min_booking_duration,
          maxBookingDuration: consultant.max_booking_duration,
          ndaRequired: consultant.nda_required,
          ndaContent: consultant.nda_content,
        },
        slots,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Availability error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
