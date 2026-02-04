import { useState } from "react";
import { 
  Clock, 
  GitBranch, 
  Code2, 
  Download,
  FileText,
  FileJson,
  Table2,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LedgerTimeline } from "./LedgerTimeline";
import { LedgerFlowDiagram } from "./LedgerFlowDiagram";
import { LedgerRawData } from "./LedgerRawData";
import { useValueLedger, type ValueLedgerEntry } from "@/hooks/useValueLedger";
import { 
  exportLedgerToPDF, 
  exportLedgerToCSV, 
  exportLedgerToJSON, 
  exportLedgerToMarkdown 
} from "@/utils/exportLedgerFormats";

interface ValueLedgerViewerProps {
  dealRoomId?: string;
  dealRoomName?: string;
}

export function ValueLedgerViewer({ dealRoomId, dealRoomName }: ValueLedgerViewerProps) {
  const [activeTab, setActiveTab] = useState("timeline");
  const { data, isLoading, error } = useValueLedger({ dealRoomId });

  const handleExport = async (format: "pdf" | "csv" | "json" | "markdown") => {
    if (!data?.entries) return;

    const filename = `value-ledger-${dealRoomName?.replace(/\s+/g, "-").toLowerCase() || "export"}`;

    switch (format) {
      case "pdf":
        await exportLedgerToPDF(data.entries, data.stats, dealRoomName || "Deal Room");
        break;
      case "csv":
        exportLedgerToCSV(data.entries, filename);
        break;
      case "json":
        exportLedgerToJSON(data.entries, filename);
        break;
      case "markdown":
        exportLedgerToMarkdown(data.entries, data.stats, dealRoomName || "Deal Room", filename);
        break;
    }
  };

  const handleViewProof = (entry: ValueLedgerEntry) => {
    // Open XODIAK block explorer or show transaction details
    if (entry.xdk_tx_hash) {
      // For now, just copy the hash - could integrate with XodiakBlockExplorer
      navigator.clipboard.writeText(entry.xdk_tx_hash);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Error loading ledger: {error.message}</p>
      </div>
    );
  }

  const entries = data?.entries || [];
  const stats = data?.stats || {
    totalValue: 0,
    totalXdk: 0,
    totalCredits: 0,
    entryCount: 0,
    uniqueEntities: 0,
    byEntityType: {},
    byEntryType: {},
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Value Ledger</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-lg font-bold">
              ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">XDK Tokenized</p>
            <p className="text-lg font-bold text-primary">
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
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <LedgerTimeline entries={entries} onViewProof={handleViewProof} />
          </TabsContent>

          <TabsContent value="flow">
            <LedgerFlowDiagram entries={entries} stats={stats} />
          </TabsContent>

          <TabsContent value="raw">
            <LedgerRawData entries={entries} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
