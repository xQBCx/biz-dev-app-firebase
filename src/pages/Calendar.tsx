import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoaderFullScreen } from "@/components/ui/loader";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";
import { CreateMeetingModal } from "@/components/CreateMeetingModal";

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);

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
          <Button onClick={() => setShowCreateMeeting(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>

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
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
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
