import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ContributorFundingDialog } from "./ContributorFundingDialog";
import { format } from "date-fns";

interface PendingFundRequestsSectionProps {
  dealRoomId: string;
  dealRoomName: string;
}

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

export function PendingFundRequestsSection({ dealRoomId, dealRoomName }: PendingFundRequestsSectionProps) {
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch pending fund requests for the current user
  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ["my-pending-fund-requests", dealRoomId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("fund_contribution_requests")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .eq("requested_from_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending requests:", error);
        return [];
      }
      return (data || []) as FundRequest[];
    },
  });

  const handlePayClick = (request: FundRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  if (isLoading) {
    return null;
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Pending Fund Requests</CardTitle>
          </div>
          <CardDescription>
            You have {pendingRequests.length} pending contribution request{pendingRequests.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingRequests.map((request) => {
              const dueDate = request.due_date ? new Date(request.due_date) : null;
              const isOverdue = dueDate && dueDate < new Date();

              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-background"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">
                        ${Number(request.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">Overdue</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{request.purpose}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {dueDate ? (
                        <span>Due: {format(dueDate, "MMM d, yyyy")}</span>
                      ) : (
                        <span>No due date</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePayClick(request)}
                    className="ml-4 shrink-0"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ContributorFundingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        request={selectedRequest}
        dealRoomName={dealRoomName}
      />
    </>
  );
}
