import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Sparkles, 
  BarChart3, 
  AlertTriangle, 
  Scale,
  TrendingUp,
  RefreshCw,
  CheckCircle
} from "lucide-react";

interface Analysis {
  id: string;
  analysis_type: string;
  analysis_data: any;
  fairness_score: number | null;
  flags: string[] | null;
  created_at: string;
}

interface DealRoomAIAnalysisProps {
  dealRoomId: string;
  isAdmin: boolean;
}

export const DealRoomAIAnalysis = ({ dealRoomId, isAdmin }: DealRoomAIAnalysisProps) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, [dealRoomId]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("deal_ai_analyses")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('deal-analyze', {
        body: { dealRoomId }
      });

      if (error) throw error;
      toast.success("Analysis generated");
      fetchAnalyses();
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast.error("Failed to generate analysis");
    } finally {
      setGenerating(false);
    }
  };

  const analysisTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
    contribution_map: { label: "Contribution Map", icon: BarChart3, color: "text-blue-500" },
    risk_analysis: { label: "Risk vs Reward", icon: AlertTriangle, color: "text-amber-500" },
    precedent: { label: "Precedent Modeling", icon: TrendingUp, color: "text-emerald-500" },
    fairness: { label: "Fairness Score", icon: Scale, color: "text-primary" },
    structures: { label: "Generated Structures", icon: Sparkles, color: "text-purple-500" },
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Analysis</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered insights on contributions, fairness, and deal structures
          </p>
        </div>
        {isAdmin && (
          <Button onClick={generateAnalysis} disabled={generating} className="gap-2">
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? "Analyzing..." : "Run Analysis"}
          </Button>
        )}
      </div>

      {analyses.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Analysis Yet</h3>
          <p className="text-muted-foreground mb-4">
            Run AI analysis once participants have submitted their contributions.
          </p>
          {isAdmin && (
            <Button onClick={generateAnalysis} disabled={generating}>
              Generate Analysis
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => {
            const config = analysisTypeConfig[analysis.analysis_type] || {
              label: analysis.analysis_type,
              icon: Sparkles,
              color: "text-muted-foreground"
            };
            const Icon = config.icon;

            return (
              <Card key={analysis.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{config.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        Generated {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {analysis.fairness_score !== null && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {Math.round(analysis.fairness_score * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Fairness Score</p>
                    </div>
                  )}
                </div>

                {analysis.flags && analysis.flags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.flags.map((flag, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {flag}
                      </Badge>
                    ))}
                  </div>
                )}

                {analysis.analysis_data && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    {typeof analysis.analysis_data === 'string' ? (
                      <p className="text-sm whitespace-pre-wrap">{analysis.analysis_data}</p>
                    ) : (
                      <div className="space-y-3">
                        {analysis.analysis_data.summary && (
                          <p className="text-sm">{analysis.analysis_data.summary}</p>
                        )}
                        {analysis.analysis_data.contributions && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {Object.entries(analysis.analysis_data.contributions).map(([key, value]: [string, any]) => (
                              <div key={key} className="text-sm">
                                <p className="font-medium">{key}</p>
                                <p className="text-muted-foreground">{JSON.stringify(value)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {analysis.analysis_data.recommendations && (
                          <div className="mt-4">
                            <p className="font-medium mb-2">Recommendations</p>
                            <ul className="space-y-1">
                              {analysis.analysis_data.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
