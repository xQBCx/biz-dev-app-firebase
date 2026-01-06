import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  FileEdit, 
  Plus, 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface ChangeOrder {
  id: string;
  change_type: string;
  entity_id: string | null;
  entity_type: string | null;
  change_description: string;
  old_value: any;
  new_value: any;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string | null;
  approved_by: string[];
  rejected_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  resolved_at: string | null;
}

interface ChangeOrderPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
  contractLocked: boolean;
}

const changeTypeLabels: Record<string, string> = {
  deliverable: "Deliverable Change",
  term: "Term Amendment",
  formulation: "Formulation Update",
  participant: "Participant Change"
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-600", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive", icon: XCircle }
};

export const ChangeOrderPanel = ({
  dealRoomId,
  isAdmin,
  contractLocked
}: ChangeOrderPanelProps) => {
  const { user } = useAuth();
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newOrder, setNewOrder] = useState({
    change_type: 'deliverable',
    change_description: ''
  });

  useEffect(() => {
    fetchChangeOrders();
  }, [dealRoomId]);

  const fetchChangeOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("deal_room_change_orders")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type cast the data properly
      const typedData = (data || []).map(order => ({
        ...order,
        approved_by: Array.isArray(order.approved_by) ? order.approved_by : []
      })) as ChangeOrder[];
      
      setChangeOrders(typedData);
    } catch (error) {
      console.error("Error fetching change orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChangeOrder = async () => {
    if (!newOrder.change_description.trim()) {
      toast.error("Please describe the change");
      return;
    }

    try {
      const { error } = await supabase
        .from("deal_room_change_orders")
        .insert({
          deal_room_id: dealRoomId,
          change_type: newOrder.change_type,
          change_description: newOrder.change_description,
          requested_by: user?.id
        });

      if (error) throw error;
      toast.success("Change order created");
      setShowAddDialog(false);
      setNewOrder({ change_type: 'deliverable', change_description: '' });
      fetchChangeOrders();
    } catch (error) {
      console.error("Error creating change order:", error);
      toast.error("Failed to create change order");
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const updateData: any = {
        status,
        resolved_at: new Date().toISOString()
      };

      if (status === 'rejected' && reason) {
        updateData.rejected_by = user?.id;
        updateData.rejection_reason = reason;
      }

      if (status === 'approved') {
        // Get current order to update approved_by array
        const currentOrder = changeOrders.find(o => o.id === orderId);
        updateData.approved_by = [...(currentOrder?.approved_by || []), user?.id];
      }

      const { error } = await supabase
        .from("deal_room_change_orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;
      toast.success(`Change order ${status}`);
      fetchChangeOrders();
    } catch (error) {
      console.error("Error updating change order:", error);
      toast.error("Failed to update change order");
    }
  };

  if (!contractLocked) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileEdit className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Change Orders</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Change orders are only needed after the contract is locked.</p>
          <p className="text-sm mt-2">
            While unlocked, you can edit deliverables and terms directly.
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  const pendingOrders = changeOrders.filter(o => o.status === 'pending');

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Change Orders</h3>
          {pendingOrders.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-600">
              {pendingOrders.length} pending
            </Badge>
          )}
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Request Change
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Change Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Contract is locked</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Changes require approval from the deal room admin.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Change Type</label>
                <Select
                  value={newOrder.change_type}
                  onValueChange={(v) => setNewOrder({ ...newOrder, change_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deliverable">Deliverable Change</SelectItem>
                    <SelectItem value="term">Term Amendment</SelectItem>
                    <SelectItem value="formulation">Formulation Update</SelectItem>
                    <SelectItem value="participant">Participant Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description of Change</label>
                <Textarea
                  placeholder="Describe what you want to change and why..."
                  value={newOrder.change_description}
                  onChange={(e) => setNewOrder({ ...newOrder, change_description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={createChangeOrder}>Submit Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {changeOrders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No change orders yet.</p>
          <p className="text-sm mt-1">Request a change when you need to modify locked terms or deliverables.</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            {changeOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              
              return (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {changeTypeLabels[order.change_type] || order.change_type}
                        </Badge>
                        <Badge className={statusConfig[order.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[order.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm mb-3">{order.change_description}</p>

                  {order.status === 'rejected' && order.rejection_reason && (
                    <div className="p-2 bg-destructive/10 rounded-lg mb-3">
                      <p className="text-sm text-destructive">
                        <strong>Rejection reason:</strong> {order.rejection_reason}
                      </p>
                    </div>
                  )}

                  {isAdmin && order.status === 'pending' && (
                    <div className="flex gap-2 border-t pt-3">
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'approved')}
                        className="gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = prompt("Reason for rejection:");
                          if (reason) {
                            updateOrderStatus(order.id, 'rejected', reason);
                          }
                        }}
                        className="gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
