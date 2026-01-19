import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useXEvents, XEvent, XEventTicketType, XEventRegistration, XEventSession, XEventParticipant } from "@/hooks/useXEvents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Video,
  Users,
  Ticket,
  Settings,
  BarChart3,
  MessageSquare,
  Clock,
  Globe,
  Lock,
  UserCheck,
  Share2,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  Copy,
  QrCode
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", action: "Publish" },
  published: { label: "Published", color: "bg-primary/20 text-primary", action: "Go Live" },
  live: { label: "Live Now", color: "bg-emerald-500/20 text-emerald-600", action: "Complete" },
  completed: { label: "Completed", color: "bg-blue-500/20 text-blue-600", action: "Archive" },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive", action: null },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground", action: null },
};

const XEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getEvent, 
    updateEventStatus, 
    deleteEvent,
    getTicketTypes,
    getRegistrations,
    getSessions,
    getParticipants,
    updateRegistrationStatus,
    createTicketType
  } = useXEvents();
  
  const [event, setEvent] = useState<XEvent | null>(null);
  const [ticketTypes, setTicketTypes] = useState<XEventTicketType[]>([]);
  const [registrations, setRegistrations] = useState<XEventRegistration[]>([]);
  const [sessions, setSessions] = useState<XEventSession[]>([]);
  const [participants, setParticipants] = useState<XEventParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddTicketDialog, setShowAddTicketDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({ name: '', price: 0, quantity: '' });

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      const [eventData, tickets, regs, sess, parts] = await Promise.all([
        getEvent(id),
        getTicketTypes(id),
        getRegistrations(id),
        getSessions(id),
        getParticipants(id),
      ]);
      
      setEvent(eventData);
      setTicketTypes(tickets);
      setRegistrations(regs);
      setSessions(sess);
      setParticipants(parts);
    } catch (err) {
      console.error('Error loading event:', err);
      toast.error('Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!event) return;
    
    const nextStatus: Record<string, string> = {
      draft: 'published',
      published: 'live',
      live: 'completed',
      completed: 'archived',
    };
    
    const newStatus = nextStatus[event.status];
    if (!newStatus) return;
    
    const success = await updateEventStatus(event.id, newStatus as any);
    if (success) {
      setEvent({ ...event, status: newStatus as any });
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm('Are you sure you want to delete this event?')) return;
    
    const success = await deleteEvent(event.id);
    if (success) {
      navigate('/xevents');
    }
  };

  const handleCheckIn = async (registrationId: string) => {
    const success = await updateRegistrationStatus(registrationId, 'checked_in');
    if (success) {
      setRegistrations(regs => 
        regs.map(r => r.id === registrationId 
          ? { ...r, status: 'checked_in', checked_in_at: new Date().toISOString() } 
          : r
        )
      );
    }
  };

  const handleAddTicket = async () => {
    if (!event || !newTicket.name) return;
    
    const ticket = await createTicketType({
      event_id: event.id,
      name: newTicket.name,
      price_cents: newTicket.price * 100,
      quantity_total: newTicket.quantity ? parseInt(newTicket.quantity) : undefined,
    });
    
    if (ticket) {
      setTicketTypes([...ticketTypes, ticket]);
      setShowAddTicketDialog(false);
      setNewTicket({ name: '', price: 0, quantity: '' });
    }
  };

  const copyEventLink = () => {
    if (!event) return;
    const link = `${window.location.origin}/e/${event.slug}`;
    navigator.clipboard.writeText(link);
    toast.success('Event link copied!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg font-medium mb-4">Event not found</p>
          <Button onClick={() => navigate('/xevents')}>Back to Events</Button>
        </Card>
      </div>
    );
  }

  const isOrganizer = event.organizer_id === user?.id;
  const config = statusConfig[event.status];

  return (
    <div className="min-h-screen bg-gradient-depth">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/xevents')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold truncate">{event.name}</h1>
                <Badge className={config.color}>{config.label}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(event.start_date), 'MMM d, yyyy')}
                </span>
                {event.is_virtual ? (
                  <span className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    Virtual
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.venue_city || event.venue_name || 'Location TBD'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyEventLink} className="gap-1.5">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              
              {isOrganizer && config.action && (
                <Button size="sm" onClick={handleStatusChange} className="gap-1.5">
                  {config.action}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-1.5">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="registrations" className="gap-1.5">
              <Users className="w-4 h-4" />
              Registrations ({registrations.length})
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1.5">
              <Ticket className="w-4 h-4" />
              Tickets ({ticketTypes.length})
            </TabsTrigger>
            <TabsTrigger value="agenda" className="gap-1.5">
              <Clock className="w-4 h-4" />
              Agenda ({sessions.length})
            </TabsTrigger>
            {isOrganizer && (
              <TabsTrigger value="settings" className="gap-1.5">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="md:col-span-2 space-y-6">
                {/* Cover Image */}
                {event.cover_image_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={event.cover_image_url} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-3">About This Event</h2>
                  {event.tagline && (
                    <p className="text-primary font-medium mb-3">{event.tagline}</p>
                  )}
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description || 'No description provided.'}
                  </p>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{registrations.length}</p>
                    <p className="text-xs text-muted-foreground">Registered</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                    <p className="text-2xl font-bold">
                      {registrations.filter(r => r.status === 'checked_in').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Checked In</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Ticket className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{ticketTypes.length}</p>
                    <p className="text-xs text-muted-foreground">Ticket Types</p>
                  </Card>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Event Details Card */}
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold">Event Details</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(event.start_date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(event.start_date), 'h:mm a')} - {format(new Date(event.end_date), 'h:mm a')}
                        </p>
                        <p className="text-xs text-muted-foreground">{event.timezone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {event.is_virtual ? (
                        <>
                          <Video className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{event.virtual_platform || 'Virtual Event'}</p>
                            {event.virtual_meeting_url && (
                              <a 
                                href={event.virtual_meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                Join Meeting <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{event.venue_name || 'Venue TBD'}</p>
                            {event.venue_address && (
                              <p className="text-muted-foreground">{event.venue_address}</p>
                            )}
                            {event.venue_city && (
                              <p className="text-muted-foreground">
                                {event.venue_city}, {event.venue_state}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {event.visibility === 'public' ? (
                        <Globe className="w-4 h-4 text-muted-foreground" />
                      ) : event.visibility === 'private' ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">{event.visibility.replace('_', ' ')}</span>
                    </div>

                    {event.max_capacity && (
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.max_capacity} capacity</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Quick Actions */}
                {isOrganizer && (
                  <Card className="p-4 space-y-2">
                    <h3 className="font-semibold mb-3">Quick Actions</h3>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={copyEventLink}>
                      <Copy className="w-4 h-4" />
                      Copy Event Link
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <QrCode className="w-4 h-4" />
                      Generate QR Code
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Event
                    </Button>
                  </Card>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            <Card>
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Registrations</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {registrations.filter(r => r.status === 'confirmed').length} Confirmed
                  </Badge>
                  <Badge variant="outline">
                    {registrations.filter(r => r.status === 'checked_in').length} Checked In
                  </Badge>
                </div>
              </div>
              
              {registrations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No registrations yet
                </div>
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map(reg => {
                        const ticket = ticketTypes.find(t => t.id === reg.ticket_type_id);
                        return (
                          <TableRow key={reg.id}>
                            <TableCell className="font-medium">
                              {reg.first_name} {reg.last_name}
                              {reg.company && (
                                <span className="text-muted-foreground text-sm block">
                                  {reg.company}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{reg.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{ticket?.name || 'Unknown'}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                reg.status === 'checked_in' 
                                  ? 'bg-emerald-500/20 text-emerald-600'
                                  : reg.status === 'confirmed'
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-muted text-muted-foreground'
                              }>
                                {reg.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(reg.created_at), 'MMM d, h:mm a')}
                            </TableCell>
                            <TableCell>
                              {isOrganizer && reg.status !== 'checked_in' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCheckIn(reg.id)}
                                >
                                  Check In
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Ticket Types</h3>
                {isOrganizer && (
                  <Dialog open={showAddTicketDialog} onOpenChange={setShowAddTicketDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add Ticket
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Ticket Type</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Ticket Name</Label>
                          <Input
                            value={newTicket.name}
                            onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                            placeholder="VIP Access"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Price (USD)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={newTicket.price}
                              onChange={(e) => setNewTicket({ ...newTicket, price: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={newTicket.quantity}
                              onChange={(e) => setNewTicket({ ...newTicket, quantity: e.target.value })}
                              placeholder="Unlimited"
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddTicket} className="w-full">
                          Create Ticket Type
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              {ticketTypes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No ticket types configured
                </div>
              ) : (
                <div className="divide-y">
                  {ticketTypes.map(ticket => (
                    <div key={ticket.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ticket.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.is_free ? 'Free' : `$${(ticket.price_cents / 100).toFixed(2)}`}
                          {ticket.quantity_total && (
                            <span className="ml-2">
                              • {ticket.quantity_sold}/{ticket.quantity_total} sold
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant={ticket.is_available ? 'default' : 'secondary'}>
                        {ticket.is_available ? 'Available' : 'Sold Out'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Agenda Tab */}
          <TabsContent value="agenda">
            <Card>
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Event Agenda</h3>
                {isOrganizer && (
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add Session
                  </Button>
                )}
              </div>
              
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No sessions scheduled yet
                </div>
              ) : (
                <div className="divide-y">
                  {sessions.map(session => (
                    <div key={session.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                          </p>
                          {session.description && (
                            <p className="text-sm mt-1">{session.description}</p>
                          )}
                        </div>
                        {session.room_name && (
                          <Badge variant="outline">{session.room_name}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          {isOrganizer && (
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                  <div className="flex gap-4">
                    {event.status !== 'cancelled' && (
                      <Button 
                        variant="outline" 
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => updateEventStatus(event.id, 'cancelled')}
                      >
                        Cancel Event
                      </Button>
                    )}
                    <Button 
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default XEventDetail;
