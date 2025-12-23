import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SituationStatsProps {
  total: number;
  active: number;
  critical: number;
  high: number;
  resolved: number;
}

export function SituationStats({ total, active, critical, high, resolved }: SituationStatsProps) {
  const stats = [
    {
      label: "Active",
      value: active,
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Critical",
      value: critical,
      icon: AlertTriangle,
      color: critical > 0 ? "text-destructive" : "text-muted-foreground",
    },
    {
      label: "High Priority",
      value: high,
      icon: TrendingUp,
      color: high > 0 ? "text-primary" : "text-muted-foreground",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "text-green-600",
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3">
          <stat.icon className={cn("h-5 w-5", stat.color)} />
          <div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
