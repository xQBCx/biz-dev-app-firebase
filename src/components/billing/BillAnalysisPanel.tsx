import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Brain, RefreshCw, TrendingDown, AlertTriangle, CheckCircle, Loader2, ExternalLink } from "lucide-react";

interface Bill {
  id: string;
  bill_name: string;
  bill_type: string;
  vendor_name: string | null;
  amount: number | null;
  file_url: string;
  extracted_data: Record<string, unknown>;
}

interface Analysis {
  id: string;
  model_used: string;
  analysis_type: string;
  analysis_result: {
    summary?: string;
    confidence_score?: number;
    optimization_opportunities?: Array<{
      type: string;
      description: string;
      estimated_savings: number;
      confidence: number;
    }>;
    risk_factors?: Array<{
      type: string;
      description: string;
      severity: string;
    }>;
    line_items?: Array<{
      description: string;
      total: number;
    }>;
  };
  confidence_score: number;
  tokens_used: number;
  processing_time_ms: number;
  created_at: string;
}

interface BillAnalysisPanelProps {
  bill: Bill;
}

const MODEL_LABELS: Record<string, string> = {
  "google/gemini-2.5-flash": "Gemini Flash",
  "google/gemini-2.5-pro": "Gemini Pro",
  "openai/gpt-5": "GPT-5",
  "openai/gpt-5-mini": "GPT-5 Mini",
  "openai/gpt-5-nano": "GPT-5 Nano",
};

export function BillAnalysisPanel({ bill }: BillAnalysisPanelProps) {
  const queryClient = useQueryClient();
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["bill-analyses", bill.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bill_analyses")
        .select("*")
        .eq("bill_id", bill.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Analysis[];
    },
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("analyze-bill", {
        body: {
          billId: bill.id,
          analysisType: "optimization",
          models: ["gemini-flash", "gpt-5-mini"],
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Re-analysis started");
      queryClient.invalidateQueries({ queryKey: ["bill-analyses", bill.id] });
    },
    onError: () => {
      toast.error("Failed to start analysis");
    },
  });

  const latestAnalysis = analyses[0];
  const result = latestAnalysis?.analysis_result;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Analysis</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reanalyzeMutation.mutate()}
            disabled={reanalyzeMutation.isPending}
          >
            {reanalyzeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>{bill.bill_name}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No analysis yet</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => reanalyzeMutation.mutate()}
            >
              Run Analysis
            </Button>
          </div>
        ) : (
          <>
            {/* Model Tabs */}
            {analyses.length > 1 && (
              <div className="flex gap-1 flex-wrap">
                {analyses.slice(0, 4).map((analysis) => (
                  <Badge
                    key={analysis.id}
                    variant={activeModel === analysis.id || (!activeModel && analysis === latestAnalysis) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveModel(analysis.id)}
                  >
                    {MODEL_LABELS[analysis.model_used] || analysis.model_used}
                  </Badge>
                ))}
              </div>
            )}

            {/* Summary */}
            {result?.summary && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">{result.summary}</p>
              </div>
            )}

            {/* Confidence Score */}
            {result?.confidence_score !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${result.confidence_score * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(result.confidence_score * 100)}%
                </span>
              </div>
            )}

            {/* Optimization Opportunities */}
            {result?.optimization_opportunities && result.optimization_opportunities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  Savings Opportunities
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {result.optimization_opportunities.map((opp, i) => (
                      <div key={i} className="p-2 rounded border text-sm">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {opp.type}
                          </Badge>
                          <span className="text-green-600 font-medium">
                            -${opp.estimated_savings?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{opp.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Risk Factors */}
            {result?.risk_factors && result.risk_factors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Risk Factors
                </h4>
                <div className="space-y-1">
                  {result.risk_factors.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge
                        variant={risk.severity === "high" ? "destructive" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {risk.severity}
                      </Badge>
                      <span className="text-muted-foreground">{risk.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Bill Button */}
            <Button variant="outline" className="w-full" asChild>
              <a href={bill.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original Bill
              </a>
            </Button>

            {/* Processing Stats */}
            {latestAnalysis && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                {latestAnalysis.tokens_used} tokens • {latestAnalysis.processing_time_ms}ms
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
