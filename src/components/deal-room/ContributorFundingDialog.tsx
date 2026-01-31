import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CreditCard, DollarSign, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FundRequest {
  id: string;
  deal_room_id: string;
  amount: number;
  currency: string;
  purpose: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface ContributorFundingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FundRequest | null;
  dealRoomName?: string;
}

export function ContributorFundingDialog({
  open,
  onOpenChange,
  request,
  dealRoomName,
}: ContributorFundingDialogProps) {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!request) throw new Error("No request selected");

      // Create Stripe checkout session for the contribution
      const response = await supabase.functions.invoke("fund-contribution-checkout", {
        body: {
          fund_request_id: request.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create checkout session");
      }

      return response.data;
    },
    onSuccess: (data) => {
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.success("Processing payment...");
        queryClient.invalidateQueries({ queryKey: ["fund-requests"] });
        onOpenChange(false);
      }
    },
    onError: (error) => {
      toast.error("Payment failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      if (!request) throw new Error("No request selected");

      const { error } = await supabase
        .from("fund_contribution_requests")
        .update({ status: "cancelled" })
        .eq("id", request.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request declined");
      queryClient.invalidateQueries({ queryKey: ["fund-requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to decline request", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      await payMutation.mutateAsync();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!request) return null;

  const dueDate = request.due_date ? new Date(request.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Fund Contribution Request
          </DialogTitle>
          <DialogDescription>
            {dealRoomName && `For: ${dealRoomName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Amount</span>
            </div>
            <span className="text-2xl font-bold">
              ${Number(request.amount).toFixed(2)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Purpose</p>
                <p className="text-sm text-muted-foreground">{request.purpose}</p>
              </div>
            </div>

            {dueDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span className="text-sm">Due: {format(dueDate, "PPP")}</span>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">Overdue</Badge>
                  )}
                </div>
              </div>
            )}

            {request.notes && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">{request.notes}</p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Your payment will be converted to XDK and deposited into the Deal Room treasury.
              This enables automated settlements and fee-free internal transfers.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => declineMutation.mutate()}
            disabled={isProcessing || declineMutation.isPending}
          >
            Decline
          </Button>
          <Button
            onClick={handlePay}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${Number(request.amount).toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
