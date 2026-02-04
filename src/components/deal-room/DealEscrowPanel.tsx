import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Shield, Lock, Unlock, DollarSign, Clock, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface DealEscrowPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
}

interface EscrowRecord {
  id: string;
  currency: string;
  status: string;
  escrow_type: string;
  total_deposited: number | null;
  total_released: number | null;
  escrow_address: string | null;
  release_conditions: any;
  created_at: string;
}

interface EscrowTransaction {
  id: string;
  escrow_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  from_address: string | null;
  to_address: string | null;
  created_at: string;
}

export const DealEscrowPanel = ({ dealRoomId, isAdmin }: DealEscrowPanelProps) => {
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEscrow, setNewEscrow] = useState({
    amount: "",
    currency: "USD",
    escrow_type: "milestone",
    release_conditions: ""
  });

  useEffect(() => {
    fetchEscrowData();
  }, [dealRoomId]);

  const fetchEscrowData = async () => {
    try {
      const [escrowRes, txRes] = await Promise.all([
        supabase
          .from("deal_room_escrow")
          .select("*")
          .eq("deal_room_id", dealRoomId)
          .order("created_at", { ascending: false }),
        supabase
          .from("escrow_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)
      ]);

      if (escrowRes.data) setEscrows(escrowRes.data);
      if (txRes.data) {
        const relevantTxs = txRes.data.filter(tx => 
          escrowRes.data?.some(e => e.id === tx.escrow_id)
        );
        setTransactions(relevantTxs);
      }
    } catch (error) {
      console.error("Error fetching escrow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async () => {
    if (!newEscrow.amount) {
      toast.error("Please enter an amount");
      return;
    }

    try {
      const { error } = await supabase.from("deal_room_escrow").insert({
        deal_room_id: dealRoomId,
        total_deposited: parseFloat(newEscrow.amount),
        currency: newEscrow.currency,
        escrow_type: newEscrow.escrow_type,
        release_conditions: newEscrow.release_conditions ? { description: newEscrow.release_conditions } : null,
        status: "pending"
      });

      if (error) throw error;
      toast.success("Escrow created successfully");
      setCreateDialogOpen(false);
      setNewEscrow({ amount: "", currency: "USD", escrow_type: "milestone", release_conditions: "" });
      fetchEscrowData();
    } catch (error) {
      console.error("Error creating escrow:", error);
      toast.error("Failed to create escrow");
    }
  };

  const updateEscrowStatus = async (escrowId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };

      const { error } = await supabase
        .from("deal_room_escrow")
        .update(updates)
        .eq("id", escrowId);

      if (error) throw error;
      toast.success(`Escrow ${newStatus}`);
      fetchEscrowData();
    } catch (error) {
      console.error("Error updating escrow:", error);
      toast.error("Failed to update escrow");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-muted text-muted-foreground", icon: Clock },
      funded: { color: "bg-primary/20 text-primary", icon: Lock },
      released: { color: "bg-green-500/20 text-green-600", icon: Unlock },
      disputed: { color: "bg-destructive/20 text-destructive", icon: AlertTriangle },
      refunded: { color: "bg-orange-500/20 text-orange-600", icon: ArrowDownLeft }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalEscrowed = escrows
    .filter(e => e.status === "funded")
    .reduce((sum, e) => sum + (e.total_deposited || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Escrow Management</CardTitle>
            </div>
            {isAdmin && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Escrow
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Escrow</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={newEscrow.amount}
                          onChange={(e) => setNewEscrow({ ...newEscrow, amount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={newEscrow.currency}
                          onValueChange={(v) => setNewEscrow({ ...newEscrow, currency: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="BTC">BTC</SelectItem>
                            <SelectItem value="ETH">ETH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Escrow Type</Label>
                      <Select
                        value={newEscrow.escrow_type}
                        onValueChange={(v) => setNewEscrow({ ...newEscrow, escrow_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="milestone">Milestone Payment</SelectItem>
                          <SelectItem value="security_deposit">Security Deposit</SelectItem>
                          <SelectItem value="revenue_share">Revenue Share Hold</SelectItem>
                          <SelectItem value="commission">Commission Escrow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Release Conditions</Label>
                      <Textarea
                        placeholder="Describe the conditions that must be met for release..."
                        value={newEscrow.release_conditions}
                        onChange={(e) => setNewEscrow({ ...newEscrow, release_conditions: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={createEscrow}>Create Escrow</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <CardDescription>Secure fund management for deal milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <div className="text-2xl font-bold text-primary">
                ${totalEscrowed.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total in Escrow</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{escrows.length}</div>
              <div className="text-sm text-muted-foreground">Active Escrows</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <div className="text-2xl font-bold text-green-600">
                {escrows.filter(e => e.status === "released").length}
              </div>
              <div className="text-sm text-muted-foreground">Released</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escrow List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escrow Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {escrows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No escrows created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {escrows.map((escrow) => (
                <div
                  key={escrow.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {escrow.currency} {escrow.total_deposited?.toLocaleString() || "0"}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {escrow.escrow_type?.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(escrow.status)}
                    {isAdmin && escrow.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateEscrowStatus(escrow.id, "funded")}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Fund
                      </Button>
                    )}
                    {isAdmin && escrow.status === "funded" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateEscrowStatus(escrow.id, "released")}
                      >
                        <Unlock className="h-3 w-3 mr-1" />
                        Release
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {tx.transaction_type === "deposit" ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    )}
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {tx.transaction_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.currency} • {tx.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${tx.amount?.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), "MMM d, HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
