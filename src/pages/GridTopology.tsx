import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, Zap, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridTopology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Grid Topology</h1>
              <p className="text-muted-foreground">Real-time grid visualization and network status</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Network Overview</CardTitle>
            <CardDescription>Interactive grid topology map</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-muted-foreground">Grid topology visualization placeholder</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Substations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
              <Badge variant="outline" className="mt-2">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transformers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">48</p>
              <Badge variant="outline" className="mt-2">Online</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Circuit Breakers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">156</p>
              <Badge variant="outline" className="mt-2">Operational</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
