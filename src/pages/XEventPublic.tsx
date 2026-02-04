import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useXEvents, XEvent, XEventTicketType, XEventSession } from "@/hooks/useXEvents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Ticket, 
  Video,
  Globe,
  Share2,
  ChevronRight,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const XEventPublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug, getTicketTypes, getSessions, createRegistration } = useXEvents();
  
  const [event, setEvent] = useState<XEvent | null>(null);
  const [ticketTypes, setTicketTypes] = useState<XEventTicketType[]>([]);
  const [sessions, setSessions] = useState<XEventSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<XEventTicketType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    title: ""
  });

  useEffect(() => {
    const loadEvent = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      const eventData = await getEventBySlug(slug);
      
      if (eventData) {
        setEvent(eventData);
        const [tickets, eventSessions] = await Promise.all([
          getTicketTypes(eventData.id),
          getSessions(eventData.id)
        ]);
        setTicketTypes(tickets.filter(t => t.is_available && !t.hidden));
        setSessions(eventSessions);
      }
      
      setIsLoading(false);
    };
    
    loadEvent();
  }, [slug, getEventBySlug, getTicketTypes, getSessions]);

  const handleSelectTicket = (ticket: XEventTicketType) => {
    setSelectedTicket(ticket);
    setShowRegistration(true);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !selectedTicket) return;
    
    setIsSubmitting(true);
    
    const registration = await createRegistration({
      event_id: event.id,
      ticket_type_id: selectedTicket.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      title: formData.title || undefined
    });
    
    setIsSubmitting(false);
    
    if (registration) {
      setTicketCode(registration.ticket_code);
      setRegistrationComplete(true);
      toast.success("Registration successful!");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">This event may have ended or doesn't exist.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const eventDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const isPastEvent = new Date() > endDate;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-primary/20 to-primary/5"
        style={{
          backgroundImage: event.cover_image_url ? `url(${event.cover_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-start gap-4">
              {event.logo_url && (
                <img 
                  src={event.logo_url} 
                  alt={event.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-background shadow-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary" className="capitalize">
                    {event.category.replace('_', ' ')}
                  </Badge>
                  {event.is_virtual && (
                    <Badge variant="outline" className="gap-1">
                      <Video className="w-3 h-3" />
                      Virtual
                    </Badge>
                  )}
                  {isPastEvent && (
                    <Badge variant="destructive">Past Event</Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {event.name}
                </h1>
                {event.tagline && (
                  <p className="text-muted-foreground text-sm sm:text-base">{event.tagline}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <Card className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(eventDate, "h:mm a")} - {format(endDate, "h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {event.is_virtual ? (
                    <>
                      <Globe className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Virtual Event</p>
                        <p className="text-sm text-muted-foreground">
                          {event.virtual_platform || "Online"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{event.venue_name || "Venue TBA"}</p>
                        <p className="text-sm text-muted-foreground">
                          {[event.venue_city, event.venue_state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Description */}
            {event.description && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">About This Event</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              </Card>
            )}

            {/* Agenda */}
            {sessions.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Agenda
                </h2>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div 
                      key={session.id}
                      className={`p-4 rounded-lg border ${session.is_break ? 'bg-muted/50 border-dashed' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{session.title}</p>
                          {session.description && (
                            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                          )}
                          {session.room_name && (
                            <Badge variant="outline" className="mt-2">{session.room_name}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(parseISO(session.start_time), "h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Registration */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Tickets
                  </h2>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {!event.registration_open || isPastEvent ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Registration is currently closed</p>
                  </div>
                ) : ticketTypes.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No tickets available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ticketTypes.map((ticket) => {
                      const isSoldOut = ticket.quantity_total && 
                        (ticket.quantity_sold + ticket.quantity_reserved) >= ticket.quantity_total;
                      
                      return (
                        <div 
                          key={ticket.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            isSoldOut 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:border-primary cursor-pointer'
                          }`}
                          onClick={() => !isSoldOut && handleSelectTicket(ticket)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{ticket.name}</p>
                              {ticket.description && (
                                <p className="text-sm text-muted-foreground">{ticket.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              {isSoldOut ? (
                                <Badge variant="secondary">Sold Out</Badge>
                              ) : (
                                <>
                                  <p className="font-bold">
                                    {ticket.is_free ? "Free" : `$${(ticket.price_cents / 100).toFixed(2)}`}
                                  </p>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {event.max_capacity && (
                  <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event.max_capacity} spots available</span>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="sm:max-w-md">
          {registrationComplete ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <DialogHeader>
                <DialogTitle className="text-center">Registration Complete!</DialogTitle>
                <DialogDescription className="text-center">
                  Your ticket code is:
                </DialogDescription>
              </DialogHeader>
              <div className="my-6 p-4 bg-muted rounded-lg">
                <p className="text-2xl font-mono font-bold tracking-wider">{ticketCode}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                A confirmation email has been sent with your ticket details.
              </p>
              <Button onClick={() => setShowRegistration(false)} className="w-full">
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Register for {event?.name}</DialogTitle>
                <DialogDescription>
                  {selectedTicket?.name} - {selectedTicket?.is_free ? "Free" : `$${((selectedTicket?.price_cents || 0) / 100).toFixed(2)}`}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                </div>
                <Separator />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default XEventPublicPage;
