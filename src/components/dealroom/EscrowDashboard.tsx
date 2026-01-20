import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Pause,
  Play,
  TrendingUp,
  History
} from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

interface EscrowDashboardProps {
  dealRoomId: string;
  isAdmin: boolean;
}

type EscrowData = Database["public"]["Tables"]["deal_room_escrow"]["Row"];
type EscrowTransaction = Database["public"]["Tables"]["escrow_transactions"]["Row"];

export function EscrowDashboard({ dealRoomId, isAdmin }: EscrowDashboardProps) {
  // Fetch escrow data
  const { data: escrow, isLoading: escrowLoading } = useQuery({
    queryKey: ["escrow-dashboard", dealRoomId],
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

  // Fetch recent transactions
  const { data: transactions } = useQuery({
    queryKey: ["escrow-transactions", escrow?.id],
    queryFn: async () => {
      if (!escrow?.id) return [];
      
      const { data, error } = await supabase
        .from("escrow_transactions")
        .select("*")
        .eq("escrow_id", escrow.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!escrow?.id
  });

  const formatCurrency = (amount: number | null | undefined) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

  const currentBalance = (escrow?.total_deposited || 0) - (escrow?.total_released || 0);
  const threshold = escrow?.minimum_balance_threshold || 0;
  const healthPercent = threshold > 0 ? Math.min((currentBalance / threshold) * 100, 100) : 100;
  
  const getHealthStatus = () => {
    if (escrow?.workflows_paused) return { label: "Paused", variant: "destructive" as const };
    if (healthPercent < 25) return { label: "Critical", variant: "destructive" as const };
    if (healthPercent < 50) return { label: "Low", variant: "secondary" as const };
    if (healthPercent < 75) return { label: "Moderate", variant: "outline" as const };
    return { label: "Healthy", variant: "default" as const };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Main Escrow Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Escrow Dashboard
              </CardTitle>
              <CardDescription>
                Multi-sig escrow wallet with kill-switch protection
              </CardDescription>
            </div>
            <Badge variant={healthStatus.variant} className="gap-1">
              {escrow?.workflows_paused ? (
                <Pause className="h-3 w-3" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              {healthStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {escrowLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading escrow data...</div>
          ) : !escrow ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No escrow configured for this Deal Room</p>
              {isAdmin && (
                <Button className="mt-4" variant="outline">
                  Initialize Escrow
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Kill Switch Warning */}
              {escrow.workflows_paused && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Workflows Paused</p>
                    <p className="text-sm text-muted-foreground">
                      Escrow balance dropped below {formatCurrency(threshold)}. 
                      {escrow.paused_at && ` Paused ${format(new Date(escrow.paused_at), "MMM d, yyyy 'at' h:mm a")}`}
                    </p>
                    {escrow.paused_reason && (
                      <p className="text-xs text-muted-foreground mt-1">{escrow.paused_reason}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Play className="h-3 w-3" />
                      Resume
                    </Button>
                  )}
                </div>
              )}

              {/* Balance Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Wallet className="h-4 w-4" />
                      Current Balance
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(currentBalance)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                      Total Deposited
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(escrow.total_deposited)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <ArrowUpRight className="h-4 w-4 text-amber-500" />
                      Total Released
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(escrow.total_released)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Health Meter */}
              {threshold > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance Health</span>
                    <span className="font-medium">
                      {formatCurrency(currentBalance)} / {formatCurrency(threshold)} minimum
                    </span>
                  </div>
                  <Progress 
                    value={healthPercent} 
                    className={`h-3 ${healthPercent < 25 ? '[&>div]:bg-destructive' : healthPercent < 50 ? '[&>div]:bg-amber-500' : ''}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {healthPercent >= 100 
                      ? "Balance exceeds minimum threshold - workflows active"
                      : `${(100 - healthPercent).toFixed(0)}% below safe operating threshold`}
                  </p>
                </div>
              )}

              {/* Escrow Config */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Escrow Type</p>
                  <p className="font-medium capitalize">{escrow.escrow_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{escrow.currency}</p>
                </div>
                {escrow.signers && escrow.signers.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Multi-Sig ({escrow.required_signatures || 1} of {escrow.signers.length} required)
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {escrow.signers.map((signer, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {signer.slice(0, 8)}...
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Transaction Ledger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {tx.transaction_type === "deposit" ? (
                      <div className="p-2 rounded-full bg-emerald-500/10">
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-amber-500/10">
                        <ArrowUpRight className="h-4 w-4 text-amber-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium capitalize">{tx.transaction_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.created_at && format(new Date(tx.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.transaction_type === "deposit" ? "text-emerald-600" : "text-amber-600"}`}>
                      {tx.transaction_type === "deposit" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
