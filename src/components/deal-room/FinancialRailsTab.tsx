import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Landmark, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  Wallet,
  Clock,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FundRequestPanel } from "./FundRequestPanel";
import { XdkTransferPanel } from "./XdkTransferPanel";
import { DealEscrowPanel } from "./DealEscrowPanel";
import { format } from "date-fns";

interface FinancialRailsTabProps {
  dealRoomId: string;
  dealRoomName: string;
  isAdmin: boolean;
}

export function FinancialRailsTab({ dealRoomId, dealRoomName, isAdmin }: FinancialRailsTabProps) {
  const [fundRequestOpen, setFundRequestOpen] = useState(false);
  const [xdkTransferOpen, setXdkTransferOpen] = useState(false);

  // For demo, we'll use a mock treasury - in production this would come from deal_room_escrow
  const treasuryBalance = 0;
  const treasuryAddress = "";

  // Fetch pending fund requests count
  const { data: pendingRequests } = useQuery({
    queryKey: ["pending-fund-requests", dealRoomId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("fund_contribution_requests")
        .select("*", { count: "exact", head: true })
        .eq("deal_room_id", dealRoomId)
        .eq("status", "pending");
      
      if (error) console.error("Error fetching pending requests:", error);
      return count || 0;
    },
  });

  // Fetch fund request stats
  const { data: fundRequestStats, isLoading } = useQuery({
    queryKey: ["fund-request-stats", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fund_contribution_requests")
        .select("status, amount")
        .eq("deal_room_id", dealRoomId);
      
      if (error) {
        console.error("Error fetching fund request stats:", error);
        return { total: 0, pending: 0, paid: 0, totalAmount: 0 };
      }

      const requests = data as Array<{ status: string; amount: string | number }>;
      const stats = {
        total: requests?.length || 0,
        pending: requests?.filter(r => r.status === "pending").length || 0,
        paid: requests?.filter(r => r.status === "paid").length || 0,
        totalAmount: requests?.filter(r => r.status === "paid")
          .reduce((sum, r) => sum + parseFloat(String(r.amount || "0")), 0) || 0,
      };
      return stats;
    },
  });

  // Fetch recent value ledger entries for this deal room
  const { data: recentLedgerEntries } = useQuery({
    queryKey: ["deal-room-ledger-entries", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_ledger_entries")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("Error fetching ledger entries:", error);
        return [];
      }
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Treasury Overview */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              <CardTitle>Deal Room Treasury</CardTitle>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setFundRequestOpen(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Request Funds
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setXdkTransferOpen(true)}
                  disabled={treasuryBalance === 0}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Transfer Out
                </Button>
              </div>
            )}
          </div>
          <CardDescription>
            Centralized fund management for {dealRoomName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Wallet className="h-4 w-4" />
                Treasury Balance
              </div>
              <div className="text-2xl font-bold text-primary">
                {treasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XDK
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Managed via escrow accounts
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="h-4 w-4" />
                Pending Requests
              </div>
              <div className="text-2xl font-bold">
                {pendingRequests || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                awaiting contribution
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <CheckCircle className="h-4 w-4" />
                Contributions Received
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${(fundRequestStats?.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {fundRequestStats?.paid || 0} payments completed
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Total Requests
              </div>
              <div className="text-2xl font-bold">
                {fundRequestStats?.total || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                all time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Value Ledger Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Financial Activity</CardTitle>
          <CardDescription>Latest value transactions in this deal room</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLedgerEntries && recentLedgerEntries.length > 0 ? (
            <div className="space-y-3">
              {recentLedgerEntries.map((entry: any) => {
                const isIncoming = entry.entry_type?.includes("payment") || entry.entry_type?.includes("deposit");
                return (
                  <div 
                    key={entry.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isIncoming ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                        {isIncoming ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {entry.entry_type?.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.source_entity_name || 'Unknown'} → {entry.destination_entity_name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${isIncoming ? 'text-green-600' : ''}`}>
                        {entry.amount ? `$${parseFloat(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''}
                        {entry.xdk_amount ? ` (${parseFloat(entry.xdk_amount).toFixed(2)} XDK)` : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.created_at ? format(new Date(entry.created_at), "MMM d, HH:mm") : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No financial activity yet</p>
              {isAdmin && (
                <p className="text-sm mt-2">Request funds from participants or create invoices to get started</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escrow Management */}
      <DealEscrowPanel dealRoomId={dealRoomId} isAdmin={isAdmin} />

      {/* Panel Sheets */}
      <FundRequestPanel
        open={fundRequestOpen}
        onOpenChange={setFundRequestOpen}
        dealRoomId={dealRoomId}
        dealRoomName={dealRoomName}
      />

      <XdkTransferPanel
        open={xdkTransferOpen}
        onOpenChange={setXdkTransferOpen}
        dealRoomId={dealRoomId}
        dealRoomName={dealRoomName}
        treasuryBalance={treasuryBalance}
        treasuryAddress={treasuryAddress}
      />
    </div>
  );
}
