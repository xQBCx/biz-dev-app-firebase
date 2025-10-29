import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Lightbulb, TrendingUp } from "lucide-react";

interface TrademarkAIResultsProps {
  results: {
    strengthScore: number;
    riskLevel: string;
    similarMarks: Array<{
      mark: string;
      owner: string;
      classes: string;
      status: string;
      similarity: string;
    }>;
    recommendedClasses: Array<{
      class: string;
      description: string;
    }>;
    suggestions: string[];
    distinctiveness: string;
  };
  onRegenerate?: () => void;
}

export const TrademarkAIResults = ({ results, onRegenerate }: TrademarkAIResultsProps) => {
  const getRiskColor = (level: string) => {
    if (level === "low") return "text-green-600";
    if (level === "medium") return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskIcon = (level: string) => {
    if (level === "low") return CheckCircle;
    if (level === "medium") return AlertTriangle;
    return AlertTriangle;
  };

  const RiskIcon = getRiskIcon(results.riskLevel);

  return (
    <div className="space-y-6">
      {/* Strength & Risk Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Strength Score</h3>
          </div>
          <div className="text-3xl font-bold">{results.strengthScore}/100</div>
          <div className="w-full bg-muted rounded-full h-3 mt-4">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${results.strengthScore}%` }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <RiskIcon className={`h-5 w-5 ${getRiskColor(results.riskLevel)}`} />
            <h3 className="text-lg font-semibold">Opposition Risk</h3>
          </div>
          <div className={`text-3xl font-bold ${getRiskColor(results.riskLevel)} capitalize`}>
            {results.riskLevel}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Distinctiveness: {results.distinctiveness}
          </p>
        </Card>
      </div>

      {/* Similar Marks */}
      {results.similarMarks.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Similar Trademarks Found</h3>
          </div>
          <div className="space-y-3">
            {results.similarMarks.map((mark, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold">{mark.mark}</div>
                  <Badge
                    variant={
                      mark.similarity === "High" ? "destructive" : "outline"
                    }
                  >
                    {mark.similarity} Similarity
                  </Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div>Owner: {mark.owner}</div>
                  <div>Classes: {mark.classes}</div>
                  <div>Status: {mark.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommended Classes */}
      {results.recommendedClasses.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Recommended TM Classes</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {results.recommendedClasses.map((cls, idx) => (
              <div key={idx} className="flex items-start gap-3 border rounded-lg p-3">
                <Badge className="mt-0.5">Class {cls.class}</Badge>
                <p className="text-sm flex-1">{cls.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Suggestions */}
      {results.suggestions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Recommendations</h3>
          </div>
          <div className="space-y-2">
            {results.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <p className="text-sm flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {onRegenerate && (
          <Button variant="outline" onClick={onRegenerate}>
            Regenerate Analysis
          </Button>
        )}
        <Button className="flex-1">Proceed with Filing</Button>
      </div>
    </div>
  );
};
