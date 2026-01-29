import { useState } from "react";
import { Copy, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { ValueLedgerEntry } from "@/hooks/useValueLedger";

interface LedgerRawDataProps {
  entries: ValueLedgerEntry[];
}

export function LedgerRawData({ entries }: LedgerRawDataProps) {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<ValueLedgerEntry | null>(null);

  const filteredEntries = entries.filter((entry) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      entry.source_entity_name.toLowerCase().includes(searchLower) ||
      entry.destination_entity_name?.toLowerCase().includes(searchLower) ||
      entry.entry_type.toLowerCase().includes(searchLower) ||
      entry.narrative?.toLowerCase().includes(searchLower) ||
      entry.xdk_tx_hash?.toLowerCase().includes(searchLower)
    );
  });

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(entries, null, 2));
    setCopied(true);
    toast.success("All entries copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEntry = (entry: ValueLedgerEntry) => {
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    toast.success("Entry copied to clipboard");
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
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
              Copy All ({entries.length})
            </>
          )}
        </Button>
      </div>

      {/* Entry List */}
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
                        {entry.source_entity_name}
                        {entry.destination_entity_name && (
                          <span className="text-muted-foreground">
                            {" → "}{entry.destination_entity_name}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.entry_type} • ${Number(entry.amount).toFixed(2)}
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
    </div>
  );
}
