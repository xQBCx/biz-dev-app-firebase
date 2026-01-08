import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, AlertCircle, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RiskStatCardsProps {
  totalRisks: number;
  criticalCount: number;
  highCount: number;
  breachedKRIs: number;
  loading?: boolean;
}

export function RiskStatCards({ 
  totalRisks, 
  criticalCount, 
  highCount, 
  breachedKRIs,
  loading 
}: RiskStatCardsProps) {
  const stats = [
    {
      label: "Total Risks",
      value: totalRisks,
      icon: Shield,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Critical Risks",
      value: criticalCount,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "High Risks",
      value: highCount,
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Breached KRIs",
      value: breachedKRIs,
      icon: Activity,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
