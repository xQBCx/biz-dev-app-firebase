import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatMapCell {
  x: string;
  y: string;
  value: number;
}

interface HeatMapProps {
  title?: string;
  description?: string;
  data: HeatMapCell[];
  xLabels: string[];
  yLabels: string[];
  className?: string;
  colorRange?: { min: string; max: string };
}

export function HeatMap({
  title,
  description,
  data,
  xLabels,
  yLabels,
  className,
  colorRange = { min: "hsl(0, 0%, 90%)", max: "hsl(0, 0%, 20%)" },
}: HeatMapProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);

  const getColor = (value: number) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue || 1);
    // Interpolate between min and max colors based on value
    const opacity = normalizedValue * 0.8 + 0.2;
    return `hsl(0, 0%, ${100 - normalizedValue * 80}%)`;
  };

  const getCellValue = (x: string, y: string) => {
    const cell = data.find((d) => d.x === x && d.y === y);
    return cell?.value ?? 0;
  };

  const content = (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* X-axis labels */}
          <div className="flex">
            <div className="w-20 shrink-0" />
            {xLabels.map((label) => (
              <div
                key={label}
                className="flex-1 min-w-[40px] text-center text-xs text-muted-foreground px-1 truncate"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          {yLabels.map((yLabel) => (
            <div key={yLabel} className="flex items-center">
              <div className="w-20 shrink-0 text-xs text-muted-foreground pr-2 truncate text-right">
                {yLabel}
              </div>
              {xLabels.map((xLabel) => {
                const value = getCellValue(xLabel, yLabel);
                return (
                  <Tooltip key={`${xLabel}-${yLabel}`}>
                    <TooltipTrigger asChild>
                      <div
                        className="flex-1 min-w-[40px] aspect-square m-0.5 rounded cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: getColor(value) }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {yLabel}, {xLabel}: <strong>{value}</strong>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end mt-4 gap-2">
            <span className="text-xs text-muted-foreground">Less</span>
            <div className="flex gap-0.5">
              {[0, 0.25, 0.5, 0.75, 1].map((val) => (
                <div
                  key={val}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: `hsl(0, 0%, ${100 - val * 80}%)` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
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
