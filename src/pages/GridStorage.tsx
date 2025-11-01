import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Battery, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridStorage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Battery className="h-8 w-8 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Energy Storage</h1>
              <p className="text-muted-foreground">Battery systems, EVs, and storage optimization</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">150 MWh</p>
              <Badge variant="outline" className="mt-2">Available</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">State of Charge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">68%</p>
              <Badge variant="outline" className="mt-2">Charging</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
              <Badge variant="outline" className="mt-2">Online</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Peak Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">50 MW</p>
              <Badge variant="outline" className="mt-2">Discharge</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Battery Energy Storage Systems</CardTitle>
            <CardDescription>Active BESS installations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">BESS Unit A1</p>
                  <p className="text-sm text-muted-foreground">50 MWh capacity • 72% SOC</p>
                </div>
                <Badge>Charging</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">BESS Unit B2</p>
                  <p className="text-sm text-muted-foreground">75 MWh capacity • 65% SOC</p>
                </div>
                <Badge>Standby</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">EV Fleet Aggregation</p>
                  <p className="text-sm text-muted-foreground">25 MWh capacity • 68% SOC</p>
                </div>
                <Badge>Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
