import { useState } from "react";
import { Copy, Check, Search, Database, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ValueLedgerEntry } from "@/hooks/useValueLedger";

export interface BlockchainTransaction {
  id: string;
  tx_hash: string;
  from_address: string;
  to_address: string | null;
  amount: number;
  tx_type: string;
  status: string;
  signature: string | null;
  data: Record<string, unknown> | null;
  block_number: number | null;
  created_at: string;
}

interface LedgerRawDataProps {
  entries: ValueLedgerEntry[];
  blockchainTransactions?: BlockchainTransaction[];
}

export function LedgerRawData({ entries, blockchainTransactions = [] }: LedgerRawDataProps) {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<ValueLedgerEntry | null>(null);
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);
  const [activeTab, setActiveTab] = useState("ledger");

  const filteredEntries = entries.filter((entry) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      entry.source_entity_name?.toLowerCase().includes(searchLower) ||
      entry.destination_entity_name?.toLowerCase().includes(searchLower) ||
      entry.entry_type?.toLowerCase().includes(searchLower) ||
      entry.narrative?.toLowerCase().includes(searchLower) ||
      entry.xdk_tx_hash?.toLowerCase().includes(searchLower)
    );
  });

  const filteredTxs = blockchainTransactions.filter((tx) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      tx.tx_hash?.toLowerCase().includes(searchLower) ||
      tx.from_address?.toLowerCase().includes(searchLower) ||
      tx.to_address?.toLowerCase().includes(searchLower) ||
      tx.tx_type?.toLowerCase().includes(searchLower) ||
      tx.status?.toLowerCase().includes(searchLower)
    );
  });

  const copyAll = () => {
    const dataToExport = activeTab === "ledger" 
      ? entries 
      : blockchainTransactions;
    navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
    setCopied(true);
    toast.success(`All ${activeTab === "ledger" ? "ledger entries" : "blockchain events"} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEntry = (entry: ValueLedgerEntry) => {
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    toast.success("Entry copied to clipboard");
  };

  const copyTx = (tx: BlockchainTransaction) => {
    navigator.clipboard.writeText(JSON.stringify(tx, null, 2));
    toast.success("Transaction copied to clipboard");
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return "—";
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entries or transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={copyAll} variant="outline">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy All ({activeTab === "ledger" ? entries.length : blockchainTransactions.length})
            </>
          )}
        </Button>
      </div>

      {/* Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="ledger" className="gap-2">
            <Database className="w-4 h-4" />
            Ledger Entries ({entries.length})
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="gap-2">
            <Link className="w-4 h-4" />
            Blockchain Events ({blockchainTransactions.length})
          </TabsTrigger>
        </TabsList>

        {/* Ledger Entries Tab */}
        <TabsContent value="ledger">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Entry List Panel */}
            <div className="border rounded-lg">
              <div className="p-3 border-b bg-muted/50">
                <p className="text-sm font-medium">
                  {filteredEntries.length} Entries
                </p>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-1">
                  {filteredEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                        selectedEntry?.id === entry.id
                          ? "bg-primary/10 border border-primary"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium truncate">
                            {entry.source_entity_name || "Unknown"}
                            {entry.destination_entity_name && (
                              <span className="text-muted-foreground">
                                {" → "}{entry.destination_entity_name}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.entry_type} • 
                            {Number(entry.xdk_amount) > 0 
                              ? ` ${Number(entry.xdk_amount).toFixed(2)} XDK`
                              : ` $${Number(entry.amount).toFixed(2)}`
                            }
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyEntry(entry);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </button>
                  ))}
                  {filteredEntries.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No ledger entries found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* JSON Detail Panel */}
            <div className="border rounded-lg">
              <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
                <p className="text-sm font-medium">
                  {selectedEntry ? "Entry Details" : "Select an entry"}
                </p>
                {selectedEntry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyEntry(selectedEntry)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[400px]">
                <pre className="p-4 text-xs font-mono overflow-x-auto">
                  {selectedEntry
                    ? JSON.stringify(selectedEntry, null, 2)
                    : "// Select an entry from the list to view its JSON structure"}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        {/* Blockchain Events Tab */}
        <TabsContent value="blockchain">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Transaction List Panel */}
            <div className="border rounded-lg">
              <div className="p-3 border-b bg-muted/50">
                <p className="text-sm font-medium">
                  {filteredTxs.length} Blockchain Events
                </p>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-1">
                  {filteredTxs.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                        selectedTx?.id === tx.id
                          ? "bg-primary/10 border border-primary"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={tx.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                              {tx.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground uppercase">{tx.tx_type}</span>
                          </div>
                          <p className="font-mono text-xs truncate text-amber-600">
                            {truncateAddress(tx.tx_hash)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {truncateAddress(tx.from_address)} → {truncateAddress(tx.to_address)}
                          </p>
                          <p className="text-xs font-medium mt-1">
                            {Number(tx.amount).toFixed(2)} XDK
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyTx(tx);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </button>
                  ))}
                  {filteredTxs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No blockchain events found</p>
                      <p className="text-xs mt-1">Transactions will appear here after XDK transfers</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* JSON Detail Panel */}
            <div className="border rounded-lg">
              <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
                <p className="text-sm font-medium">
                  {selectedTx ? "Transaction Details" : "Select a transaction"}
                </p>
                {selectedTx && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyTx(selectedTx)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[400px]">
                <pre className="p-4 text-xs font-mono overflow-x-auto">
                  {selectedTx
                    ? JSON.stringify(selectedTx, null, 2)
                    : "// Select a transaction from the list to view its blockchain data"}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
