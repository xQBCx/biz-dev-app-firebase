import { useState, useEffect } from "react";
import { Target, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrackedOutcome {
  id: string;
  action_type: string;
  suggested_action: string;
  was_executed: boolean | null;
  outcome_success: boolean | null;
  created_at: string;
  executed_at: string | null;
}

export const OutcomeTracker = () => {
  const [outcomes, setOutcomes] = useState<TrackedOutcome[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    executed: 0,
    successful: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutcomes();
  }, []);

  const fetchOutcomes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ai_outcome_tracking")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const outcomes = data || [];
      setOutcomes(outcomes);

      // Calculate stats
      const total = outcomes.length;
      const executed = outcomes.filter(o => o.was_executed).length;
      const successful = outcomes.filter(o => o.outcome_success).length;
      const pending = outcomes.filter(o => o.was_executed === null).length;

      setStats({ total, executed, successful, pending });
    } catch (error) {
      console.error("Error fetching outcomes:", error);
    } finally {
      setLoading(false);
    }
  };

  const markOutcome = async (
    outcomeId: string, 
    wasExecuted: boolean, 
    wasSuccessful?: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("ai_outcome_tracking")
        .update({
          was_executed: wasExecuted,
          executed_at: wasExecuted ? new Date().toISOString() : null,
          outcome_success: wasSuccessful ?? null,
        })
        .eq("id", outcomeId);

      if (error) throw error;

      await fetchOutcomes();
      toast.success("Outcome updated");
    } catch (error) {
      console.error("Error updating outcome:", error);
      toast.error("Failed to update outcome");
    }
  };

  const successRate = stats.executed > 0 
    ? Math.round((stats.successful / stats.executed) * 100) 
    : 0;

  const adoptionRate = stats.total > 0 
    ? Math.round((stats.executed / stats.total) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          AI Suggestion Outcomes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              Adoption Rate
            </div>
            <div className="text-2xl font-bold">{adoptionRate}%</div>
            <Progress value={adoptionRate} className="mt-2 h-1" />
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Success Rate
            </div>
            <div className="text-2xl font-bold">{successRate}%</div>
            <Progress value={successRate} className="mt-2 h-1" />
          </div>
        </div>

        {/* Recent Outcomes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Recent Suggestions
          </h4>
          {outcomes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tracked suggestions yet. AI suggestions will appear here for feedback.
            </p>
          ) : (
            outcomes.slice(0, 5).map((outcome) => (
              <div
                key={outcome.id}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {outcome.action_type}
                    </Badge>
                    {outcome.was_executed === null && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {outcome.was_executed === true && outcome.outcome_success === true && (
                      <Badge className="text-xs bg-green-500/20 text-green-400">
                        Successful
                      </Badge>
                    )}
                    {outcome.was_executed === true && outcome.outcome_success === false && (
                      <Badge className="text-xs bg-red-500/20 text-red-400">
                        Unsuccessful
                      </Badge>
                    )}
                    {outcome.was_executed === false && (
                      <Badge variant="secondary" className="text-xs">
                        Not Taken
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm line-clamp-2">{outcome.suggested_action}</p>
                </div>
                {outcome.was_executed === null && (
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-green-500 hover:text-green-400"
                      onClick={() => markOutcome(outcome.id, true, true)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Worked
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-red-500 hover:text-red-400"
                      onClick={() => markOutcome(outcome.id, false)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Skip
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
