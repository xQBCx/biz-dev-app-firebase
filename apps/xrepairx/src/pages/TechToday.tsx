import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, MapPin, Clock, CheckCircle } from "lucide-react";

export default function TechToday() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Today's Schedule</h1>
        <p className="text-muted-foreground">Your assigned work orders for today</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Today</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Map placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Overview
          </CardTitle>
          <CardDescription>Your optimized route for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[2/1] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No work orders assigned for today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Order List */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
          <CardDescription>Ordered by priority and proximity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No work orders for today</p>
            <p className="text-sm mt-2">Check back later for new assignments</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}