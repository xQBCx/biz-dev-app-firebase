import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Loader2, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ExternalLink,
  Building2,
  User,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  xdk_amount: number;
  usd_amount: number;
  target_currency?: string | null;
  status: string;
  payout_processor: string | null;
  payout_error: string | null;
  external_payout_id: string | null;
  created_at: string;
  processed_at: string | null;
  user_email?: string;
  user_name?: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: "bg-amber-100 text-amber-800", icon: <Clock className="w-3 h-3" /> },
  processing: { color: "bg-blue-100 text-blue-800", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-3 h-3" /> },
  failed: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
};

export function WithdrawalRequestsPanel() {
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processingNotes, setProcessingNotes] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const queryClient = useQueryClient();

  // Fetch withdrawal requests with user info
  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-withdrawal-requests"],
    queryFn: async () => {
      const { data: withdrawals, error } = await supabase
        .from("xdk_withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each withdrawal
      const userIds = [...new Set(withdrawals?.map(w => w.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return withdrawals?.map(w => ({
        ...w,
        user_email: profileMap.get(w.user_id)?.email,
        user_name: profileMap.get(w.user_id)?.full_name,
      })) as WithdrawalRequest[];
    },
  });

  // Process via Stripe Connect
  const processStripeMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.functions.invoke("process-stripe-payout", {
        body: { withdrawal_request_id: requestId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.requires_manual) {
        toast.info("Manual processing required", {
          description: data.message,
        });
      } else {
        toast.success("Payout initiated via Stripe Connect");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-requests"] });
    },
    onError: (error) => {
      toast.error("Failed to process payout", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  // Mark as completed (manual)
  const markCompletedMutation = useMutation({
    mutationFn: async ({ requestId, notes, reference }: { requestId: string; notes: string; reference: string }) => {
      const { error } = await supabase
        .from("xdk_withdrawal_requests")
        .update({
          status: "completed",
          payout_processor: "manual",
          external_payout_id: reference || null,
          payout_error: null,
          processed_at: new Date().toISOString(),
          metadata: { admin_notes: notes },
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Withdrawal marked as completed");
      setProcessDialogOpen(false);
      setSelectedRequest(null);
      setProcessingNotes("");
      setExternalReference("");
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-requests"] });
    },
    onError: (error) => {
      toast.error("Failed to update withdrawal", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const filteredRequests = requests?.filter(
    (r) =>
      r.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = requests?.filter(r => r.status === "pending").length || 0;
  const totalPending = requests?.filter(r => r.status === "pending").reduce((sum, r) => sum + Number(r.usd_amount), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pending Amount</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {formatCurrency(totalPending)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-2xl">{requests?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Process and track user payout requests</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by user or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No withdrawal requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests?.map((request) => {
                    const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{request.user_name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{request.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(Number(request.usd_amount))}</p>
                            <p className="text-xs text-muted-foreground">{request.xdk_amount} XDK</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig.color}>
                            <span className="flex items-center gap-1">
                              {statusConfig.icon}
                              {request.status}
                            </span>
                          </Badge>
                          {request.payout_error && (
                            <p className="text-xs text-destructive mt-1">{request.payout_error}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {request.payout_processor === "stripe_connect" ? (
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                            ) : request.payout_processor === "manual" ? (
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                            ) : null}
                            <span className="text-sm">{request.payout_processor || "—"}</span>
                          </div>
                          {request.external_payout_id && (
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {request.external_payout_id}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{format(new Date(request.created_at), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(request.created_at), "h:mm a")}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {request.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processStripeMutation.mutate(request.id)}
                                  disabled={processStripeMutation.isPending}
                                >
                                  {processStripeMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CreditCard className="w-4 h-4 mr-1" />
                                      Stripe
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setProcessDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Complete
                                </Button>
                              </>
                            )}
                            {request.status === "completed" && request.external_payout_id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(request.external_payout_id!);
                                  toast.success("Reference copied to clipboard");
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Withdrawal</DialogTitle>
            <DialogDescription>
              Mark this withdrawal as completed after processing manually.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User</span>
                  <span className="font-medium">{selectedRequest.user_name || selectedRequest.user_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-medium">{formatCurrency(Number(selectedRequest.usd_amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">XDK</span>
                  <span className="font-medium">{selectedRequest.xdk_amount} XDK</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">External Reference (Optional)</label>
                <Input
                  placeholder="Wire transfer ID, confirmation number, etc."
                  value={externalReference}
                  onChange={(e) => setExternalReference(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this payout..."
                  value={processingNotes}
                  onChange={(e) => setProcessingNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  markCompletedMutation.mutate({
                    requestId: selectedRequest.id,
                    notes: processingNotes,
                    reference: externalReference,
                  });
                }
              }}
              disabled={markCompletedMutation.isPending}
            >
              {markCompletedMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Mark as Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
