import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, TrendingUp, DollarSign, Building2, Wallet } from "lucide-react";

interface LifecycleStage {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'available' | 'locked';
  metrics?: { label: string; value: string }[];
}

interface LifecycleOverviewProps {
  activeStage?: string;
}

export function LifecycleOverview({ activeStage }: LifecycleOverviewProps) {
  const stages: LifecycleStage[] = [
    {
      id: 'earn',
      label: 'Earn',
      description: 'Generate income through workforce engagements',
      icon: <Briefcase className="h-5 w-5" />,
      status: 'active',
      metrics: [
        { label: 'Active Engagements', value: '3' },
        { label: 'Monthly Earnings', value: '$12,500' },
      ],
    },
    {
      id: 'trade',
      label: 'Trade',
      description: 'Grow capital through rules-based trading',
      icon: <TrendingUp className="h-5 w-5" />,
      status: 'active',
      metrics: [
        { label: 'Trading Level', value: 'Intermediate' },
        { label: 'Win Rate', value: '62%' },
      ],
    },
    {
      id: 'invest',
      label: 'Invest',
      description: 'Deploy capital into equity positions',
      icon: <DollarSign className="h-5 w-5" />,
      status: 'available',
      metrics: [
        { label: 'Available Capital', value: '$45,000' },
        { label: 'Deployed YTD', value: '$28,000' },
      ],
    },
    {
      id: 'own',
      label: 'Own',
      description: 'Build portfolio of productive assets',
      icon: <Building2 className="h-5 w-5" />,
      status: 'active',
      metrics: [
        { label: 'Positions', value: '4' },
        { label: 'Total Value', value: '$156,000' },
      ],
    },
    {
      id: 'compound',
      label: 'Compound',
      description: 'Reinvest returns into more assets',
      icon: <Wallet className="h-5 w-5" />,
      status: 'available',
      metrics: [
        { label: 'Dividends YTD', value: '$3,200' },
        { label: 'Reinvested', value: '$2,400' },
      ],
    },
  ];

  const getStatusStyles = (status: LifecycleStage['status']) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 border-primary/20 text-primary';
      case 'available':
        return 'bg-muted border-muted-foreground/20 text-muted-foreground';
      case 'locked':
        return 'bg-muted/50 border-muted-foreground/10 text-muted-foreground/50 opacity-60';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Human + Capital Lifecycle</CardTitle>
        <CardDescription>
          Your journey from earned income to durable wealth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              <div
                className={`min-w-[180px] p-4 rounded-lg border-2 transition-all ${getStatusStyles(stage.status)} ${
                  activeStage === stage.id ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md ${stage.status === 'active' ? 'bg-primary/20' : 'bg-muted'}`}>
                    {stage.icon}
                  </div>
                  <span className="font-semibold">{stage.label}</span>
                  {stage.status === 'active' && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs mb-3">{stage.description}</p>
                {stage.metrics && (
                  <div className="space-y-1">
                    {stage.metrics.map((metric) => (
                      <div key={metric.label} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="font-medium">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="h-5 w-5 mx-2 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
