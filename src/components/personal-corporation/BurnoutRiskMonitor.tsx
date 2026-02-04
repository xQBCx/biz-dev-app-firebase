import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Heart, Brain, Users, DollarSign, Clock, Loader2, Shield } from "lucide-react";

interface BurnoutRiskMonitorProps {
  burnoutScore: any;
  isLoading: boolean;
}

export const BurnoutRiskMonitor = ({ burnoutScore, isLoading }: BurnoutRiskMonitorProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-500";
    if (score < 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskBgColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Healthy";
    if (score < 60) return "Moderate";
    return "At Risk";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'worsening': return <TrendingUp className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const riskComponents = [
    { 
      label: "Overcommitment", 
      score: burnoutScore?.overcommitment_score || 0, 
      icon: Clock,
      description: "Taking on more than sustainable capacity"
    },
    { 
      label: "Recovery Deficit", 
      score: burnoutScore?.recovery_deficit_score || 0, 
      icon: Heart,
      description: "Insufficient rest and recovery time"
    },
    { 
      label: "Platform Dependence", 
      score: burnoutScore?.platform_dependence_score || 0, 
      icon: Shield,
      description: "Over-reliance on single income sources"
    },
    { 
      label: "Financial Stress", 
      score: burnoutScore?.financial_stress_score || 0, 
      icon: DollarSign,
      description: "Pressure from financial obligations"
    },
    { 
      label: "Relationship Strain", 
      score: burnoutScore?.relationship_strain_score || 0, 
      icon: Users,
      description: "Stress affecting key relationships"
    },
  ];

  const overallScore = burnoutScore?.overall_risk_score || 0;

  return (
    <div className="space-y-6">
      {/* Overall Risk Card */}
      <Card className={overallScore >= 60 ? "border-red-500/50 bg-red-500/5" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Burnout Risk Assessment
              </CardTitle>
              <CardDescription>AI-calculated wellness metrics based on your activity patterns</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(burnoutScore?.trend || 'stable')}
              <Badge variant="outline">{burnoutScore?.trend || 'stable'}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${getRiskColor(overallScore)}`}>
                {overallScore.toFixed(0)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                <Badge className={getRiskBgColor(overallScore)}>
                  {getRiskLabel(overallScore)}
                </Badge>
              </div>
            </div>
            <div className="flex-1">
              <Progress 
                value={overallScore} 
                className="h-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Healthy (0-30)</span>
                <span>Moderate (30-60)</span>
                <span>At Risk (60-100)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Risk Alert */}
      {overallScore >= 60 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Burnout Risk Detected</AlertTitle>
          <AlertDescription>
            Your current activity patterns suggest elevated burnout risk. Consider reviewing the recommendations below
            and adjusting your workload to maintain sustainable performance.
          </AlertDescription>
        </Alert>
      )}

      {/* Risk Components */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Components</CardTitle>
          <CardDescription>Breakdown of factors contributing to your overall risk score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskComponents.map((component) => {
              const Icon = component.icon;
              return (
                <div key={component.label} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${getRiskColor(component.score)}`} />
                      <span className="font-medium text-sm">{component.label}</span>
                    </div>
                    <span className={`font-bold ${getRiskColor(component.score)}`}>
                      {component.score.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={component.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{component.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {(burnoutScore?.recommendations as string[])?.length > 0 ? (
              <ul className="space-y-2">
                {(burnoutScore?.recommendations as string[]).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific recommendations at this time. Keep up the good work!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contributing Factors</CardTitle>
          </CardHeader>
          <CardContent>
            {(burnoutScore?.contributing_factors as string[])?.length > 0 ? (
              <ul className="space-y-2">
                {(burnoutScore?.contributing_factors as string[]).map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    {factor}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No significant risk factors detected in your recent activity.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Signals */}
      {(burnoutScore?.behavioral_signals as string[])?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Behavioral Signals Detected</CardTitle>
            <CardDescription>Patterns observed from your platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(burnoutScore?.behavioral_signals as string[]).map((signal, i) => (
                <Badge key={i} variant="secondary">{signal}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
