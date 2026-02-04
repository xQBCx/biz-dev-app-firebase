import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, Square, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";

export const ActivityLogger = ({ onActivityLogged }: { onActivityLogged?: () => void }) => {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();
  const [activityType, setActivityType] = useState<string>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(activeClientId);

  useEffect(() => {
    setSelectedClientId(activeClientId);
  }, [activeClientId]);

  useEffect(() => {
    const loadClients = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');
      if (data) setClients(data);
    };
    loadClients();
  }, [user]);

  const startTracking = () => {
    setStartTime(new Date());
    setIsTracking(true);
    toast.success("Activity tracking started");
  };

  const stopAndLog = async () => {
    if (!title.trim()) {
      toast.error("Please enter an activity title");
      return;
    }

    setIsSubmitting(true);
    const endTime = new Date();
    const durationMinutes = startTime 
      ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
      : null;

    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase.from('activity_logs').insert([{
        user_id: user.id,
        client_id: selectedClientId,
        activity_type: activityType as any,
        title: title.trim(),
        description: description.trim() || undefined,
        started_at: startTime?.toISOString() || new Date().toISOString(),
        ended_at: endTime.toISOString(),
        duration_minutes: durationMinutes || undefined,
      }]);

      if (error) throw error;

      toast.success(`Activity logged: ${title}`);
      
      // Reset form
      setTitle("");
      setDescription("");
      setIsTracking(false);
      setStartTime(null);
      onActivityLogged?.();
    } catch (error) {
      console.error('Error logging activity:', error);
      toast.error("Failed to log activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLog = async () => {
    if (!title.trim()) {
      toast.error("Please enter an activity title");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase.from('activity_logs').insert([{
        user_id: user.id,
        client_id: selectedClientId,
        activity_type: activityType as any,
        title: title.trim(),
        description: description.trim() || undefined,
        started_at: new Date().toISOString(),
      }]);

      if (error) throw error;

      toast.success(`Activity logged: ${title}`);
      
      // Reset form
      setTitle("");
      setDescription("");
      onActivityLogged?.();
    } catch (error) {
      console.error('Error logging activity:', error);
      toast.error("Failed to log activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Activity</CardTitle>
        <CardDescription>
          Track your work activities to generate AI-powered SOPs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {clients.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={selectedClientId || "none"} onValueChange={(v) => setSelectedClientId(v === "none" ? null : v)}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select client (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Personal Work</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="activity-type">Activity Type</Label>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger id="activity-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Phone Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="project_work">Project Work</SelectItem>
              <SelectItem value="document">Document Work</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity-title">Title</Label>
          <Input
            id="activity-title"
            placeholder="e.g., Client follow-up call"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity-description">Description (Optional)</Label>
          <Textarea
            id="activity-description"
            placeholder="Additional details about what you did..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          {!isTracking ? (
            <>
              <Button onClick={startTracking} className="flex-1 gap-2">
                <Play className="h-4 w-4" />
                Start & Track Time
              </Button>
              <Button onClick={quickLog} variant="outline" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Quick Log"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={stopAndLog} variant="destructive" className="flex-1 gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  Stop & Save
                </>
              )}
            </Button>
          )}
        </div>

        {isTracking && startTime && (
          <p className="text-sm text-muted-foreground text-center">
            Tracking since {startTime.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};