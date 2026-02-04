import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridEvents() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Event Management</h1>
              <p className="text-muted-foreground">Alarms, events, and outage tracking</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">2</p>
              <Badge variant="destructive" className="mt-2">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5</p>
              <Badge variant="outline" className="mt-2">Pending</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
              <Badge variant="outline" className="mt-2">Monitoring</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Low Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">28</p>
              <Badge variant="outline" className="mt-2">Logged</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Alarms</CardTitle>
            <CardDescription>Current system alarms and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div>
                  <p className="font-semibold">Transformer Overload - Substation 4</p>
                  <p className="text-sm text-muted-foreground">2 minutes ago</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div>
                  <p className="font-semibold">Voltage Deviation - Circuit B12</p>
                  <p className="text-sm text-muted-foreground">15 minutes ago</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Communication Lost - Meter Group 5</p>
                  <p className="text-sm text-muted-foreground">1 hour ago</p>
                </div>
                <Badge variant="outline">High</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
