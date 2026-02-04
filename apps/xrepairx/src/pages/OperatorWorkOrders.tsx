import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OperatorWorkOrders() {
  const statuses = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "triage_in_progress", label: "Triage" },
    { value: "scheduled_visit", label: "Scheduled" },
    { value: "in_field", label: "In Field" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Manage maintenance and repair requests</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            {statuses.map((status) => (
              <TabsTrigger key={status.value} value={status.value}>
                {status.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {statuses.map((status) => (
          <TabsContent key={status.value} value={status.value}>
            <Card>
              <CardHeader>
                <CardTitle>{status.label} Work Orders</CardTitle>
                <CardDescription>
                  {status.value === "all"
                    ? "All work orders across all statuses"
                    : `Work orders with ${status.label.toLowerCase()} status`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No work orders found</p>
                  <Button variant="link" className="mt-2">
                    Create your first work order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}