import { useState } from "react";
import { LocationManager } from "@/components/LocationManager";
import { LearningEngineStats } from "@/components/LearningEngineStats";
import { useSchedulingPreferences, SchedulingPreferences as Prefs } from "@/hooks/useSchedulingPreferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { 
  Clock, 
  Calendar, 
  Battery, 
  MapPin, 
  Brain, 
  Coffee, 
  Loader2,
  Sun,
  Moon,
  Sunset
} from "lucide-react";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function SchedulingPreferences() {
  const { preferences, isLoading, isSaving, savePreferences, getCurrentLocation } = useSchedulingPreferences();
  const [localPrefs, setLocalPrefs] = useState<Prefs | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Use local state for editing, fall back to fetched preferences
  const currentPrefs = localPrefs || preferences;

  const updatePref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setLocalPrefs((prev) => ({
      ...(prev || preferences),
      [key]: value,
    }));
  };

  const toggleWorkDay = (day: number) => {
    const current = currentPrefs.work_days;
    const newDays = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    updatePref("work_days", newDays);
  };

  const handleSave = async () => {
    if (localPrefs) {
      await savePreferences(localPrefs);
      setLocalPrefs(null);
    }
  };

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    const location = await getCurrentLocation();
    if (location) {
      setLocalPrefs((prev) => ({
        ...(prev || preferences),
        default_location: location.address,
        default_location_lat: location.lat,
        default_location_lng: location.lng,
      }));
    }
    setIsGettingLocation(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  const hasChanges = localPrefs !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduling Preferences</h2>
          <p className="text-muted-foreground">Configure your ideal work schedule for intelligent scheduling</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        )}
      </div>

      <Tabs defaultValue="hours" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="energy" className="gap-2">
            <Battery className="h-4 w-4" />
            Energy
          </TabsTrigger>
          <TabsTrigger value="focus" className="gap-2">
            <Brain className="h-4 w-4" />
            Focus
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </TabsTrigger>
        </TabsList>

        {/* Working Hours Tab */}
        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Working Hours
              </CardTitle>
              <CardDescription>Set your typical work schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={currentPrefs.work_start_time}
                    onChange={(e) => updatePref("work_start_time", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={currentPrefs.work_end_time}
                    onChange={(e) => updatePref("work_end_time", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Work Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((day) => (
                    <Badge
                      key={day.value}
                      variant={currentPrefs.work_days.includes(day.value) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => toggleWorkDay(day.value)}
                    >
                      {day.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Break Preferences
              </CardTitle>
              <CardDescription>Configure your break schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lunch Start Time</Label>
                  <Input
                    type="time"
                    value={currentPrefs.lunch_start_time}
                    onChange={(e) => updatePref("lunch_start_time", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lunch Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={currentPrefs.lunch_duration_minutes}
                    onChange={(e) => updatePref("lunch_duration_minutes", parseInt(e.target.value) || 60)}
                    min={15}
                    max={120}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Short Break Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={currentPrefs.short_break_duration_minutes}
                    onChange={(e) => updatePref("short_break_duration_minutes", parseInt(e.target.value) || 15)}
                    min={5}
                    max={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Break Every (hours)</Label>
                  <Input
                    type="number"
                    value={currentPrefs.short_break_frequency_hours}
                    onChange={(e) => updatePref("short_break_frequency_hours", parseInt(e.target.value) || 2)}
                    min={1}
                    max={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Energy Tab */}
        <TabsContent value="energy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="h-5 w-5" />
                Energy Patterns
              </CardTitle>
              <CardDescription>
                Help us schedule your most demanding tasks when you're at peak energy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>When are you most energetic?</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "morning", label: "Morning", icon: Sun, desc: "6am - 12pm" },
                    { value: "afternoon", label: "Afternoon", icon: Sunset, desc: "12pm - 6pm" },
                    { value: "evening", label: "Evening", icon: Moon, desc: "6pm - 12am" },
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        currentPrefs.peak_energy_time === option.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => updatePref("peak_energy_time", option.value as Prefs["peak_energy_time"])}
                    >
                      <CardContent className="p-4 text-center space-y-2">
                        <option.icon className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.desc}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>When do you experience energy dips?</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "morning", label: "Morning", icon: Sun, desc: "6am - 12pm" },
                    { value: "afternoon", label: "Afternoon", icon: Sunset, desc: "12pm - 6pm" },
                    { value: "evening", label: "Evening", icon: Moon, desc: "6pm - 12am" },
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        currentPrefs.low_energy_time === option.value
                          ? "border-destructive bg-destructive/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => updatePref("low_energy_time", option.value as Prefs["low_energy_time"])}
                    >
                      <CardContent className="p-4 text-center space-y-2">
                        <option.icon className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.desc}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Focus Tab */}
        <TabsContent value="focus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Focus Time Preferences
              </CardTitle>
              <CardDescription>Configure deep work and meeting preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Ideal Focus Block Duration: {currentPrefs.focus_block_duration_minutes} minutes</Label>
                <Slider
                  value={[currentPrefs.focus_block_duration_minutes]}
                  onValueChange={([value]) => updatePref("focus_block_duration_minutes", value)}
                  min={30}
                  max={180}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30 min</span>
                  <span>90 min</span>
                  <span>180 min</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Prefer Focus Time in Morning</Label>
                  <p className="text-sm text-muted-foreground">Schedule deep work during morning hours</p>
                </div>
                <Switch
                  checked={currentPrefs.prefer_focus_time_morning}
                  onCheckedChange={(checked) => updatePref("prefer_focus_time_morning", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Meetings Per Day: {currentPrefs.max_meetings_per_day}</Label>
                <Slider
                  value={[currentPrefs.max_meetings_per_day]}
                  onValueChange={([value]) => updatePref("max_meetings_per_day", value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Buffer Between Meetings: {currentPrefs.min_buffer_between_meetings_minutes} minutes</Label>
                <Slider
                  value={[currentPrefs.min_buffer_between_meetings_minutes]}
                  onValueChange={([value]) => updatePref("min_buffer_between_meetings_minutes", value)}
                  min={0}
                  max={60}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Scheduling Preferences</CardTitle>
              <CardDescription>How should we prioritize your tasks?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Task Order</Label>
                <Select
                  value={currentPrefs.preferred_task_order}
                  onValueChange={(value) => updatePref("preferred_task_order", value as Prefs["preferred_task_order"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">By Priority (High → Low)</SelectItem>
                    <SelectItem value="due_date">By Due Date (Soonest First)</SelectItem>
                    <SelectItem value="energy_match">Match Task to Energy Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Batch Similar Tasks</Label>
                  <p className="text-sm text-muted-foreground">Group similar tasks together for efficiency</p>
                </div>
                <Switch
                  checked={currentPrefs.batch_similar_tasks}
                  onCheckedChange={(checked) => updatePref("batch_similar_tasks", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Settings
              </CardTitle>
              <CardDescription>Set your default location for travel time calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Default Location</Label>
                    <Input
                      placeholder="Enter address or use current location"
                      value={currentPrefs.default_location || ""}
                      onChange={(e) => updatePref("default_location", e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="mt-8"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {currentPrefs.default_location_lat && currentPrefs.default_location_lng && (
                  <p className="text-sm text-muted-foreground">
                    Coordinates: {currentPrefs.default_location_lat.toFixed(4)}, {currentPrefs.default_location_lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Default Commute Buffer: {currentPrefs.commute_buffer_minutes} minutes</Label>
                <Slider
                  value={[currentPrefs.commute_buffer_minutes]}
                  onValueChange={([value]) => updatePref("commute_buffer_minutes", value)}
                  min={0}
                  max={120}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Added buffer time for travel between locations
                </p>
              </div>
            </CardContent>
          </Card>

          <LocationManager />
          <LearningEngineStats />
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}
