import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TrendingDown, ArrowRight, Check, X, Lightbulb } from "lucide-react";

interface Recommendation {
  id: string;
  recommendation_type: string;
  current_cost: number | null;
  potential_savings: number | null;
  confidence_score: number | null;
  reasoning: string | null;
  action_steps: string[];
  status: string;
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  switch_provider: { label: "Switch Provider", color: "bg-blue-500/10 text-blue-600" },
  reduce_usage: { label: "Reduce Usage", color: "bg-green-500/10 text-green-600" },
  negotiate: { label: "Negotiate", color: "bg-purple-500/10 text-purple-600" },
  consolidate: { label: "Consolidate", color: "bg-orange-500/10 text-orange-600" },
  eliminate: { label: "Eliminate", color: "bg-red-500/10 text-red-600" },
  optimize: { label: "Optimize", color: "bg-yellow-500/10 text-yellow-600" },
};

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bill_recommendations")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-recommendations"] });
    },
  });

  const pendingRecs = recommendations.filter((r) => r.status === "pending");
  const acceptedRecs = recommendations.filter((r) => r.status === "accepted");
  const dismissedRecs = recommendations.filter((r) => r.status === "dismissed");

  const totalPotentialSavings = pendingRecs.reduce(
    (sum, r) => sum + (r.potential_savings || 0),
    0
  );

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground">
            Upload and analyze bills to get AI-powered savings recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Potential Savings</p>
              <p className="text-3xl font-bold text-green-600">
                ${totalPotentialSavings.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-12 w-12 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {pendingRecs.length} pending recommendations
          </p>
        </CardContent>
      </Card>

      {/* Pending Recommendations */}
      {pendingRecs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Pending Recommendations</h3>
          {pendingRecs.map((rec) => {
            const typeConfig = TYPE_LABELS[rec.recommendation_type] || {
              label: rec.recommendation_type,
              color: "bg-muted",
            };
            const actionSteps = Array.isArray(rec.action_steps) ? rec.action_steps : [];

            return (
              <Card key={rec.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                        {rec.confidence_score && (
                          <Badge variant="outline">
                            {Math.round(rec.confidence_score * 100)}% confidence
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm mb-3">{rec.reasoning}</p>

                      {actionSteps.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Action Steps:
                          </p>
                          <ul className="text-sm space-y-1">
                            {actionSteps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {rec.potential_savings && (
                        <p className="text-xl font-bold text-green-600">
                          -${rec.potential_savings.toLocaleString()}
                        </p>
                      )}
                      {rec.current_cost && (
                        <p className="text-xs text-muted-foreground">
                          from ${rec.current_cost.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        updateMutation.mutate({ id: rec.id, status: "accepted" })
                      }
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        updateMutation.mutate({ id: rec.id, status: "dismissed" })
                      }
                    >
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Accepted Recommendations */}
      {acceptedRecs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-green-600">
            Accepted ({acceptedRecs.length})
          </h3>
          {acceptedRecs.map((rec) => (
            <Card key={rec.id} className="opacity-75">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{rec.reasoning}</span>
                  </div>
                  {rec.potential_savings && (
                    <span className="text-sm font-medium text-green-600">
                      -${rec.potential_savings.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
