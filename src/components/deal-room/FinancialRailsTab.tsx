import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Landmark, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  Wallet,
  Clock,
  CheckCircle,
  TrendingUp,
  Zap,
  History,
  GitBranch,
  Code2,
  Download,
  FileText,
  FileJson,
  Table2,
  AlertTriangle,
  Pause
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { FundRequestPanel } from "./FundRequestPanel";
import { XdkTransferPanel } from "./XdkTransferPanel";
import { PendingFundRequestsSection } from "./PendingFundRequestsSection";
import { FundEscrowDialog } from "@/components/dealroom/FundEscrowDialog";
import { LedgerTimeline } from "@/components/ledger/LedgerTimeline";
import { LedgerFlowDiagram } from "@/components/ledger/LedgerFlowDiagram";
import { LedgerRawData } from "@/components/ledger/LedgerRawData";
import { format } from "date-fns";
import { 
  exportLedgerToPDF, 
  exportLedgerToCSV, 
  exportLedgerToJSON, 
  exportLedgerToMarkdown 
} from "@/utils/exportLedgerFormats";
import type { ValueLedgerEntry, LedgerStats } from "@/hooks/useValueLedger";

interface FinancialRailsTabProps {
  dealRoomId: string;
  dealRoomName: string;
  isAdmin: boolean;
}

