import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FunnelStage {
  name: string;
  value: number;
  color?: string;
}

interface FunnelChartProps {
  title?: string;
  description?: string;
  data: FunnelStage[];
  className?: string;
  showPercentage?: boolean;
  showConversion?: boolean;
}

const DEFAULT_COLORS = [
  "bg-primary",
  "bg-primary/80",
  "bg-primary/60",
  "bg-primary/40",
  "bg-primary/20",
];

export function FunnelChart({
  title,
  description,
  data,
  className,
  showPercentage = true,
  showConversion = true,
}: FunnelChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  const getConversionRate = (index: number) => {
    if (index === 0) return 100;
    return ((data[index].value / data[index - 1].value) * 100).toFixed(1);
  };

  const content = (
    <div className="space-y-3">
      {data.map((stage, index) => {
        const width = (stage.value / maxValue) * 100;
        const colorClass = DEFAULT_COLORS[index % DEFAULT_COLORS.length];

        return (
          <div key={stage.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate">{stage.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold">{stage.value.toLocaleString()}</span>
                {showPercentage && (
                  <span className="text-muted-foreground">
                    ({((stage.value / maxValue) * 100).toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-8 bg-muted rounded overflow-hidden">
              <div
                className={cn("h-full rounded transition-all duration-500", colorClass)}
                style={{ width: `${width}%` }}
              />
              {showConversion && index > 0 && (
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <span className="text-xs text-muted-foreground">
                    {getConversionRate(index)}% conv.
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (title) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-0">{content}</CardContent>
      </Card>
    );
  }

  return <div className={cn(className)}>{content}</div>;
}
