import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InvoicePaymentModal } from "./InvoicePaymentModal";

interface Invoice {
  id: string;
  stripe_invoice_id: string;
  amount: number | string;
  currency: string;
  description: string | null;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  creator_id: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, icon: FileText },
  open: { label: "Pending", variant: "default" as const, icon: Clock },
  paid: { label: "Paid", variant: "outline" as const, icon: CheckCircle2 },
  void: { label: "Void", variant: "destructive" as const, icon: AlertCircle },
  uncollectible: { label: "Uncollectible", variant: "destructive" as const, icon: AlertCircle },
};

export function ClientInvoiceDashboard() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ["client-invoices"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First get invoices
      const { data: invoiceData, error } = await supabase
        .from("platform_invoices")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!invoiceData) return [];

      // Then get creator profiles
      const creatorIds = [...new Set(invoiceData.map(inv => inv.creator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", creatorIds);

      const profileMap = new Map<string, { id: string; full_name: string | null }>();
      profiles?.forEach(p => profileMap.set(p.id, p));

      return invoiceData.map(inv => ({
        ...inv,
        amount: Number(inv.amount),
        profiles: profileMap.get(inv.creator_id) || null,
      })) as unknown as Invoice[];
    },
  });

  const formatCurrency = (amount: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const handlePayClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const pendingInvoices = invoices?.filter(inv => inv.status === "open") || [];
  const paidInvoices = invoices?.filter(inv => inv.status === "paid") || [];
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Payment</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                {formatCurrency(totalPending)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? "s" : ""} awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Paid</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {formatCurrency(totalPaid)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {paidInvoices.length} invoice{paidInvoices.length !== 1 ? "s" : ""} paid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Your Invoices
            </CardTitle>
            <CardDescription>
              View and pay invoices from your business partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!invoices || invoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No invoices yet</p>
                <p className="text-sm">Invoices from your partners will appear here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.open;
                    const StatusIcon = status.icon;
                    const isOverdue = invoice.due_date && 
                      new Date(invoice.due_date) < new Date() && 
                      invoice.status === "open";

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="font-medium">
                            {invoice.profiles?.full_name || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {invoice.description}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(Number(invoice.amount), invoice.currency)}
                        </TableCell>
                        <TableCell>
                          {invoice.due_date ? (
                            <span className={isOverdue ? "text-destructive" : ""}>
                              {format(new Date(invoice.due_date), "MMM d, yyyy")}
                              {isOverdue && " (Overdue)"}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.status === "open" ? (
                            <Button
                              size="sm"
                              onClick={() => handlePayClick(invoice)}
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay Now
                            </Button>
                          ) : invoice.status === "paid" ? (
                            <span className="text-sm text-muted-foreground">
                              Paid {invoice.paid_at && format(new Date(invoice.paid_at), "MMM d")}
                            </span>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {selectedInvoice && (
        <InvoicePaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          invoiceId={selectedInvoice.id}
          amount={Number(selectedInvoice.amount)}
          currency={selectedInvoice.currency}
          description={selectedInvoice.description}
          dueDate={selectedInvoice.due_date || undefined}
          onSuccess={() => {
            refetch();
            setSelectedInvoice(null);
          }}
        />
      )}
    </>
  );
}
