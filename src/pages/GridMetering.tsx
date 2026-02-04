import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridMetering() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AMI / Metering</h1>
              <p className="text-muted-foreground">Advanced metering infrastructure and consumption</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Meters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">15,432</p>
              <Badge variant="outline" className="mt-2">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">15,401</p>
              <Badge variant="outline" className="mt-2">99.8%</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Load (MW)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">234.5</p>
              <Badge variant="outline" className="mt-2">Current</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Peak Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">298.2</p>
              <Badge variant="outline" className="mt-2">MW</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meter Data</CardTitle>
            <CardDescription>Recent interval readings and consumption data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-muted-foreground">Meter data visualization placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
