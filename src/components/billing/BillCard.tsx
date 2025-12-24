import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Brain, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Bill {
  id: string;
  bill_name: string;
  bill_type: string;
  vendor_name: string | null;
  amount: number | null;
  currency: string;
  status: string;
  file_url: string;
  created_at: string;
}

interface BillCardProps {
  bill: Bill;
  isSelected: boolean;
  onSelect: () => void;
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "secondary", label: "Pending" },
  analyzing: { icon: Brain, color: "default", label: "Analyzing" },
  analyzed: { icon: CheckCircle, color: "default", label: "Analyzed" },
  linked: { icon: ExternalLink, color: "default", label: "Linked" },
  error: { icon: AlertCircle, color: "destructive", label: "Error" },
} as const;

const TYPE_COLORS: Record<string, string> = {
  utility: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  telecom: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  saas: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  materials: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  ingredients: "bg-green-500/10 text-green-600 border-green-500/20",
  construction: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  other: "bg-muted text-muted-foreground",
};

export function BillCard({ bill, isSelected, onSelect }: BillCardProps) {
  const statusConfig = STATUS_CONFIG[bill.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const typeColor = TYPE_COLORS[bill.bill_type] || TYPE_COLORS.other;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium truncate">{bill.bill_name}</h3>
                {bill.vendor_name && (
                  <p className="text-sm text-muted-foreground">{bill.vendor_name}</p>
                )}
              </div>
              <Badge variant={statusConfig.color as any} className="gap-1 shrink-0">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className={typeColor}>
                {bill.bill_type}
              </Badge>
              {bill.amount && (
                <span className="text-sm font-medium">
                  ${bill.amount.toLocaleString()}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(bill.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
