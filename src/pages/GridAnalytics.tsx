import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridAnalytics() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics & Reports</h1>
              <p className="text-muted-foreground">Forecasting, analytics, and performance reports</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Load Forecast (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">285 MW</p>
              <Badge variant="outline" className="mt-2">Peak @ 6PM</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Solar Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">42 MW</p>
              <Badge variant="outline" className="mt-2">Peak @ 1PM</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wind Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">35 MW</p>
              <Badge variant="outline" className="mt-2">Steady</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Load Forecast</CardTitle>
            <CardDescription>24-hour ahead load prediction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-muted-foreground">Load forecast chart placeholder</p>
            </div>
          </CardContent>
        </Card>

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
