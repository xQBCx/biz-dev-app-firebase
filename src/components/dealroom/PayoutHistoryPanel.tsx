import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Loader2,
  Receipt,
  Users
} from "lucide-react";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";
import { format } from "date-fns";

interface PayoutHistoryPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
}

interface SettlementExecution {
  id: string;
  contract_id: string;
  contract_name?: string;
  trigger_event: any;
  total_amount: number;
  currency: string;
  status: string;
  executed_at: string | null;
  created_at: string;
}

interface SettlementPayout {
  id: string;
  execution_id: string;
  participant_id: string;
  participant_name?: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  payment_reference: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-600", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/20 text-blue-600", icon: Clock },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-destructive/20 text-destructive", icon: AlertCircle },
};

export const PayoutHistoryPanel = ({
  dealRoomId,
  isAdmin,
}: PayoutHistoryPanelProps) => {
  const [executions, setExecutions] = useState<SettlementExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<SettlementExecution | null>(null);
  const [payouts, setPayouts] = useState<SettlementPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchExecutions();
  }, [dealRoomId]);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      // First get contracts for this deal room
      const { data: contracts } = await supabase
        .from("settlement_contracts")
        .select("id, name")
        .eq("deal_room_id", dealRoomId);

      if (!contracts || contracts.length === 0) {
        setLoading(false);
        return;
      }

      const contractIds = contracts.map(c => c.id);
      const contractMap = new Map(contracts.map(c => [c.id, c.name]));

      // Fetch executions
      const { data: execData } = await supabase
        .from("settlement_executions")
        .select("*")
        .in("contract_id", contractIds)
        .order("created_at", { ascending: false });

      if (execData) {
        const execWithNames = execData.map((exec: any) => ({
          ...exec,
          contract_name: contractMap.get(exec.contract_id) || "Unknown Contract",
        }));
        setExecutions(execWithNames);
      }
    } catch (error) {
      console.error("Error fetching executions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutDetails = async (execution: SettlementExecution) => {
    setSelectedExecution(execution);
    setDetailLoading(true);
    
    try {
      const { data: payoutData } = await supabase
        .from("settlement_payouts")
        .select(`
          *,
          deal_room_participants(
            profiles(full_name, email)
          )
        `)
        .eq("execution_id", execution.id)
        .order("amount", { ascending: false });

      if (payoutData) {
        const payoutsWithNames = payoutData.map((p: any) => ({
          ...p,
          participant_name: 
            p.deal_room_participants?.profiles?.full_name || 
            p.deal_room_participants?.profiles?.email || 
            "Unknown",
        }));
        setPayouts(payoutsWithNames);
      }
    } catch (error) {
      console.error("Error fetching payout details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPaid = executions
    .filter(e => e.status === "completed")
    .reduce((sum, e) => sum + e.total_amount, 0);

  const pendingAmount = executions
    .filter(e => e.status === "pending" || e.status === "processing")
    .reduce((sum, e) => sum + e.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Payout History</h3>
        <BlenderKnowledgeHelper conceptKey="smart_contract_settlement" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span className="font-medium">Total Settlements</span>
          </div>
          <p className="text-3xl font-bold">{executions.length}</p>
          <p className="text-sm text-muted-foreground">Executed payouts</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">Total Paid</span>
          </div>
          <p className="text-3xl font-bold text-emerald-500">
            ${totalPaid.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Completed payouts</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="font-medium">Pending</span>
          </div>
          <p className="text-3xl font-bold text-amber-500">
            ${pendingAmount.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Awaiting processing</p>
        </Card>
      </div>

      {/* Executions Table */}
      {executions.length === 0 ? (
        <Card className="p-8 text-center">
          <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Payouts Yet</h3>
          <p className="text-muted-foreground">
            Payouts will appear here when settlement contracts are triggered
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((execution) => {
                const status = statusConfig[execution.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={execution.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {format(new Date(execution.created_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(execution.created_at), "h:mm a")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{execution.contract_name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-lg">
                        ${execution.total_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {execution.currency}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchPayoutDetails(execution)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Payout Details Dialog */}
      <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Payout Details
            </DialogTitle>
          </DialogHeader>

          {selectedExecution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-3">
                  <p className="text-sm text-muted-foreground">Contract</p>
                  <p className="font-medium">{selectedExecution.contract_name}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-lg text-emerald-500">
                    ${selectedExecution.total_amount.toLocaleString()}
                  </p>
                </Card>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participant Payouts
                </h4>

                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : payouts.length === 0 ? (
                  <Card className="p-4 text-center text-muted-foreground">
                    No payout records found
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {payouts.map((payout) => {
                      const payoutStatus = statusConfig[payout.status] || statusConfig.pending;
                      return (
                        <Card key={payout.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{payout.participant_name}</p>
                              {payout.payment_reference && (
                                <p className="text-xs text-muted-foreground">
                                  Ref: {payout.payment_reference}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={payoutStatus.color}>
                                {payoutStatus.label}
                              </Badge>
                              <p className="font-bold text-emerald-500">
                                ${payout.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
