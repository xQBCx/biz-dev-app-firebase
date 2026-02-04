import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft, Zap, Sun, Wind, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KPIGrid, TimeSeriesChart, DistributionChart, HeatMap } from "@/components/analytics";

const loadForecastData = [
  { date: "2024-01-01", load: 245, solar: 35, wind: 28 },
  { date: "2024-01-02", load: 258, solar: 42, wind: 32 },
  { date: "2024-01-03", load: 272, solar: 38, wind: 25 },
  { date: "2024-01-04", load: 285, solar: 45, wind: 30 },
  { date: "2024-01-05", load: 268, solar: 40, wind: 35 },
  { date: "2024-01-06", load: 255, solar: 48, wind: 28 },
  { date: "2024-01-07", load: 290, solar: 52, wind: 38 },
];

const generationMixData = [
  { name: "Solar", value: 42 },
  { name: "Wind", value: 35 },
  { name: "Gas", value: 15 },
  { name: "Hydro", value: 8 },
];

const hourlyLabels = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatMapData = dayLabels.flatMap((day) =>
  hourlyLabels.map((hour) => ({
    x: hour,
    y: day,
    value: Math.floor(Math.random() * 100),
  }))
);

export default function GridAnalytics() {
  const navigate = useNavigate();

  const kpiItems = [
    { title: "Load Forecast (24h)", value: "285 MW", subtitle: "Peak @ 6PM", icon: Zap, trend: { value: 8, label: "vs yesterday" } },
    { title: "Solar Forecast", value: "42 MW", subtitle: "Peak @ 1PM", icon: Sun, trend: { value: 15, label: "vs yesterday" } },
    { title: "Wind Forecast", value: "35 MW", subtitle: "Steady", icon: Wind, trend: { value: -5, label: "vs yesterday" } },
    { title: "System Reliability", value: "99.97%", subtitle: "Last 30 days", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Analytics & Reports</h1>
              <p className="text-sm text-muted-foreground">Forecasting and performance reports</p>
            </div>
          </div>
        </div>

        <KPIGrid items={kpiItems} columns={4} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimeSeriesChart
              title="Load & Generation Forecast"
              description="24-hour ahead prediction"
              data={loadForecastData}
              series={[
                { key: "load", label: "Load (MW)", color: "hsl(0, 0%, 30%)" },
                { key: "solar", label: "Solar (MW)", color: "hsl(45, 90%, 50%)" },
                { key: "wind", label: "Wind (MW)", color: "hsl(200, 70%, 50%)" },
              ]}
              type="area"
              height={320}
            />
          </div>
          <DistributionChart
            title="Generation Mix"
            description="Current energy sources"
            data={generationMixData}
            type="donut"
            height={320}
          />
        </div>

        <HeatMap
          title="Load Intensity by Time"
          description="Weekly load patterns"
          data={heatMapData}
          xLabels={hourlyLabels}
          yLabels={dayLabels}
        />

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">System Reliability</p>
                <p className="text-2xl font-bold">99.97%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Load Factor</p>
                <p className="text-2xl font-bold">82.5%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Peak Demand</p>
                <p className="text-2xl font-bold">312 MW</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Energy Served</p>
                <p className="text-2xl font-bold">4.2 GWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
