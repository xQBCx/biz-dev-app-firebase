import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Plus, RefreshCw } from "lucide-react";
import type { EnterpriseRisk, KeyRiskIndicator } from "@/hooks/useEnterpriseRisks";

interface KRIDashboardProps {
  kris: KeyRiskIndicator[];
  risks: EnterpriseRisk[];
  onRefresh: () => void;
}

export function KRIDashboard({ kris, risks, onRefresh }: KRIDashboardProps) {
  const getKRIStatus = (kri: KeyRiskIndicator) => {
    if (!kri.current_value) return 'unknown';
    if (kri.threshold_critical && kri.current_value >= kri.threshold_critical) return 'critical';
    if (kri.threshold_warning && kri.current_value >= kri.threshold_warning) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-destructive bg-destructive/10 border-destructive';
      case 'warning':
        return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'normal':
        return 'text-green-500 bg-green-500/10 border-green-500';
      default:
        return 'text-muted-foreground bg-muted border-muted';
    }
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getProgressValue = (kri: KeyRiskIndicator) => {
    if (!kri.current_value || !kri.threshold_critical) return 0;
    return Math.min((kri.current_value / kri.threshold_critical) * 100, 100);
  };

  const getRiskForKRI = (riskId: string | null) => {
    if (!riskId) return null;
    return risks.find(r => r.id === riskId);
  };

  const criticalKRIs = kris.filter(k => getKRIStatus(k) === 'critical');
  const warningKRIs = kris.filter(k => getKRIStatus(k) === 'warning');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{kris.length}</div>
            <div className="text-sm text-muted-foreground">Total KRIs</div>
          </CardContent>
        </Card>
        <Card className={criticalKRIs.length > 0 ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-destructive">{criticalKRIs.length}</div>
            <div className="text-sm text-muted-foreground">Critical Breaches</div>
          </CardContent>
        </Card>
        <Card className={warningKRIs.length > 0 ? 'border-orange-500' : ''}>
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-orange-500">{warningKRIs.length}</div>
            <div className="text-sm text-muted-foreground">Warning Thresholds</div>
          </CardContent>
        </Card>
      </div>

      {/* KRI List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Key Risk Indicators</CardTitle>
            <CardDescription>Monitor real-time risk metrics and thresholds</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add KRI
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {kris.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No KRIs configured. Add key risk indicators to monitor risk thresholds.
            </div>
          ) : (
            <div className="space-y-4">
              {kris.map((kri) => {
                const status = getKRIStatus(kri);
                const linkedRisk = getRiskForKRI(kri.risk_id);
                const progressValue = getProgressValue(kri);

                return (
                  <div
                    key={kri.id}
                    className={`p-4 rounded-lg border ${getStatusColor(status)}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{kri.kri_name}</span>
                          {getTrendIcon(kri.trend)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {kri.metric_source || 'custom'}
                          </Badge>
                        </div>
                        {linkedRisk && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Linked to: {linkedRisk.title}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {kri.current_value?.toLocaleString() ?? 'N/A'}
                            {kri.unit && <span className="text-sm font-normal ml-1">{kri.unit}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Warning: {kri.threshold_warning ?? '-'} | Critical: {kri.threshold_critical ?? '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar showing proximity to critical threshold */}
                    <div className="mt-3">
                      <Progress 
                        value={progressValue} 
                        className={`h-2 ${status === 'critical' ? '[&>div]:bg-destructive' : status === 'warning' ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
