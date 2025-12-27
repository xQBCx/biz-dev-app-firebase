import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DistributionDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface DistributionChartProps {
  title?: string;
  description?: string;
  data: DistributionDataPoint[];
  type?: "pie" | "donut";
  showLegend?: boolean;
  className?: string;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "hsl(0, 0%, 20%)",
  "hsl(0, 0%, 35%)",
  "hsl(0, 0%, 50%)",
  "hsl(0, 0%, 65%)",
  "hsl(0, 0%, 80%)",
];

export function DistributionChart({
  title,
  description,
  data,
  type = "donut",
  showLegend = true,
  className,
  height = 300,
  colors = DEFAULT_COLORS,
}: DistributionChartProps) {
  const chartConfig: ChartConfig = data.reduce(
    (acc, item, index) => ({
      ...acc,
      [item.name]: {
        label: item.name,
        color: item.color || colors[index % colors.length],
      },
    }),
    {}
  );

  const innerRadius = type === "donut" ? "60%" : 0;

  const content = (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius="80%"
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        )}
      </PieChart>
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
