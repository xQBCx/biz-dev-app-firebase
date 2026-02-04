import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridGeneration() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Generation Control</h1>
              <p className="text-muted-foreground">Manage generators, DERs, and dispatch</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Generators</CardTitle>
            <CardDescription>Real-time generation assets and control</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Generator Unit 1</p>
                  <p className="text-sm text-muted-foreground">Natural Gas - 50 MW</p>
                </div>
                <Badge>Online</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Solar Array A</p>
                  <p className="text-sm text-muted-foreground">Solar PV - 25 MW</p>
                </div>
                <Badge>Generating</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Wind Farm B</p>
                  <p className="text-sm text-muted-foreground">Wind - 30 MW</p>
                </div>
                <Badge>Generating</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full">
          <Zap className="h-4 w-4 mr-2" />
          Dispatch New Generator
        </Button>
      </div>
    </div>
  );
}
