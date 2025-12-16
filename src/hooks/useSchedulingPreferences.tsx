import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SchedulingPreferences {
  id?: string;
  user_id?: string;
  work_start_time: string;
  work_end_time: string;
  work_days: number[];
  lunch_start_time: string;
  lunch_duration_minutes: number;
  short_break_duration_minutes: number;
  short_break_frequency_hours: number;
  peak_energy_time: "morning" | "afternoon" | "evening";
  low_energy_time: "morning" | "afternoon" | "evening";
  focus_block_duration_minutes: number;
  prefer_focus_time_morning: boolean;
  max_meetings_per_day: number;
  min_buffer_between_meetings_minutes: number;
  default_location: string | null;
  default_location_lat: number | null;
  default_location_lng: number | null;
  commute_buffer_minutes: number;
  preferred_task_order: "priority" | "due_date" | "energy_match";
  batch_similar_tasks: boolean;
}

const defaultPreferences: SchedulingPreferences = {
  work_start_time: "09:00",
  work_end_time: "17:00",
  work_days: [1, 2, 3, 4, 5],
  lunch_start_time: "12:00",
  lunch_duration_minutes: 60,
  short_break_duration_minutes: 15,
  short_break_frequency_hours: 2,
  peak_energy_time: "morning",
  low_energy_time: "afternoon",
  focus_block_duration_minutes: 90,
  prefer_focus_time_morning: true,
  max_meetings_per_day: 5,
  min_buffer_between_meetings_minutes: 15,
  default_location: null,
  default_location_lat: null,
  default_location_lng: null,
  commute_buffer_minutes: 30,
  preferred_task_order: "priority",
  batch_similar_tasks: true,
};

export function useSchedulingPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<SchedulingPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_scheduling_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          ...defaultPreferences,
          ...data,
          work_start_time: data.work_start_time?.slice(0, 5) || "09:00",
          work_end_time: data.work_end_time?.slice(0, 5) || "17:00",
          lunch_start_time: data.lunch_start_time?.slice(0, 5) || "12:00",
          peak_energy_time: (data.peak_energy_time as SchedulingPreferences["peak_energy_time"]) || "morning",
          low_energy_time: (data.low_energy_time as SchedulingPreferences["low_energy_time"]) || "afternoon",
          preferred_task_order: (data.preferred_task_order as SchedulingPreferences["preferred_task_order"]) || "priority",
        });
      }
    } catch (error) {
      console.error("Error fetching scheduling preferences:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = async (newPreferences: Partial<SchedulingPreferences>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        user_id: user.id,
        ...preferences,
        ...newPreferences,
      };

      // Remove id from insert/update data
      const { id, ...saveData } = dataToSave;

      const { error } = await supabase
        .from("user_scheduling_preferences")
        .upsert(saveData, { onConflict: "user_id" });

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, ...newPreferences }));
      toast.success("Preferences saved!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number; address: string } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // For now, just return coordinates - could integrate with geocoding API later
          resolve({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Unable to get location");
          resolve(null);
        }
      );
    });
  };

  return {
    preferences,
    isLoading,
    isSaving,
    savePreferences,
    getCurrentLocation,
    refetch: fetchPreferences,
  };
}
