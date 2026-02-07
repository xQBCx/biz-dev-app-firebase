import { useEffect, useState } from "react";
import { supabase } from "packages/supabase-client/src/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Clock, Calendar as CalendarIcon } from "lucide-react";

type WeeklySchedule = {
  [key: number]: {
    is_available: boolean;
    start_time: string;
    end_time: string;
  };
};

type Override = {
  id: string;
  specific_date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PartnerAvailability() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    is_available: false,
    start_time: "09:00",
    end_time: "17:00",
    reason: "",
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", user.id)
        .single();

      if (!membership) return;
      setBusinessId(membership.business_id);

      // Load weekly schedule
      const { data: scheduleData } = await supabase
        .from("business_availability")
        .select("*")
        .eq("business_id", membership.business_id);

      const scheduleMap: WeeklySchedule = {};
      if (scheduleData) {
        scheduleData.forEach((item) => {
          scheduleMap[item.day_of_week] = {
            is_available: item.is_available,
            start_time: item.start_time,
            end_time: item.end_time,
          };
        });
      }

      // Initialize missing days with defaults
      for (let i = 0; i < 7; i++) {
        if (!scheduleMap[i]) {
          scheduleMap[i] = {
            is_available: i >= 1 && i <= 5, // Mon-Fri default
            start_time: "09:00",
            end_time: "17:00",
          };
        }
      }

      setSchedule(scheduleMap);

      // Load overrides
      const { data: overridesData } = await supabase
        .from("availability_overrides")
        .select("*")
        .eq("business_id", membership.business_id)
        .order("specific_date", { ascending: true });

      setOverrides(overridesData || []);
    } catch (error) {
      console.error("Error loading availability:", error);
      toast({
        title: "Error",
        description: "Failed to load availability settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWeeklySchedule = async () => {
    if (!businessId) return;
    setSaving(true);

    try {
      // Delete existing schedule
      await supabase
        .from("business_availability")
        .delete()
        .eq("business_id", businessId);

      // Insert new schedule
      const scheduleArray = Object.entries(schedule).map(([day, config]) => ({
        business_id: businessId,
        day_of_week: parseInt(day),
        ...config,
      }));

      const { error } = await supabase
        .from("business_availability")
        .insert(scheduleArray);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Weekly schedule saved",
      });
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addOverride = async () => {
    if (!businessId || !selectedDate) return;

    try {
      const dateString = selectedDate.toISOString().split("T")[0];
      
      const { error } = await supabase
        .from("availability_overrides")
        .upsert({
          business_id: businessId,
          specific_date: dateString,
          ...overrideForm,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Date override saved",
      });

      setOverrideDialogOpen(false);
      loadAvailability();
    } catch (error) {
      console.error("Error saving override:", error);
      toast({
        title: "Error",
        description: "Failed to save date override",
        variant: "destructive",
      });
    }
  };

  const deleteOverride = async (id: string) => {
    try {
      const { error } = await supabase
        .from("availability_overrides")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Override deleted",
      });

      loadAvailability();
    } catch (error) {
      console.error("Error deleting override:", error);
      toast({
        title: "Error",
        description: "Failed to delete override",
        variant: "destructive",
      });
    }
  };

  const applyToAllDays = () => {
    const template = schedule[1]; // Use Monday as template
    const newSchedule: WeeklySchedule = {};
    for (let i = 0; i < 7; i++) {
      newSchedule[i] = { ...template };
    }
    setSchedule(newSchedule);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
        <p className="text-muted-foreground">
          Manage your business hours and special dates
        </p>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>Set your default operating hours</CardDescription>
            </div>
            <Button onClick={applyToAllDays} variant="outline" size="sm">
              Apply Monday to All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((day, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-32 font-medium">{day}</div>
              <Switch
                checked={schedule[index]?.is_available}
                onCheckedChange={(checked) =>
                  setSchedule({
                    ...schedule,
                    [index]: { ...schedule[index], is_available: checked },
                  })
                }
              />
              {schedule[index]?.is_available && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={schedule[index]?.start_time}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        [index]: { ...schedule[index], start_time: e.target.value },
                      })
                    }
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={schedule[index]?.end_time}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        [index]: { ...schedule[index], end_time: e.target.value },
                      })
                    }
                    className="w-32"
                  />
                </div>
              )}
              {!schedule[index]?.is_available && (
                <span className="text-muted-foreground">Unavailable</span>
              )}
            </div>
          ))}
          <Button onClick={saveWeeklySchedule} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Weekly Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Date Overrides */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Date Overrides
              </CardTitle>
              <CardDescription>
                Block off specific dates or set custom hours
              </CardDescription>
            </div>
            <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Override</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Date Override</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={overrideForm.is_available}
                        onCheckedChange={(checked) =>
                          setOverrideForm({ ...overrideForm, is_available: checked })
                        }
                      />
                      <Label>Available on this date</Label>
                    </div>
                    {overrideForm.is_available && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={overrideForm.start_time}
                          onChange={(e) =>
                            setOverrideForm({ ...overrideForm, start_time: e.target.value })
                          }
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={overrideForm.end_time}
                          onChange={(e) =>
                            setOverrideForm({ ...overrideForm, end_time: e.target.value })
                          }
                        />
                      </div>
                    )}
                    <div>
                      <Label>Reason (optional)</Label>
                      <Input
                        value={overrideForm.reason}
                        onChange={(e) =>
                          setOverrideForm({ ...overrideForm, reason: e.target.value })
                        }
                        placeholder="e.g., Holiday, Vacation"
                      />
                    </div>
                  </div>
                  <Button onClick={addOverride} className="w-full">
                    Save Override
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {overrides.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No date overrides set
            </p>
          ) : (
            <div className="space-y-2">
              {overrides.map((override) => (
                <div
                  key={override.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{override.specific_date}</div>
                    <div className="text-sm text-muted-foreground">
                      {override.is_available
                        ? `${override.start_time} - ${override.end_time}`
                        : "Unavailable"}
                      {override.reason && ` • ${override.reason}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteOverride(override.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}