import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GridDemandResponse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/grid-os")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Demand Response</h1>
              <p className="text-muted-foreground">DR programs, enrollments, and dispatch</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">8</p>
              <Badge variant="outline" className="mt-2">Running</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enrolled Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">2,456</p>
              <Badge variant="outline" className="mt-2">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">45.8 MW</p>
              <Badge variant="outline" className="mt-2">Ready</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>DR Programs</CardTitle>
            <CardDescription>Active demand response programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Peak Shaving Program</p>
                  <p className="text-sm text-muted-foreground">845 customers • 15.2 MW capacity</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Load Shifting Initiative</p>
                  <p className="text-sm text-muted-foreground">1,234 customers • 22.5 MW capacity</p>
                </div>
                <Badge>Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full">
          <TrendingUp className="h-4 w-4 mr-2" />
          Initiate DR Event
        </Button>
      </div>
    </div>
  );
}
