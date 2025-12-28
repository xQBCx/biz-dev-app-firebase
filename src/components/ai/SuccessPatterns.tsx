import { useState, useEffect } from "react";
import { Sparkles, Users, TrendingUp, Copy, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SuccessPattern {
  id: string;
  pattern_name: string;
  pattern_type: string;
  pattern_description: string | null;
  success_rate: number;
  source_user_count: number;
  times_suggested: number;
  times_adopted: number;
  adoption_success_rate: number | null;
  applicable_contexts: string[] | null;
  active: boolean;
}

export const SuccessPatterns = () => {
  const [patterns, setPatterns] = useState<SuccessPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [adoptedPatterns, setAdoptedPatterns] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_success_patterns")
        .select("*")
        .eq("active", true)
        .order("success_rate", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPatterns(data || []);
    } catch (error) {
      console.error("Error fetching success patterns:", error);
    } finally {
      setLoading(false);
    }
  };

  const adoptPattern = async (patternId: string) => {
    try {
      // Increment adoption count
      const pattern = patterns.find(p => p.id === patternId);
      if (!pattern) return;

      const { error } = await supabase
        .from("ai_success_patterns")
        .update({
          times_adopted: (pattern.times_adopted || 0) + 1,
        })
        .eq("id", patternId);

      if (error) throw error;

      setAdoptedPatterns(prev => new Set([...prev, patternId]));
      toast.success("Pattern adopted! We'll help you implement this.");
    } catch (error) {
      console.error("Error adopting pattern:", error);
      toast.error("Failed to adopt pattern");
    }
  };

  const getPatternTypeIcon = (type: string) => {
    switch (type) {
      case "workflow":
        return "🔄";
      case "communication":
        return "💬";
      case "timing":
        return "⏰";
      case "organization":
        return "📁";
      default:
        return "✨";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading patterns...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Success Patterns from Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No success patterns discovered yet. The AI is analyzing user behaviors to find patterns that lead to success.
            </p>
          </div>
        ) : (
          patterns.map((pattern) => (
            <div
              key={pattern.id}
              className="p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getPatternTypeIcon(pattern.pattern_type)}</span>
                    <h4 className="font-medium">{pattern.pattern_name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pattern.pattern_description}
                  </p>
                </div>
                {adoptedPatterns.has(pattern.id) ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Adopted
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adoptPattern(pattern.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Adopt
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <TrendingUp className="h-3 w-3" />
                    Success Rate
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {Math.round((pattern.success_rate || 0) * 100)}%
                    </span>
                    <Progress 
                      value={(pattern.success_rate || 0) * 100} 
                      className="flex-1 h-1" 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    Used By
                  </div>
                  <span className="font-medium">
                    {pattern.source_user_count || 0} users
                  </span>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    Adoption Success
                  </div>
                  <span className="font-medium">
                    {pattern.adoption_success_rate 
                      ? `${Math.round(pattern.adoption_success_rate * 100)}%`
                      : "N/A"
                    }
                  </span>
                </div>
              </div>

              {pattern.applicable_contexts && pattern.applicable_contexts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {pattern.applicable_contexts.map((context, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {context}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
