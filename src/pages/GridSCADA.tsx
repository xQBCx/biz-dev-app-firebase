import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridSCADA() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Radio className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SCADA / PMU</h1>
              <p className="text-muted-foreground">Real-time telemetry and synchrophasor data</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">45,678</p>
              <Badge variant="outline" className="mt-2">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PMU Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">24</p>
              <Badge variant="outline" className="mt-2">Synced</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">RTU Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">156/158</p>
              <Badge variant="outline" className="mt-2">Online</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">60/sec</p>
              <Badge variant="outline" className="mt-2">Normal</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Telemetry</CardTitle>
            <CardDescription>Real-time SCADA measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-muted-foreground">SCADA telemetry visualization placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phasor Measurement Units</CardTitle>
            <CardDescription>Synchrophasor data streams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">PMU-SUB-01</p>
                  <p className="text-sm text-muted-foreground">Substation 1 • 60 samples/sec</p>
                </div>
                <Badge>Synced</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">PMU-SUB-04</p>
                  <p className="text-sm text-muted-foreground">Substation 4 • 60 samples/sec</p>
                </div>
                <Badge>Synced</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