export function FinancialRailsTab({ dealRoomId, dealRoomName, isAdmin }: FinancialRailsTabProps) {
  const [fundRequestOpen, setFundRequestOpen] = useState(false);
  const [xdkTransferOpen, setXdkTransferOpen] = useState(false);
  const [ledgerTab, setLedgerTab] = useState("timeline");

  // Fetch treasury account balance from deal_room_xdk_treasury
  const { data: treasuryAccount, isLoading: treasuryLoading } = useQuery({
    queryKey: ["treasury-account", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_room_xdk_treasury")
        .select("xdk_address, balance")
        .eq("deal_room_id", dealRoomId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching treasury account:", error);
        return null;
      }
      return data ? { address: data.xdk_address || "", balance: data.balance || 0 } : null;
    },
  });

  // Fetch escrow data for USD backing info
  const { data: escrowData } = useQuery({
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

  // Fetch escrow funding requests for Gross/Fee/Net breakdown
  const { data: fundingRequests } = useQuery({
    queryKey: ["escrow-funding-requests", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escrow_funding_requests")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      
      if (error) return [];
      return data || [];
    }
  });

  // Calculate totals from funding requests
  const fundingTotals = fundingRequests?.reduce((acc, req) => ({
    gross: acc.gross + (Number(req.gross_amount) || Number(req.amount) || 0),
    fees: acc.fees + (Number(req.stripe_fee) || 0),
    net: acc.net + (Number(req.net_amount) || Number(req.amount) || 0),
  }), { gross: 0, fees: 0, net: 0 }) || { gross: 0, fees: 0, net: 0 };

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

  // Fetch value ledger entries for this deal room (unified activity)
  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ["deal-room-ledger-entries", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_ledger_entries")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) {
        console.error("Error fetching ledger entries:", error);
        return { entries: [], stats: getEmptyStats() };
      }
      
      const entries = (data || []) as ValueLedgerEntry[];
      const stats = calculateStats(entries);
      return { entries, stats };
    },
  });

  // Also fetch escrow transactions to merge into activity feed
  const { data: escrowTransactions } = useQuery({
    queryKey: ["escrow-transactions-activity", dealRoomId],
    queryFn: async () => {
      if (!escrowData?.id) return [];
      
      const { data, error } = await supabase
        .from("escrow_transactions")
        .select("*")
        .eq("escrow_id", escrowData.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) return [];
      return data || [];
    },
    enabled: !!escrowData?.id
  });

  const treasuryBalance = treasuryAccount?.balance || 0;
  const treasuryAddress = treasuryAccount?.address || "";
  const escrowBalance = (escrowData?.total_deposited || 0) - (escrowData?.total_released || 0);
  const entries = ledgerData?.entries || [];
  const stats = ledgerData?.stats || getEmptyStats();

  // Merge escrow transactions into activity for unified view
  const mergedActivity = [...entries];
  escrowTransactions?.forEach(tx => {
    // Check if this transaction is already represented in value ledger
    const alreadyExists = entries.some(e => 
      e.xdk_tx_hash === tx.blockchain_tx_hash || 
      (e.amount === tx.amount && Math.abs(new Date(e.created_at).getTime() - new Date(tx.created_at).getTime()) < 60000)
    );
    
    if (!alreadyExists) {
      // Create a pseudo ledger entry for display
      mergedActivity.push({
        id: tx.id,
        deal_room_id: dealRoomId,
        source_user_id: null,
        source_entity_type: "escrow",
        source_entity_id: null,
        source_entity_name: tx.transaction_type === "deposit" ? "Stripe" : dealRoomName,
        destination_user_id: null,
        destination_entity_type: tx.transaction_type === "deposit" ? "treasury" : "external",
        destination_entity_id: null,
        destination_entity_name: tx.transaction_type === "deposit" ? dealRoomName : "Payout",
        entry_type: tx.transaction_type === "deposit" ? "escrow_deposit" : "escrow_release",
        amount: tx.amount,
        currency: tx.currency || "USD",
        xdk_amount: tx.transaction_type === "deposit" ? tx.amount : null,
        purpose: tx.transaction_type === "deposit" ? "USD Deposit" : "Payout Release",
        reference_type: "escrow_transaction",
        reference_id: null,
        contribution_credits: 0,
        credit_category: null,
        verification_source: tx.status === "confirmed" ? "stripe" : null,
        verification_id: null,
        verified_at: tx.confirmed_at,
        xdk_tx_hash: tx.blockchain_tx_hash,
        xodiak_block_number: null,
        narrative: null,
        created_at: tx.created_at,
        metadata: {},
      } as ValueLedgerEntry);
    }
  });

  // Sort merged activity by date
  mergedActivity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleExport = async (format: "pdf" | "csv" | "json" | "markdown") => {
    if (!entries.length) return;

    const filename = `value-ledger-${dealRoomName?.replace(/\s+/g, "-").toLowerCase() || "export"}`;

    switch (format) {
      case "pdf":
        await exportLedgerToPDF(entries, stats, dealRoomName || "Deal Room");
        break;
      case "csv":
        exportLedgerToCSV(entries, filename);
        break;
      case "json":
        exportLedgerToJSON(entries, filename);
        break;
      case "markdown":
        exportLedgerToMarkdown(entries, stats, dealRoomName || "Deal Room", filename);
        break;
    }
  };

  const handleViewProof = (entry: ValueLedgerEntry) => {
    if (entry.xdk_tx_hash) {
      navigator.clipboard.writeText(entry.xdk_tx_hash);
    }
  };

  if (treasuryLoading || ledgerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Fund Requests for Contributors */}
      <PendingFundRequestsSection dealRoomId={dealRoomId} dealRoomName={dealRoomName} />

      {/* Kill Switch Warning */}
      {escrowData?.workflows_paused && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">Workflows Paused - Low Balance</p>
            <p className="text-sm text-muted-foreground">
              Add funds to resume automated settlements.
              {escrowData.paused_at && ` Paused ${format(new Date(escrowData.paused_at), "MMM d 'at' h:mm a")}`}
            </p>
          </div>
          <FundEscrowDialog
            dealRoomId={dealRoomId}
            dealRoomName={dealRoomName}
            currentBalance={escrowBalance}
            trigger={<Button size="sm" variant="outline"><DollarSign className="h-4 w-4 mr-1" />Add Funds</Button>}
          />
        </div>
      )}

      {/* Treasury Overview - Unified Balance Display */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              <CardTitle>Deal Room Treasury</CardTitle>
            </div>
            <div className="flex gap-2">
              <FundEscrowDialog
                dealRoomId={dealRoomId}
                dealRoomName={dealRoomName}
                currentBalance={escrowBalance}
                trigger={
                  <Button size="sm" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Fund
                  </Button>
                }
              />
              {isAdmin && (
                <>
                  <Button size="sm" variant="outline" onClick={() => setFundRequestOpen(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Request
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setXdkTransferOpen(true)}
                    disabled={treasuryBalance === 0}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Transfer
                  </Button>
                </>
              )}
            </div>
          </div>
          <CardDescription>
            Centralized fund management for {dealRoomName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* XDK Balance */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Zap className="h-4 w-4 text-amber-500" />
                XDK Balance
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {treasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XDK
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ≈ ${treasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
              </div>
            </div>
            
            {/* USD Backing */}
            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Wallet className="h-4 w-4" />
                USD Backing
              </div>
              <div className="text-2xl font-bold">
                ${escrowBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              {fundingTotals.gross > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Gross: ${fundingTotals.gross.toFixed(2)} | Fees: ${fundingTotals.fees.toFixed(2)}
                </div>
              )}
            </div>

            {/* Pending Requests */}
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

            {/* Total Released */}
            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Total Released
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${(escrowData?.total_released || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                paid to participants
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Activity & Value Ledger */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5" />
                Financial Activity & Value Ledger
              </CardTitle>
              <CardDescription>Complete transaction history and attribution trail</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={entries.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <Table2 className="w-4 h-4 mr-2" />
                  CSV Spreadsheet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <FileJson className="w-4 h-4 mr-2" />
                  JSON Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("markdown")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Stats */}
          {stats.entryCount > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-lg font-bold">
                  ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">XDK Tokenized</p>
                <p className="text-lg font-bold text-amber-600">
                  {stats.totalXdk.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Credits Earned</p>
                <p className="text-lg font-bold text-green-600">{stats.totalCredits}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold">{stats.entryCount}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {mergedActivity.length > 0 ? (
            <Tabs value={ledgerTab} onValueChange={setLedgerTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="timeline" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="flow" className="gap-2">
                  <GitBranch className="w-4 h-4" />
                  Flow Diagram
                </TabsTrigger>
                <TabsTrigger value="raw" className="gap-2">
                  <Code2 className="w-4 h-4" />
                  Raw Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <LedgerTimeline entries={mergedActivity} onViewProof={handleViewProof} />
              </TabsContent>

              <TabsContent value="flow">
                <LedgerFlowDiagram entries={entries} stats={stats} />
              </TabsContent>

              <TabsContent value="raw">
                <LedgerRawData entries={entries} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No financial activity yet</p>
              {isAdmin && (
                <p className="text-sm mt-2">Fund the escrow, request contributions, or create invoices to get started</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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

// Helper functions
function getEmptyStats(): LedgerStats {
  return {
    totalValue: 0,
    totalXdk: 0,
    totalCredits: 0,
    entryCount: 0,
    uniqueEntities: 0,
    byEntityType: {},
    byEntryType: {},
  };
}

function calculateStats(entries: ValueLedgerEntry[]): LedgerStats {
  const stats: LedgerStats = {
    totalValue: 0,
    totalXdk: 0,
    totalCredits: 0,
    entryCount: entries.length,
    uniqueEntities: 0,
    byEntityType: {},
    byEntryType: {},
  };

  const entitySet = new Set<string>();

  entries.forEach((entry) => {
    stats.totalValue += Number(entry.amount) || 0;
    stats.totalXdk += Number(entry.xdk_amount) || 0;
    stats.totalCredits += Number(entry.contribution_credits) || 0;

    entitySet.add(entry.source_entity_name);
    if (entry.destination_entity_name) {
      entitySet.add(entry.destination_entity_name);
    }

    if (entry.source_entity_type) {
      stats.byEntityType[entry.source_entity_type] = 
        (stats.byEntityType[entry.source_entity_type] || 0) + Number(entry.amount);
    }

    if (entry.entry_type) {
      stats.byEntryType[entry.entry_type] = 
        (stats.byEntryType[entry.entry_type] || 0) + Number(entry.amount);
    }
  });

  stats.uniqueEntities = entitySet.size;

  return stats;
}