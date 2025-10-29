import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Lightbulb, FileText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatentAIResultsProps {
  results: {
    abstract: string;
    claims: string[];
    noveltyScore: number;
    priorArtRisks: string[];
    recommendations: string[];
  };
  onRegenerate?: () => void;
}

export const PatentAIResults = ({ results, onRegenerate }: PatentAIResultsProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Novelty Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Novelty Assessment</h3>
          <div className={`text-3xl font-bold ${getScoreColor(results.noveltyScore)}`}>
            {results.noveltyScore}/100
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${results.noveltyScore}%` }}
          />
        </div>
      </Card>

      {/* Abstract */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Abstract</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(results.abstract, "Abstract")}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{results.abstract}</p>
      </Card>

      {/* Claims */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Patent Claims</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(results.claims.join("\n\n"), "Claims")}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {results.claims.map((claim, idx) => (
            <div key={idx} className="text-sm border-l-2 border-primary pl-4 py-2">
              {claim}
            </div>
          ))}
        </div>
      </Card>

      {/* Prior Art Risks */}
      {results.priorArtRisks.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-xl font-semibold">Prior Art Risks</h3>
          </div>
          <div className="space-y-2">
            {results.priorArtRisks.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  {idx + 1}
                </Badge>
                <p className="text-sm flex-1">{risk}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {results.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Recommendations</h3>
          </div>
          <div className="space-y-2">
            {results.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <p className="text-sm flex-1">{rec}</p>
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
        <Button className="flex-1">Save & Continue</Button>
      </div>
    </div>
  );
};
