import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowRight, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface RevenueEntry {
  id: string;
  work_order_id: string;
  distribution_type: string;
  recipient_type: string;
  recipient_name: string | null;
  amount: number;
  percentage_of_total: number | null;
  transaction_status: string;
  blockchain_tx_hash: string | null;
  payment_method: string | null;
  processed_at: string | null;
  created_at: string;
  fleet_work_orders?: { order_number: string };
}

export const RevenueDistributionPanel = () => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['revenue-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_distribution')
        .select(`
          *,
          fleet_work_orders (order_number)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as RevenueEntry[];
    }
  });

  // Calculate summary stats
  const stats = entries?.reduce((acc, entry) => {
    if (entry.transaction_status === 'completed') {
      acc.totalDistributed += entry.amount;
      if (entry.recipient_type === 'vendor') acc.vendorPayments += entry.amount;
      if (entry.recipient_type === 'partner') acc.partnerPayments += entry.amount;
      if (entry.recipient_type === 'platform') acc.platformFees += entry.amount;
    }
    if (entry.transaction_status === 'pending') acc.pending += entry.amount;
    return acc;
  }, { totalDistributed: 0, vendorPayments: 0, partnerPayments: 0, platformFees: 0, pending: 0 });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vendor_advance: "Vendor Advance",
      vendor_completion: "Vendor Completion",
      partner_share: "Partner Share",
      platform_fee: "Platform Fee",
      material_referral: "Material Referral",
      escrow_fund: "Escrow Fund",
      escrow_release: "Escrow Release"
    };
    return labels[type] || type;
  };

  const getRecipientColor = (type: string) => {
    switch (type) {
      case 'vendor': return 'default';
      case 'partner': return 'secondary';
      case 'platform': return 'outline';
      case 'escrow': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading revenue data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Revenue Distribution</h2>
        <p className="text-sm text-muted-foreground">Track payments to vendors, partners, and platform fees</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Distributed</CardDescription>
            <CardTitle className="text-2xl">${(stats?.totalDistributed || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vendor Payments</CardDescription>
            <CardTitle className="text-2xl">${(stats?.vendorPayments || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Partner Shares</CardDescription>
            <CardTitle className="text-2xl">${(stats?.partnerPayments || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Platform Fees</CardDescription>
            <CardTitle className="text-2xl">${(stats?.platformFees || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">${(stats?.pending || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {entries?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Revenue Yet</h3>
            <p className="text-muted-foreground">Revenue distributions will appear here as work orders are completed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries?.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(entry.transaction_status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getTypeLabel(entry.distribution_type)}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={getRecipientColor(entry.recipient_type)}>
                          {entry.recipient_name || entry.recipient_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        {entry.fleet_work_orders && (
                          <span className="font-mono">{entry.fleet_work_orders.order_number}</span>
                        )}
                        <span>{format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}</span>
                        {entry.percentage_of_total && (
                          <span>{entry.percentage_of_total}% of total</span>
                        )}
                        {entry.blockchain_tx_hash && (
                          <span className="font-mono text-xs truncate max-w-[120px]">
                            TX: {entry.blockchain_tx_hash.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {entry.amount.toLocaleString()}
                    </div>
                    {entry.payment_method && (
                      <span className="text-xs text-muted-foreground">{entry.payment_method}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
