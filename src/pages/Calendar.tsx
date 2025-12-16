import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useInstincts } from "@/hooks/useInstincts";
import { LoaderFullScreen } from "@/components/ui/loader";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, Settings } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format, isSameDay, startOfDay, setHours } from "date-fns";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Activity {
  id: string;
  subject: string;
  description: string | null;
  activity_type: string;
  status: string;
  priority: string;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  meeting_link: string | null;
  attendee_emails: string[] | null;
  created_at: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const { trackEntityCreated } = useInstincts();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "day">("month");

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('user_id', user.id)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error("Failed to load calendar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => 
      activity.due_date && isSameDay(new Date(activity.due_date), date)
    );
  };

  const selectedDateActivities = getActivitiesForDate(selectedDate);

  const datesWithActivities = activities
    .filter(a => a.due_date)
    .map(a => new Date(a.due_date!));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getActivityForHour = (hour: number) => {
    return activities.filter(activity => {
      if (!activity.start_time || !isSameDay(new Date(activity.start_time), selectedDate)) return false;
      const activityHour = new Date(activity.start_time).getHours();
      return activityHour === hour;
    });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (isLoading) {
    return <LoaderFullScreen />;
  }

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              View all your tasks, activities, and deadlines
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/scheduling-settings">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Link>
            </Button>
            <Button onClick={() => setShowCreateMeeting(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "day")}>
          <TabsList>
            <TabsTrigger value="month">Month View</TabsTrigger>
            <TabsTrigger value="day">Day View</TabsTrigger>
          </TabsList>

          <TabsContent value="month" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>
                    Select a date to view activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setViewMode("day");
                      }
                    }}
                    className="rounded-md border scale-125"
                    modifiers={{
                      hasActivity: datesWithActivities
                    }}
                    modifiersStyles={{
                      hasActivity: {
                        fontWeight: 'bold',
                        textDecoration: 'underline'
                      }
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateActivities.length} {selectedDateActivities.length === 1 ? 'activity' : 'activities'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDateActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No activities scheduled for this date
                    </p>
                  ) : (
                    selectedDateActivities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{activity.subject}</h4>
                          <Badge variant={getPriorityColor(activity.priority)} className="text-xs">
                            {activity.priority}
                          </Badge>
                        </div>
                        {activity.start_time && activity.end_time && (
                          <p className="text-sm font-medium text-muted-foreground">
                            {format(new Date(activity.start_time), "h:mm a")} - {format(new Date(activity.end_time), "h:mm a")}
                          </p>
                        )}
                        {activity.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        {activity.location && (
                          <p className="text-xs text-muted-foreground">📍 {activity.location}</p>
                        )}
                        {activity.meeting_link && (
                          <a 
                            href={activity.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            🔗 Join Meeting
                          </a>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {activity.activity_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {activity.status}
                          </Badge>
                          {activity.attendee_emails && activity.attendee_emails.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {activity.attendee_emails.length} attendee{activity.attendee_emails.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="day" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                    <CardDescription>
                      Hour by hour schedule
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setViewMode("month")}>
                    Back to Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-1">
                    {hours.map((hour) => {
                      const hourActivities = getActivityForHour(hour);
                      const hasActivities = hourActivities.length > 0;
                      
                      return (
                        <div 
                          key={hour} 
                          className={`flex gap-4 p-3 rounded-lg border ${hasActivities ? 'bg-accent/50' : ''}`}
                        >
                          <div className="w-24 text-sm font-medium text-muted-foreground shrink-0">
                            {format(setHours(new Date(), hour), "h:mm a")}
                          </div>
                          <div className="flex-1 space-y-2">
                            {hasActivities ? (
                              hourActivities.map((activity) => (
                                <div key={activity.id} className="bg-card border rounded-lg p-3 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold">{activity.subject}</h4>
                                    <Badge variant={getPriorityColor(activity.priority)} className="text-xs shrink-0">
                                      {activity.priority}
                                    </Badge>
                                  </div>
                                  {activity.start_time && activity.end_time && (
                                    <p className="text-sm font-medium text-primary">
                                      {format(new Date(activity.start_time), "h:mm a")} - {format(new Date(activity.end_time), "h:mm a")}
                                    </p>
                                  )}
                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {activity.description}
                                    </p>
                                  )}
                                  {activity.location && (
                                    <p className="text-sm text-muted-foreground">📍 {activity.location}</p>
                                  )}
                                  {activity.meeting_link && (
                                    <a 
                                      href={activity.meeting_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline inline-block"
                                    >
                                      🔗 Join Meeting
                                    </a>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {activity.activity_type}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {activity.status}
                                    </Badge>
                                    {activity.attendee_emails && activity.attendee_emails.length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {activity.attendee_emails.length} attendee{activity.attendee_emails.length !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground">-</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Activities</CardTitle>
          <CardDescription>Next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities
              .filter(a => {
                if (!a.due_date) return false;
                const dueDate = new Date(a.due_date);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return dueDate >= new Date() && dueDate <= weekFromNow;
              })
              .slice(0, 10)
              .map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.due_date && format(new Date(activity.due_date), "EEEE, MMMM d")}
                      {activity.start_time && ` at ${format(new Date(activity.start_time), "h:mm a")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(activity.priority)}>
                      {activity.priority}
                    </Badge>
                    <Badge variant="outline">
                      {activity.activity_type}
                    </Badge>
                  </div>
                </div>
              ))}
            {activities.filter(a => {
              if (!a.due_date) return false;
              const dueDate = new Date(a.due_date);
              const weekFromNow = new Date();
              weekFromNow.setDate(weekFromNow.getDate() + 7);
              return dueDate >= new Date() && dueDate <= weekFromNow;
            }).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming activities in the next 7 days
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      <CreateMeetingModal 
        open={showCreateMeeting} 
        onOpenChange={setShowCreateMeeting}
        onSuccess={fetchActivities}
      />
    </>
  );
}
