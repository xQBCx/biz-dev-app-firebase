import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, DollarSign, User, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface WorkOrder {
  id: string;
  order_number: string;
  issue_type: string;
  issue_description: string | null;
  location_address: string | null;
  priority: string;
  status: string;
  estimated_cost: number | null;
  total_cost: number | null;
  materials_advance_amount: number | null;
  escrow_funded_at: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  created_at: string;
  service_franchises?: { franchise_name: string };
  service_vendors?: { business_name: string };
  fleet_partners?: { partner_name: string };
}

export const FleetWorkOrdersPanel = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['fleet-work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet_work_orders')
        .select(`
          *,
          service_franchises (franchise_name),
          service_vendors (business_name),
          fleet_partners (partner_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as WorkOrder[];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'assigned': return 'outline';
      case 'materials_funded': return 'outline';
      case 'in_progress': return 'default';
      case 'pending_verification': return 'secondary';
      case 'completed': return 'default';
      case 'disputed': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'destructive';
      case 'high': return 'destructive';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading work orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Work Orders</h2>
        <p className="text-sm text-muted-foreground">Jobs assigned to vendors with escrow-backed payments</p>
      </div>

      {orders?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Work Orders Yet</h3>
            <p className="text-muted-foreground">Work orders will be created from detected issues in fleet data</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardContent className="py-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold">{order.order_number}</span>
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      {order.service_franchises && (
                        <Badge variant="outline">{order.service_franchises.franchise_name}</Badge>
                      )}
                    </div>
                    <div className="text-sm font-medium">{order.issue_type}</div>
                    {order.issue_description && (
                      <p className="text-sm text-muted-foreground">{order.issue_description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {order.location_address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.location_address}
                        </span>
                      )}
                      {order.service_vendors && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.service_vendors.business_name}
                        </span>
                      )}
                      {order.fleet_partners && (
                        <span className="text-xs">via {order.fleet_partners.partner_name}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </span>
                      {order.completed_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Completed {format(new Date(order.completed_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      {order.total_cost && (
                        <div className="flex items-center gap-1 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {order.total_cost.toLocaleString()}
                        </div>
                      )}
                      {order.materials_advance_amount && order.status !== 'pending' && (
                        <div className="text-xs text-muted-foreground">
                          Advance: ${order.materials_advance_amount.toLocaleString()}
                        </div>
                      )}
                      {order.escrow_funded_at && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Escrow Funded
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button size="sm">Assign Vendor</Button>
                      )}
                      {order.status === 'pending_verification' && (
                        <Button size="sm" variant="default">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      {order.status === 'disputed' && (
                        <Button size="sm" variant="outline">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
