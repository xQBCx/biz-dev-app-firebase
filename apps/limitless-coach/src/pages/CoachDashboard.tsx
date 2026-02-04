import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, DollarSign, Users, Settings, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

type CoachSession = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  session_date: string;
  session_time: string;
  duration_minutes: number | null;
  status: string;
  price: number;
  notes: string | null;
  session_type: string | null;
  payment_status: string | null;
};

type CoachAvailability = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export default function CoachDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [coachProfile, setCoachProfile] = useState<{ id: string; full_name: string } | null>(null);

  // Check if user is a coach
  useEffect(() => {
    const checkCoachAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ title: "Please log in", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { data: coach, error } = await supabase
        .from("coach_profiles")
        .select("id, full_name")
        .eq("user_id", session.user.id)
        .eq("status", "approved")
        .maybeSingle();

      if (error || !coach) {
        toast({ 
          title: "Access Denied", 
          description: "You must be an approved coach to access this dashboard",
          variant: "destructive" 
        });
        navigate("/");
        return;
      }

      setCoachProfile(coach);
      setLoading(false);
    };

    checkCoachAccess();
  }, [navigate, toast]);

  // Fetch sessions
  const { data: sessions } = useQuery({
    queryKey: ["coach-sessions", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("coach_sessions")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("session_date", { ascending: true });

      if (error) throw error;
      return data as CoachSession[];
    },
    enabled: !!coachProfile,
  });

  // Fetch availability
  const { data: availability } = useQuery({
    queryKey: ["coach-availability", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("coach_availability")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("day_of_week");

      if (error) throw error;
      return data as CoachAvailability[];
    },
    enabled: !!coachProfile,
  });

  // Update session status
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("coach_sessions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-sessions"] });
      toast({ title: "Session updated" });
    },
  });

  // Save availability
  const saveAvailabilityMutation = useMutation({
    mutationFn: async (slot: Partial<CoachAvailability> & { day_of_week: number }) => {
      if (!coachProfile) return;
      
      const existingSlot = availability?.find(a => a.day_of_week === slot.day_of_week);
      
      if (existingSlot) {
        const { error } = await supabase
          .from("coach_availability")
          .update({
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: slot.is_available,
          })
          .eq("id", existingSlot.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("coach_availability")
          .insert({
            coach_id: coachProfile.id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time || "09:00",
            end_time: slot.end_time || "17:00",
            is_available: slot.is_available ?? true,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-availability"] });
      toast({ title: "Availability saved" });
    },
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const pendingSessions = sessions?.filter(s => s.status === "pending") || [];
  const confirmedSessions = sessions?.filter(s => s.status === "confirmed") || [];
  const completedSessions = sessions?.filter(s => s.status === "completed") || [];
  const totalEarnings = completedSessions.reduce((sum, s) => sum + s.price * 0.95, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "confirmed": return <Badge className="bg-blue-500">Confirmed</Badge>;
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getAvailabilityForDay = (day: number) => {
    return availability?.find(a => a.day_of_week === day) || {
      day_of_week: day,
      start_time: "09:00",
      end_time: "17:00",
      is_available: false,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Coach Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {coachProfile?.full_name}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSessions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedSessions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">After 5% platform fee</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            {pendingSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Requests</CardTitle>
                  <CardDescription>Review and confirm session requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{session.client_name}</div>
                              <div className="text-sm text-muted-foreground">{session.client_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(session.session_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{session.session_time}</TableCell>
                          <TableCell className="capitalize">{session.session_type || "In-person"}</TableCell>
                          <TableCell>${session.price}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateSessionMutation.mutate({ id: session.id, status: "confirmed" })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateSessionMutation.mutate({ id: session.id, status: "cancelled" })}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No sessions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessions?.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{session.client_name}</div>
                              <div className="text-sm text-muted-foreground">{session.client_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(session.session_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{session.session_time}</TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                          <TableCell>${session.price}</TableCell>
                          <TableCell className="text-right">
                            {session.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateSessionMutation.mutate({ id: session.id, status: "completed" })}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Weekly Availability
                </CardTitle>
                <CardDescription>Set your available hours for each day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day, index) => {
                    const dayAvailability = getAvailabilityForDay(index);
                    return (
                      <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-28">
                          <Label className="font-medium">{day}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={dayAvailability.is_available}
                            onCheckedChange={(checked) => 
                              saveAvailabilityMutation.mutate({
                                ...dayAvailability,
                                is_available: checked,
                              })
                            }
                          />
                          <Label className="text-sm text-muted-foreground">
                            {dayAvailability.is_available ? "Available" : "Unavailable"}
                          </Label>
                        </div>
                        {dayAvailability.is_available && (
                          <>
                            <Select
                              value={dayAvailability.start_time?.slice(0, 5) || "09:00"}
                              onValueChange={(value) =>
                                saveAvailabilityMutation.mutate({
                                  ...dayAvailability,
                                  start_time: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_SLOTS.map((time) => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-muted-foreground">to</span>
                            <Select
                              value={dayAvailability.end_time?.slice(0, 5) || "17:00"}
                              onValueChange={(value) =>
                                saveAvailabilityMutation.mutate({
                                  ...dayAvailability,
                                  end_time: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_SLOTS.map((time) => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
