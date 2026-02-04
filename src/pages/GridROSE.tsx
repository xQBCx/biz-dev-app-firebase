import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridROSE() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Server className="h-8 w-8 text-pink-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ROSE Computing</h1>
              <p className="text-muted-foreground">Distributed workload computing infrastructure</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compute Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">248</p>
              <Badge variant="outline" className="mt-2">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1.5 PF</p>
              <Badge variant="outline" className="mt-2">Petaflops</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Workloads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">42</p>
              <Badge variant="outline" className="mt-2">Running</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">73%</p>
              <Badge variant="outline" className="mt-2">Optimal</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Distributed Computing Infrastructure</CardTitle>
            <CardDescription>ROSE edge computing network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-muted-foreground">Computing infrastructure visualization placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Compute Workloads</CardTitle>
            <CardDescription>Current processing tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Load Flow Analysis</p>
                  <p className="text-sm text-muted-foreground">32 nodes • 156 GFLOPS</p>
                </div>
                <Badge>Running</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">State Estimation</p>
                  <p className="text-sm text-muted-foreground">64 nodes • 298 GFLOPS</p>
                </div>
                <Badge>Running</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Contingency Analysis</p>
                  <p className="text-sm text-muted-foreground">48 nodes • 212 GFLOPS</p>
                </div>
                <Badge>Running</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
