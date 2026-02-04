import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridMarket() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Market Operations</h1>
              <p className="text-muted-foreground">Energy trading, settlements, and pricing</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current LMP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$45.25</p>
              <Badge variant="outline" className="mt-2">/MWh</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Day-Ahead Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$48.50</p>
              <Badge variant="outline" className="mt-2">/MWh</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$28.5K</p>
              <Badge variant="outline" className="mt-2">USD</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ancillary Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$3.2K</p>
              <Badge variant="outline" className="mt-2">USD</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Energy Market Prices</CardTitle>
            <CardDescription>Real-time and day-ahead market pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-muted-foreground">Market price chart placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Trading Positions</CardTitle>
            <CardDescription>Current market positions and settlements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Day-Ahead Energy</p>
                  <p className="text-sm text-muted-foreground">250 MWh @ $48.50/MWh</p>
                </div>
                <Badge>Cleared</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Frequency Regulation</p>
                  <p className="text-sm text-muted-foreground">15 MW capacity</p>
                </div>
                <Badge>Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
