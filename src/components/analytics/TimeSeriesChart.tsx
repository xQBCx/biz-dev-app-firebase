import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TimeSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

interface SeriesConfig {
  key: string;
  label: string;
  color: string;
}

interface TimeSeriesChartProps {
  title?: string;
  description?: string;
  data: TimeSeriesDataPoint[];
  series: SeriesConfig[];
  type?: "line" | "area";
  showGrid?: boolean;
  className?: string;
  height?: number;
}

export function TimeSeriesChart({
  title,
  description,
  data,
  series,
  type = "line",
  showGrid = true,
  className,
  height = 300,
}: TimeSeriesChartProps) {
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

  const ChartComponent = type === "area" ? AreaChart : LineChart;

  const content = (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <ChartComponent data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />}
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
          className="text-xs text-muted-foreground"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs text-muted-foreground"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.map((s) =>
          type === "area" ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )
        )}
      </ChartComponent>
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
