import { format } from "date-fns";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Receipt, 
  CreditCard,
  Coins,
  Copy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ValueLedgerEntry } from "@/hooks/useValueLedger";

interface LedgerTimelineProps {
  entries: ValueLedgerEntry[];
  onViewProof?: (entry: ValueLedgerEntry) => void;
}

const entryTypeConfig: Record<string, { icon: typeof ArrowDownCircle; color: string; label: string }> = {
  escrow_deposit: { icon: ArrowDownCircle, color: "text-green-500", label: "Escrow Deposit" },
  escrow_release: { icon: ArrowUpCircle, color: "text-amber-500", label: "Escrow Release" },
  internal_transfer: { icon: ArrowUpCircle, color: "text-primary", label: "XDK Transfer" },
  invoice_payment: { icon: Receipt, color: "text-blue-500", label: "Invoice Payment" },
  payout: { icon: ArrowUpCircle, color: "text-orange-500", label: "Payout" },
  fee: { icon: CreditCard, color: "text-red-500", label: "Fee" },
  subscription: { icon: CreditCard, color: "text-purple-500", label: "Subscription" },
  service_credit: { icon: Coins, color: "text-yellow-500", label: "Service Credit" },
  fund_contribution: { icon: ArrowDownCircle, color: "text-emerald-500", label: "Fund Contribution" },
};

export function LedgerTimeline({ entries, onViewProof }: LedgerTimelineProps) {
  const copyJson = (entry: ValueLedgerEntry) => {
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    toast.success("Entry JSON copied to clipboard");
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No ledger entries yet</p>
        <p className="text-sm">Transactions will appear here as they occur</p>
      </div>
    );
  }

  // Group entries by date
  const groupedByDate: Record<string, ValueLedgerEntry[]> = {};
  entries.forEach((entry) => {
    const date = format(new Date(entry.created_at), "MMMM d, yyyy");
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(entry);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, dateEntries]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 sticky top-0 bg-background py-2">
            {date}
          </h3>
          <div className="space-y-4">
            {dateEntries.map((entry) => {
              const config = entryTypeConfig[entry.entry_type] || {
                icon: Coins,
                color: "text-muted-foreground",
                label: entry.entry_type,
              };
              const Icon = config.icon;

              return (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full bg-muted ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), "h:mm a")}
                        </span>
                      </div>
                      
                      {entry.narrative ? (
                        <p className="text-sm mb-3">{entry.narrative}</p>
                      ) : (
                        <p className="text-sm mb-3">
                          <span className="font-medium">{entry.source_entity_name}</span>
                          {entry.destination_entity_name && (
                            <>
                              {" → "}
                              <span className="font-medium">{entry.destination_entity_name}</span>
                            </>
                          )}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Amount</p>
                          <p className="font-medium">
                            ${Number(entry.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        {entry.xdk_amount && (
                          <div>
                            <p className="text-muted-foreground text-xs">XDK</p>
                            <p className="font-medium text-primary">
                              {Number(entry.xdk_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} XDK
                            </p>
                          </div>
                        )}
                        {entry.contribution_credits > 0 && (
                          <div>
                            <p className="text-muted-foreground text-xs">Credits Earned</p>
                            <p className="font-medium text-green-600">
                              +{entry.contribution_credits} {entry.credit_category}
                            </p>
                          </div>
                        )}
                        {entry.xdk_tx_hash && (
                          <div>
                            <p className="text-muted-foreground text-xs">TX Hash</p>
                            <p className="font-mono text-xs truncate">
                              {entry.xdk_tx_hash.slice(0, 10)}...
                            </p>
                          </div>
                        )}
                      </div>

                      {entry.purpose && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Purpose: {entry.purpose}
                        </p>
                      )}

                      <div className="flex gap-2 mt-3">
                        {entry.xdk_tx_hash && onViewProof && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProof(entry)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Proof
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyJson(entry)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy JSON
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
