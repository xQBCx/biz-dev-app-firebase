import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  iconClassName?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-bold mt-1 truncate">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {TrendIcon && (
                  <TrendIcon
                    className={cn(
                      "h-3 w-3",
                      trend.value > 0 && "text-emerald-500",
                      trend.value < 0 && "text-red-500",
                      trend.value === 0 && "text-muted-foreground"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.value > 0 && "text-emerald-500",
                    trend.value < 0 && "text-red-500",
                    trend.value === 0 && "text-muted-foreground"
                  )}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
                {trend.label && (
                  <span className="text-xs text-muted-foreground">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "p-2 sm:p-3 rounded-lg bg-primary/10 shrink-0",
                iconClassName
              )}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
