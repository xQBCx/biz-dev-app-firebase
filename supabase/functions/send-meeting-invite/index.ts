import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeetingInviteRequest {
  activityId: string;
  subject: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  organizerEmail: string;
  organizerName: string;
  attendeeEmails: string[];
}

function generateICS(data: {
  subject: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  organizerEmail: string;
  organizerName: string;
  attendeeEmails: string[];
  uid: string;
}): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const attendees = data.attendeeEmails
    .map(email => `ATTENDEE;CN=${email};RSVP=TRUE:mailto:${email}`)
    .join('\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Biz Dev App//Meeting Invite//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${data.uid}
DTSTAMP:${formatDate(new Date().toISOString())}
DTSTART:${formatDate(data.startTime)}
DTEND:${formatDate(data.endTime)}
SUMMARY:${data.subject}
DESCRIPTION:${data.description}
LOCATION:${data.location}
ORGANIZER;CN=${data.organizerName}:mailto:${data.organizerEmail}
${attendees}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const meetingData: MeetingInviteRequest = await req.json();
    console.log('Sending meeting invite:', meetingData);

    // Generate unique UID for the meeting
    const uid = `${meetingData.activityId}@bizdevapp.com`;

    // Generate ICS file
    const icsContent = generateICS({
      subject: meetingData.subject,
      description: meetingData.description || '',
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      location: meetingData.location || meetingData.meetingLink || '',
      organizerEmail: meetingData.organizerEmail,
      organizerName: meetingData.organizerName,
      attendeeEmails: meetingData.attendeeEmails,
      uid,
    });

    const startDate = new Date(meetingData.startTime);
    const endDate = new Date(meetingData.endTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    };

    // Send email to each attendee
    for (const attendeeEmail of meetingData.attendeeEmails) {
      try {
        const emailResponse = await resend.emails.send({
          from: `${meetingData.organizerName} via Biz Dev App <onboarding@resend.dev>`,
          to: [attendeeEmail],
          subject: `Meeting Invitation: ${meetingData.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">You're Invited to a Meeting</h2>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #444;">${meetingData.subject}</h3>
                <p style="margin: 10px 0;"><strong>When:</strong> ${formatTime(startDate)}</p>
                <p style="margin: 10px 0;"><strong>Duration:</strong> ${Math.round((endDate.getTime() - startDate.getTime()) / 60000)} minutes</p>
                ${meetingData.location ? `<p style="margin: 10px 0;"><strong>Location:</strong> ${meetingData.location}</p>` : ''}
                ${meetingData.meetingLink ? `<p style="margin: 10px 0;"><strong>Join Link:</strong> <a href="${meetingData.meetingLink}" style="color: #0066cc;">${meetingData.meetingLink}</a></p>` : ''}
                ${meetingData.description ? `<p style="margin: 10px 0;"><strong>Description:</strong><br/>${meetingData.description}</p>` : ''}
              </div>

              <div style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                <p style="margin: 10px 0;"><strong>Organizer:</strong> ${meetingData.organizerName} (${meetingData.organizerEmail})</p>
                <p style="margin: 10px 0; color: #666; font-size: 14px;">
                  This meeting invitation has been sent to: ${meetingData.attendeeEmails.join(', ')}
                </p>
              </div>

              <p style="margin-top: 20px; color: #888; font-size: 12px;">
                The calendar invite (.ics file) is attached to this email. Click on it to add this meeting to your calendar.
              </p>
            </div>
          `,
          attachments: [
            {
              filename: 'meeting-invite.ics',
              content: btoa(icsContent),
            },
          ],
        });

        console.log(`Email sent to ${attendeeEmail}:`, emailResponse);
      } catch (emailError) {
        console.error(`Failed to send email to ${attendeeEmail}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Meeting invites sent successfully',
        sentTo: meetingData.attendeeEmails 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-meeting-invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
