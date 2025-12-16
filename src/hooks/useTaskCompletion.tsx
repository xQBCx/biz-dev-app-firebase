import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskCompletionData {
  taskId: string;
  estimatedDurationMinutes?: number;
  scheduledStart?: string;
  actualStart?: string;
  actualEnd?: string;
  locationLat?: number;
  locationLng?: number;
  completionNotes?: string;
}

export function useTaskCompletion() {
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);

  const logTaskCompletion = useCallback(
    async (data: TaskCompletionData) => {
      if (!user) return;

      setIsLogging(true);
      try {
        const actualStart = data.actualStart ? new Date(data.actualStart) : null;
        const actualEnd = data.actualEnd ? new Date(data.actualEnd) : new Date();
        
        let actualDurationMinutes: number | null = null;
        if (actualStart && actualEnd) {
          actualDurationMinutes = Math.round(
            (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60)
          );
        }

        const { error } = await supabase.from("task_completion_logs").insert({
          user_id: user.id,
          task_id: data.taskId,
          estimated_duration_minutes: data.estimatedDurationMinutes || null,
          actual_duration_minutes: actualDurationMinutes,
          scheduled_start: data.scheduledStart || null,
          actual_start: data.actualStart || null,
          actual_end: data.actualEnd || actualEnd.toISOString(),
          location_lat: data.locationLat || null,
          location_lng: data.locationLng || null,
          completion_notes: data.completionNotes || null,
        });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error logging task completion:", error);
        return false;
      } finally {
        setIsLogging(false);
      }
    },
    [user]
  );

  const getTaskStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("task_completion_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Calculate average estimation accuracy
      const logsWithBoth = data.filter(
        (log) => log.estimated_duration_minutes && log.actual_duration_minutes
      );

      let avgAccuracy = 0;
      let avgOverUnder = 0;
      if (logsWithBoth.length > 0) {
        const accuracies = logsWithBoth.map((log) => {
          const estimated = log.estimated_duration_minutes!;
          const actual = log.actual_duration_minutes!;
          return Math.min(estimated, actual) / Math.max(estimated, actual);
        });
        avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

        const diffs = logsWithBoth.map(
          (log) => log.actual_duration_minutes! - log.estimated_duration_minutes!
        );
        avgOverUnder = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      }

      return {
        totalTasksLogged: data.length,
        tasksWithEstimates: logsWithBoth.length,
        avgAccuracyPercent: Math.round(avgAccuracy * 100),
        avgOverUnderMinutes: Math.round(avgOverUnder),
        recentLogs: data.slice(0, 10),
      };
    } catch (error) {
      console.error("Error fetching task stats:", error);
      return null;
    }
  }, [user]);

  return {
    logTaskCompletion,
    getTaskStats,
    isLogging,
  };
}
