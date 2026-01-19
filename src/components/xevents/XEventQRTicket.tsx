import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { XEventRegistration, XEvent } from "@/hooks/useXEvents";
import { Download, Share2, Calendar, MapPin, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

interface XEventQRTicketProps {
  registration: XEventRegistration;
  event: XEvent;
  ticketName?: string;
}

// Simple QR code generator using a canvas
const generateQRCodeUrl = (data: string): string => {
  // Using a public QR code API for simplicity
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

export const XEventQRTicket = ({ registration, event, ticketName }: XEventQRTicketProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  
  const qrData = JSON.stringify({
    code: registration.ticket_code,
    event_id: event.id,
    reg_id: registration.id
  });
  
  const qrUrl = generateQRCodeUrl(registration.ticket_code);
  const eventDate = parseISO(event.start_date);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/e/${event.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: `My ticket for ${event.name}`,
        text: `I'm attending ${event.name}! Ticket: ${registration.ticket_code}`,
        url: shareUrl
      });
    } else {
      await navigator.clipboard.writeText(`Ticket: ${registration.ticket_code} - ${shareUrl}`);
      toast.success("Ticket info copied to clipboard!");
    }
  };

  const handleDownload = () => {
    // Create a simple downloadable ticket image
    const ticketData = `
${event.name}
${format(eventDate, "MMMM d, yyyy h:mm a")}
${event.is_virtual ? "Virtual Event" : event.venue_name || "TBA"}

Ticket: ${registration.ticket_code}
${registration.first_name} ${registration.last_name}
${registration.email}
    `.trim();
    
    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${registration.ticket_code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Ticket downloaded!");
  };

  return (
    <Card ref={ticketRef} className="overflow-hidden max-w-sm mx-auto">
      {/* Header with event branding */}
      <div 
        className="p-6 text-center"
        style={{ 
          background: `linear-gradient(135deg, ${event.primary_color || '#000'}, ${event.accent_color || '#333'})`
        }}
      >
        {event.logo_url && (
          <img 
            src={event.logo_url} 
            alt={event.name}
            className="w-16 h-16 mx-auto rounded-lg mb-3 object-cover"
          />
        )}
        <h2 className="text-xl font-bold text-white">{event.name}</h2>
        {ticketName && (
          <Badge variant="secondary" className="mt-2">{ticketName}</Badge>
        )}
      </div>

      {/* QR Code Section */}
      <div className="p-6 text-center bg-background">
        <div className="bg-white p-4 rounded-lg inline-block mb-4">
          <img 
            src={qrUrl} 
            alt="Ticket QR Code"
            className="w-48 h-48"
          />
        </div>
        <p className="font-mono text-2xl font-bold tracking-wider mb-1">
          {registration.ticket_code}
        </p>
        <p className="text-sm text-muted-foreground">
          Present this code at check-in
        </p>
      </div>

      <Separator />

      {/* Attendee Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Attendee</p>
          <p className="font-medium">{registration.first_name} {registration.last_name}</p>
        </div>
        
        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm">{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
            <p className="text-sm text-muted-foreground">{format(eventDate, "h:mm a")}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          {event.is_virtual ? (
            <>
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">Virtual Event</p>
                <p className="text-sm text-muted-foreground">{event.virtual_platform || "Online"}</p>
              </div>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">{event.venue_name || "Venue TBA"}</p>
                {event.venue_city && (
                  <p className="text-sm text-muted-foreground">
                    {[event.venue_city, event.venue_state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="p-4 flex gap-2">
        <Button variant="outline" className="flex-1 gap-2" onClick={handleDownload}>
          <Download className="w-4 h-4" />
          Save
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </Card>
  );
};

export default XEventQRTicket;
