import { useState, useEffect } from "react";
import { useTaskCompletion } from "@/hooks/useTaskCompletion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TaskStats {
  totalTasksLogged: number;
  tasksWithEstimates: number;
  avgAccuracyPercent: number;
  avgOverUnderMinutes: number;
}

export function LearningEngineStats() {
  const { getTaskStats } = useTaskCompletion();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getTaskStats();
      setStats(data);
      setIsLoading(false);
    };
    fetchStats();
  }, [getTaskStats]);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading learning stats...</div>;
  }

  if (!stats || stats.totalTasksLogged === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Learning Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Complete tasks with time tracking to help the system learn your patterns.
            The more data you provide, the better your schedules will become.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Learning Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Tasks Tracked
            </div>
            <p className="text-2xl font-bold">{stats.totalTasksLogged}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              With Estimates
            </div>
            <p className="text-2xl font-bold">{stats.tasksWithEstimates}</p>
          </div>
        </div>

        {stats.tasksWithEstimates > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Estimation Accuracy
                </span>
                <span className="font-medium">{stats.avgAccuracyPercent}%</span>
              </div>
              <Progress value={stats.avgAccuracyPercent} />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                {stats.avgOverUnderMinutes > 0 ? (
                  <>
                    On average, tasks take <strong>{stats.avgOverUnderMinutes} minutes longer</strong> than estimated.
                  </>
                ) : stats.avgOverUnderMinutes < 0 ? (
                  <>
                    On average, tasks take <strong>{Math.abs(stats.avgOverUnderMinutes)} minutes less</strong> than estimated.
                  </>
                ) : (
                  <>Your estimates are spot on!</>
                )}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
