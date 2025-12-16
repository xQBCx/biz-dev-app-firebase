import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Sparkles,
  RefreshCw,
  Check,
  Clock,
  Coffee,
  Brain,
  Users,
  Loader2,
  Lightbulb,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ScheduleBlock {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  type: "task" | "meeting" | "focus" | "break" | "lunch" | "buffer";
  priority?: string;
  task_id?: string;
  description?: string;
}

interface GeneratedSchedule {
  date: string;
  blocks: ScheduleBlock[];
  summary: string;
  tips: string[];
}

export function SmartScheduler() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const generateSchedule = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-schedule", {
        body: { date: format(selectedDate, "yyyy-MM-dd") },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSchedule(data.schedule);
      toast.success("Schedule generated!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("Failed to generate schedule");
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptSchedule = async () => {
    if (!schedule) return;

    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from("generated_schedules")
        .update({ accepted: true })
        .eq("user_id", user?.id)
        .eq("date", schedule.date);

      if (error) throw error;

      toast.success("Schedule accepted!");
    } catch (error) {
      console.error("Error accepting schedule:", error);
      toast.error("Failed to accept schedule");
    } finally {
      setIsAccepting(false);
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Check className="h-4 w-4" />;
      case "meeting":
        return <Users className="h-4 w-4" />;
      case "focus":
        return <Brain className="h-4 w-4" />;
      case "break":
        return <Coffee className="h-4 w-4" />;
      case "lunch":
        return <Coffee className="h-4 w-4" />;
      case "buffer":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getBlockColor = (type: string, priority?: string) => {
    if (priority === "high") return "bg-red-500/10 border-red-500/30";
    if (priority === "medium") return "bg-yellow-500/10 border-yellow-500/30";

    switch (type) {
      case "task":
        return "bg-blue-500/10 border-blue-500/30";
      case "meeting":
        return "bg-purple-500/10 border-purple-500/30";
      case "focus":
        return "bg-green-500/10 border-green-500/30";
      case "break":
        return "bg-muted border-muted-foreground/20";
      case "lunch":
        return "bg-orange-500/10 border-orange-500/30";
      case "buffer":
        return "bg-muted/50 border-muted-foreground/10";
      default:
        return "bg-muted border-muted-foreground/20";
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setSchedule(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Smart Scheduler
          </h2>
          <p className="text-muted-foreground">AI-powered daily schedule optimization</p>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </span>
              {format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && (
                <Badge variant="secondary">Today</Badge>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      {!schedule && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Generate Your Optimized Schedule</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Our AI will analyze your tasks, calendar, and preferences to create the perfect
                schedule for maximum productivity.
              </p>
            </div>
            <Button onClick={generateSchedule} disabled={isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Schedule
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Schedule */}
      {schedule && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Schedule</CardTitle>
                <CardDescription>{schedule.summary}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={generateSchedule} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button onClick={acceptSchedule} disabled={isAccepting}>
                  {isAccepting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Accept
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {schedule.blocks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No schedule blocks generated
                    </p>
                  ) : (
                    schedule.blocks.map((block) => (
                      <div
                        key={block.id}
                        className={`flex gap-4 p-4 rounded-lg border ${getBlockColor(
                          block.type,
                          block.priority
                        )}`}
                      >
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <span className="text-sm font-medium">{block.start_time}</span>
                          <div className="h-8 border-l border-muted-foreground/30" />
                          <span className="text-sm text-muted-foreground">{block.end_time}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {getBlockIcon(block.type)}
                            <h4 className="font-medium">{block.title}</h4>
                            {block.priority && (
                              <Badge
                                variant={
                                  block.priority === "high"
                                    ? "destructive"
                                    : block.priority === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {block.priority}
                              </Badge>
                            )}
                          </div>
                          {block.description && (
                            <p className="text-sm text-muted-foreground">{block.description}</p>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {block.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tips & Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Productivity Tips
              </CardTitle>
              <CardDescription>AI-generated suggestions for your day</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {schedule.tips.length === 0 ? (
                  <li className="text-muted-foreground text-sm">No tips generated</li>
                ) : (
                  schedule.tips.map((tip, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="text-sm">{tip}</p>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
