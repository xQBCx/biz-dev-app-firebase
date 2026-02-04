import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BarDataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarSeriesConfig {
  key: string;
  label: string;
  color: string;
}

interface BarChartProps {
  title?: string;
  description?: string;
  data: BarDataPoint[];
  series: BarSeriesConfig[];
  layout?: "vertical" | "horizontal";
  stacked?: boolean;
  showGrid?: boolean;
  className?: string;
  height?: number;
}

export function BarChart({
  title,
  description,
  data,
  series,
  layout = "vertical",
  stacked = false,
  showGrid = true,
  className,
  height = 300,
}: BarChartProps) {
  const chartConfig: ChartConfig = series.reduce(
    (acc, s) => ({
      ...acc,
      [s.key]: {
        label: s.label,
        color: s.color,
      },
    }),
    {}
  );

  const content = (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <RechartsBarChart
        data={data}
        layout={layout === "horizontal" ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />}
        {layout === "vertical" ? (
          <>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={100}
              className="text-xs text-muted-foreground"
            />
          </>
        )}
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={s.color}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
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
