import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface LimitProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function LimitProgressBar({
  current,
  max,
  label,
  showPercentage = true,
  className,
}: LimitProgressBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  const getStatusColor = () => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-yellow-500";
    if (percentage >= 60) return "bg-yellow-400";
    return "bg-primary";
  };

  const getBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (percentage >= 100) return "destructive";
    if (percentage >= 80) return "secondary";
    return "outline";
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          {showPercentage && (
            <Badge variant={getBadgeVariant()} className="text-xs px-1.5 py-0">
              {percentage.toFixed(0)}%
            </Badge>
          )}
        </div>
      )}
      <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
        <div
          className={cn("h-full transition-all", getStatusColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current.toLocaleString()}</span>
        <span>/ {max.toLocaleString()}</span>
      </div>
    </div>
  );
}

interface LimitStatusBadgeProps {
  current: number;
  max: number;
  type?: "runs" | "cost";
}

export function LimitStatusBadge({ current, max, type = "runs" }: LimitStatusBadgeProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  if (percentage >= 100) {
    return (
      <Badge variant="destructive" className="text-xs">
        {type === "cost" ? "Cost" : "Run"} Cap Hit
      </Badge>
    );
  }

  if (percentage >= 80) {
    return (
      <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
        {percentage.toFixed(0)}% used
      </Badge>
    );
  }

  if (percentage >= 60) {
    return (
      <Badge variant="outline" className="text-xs">
        {percentage.toFixed(0)}% used
      </Badge>
    );
  }

  return null;
}
