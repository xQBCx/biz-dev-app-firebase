import { format } from "date-fns";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScheduledSessions } from "@/hooks/useBooking";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ScheduledSessionsListProps {
  userId: string;
  userRole: "client" | "photographer";
}

export function ScheduledSessionsList({ userId, userRole }: ScheduledSessionsListProps) {
  const { data: sessions = [], isLoading } = useScheduledSessions(userId);
  const queryClient = useQueryClient();

  const updateSessionStatus = useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: string; status: string }) => {
      const updates: any = { status };
      
      if (status === "active") {
        updates.started_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-sessions"] });
      toast.success("Session updated");
    },
  });

  const cancelSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("sessions")
        .update({ status: "cancelled" })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-sessions"] });
      toast.success("Session cancelled");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No upcoming scheduled sessions</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session: any) => {
        const otherPerson = userRole === "client" ? session.photographer : session.client;
        const scheduledDate = new Date(session.scheduled_at);
        const isToday = scheduledDate.toDateString() === new Date().toDateString();
        const isPast = scheduledDate < new Date();

        return (
          <Card key={session.id} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">
                  {otherPerson?.full_name?.[0] || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold">{otherPerson?.full_name || "User"}</p>
                  {isToday && <Badge variant="default">Today</Badge>}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(scheduledDate, "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{format(scheduledDate, "p")}</span>
                  </div>
                  {session.location_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{session.location_name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">${session.hourly_rate}/hr</p>
                {session.editing_requested && (
                  <p className="text-xs text-muted-foreground">+ ${session.editing_fee} editing</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {userRole === "photographer" && !isPast && (
                <Button
                  size="sm"
                  onClick={() => updateSessionStatus.mutate({ sessionId: session.id, status: "active" })}
                  disabled={updateSessionStatus.isPending}
                  className="flex-1"
                >
                  Start Now
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => cancelSession.mutate(session.id)}
                disabled={cancelSession.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
