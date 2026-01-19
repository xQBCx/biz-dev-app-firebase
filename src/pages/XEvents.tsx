import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useXEvents, XEvent, XEventStatus } from "@/hooks/useXEvents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Users, 
  Calendar,
  MapPin,
  Video,
  Clock,
  LayoutList,
  BarChart3,
  Ticket,
  CalendarDays,
  Globe,
  Lock,
  UserCheck
} from "lucide-react";
import { format, isPast, isFuture, isToday } from "date-fns";

const statusConfig: Record<XEventStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  published: { label: "Published", color: "bg-primary/20 text-primary" },
  live: { label: "Live Now", color: "bg-emerald-500/20 text-emerald-600" },
  completed: { label: "Completed", color: "bg-blue-500/20 text-blue-600" },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive" },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground" },
};

const categoryLabels: Record<string, string> = {
  workshop: "Workshop",
  summit: "Summit",
  conference: "Conference",
  webinar: "Webinar",
  roundtable: "Roundtable",
  networking: "Networking",
  private_dinner: "Private Dinner",
  training: "Training",
  launch_event: "Launch Event",
  custom: "Custom Event",
};

const visibilityIcons: Record<string, typeof Globe> = {
  public: Globe,
  private: Lock,
  invite_only: UserCheck,
};

const XEventsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasRole } = useUserRole();
  const { events, isLoading } = useXEvents();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Filter events
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== "all" && event.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== "all" && event.category !== categoryFilter) return false;

    // Tab filter
    if (activeTab === "organizing") {
      return event.organizer_id === user?.id;
    } else if (activeTab === "attending") {
      return event.organizer_id !== user?.id;
    }

    return true;
  });

  // Group events
  const upcomingEvents = filteredEvents.filter(e => 
    isFuture(new Date(e.start_date)) && !['cancelled', 'archived'].includes(e.status)
  );
  const liveEvents = filteredEvents.filter(e => 
    e.status === 'live' || (isToday(new Date(e.start_date)) && e.status === 'published')
  );
  const pastEvents = filteredEvents.filter(e => 
    isPast(new Date(e.end_date)) || ['completed', 'archived'].includes(e.status)
  );

  const getEventTimeStatus = (event: XEvent) => {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    const now = new Date();

    if (event.status === 'live' || (now >= start && now <= end)) {
      return { label: "Live Now", color: "text-emerald-600" };
    }
    if (isFuture(start)) {
      const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil === 0) return { label: "Today", color: "text-primary" };
      if (daysUntil === 1) return { label: "Tomorrow", color: "text-primary" };
      return { label: `In ${daysUntil} days`, color: "text-muted-foreground" };
    }
    return { label: "Past", color: "text-muted-foreground" };
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex items-start gap-3">
            <CalendarDays className="w-8 h-8 sm:w-10 sm:h-10 text-foreground shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold">xEVENTSx</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Event-driven business formation and network activation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => navigate("/xevents/new")} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Video className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{liveEvents.length}</p>
                <p className="text-xs text-muted-foreground">Live Now</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + (e.registration_count || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Registrations</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pastEvents.length}</p>
                <p className="text-xs text-muted-foreground">Past Events</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="all" className="gap-1.5 text-sm">
                <LayoutList className="w-4 h-4" />
                <span>All Events</span>
              </TabsTrigger>
              <TabsTrigger value="organizing" className="gap-1.5 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Organizing</span>
              </TabsTrigger>
              <TabsTrigger value="attending" className="gap-1.5 text-sm">
                <Ticket className="w-4 h-4" />
                <span>Attending</span>
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event List */}
          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "organizing" 
                    ? "Create your first event to start building your network."
                    : "Discover events or get invited to participate."}
                </p>
                <Button onClick={() => navigate("/xevents/new")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Event
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredEvents.map(event => {
                  const timeStatus = getEventTimeStatus(event);
                  const VisibilityIcon = visibilityIcons[event.visibility] || Globe;
                  const isOrganizer = event.organizer_id === user?.id;

                  return (
                    <Card
                      key={event.id}
                      className="p-4 sm:p-6 hover:border-primary/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/xevents/${event.id}`)}
                    >
                      <div className="flex gap-4">
                        {/* Cover Image or Placeholder */}
                        <div className="hidden sm:block w-32 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                          {event.cover_image_url ? (
                            <img 
                              src={event.cover_image_url} 
                              alt={event.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <CalendarDays className="w-8 h-8 text-primary/40" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Title & Status */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                {event.name}
                              </h3>
                              {event.tagline && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {event.tagline}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-sm font-medium ${timeStatus.color}`}>
                                {timeStatus.label}
                              </span>
                              <Badge className={`text-xs ${statusConfig[event.status]?.color || ""}`}>
                                {statusConfig[event.status]?.label || event.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(event.start_date), "MMM d, yyyy")}
                              {!isToday(new Date(event.start_date)) && (
                                <span className="text-xs">
                                  at {format(new Date(event.start_date), "h:mm a")}
                                </span>
                              )}
                            </span>
                            
                            {event.is_virtual ? (
                              <span className="flex items-center gap-1.5">
                                <Video className="w-4 h-4" />
                                {event.virtual_platform || "Virtual"}
                              </span>
                            ) : event.venue_name ? (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {event.venue_city ? `${event.venue_name}, ${event.venue_city}` : event.venue_name}
                              </span>
                            ) : null}

                            <span className="flex items-center gap-1.5">
                              <VisibilityIcon className="w-4 h-4" />
                              {event.visibility === 'public' ? 'Public' : event.visibility === 'private' ? 'Private' : 'Invite Only'}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {event.registration_count || 0} registered
                              {event.max_capacity && (
                                <span className="text-xs">/ {event.max_capacity}</span>
                              )}
                            </span>
                          </div>

                          {/* Category & Tags */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[event.category] || event.category}
                            </Badge>
                            {isOrganizer && (
                              <Badge variant="secondary" className="text-xs">
                                Organizer
                              </Badge>
                            )}
                            {event.tags?.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs bg-muted/50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default XEventsPage;
