import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  FileText,
  Play,
  Settings,
  Activity,
  Bell,
  History
} from "lucide-react";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";
import { SettlementContractModal } from "./SettlementContractModal";
import { AttributionRulesPanel } from "./AttributionRulesPanel";
import { UsageTrackingPanel } from "./UsageTrackingPanel";
import { PayoutHistoryPanel } from "./PayoutHistoryPanel";
import { BlenderNotificationsPanel } from "./BlenderNotificationsPanel";
import { format } from "date-fns";

interface SettlementContract {
  id: string;
  name: string;
  trigger_type: string;
  trigger_conditions: any;
  distribution_logic: any;
  is_active: boolean;
  last_triggered_at: string | null;
  total_distributed: number;
  created_at: string;
}

interface SettlementExecution {
  id: string;
  contract_id: string;
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
  amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  participant?: {
    name: string;
  };
}

interface DealRoomSettlementProps {
  dealRoomId: string;
  isAdmin: boolean;
}

const triggerTypeLabels: Record<string, { label: string; color: string }> = {
  revenue_received: { label: "Revenue Received", color: "bg-emerald-500/20 text-emerald-600" },
  invoice_paid: { label: "Invoice Paid", color: "bg-blue-500/20 text-blue-600" },
  savings_verified: { label: "Savings Verified", color: "bg-purple-500/20 text-purple-600" },
  milestone_hit: { label: "Milestone Hit", color: "bg-amber-500/20 text-amber-600" },
  usage_threshold: { label: "Usage Threshold", color: "bg-cyan-500/20 text-cyan-600" },
  time_based: { label: "Time-Based", color: "bg-pink-500/20 text-pink-600" },
  manual_approval: { label: "Manual Approval", color: "bg-muted text-muted-foreground" },
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-600", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/20 text-blue-600", icon: Play },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-destructive/20 text-destructive", icon: AlertCircle },
};

export const DealRoomSettlement = ({ 
  dealRoomId, 
  isAdmin 
}: DealRoomSettlementProps) => {
  const [contracts, setContracts] = useState<SettlementContract[]>([]);
  const [executions, setExecutions] = useState<SettlementExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettlements();
  }, [dealRoomId]);

  const fetchSettlements = async () => {
    setLoading(true);

    const { data: contractData } = await supabase
      .from("settlement_contracts")
      .select("*")
      .eq("deal_room_id", dealRoomId)
      .order("created_at", { ascending: false });

    if (contractData) setContracts(contractData);

    if (contractData && contractData.length > 0) {
      const contractIds = contractData.map(c => c.id);
      const { data: execData } = await supabase
        .from("settlement_executions")
        .select("*")
        .in("contract_id", contractIds)
        .order("created_at", { ascending: false });

      if (execData) setExecutions(execData);
    }

    setLoading(false);
  };

  const totalDistributed = contracts.reduce((sum, c) => sum + (c.total_distributed || 0), 0);
  const activeContracts = contracts.filter(c => c.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading settlements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-medium">Smart Contracts</span>
            <BlenderKnowledgeHelper conceptKey="smart_contract_settlement" />
          </div>
          <p className="text-3xl font-bold">{contracts.length}</p>
          <p className="text-sm text-muted-foreground">
            {activeContracts} active
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">Total Distributed</span>
          </div>
          <p className="text-3xl font-bold text-emerald-500">
            ${totalDistributed.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Across all settlements
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Executions</span>
          </div>
          <p className="text-3xl font-bold text-blue-500">{executions.length}</p>
          <p className="text-sm text-muted-foreground">
            Settlement events
          </p>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          How Smart Contract Settlement Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-2">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="font-medium text-sm">1. Define Rules</p>
            <p className="text-xs text-muted-foreground mt-1">
              Set trigger conditions and distribution logic
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="p-3 rounded-full bg-amber-500/10 w-fit mx-auto mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="font-medium text-sm">2. Monitor</p>
            <p className="text-xs text-muted-foreground mt-1">
              System watches for trigger events
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="p-3 rounded-full bg-blue-500/10 w-fit mx-auto mb-2">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <p className="font-medium text-sm">3. Execute</p>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically calculate distributions
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="p-3 rounded-full bg-emerald-500/10 w-fit mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="font-medium text-sm">4. Payout</p>
            <p className="text-xs text-muted-foreground mt-1">
              Funds flow to participants
            </p>
          </div>
        </div>
      </Card>

      {/* Settlement Tabs */}
      <Tabs defaultValue="contracts" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="contracts" className="gap-2">
            <Zap className="w-4 h-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="w-4 h-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <Activity className="w-4 h-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="mt-6">
          {/* Contracts List */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Settlement Contracts</h3>
            {isAdmin && (
              <SettlementContractModal dealRoomId={dealRoomId} onCreated={fetchSettlements} />
            )}
          </div>
          {contracts.length === 0 ? (
            <Card className="p-8 text-center">
              <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Settlement Contracts</h3>
              <p className="text-muted-foreground mb-4">
                Settlement contracts define how value flows to participants automatically.
              </p>
              {isAdmin && (
                <SettlementContractModal dealRoomId={dealRoomId} onCreated={fetchSettlements} />
              )}
            </Card>
          ) : (
          <div className="space-y-4">
            {contracts.map((contract) => {
              const triggerConfig = triggerTypeLabels[contract.trigger_type] || triggerTypeLabels.manual_approval;
              const contractExecutions = executions.filter(e => e.contract_id === contract.id);
              
              return (
                <Card key={contract.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{contract.name}</h4>
                        <Badge className={triggerConfig.color}>
                          {triggerConfig.label}
                        </Badge>
                        {!contract.is_active && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {format(new Date(contract.created_at), "MMM d, yyyy")}
                        {contract.last_triggered_at && (
                          <> • Last triggered {format(new Date(contract.last_triggered_at), "MMM d, yyyy")}</>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-500">
                        ${(contract.total_distributed || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">distributed</p>
                    </div>
                  </div>

                  {/* Recent Executions */}
                  {contractExecutions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Recent Executions</p>
                      <div className="space-y-2">
                        {contractExecutions.slice(0, 3).map((exec) => {
                          const status = statusConfig[exec.status] || statusConfig.pending;
                          const StatusIcon = status.icon;
                          return (
                            <div key={exec.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <StatusIcon className="w-4 h-4" />
                                <Badge className={status.color}>{status.label}</Badge>
                                <span className="text-muted-foreground">
                                  {format(new Date(exec.created_at), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <span className="font-medium">
                                ${exec.total_amount.toLocaleString()} {exec.currency}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <AttributionRulesPanel dealRoomId={dealRoomId} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <UsageTrackingPanel dealRoomId={dealRoomId} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <PayoutHistoryPanel dealRoomId={dealRoomId} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <BlenderNotificationsPanel dealRoomId={dealRoomId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};