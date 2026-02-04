import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

interface PipelineChartProps {
  stages: PipelineStage[];
}

export const PipelineChart = ({ stages }: PipelineChartProps) => {
  const total = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Pipeline</CardTitle>
        <CardDescription>Current status of all active deals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage) => {
          const percentage = total > 0 ? (stage.count / total) * 100 : 0;
          
          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.name}</span>
                <span className="text-muted-foreground">
                  {stage.count} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
