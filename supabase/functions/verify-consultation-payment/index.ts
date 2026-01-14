import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateICS(data: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  organizerEmail: string;
  organizerName: string;
  attendeeEmail: string;
  attendeeName: string;
  meetingLink?: string;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@bdsrvs.com`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BDSRVS//Consultation Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(data.startTime)}
DTEND:${formatDate(data.endTime)}
SUMMARY:${data.title}
DESCRIPTION:${data.description}${data.meetingLink ? `\\n\\nJoin meeting: ${data.meetingLink}` : ''}
ORGANIZER;CN=${data.organizerName}:mailto:${data.organizerEmail}
ATTENDEE;CN=${data.attendeeName};RSVP=TRUE:mailto:${data.attendeeEmail}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
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

    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, status: session.payment_status }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const bookingId = session.metadata?.booking_id;
    if (!bookingId) {
      throw new Error("Booking ID not found in session metadata");
    }

    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from("consultation_bookings")
      .select(`
        *,
        consultant:consultant_profiles(*)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Skip if already confirmed
    if (booking.status === "confirmed") {
      return new Response(
        JSON.stringify({
          success: true,
          booking: {
            id: booking.id,
            startTime: booking.start_time,
            endTime: booking.end_time,
            meetingLink: booking.meeting_link,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate a meeting link (for now, we'll use a placeholder - Google Meet integration comes later)
    const meetingLink = `https://meet.google.com/new`; // Placeholder

    // Update booking to confirmed
    const { error: updateError } = await supabase
      .from("consultation_bookings")
      .update({
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        paid_at: new Date().toISOString(),
        meeting_link: meetingLink,
      })
      .eq("id", bookingId);

    if (updateError) {
      throw new Error("Failed to update booking status");
    }

    // Send confirmation emails
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      const startTime = new Date(booking.start_time);
      const endTime = new Date(booking.end_time);
      const consultant = booking.consultant;

      const icsContent = generateICS({
        title: `Consultation with ${consultant.display_name}`,
        description: `${booking.duration_minutes}-minute consultation\n\nNotes: ${booking.booking_notes || 'None'}`,
        startTime,
        endTime,
        organizerEmail: consultant.contact_email || 'bill@bdsrvs.com',
        organizerName: consultant.display_name,
        attendeeEmail: booking.booker_email,
        attendeeName: booking.booker_name,
        meetingLink,
      });

      const icsBuffer = new TextEncoder().encode(icsContent);
      const icsBase64 = btoa(String.fromCharCode(...icsBuffer));

      // Email to booker
      await resend.emails.send({
        from: "BDSRVS <noreply@bdsrvs.com>",
        to: booking.booker_email,
        subject: `Consultation Confirmed - ${startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
        html: `
          <h1>Your Consultation is Confirmed!</h1>
          <p>Hi ${booking.booker_name},</p>
          <p>Your consultation with ${consultant.display_name} has been confirmed.</p>
          <h2>Details:</h2>
          <ul>
            <li><strong>Date:</strong> ${startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</li>
            <li><strong>Time:</strong> ${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</li>
            <li><strong>Duration:</strong> ${booking.duration_minutes} minutes</li>
            <li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>
          </ul>
          ${booking.booking_notes ? `<p><strong>Your Notes:</strong> ${booking.booking_notes}</p>` : ''}
          <p>The calendar invite is attached to this email.</p>
          <p>Best regards,<br>BDSRVS</p>
        `,
        attachments: [
          {
            filename: "consultation.ics",
            content: icsBase64,
          },
        ],
      });

      // Email to consultant
      await resend.emails.send({
        from: "BDSRVS <noreply@bdsrvs.com>",
        to: consultant.contact_email || 'bill@bdsrvs.com',
        subject: `New Consultation Booked - ${booking.booker_name}`,
        html: `
          <h1>New Consultation Booked</h1>
          <p>A new consultation has been booked:</p>
          <h2>Client Details:</h2>
          <ul>
            <li><strong>Name:</strong> ${booking.booker_name}</li>
            <li><strong>Email:</strong> ${booking.booker_email}</li>
            ${booking.booker_company ? `<li><strong>Company:</strong> ${booking.booker_company}</li>` : ''}
            ${booking.booker_phone ? `<li><strong>Phone:</strong> ${booking.booker_phone}</li>` : ''}
          </ul>
          <h2>Booking Details:</h2>
          <ul>
            <li><strong>Date:</strong> ${startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</li>
            <li><strong>Time:</strong> ${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</li>
            <li><strong>Duration:</strong> ${booking.duration_minutes} minutes</li>
            <li><strong>Amount Paid:</strong> $${booking.amount_charged}</li>
            <li><strong>First-time Caller:</strong> ${booking.is_first_time_caller ? 'Yes' : 'No'}</li>
            ${booking.access_code_used ? `<li><strong>Access Code:</strong> ${booking.access_code_used}</li>` : ''}
          </ul>
          ${booking.booking_notes ? `<p><strong>Client Notes:</strong> ${booking.booking_notes}</p>` : ''}
          <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
        `,
        attachments: [
          {
            filename: "consultation.ics",
            content: icsBase64,
          },
        ],
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          startTime: booking.start_time,
          endTime: booking.end_time,
          meetingLink,
          consultantName: booking.consultant.display_name,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
