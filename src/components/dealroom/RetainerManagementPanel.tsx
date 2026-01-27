import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, DollarSign, RefreshCw, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Database, Json } from "@/integrations/supabase/types";

interface RetainerManagementPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
}

type SettlementContract = Database["public"]["Tables"]["settlement_contracts"]["Row"];
type DealRoomEscrow = Database["public"]["Tables"]["deal_room_escrow"]["Row"];

interface Participant {
  id: string;
  name: string;
  email: string;
  user_id: string | null;
  wallet_address: string | null;
}

export function RetainerManagementPanel({ dealRoomId, isAdmin }: RetainerManagementPanelProps) {
  const queryClient = useQueryClient();
  const [newRetainer, setNewRetainer] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    priority: "1",
    recipientId: "" // participant ID who receives the payout
  });

  // Fetch participants for recipient selection
  const { data: participants } = useQuery({
    queryKey: ["deal-room-participants", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_room_participants")
        .select("id, name, email, user_id, wallet_address")
        .eq("deal_room_id", dealRoomId)
        .order("name");

      if (error) throw error;
      return data as Participant[];
    }
  });

  // Fetch retainer-type settlement contracts
  const { data: retainers, isLoading } = useQuery({
    queryKey: ["retainer-contracts", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settlement_contracts")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .eq("revenue_source_type", "retainer")
        .order("payout_priority", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Fetch escrow balance
  const { data: escrow } = useQuery({
    queryKey: ["deal-room-escrow", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_room_escrow")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    }
  });

  // Create retainer contract
  const createRetainer = useMutation({
    mutationFn: async () => {
      const triggerConditions: Record<string, string> = {
        schedule: newRetainer.frequency === "monthly" ? "0 0 1 * *" : 
                  newRetainer.frequency === "weekly" ? "0 0 * * 0" : "0 0 * * *"
      };

      // Find recipient participant details
      const recipient = participants?.find(p => p.id === newRetainer.recipientId);

      const { error } = await supabase
        .from("settlement_contracts")
        .insert([{
          deal_room_id: dealRoomId,
          name: newRetainer.name,
          trigger_type: "time_based" as const,
          trigger_conditions: triggerConditions as unknown as Json,
          distribution_logic: { 
            type: "fixed",
            amount: parseFloat(newRetainer.amount),
            recipient_participant_id: newRetainer.recipientId,
            recipient_user_id: recipient?.user_id || null,
            recipient_name: recipient?.name || null,
            recipient_wallet: recipient?.wallet_address || null
          } as unknown as Json,
          payout_priority: parseInt(newRetainer.priority),
          revenue_source_type: "retainer",
          is_active: true
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retainer-contracts", dealRoomId] });
      toast.success("Retainer contract created");
      setNewRetainer({ name: "", amount: "", frequency: "monthly", priority: "1", recipientId: "" });
    },
    onError: (error) => {
      toast.error(`Failed to create retainer: ${error.message}`);
    }
  });

  // Execute retainer payout
  const executeRetainer = useMutation({
    mutationFn: async (contractId: string) => {
      const { error } = await supabase.functions.invoke("settlement-execute", {
        body: { contract_id: contractId, force_execute: true }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retainer-contracts", dealRoomId] });
      queryClient.invalidateQueries({ queryKey: ["deal-room-escrow", dealRoomId] });
      toast.success("Retainer payout executed");
    },
    onError: (error) => {
      toast.error(`Failed to execute payout: ${error.message}`);
    }
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getPayoutAmount = (contract: SettlementContract): number => {
    const logic = contract.distribution_logic as Record<string, unknown> | null;
    if (logic && typeof logic.amount === "number") {
      return logic.amount;
    }
    return 0;
  };

  const getRecipientName = (contract: SettlementContract): string | null => {
    const logic = contract.distribution_logic as Record<string, unknown> | null;
    if (logic && typeof logic.recipient_name === "string") {
      return logic.recipient_name;
    }
    return null;
  };

  const getEscrowBalance = (escrow: DealRoomEscrow | null | undefined): number => {
    if (!escrow) return 0;
    return (escrow.total_deposited || 0) - (escrow.total_released || 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Retainer Management
            </CardTitle>
            <CardDescription>
              Recurring payments with priority sequencing
            </CardDescription>
          </div>
          {escrow && (
            <Badge variant={escrow.workflows_paused ? "destructive" : "secondary"}>
              Escrow: {formatCurrency(getEscrowBalance(escrow))}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Escrow Warning */}
        {escrow?.workflows_paused && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Workflows paused - Escrow below minimum threshold ({formatCurrency(escrow.minimum_balance_threshold || 0)})
            </span>
          </div>
        )}

        {/* Active Retainers */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Active Retainers</h4>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : retainers?.length === 0 ? (
            <div className="text-sm text-muted-foreground">No retainer contracts configured</div>
          ) : (
            <div className="space-y-2">
              {retainers?.map((retainer) => (
                <div 
                  key={retainer.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      P{retainer.payout_priority || "-"}
                    </Badge>
                    <div>
                      <p className="font-medium">{retainer.name}</p>
                      {getRecipientName(retainer) && (
                        <p className="text-xs text-primary flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Recipient: {getRecipientName(retainer)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {retainer.last_triggered_at 
                          ? `Last: ${format(new Date(retainer.last_triggered_at), "MMM d, yyyy")}`
                          : "Never executed"}
                        {" • "}
                        {formatCurrency(retainer.total_distributed || 0)} distributed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">
                      {formatCurrency(getPayoutAmount(retainer))}
                    </span>
                    {isAdmin && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => executeRetainer.mutate(retainer.id)}
                        disabled={executeRetainer.isPending || escrow?.workflows_paused || false}
                      >
                        Execute
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Retainer */}
        {isAdmin && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Create Retainer Contract</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retainer-name">Contract Name</Label>
                <Input
                  id="retainer-name"
                  placeholder="e.g., OptimoIT Monthly Retainer"
                  value={newRetainer.name}
                  onChange={(e) => setNewRetainer(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retainer-amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="retainer-amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-9"
                    value={newRetainer.amount}
                    onChange={(e) => setNewRetainer(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select 
                  value={newRetainer.frequency}
                  onValueChange={(value) => setNewRetainer(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority (Lower = First)</Label>
                <Select 
                  value={newRetainer.priority}
                  onValueChange={(value) => setNewRetainer(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Highest</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5 - Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Recipient Participant</Label>
                <Select 
                  value={newRetainer.recipientId}
                  onValueChange={(value) => setNewRetainer(prev => ({ ...prev, recipientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select who receives the payout..." />
                  </SelectTrigger>
                  <SelectContent>
                    {participants?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{p.name}</span>
                          {p.wallet_address && (
                            <Badge variant="outline" className="text-[10px] ml-1">Wallet Ready</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newRetainer.recipientId && !participants?.find(p => p.id === newRetainer.recipientId)?.wallet_address && (
                  <p className="text-xs text-amber-600">
                    ⚠️ This participant hasn't set up their XDK wallet yet
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={() => createRetainer.mutate()}
              disabled={!newRetainer.name || !newRetainer.amount || !newRetainer.recipientId || createRetainer.isPending}
            >
              Create Retainer Contract
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
