import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface FormulationReviewPanelProps {
  formulationId: string;
  dealRoomId: string;
  isAdmin: boolean;
  status: string;
}

interface Review {
  id: string;
  formulation_id: string;
  participant_id: string;
  participant_name?: string;
  status: string;
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  role: string;
  profiles?: { full_name: string; email: string };
}

const reviewStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-600", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive", icon: XCircle },
  changes_requested: { label: "Changes Requested", color: "bg-amber-500/20 text-amber-600", icon: AlertTriangle },
};

export const FormulationReviewPanel = ({
  formulationId,
  dealRoomId,
  isAdmin,
  status,
}: FormulationReviewPanelProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected" | "changes_requested" | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, [formulationId, dealRoomId]);

  const fetchData = async () => {
    try {
      const [reviewsRes, participantsRes] = await Promise.all([
        supabase
          .from("deal_room_formulation_reviews")
          .select("*")
          .eq("formulation_id", formulationId)
          .order("created_at", { ascending: true }),
        supabase
          .from("deal_room_participants")
          .select("id, user_id, role, profiles(full_name, email)")
          .eq("deal_room_id", dealRoomId),
      ]);

      if (reviewsRes.error) throw reviewsRes.error;
      
      const reviewsWithNames = (reviewsRes.data || []).map((review) => {
        const participant = (participantsRes.data as any)?.find(
          (p: Participant) => p.id === review.participant_id
        );
        return {
          ...review,
          participant_name: participant?.profiles?.full_name || participant?.profiles?.email || "Unknown",
        };
      });

      setReviews(reviewsWithNames);
      setParticipants((participantsRes.data as any) || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const myParticipant = participants.find(p => p.user_id === user?.id);
  const myReview = reviews.find(r => r.participant_id === myParticipant?.id);

  const handleSubmitReview = async () => {
    if (!user || !reviewAction || !myParticipant) return;

    setSubmitting(true);
    try {
      if (myReview) {
        // Update existing review
        const { error } = await supabase
          .from("deal_room_formulation_reviews")
          .update({
            status: reviewAction,
            notes: notes.trim() || null,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", myReview.id);

        if (error) throw error;
      } else {
        // Create new review
        const { error } = await supabase
          .from("deal_room_formulation_reviews")
          .insert({
            formulation_id: formulationId,
            participant_id: myParticipant.id,
            status: reviewAction,
            notes: notes.trim() || null,
            reviewed_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      toast.success(`Review submitted: ${reviewStatusConfig[reviewAction]?.label}`);
      setConfirmOpen(false);
      setNotes("");
      setReviewAction(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const requestReviewFromAll = async () => {
    if (!isAdmin) return;

    setSubmitting(true);
    try {
      // Create pending reviews for all participants who haven't reviewed
      const existingParticipantIds = reviews.map(r => r.participant_id);
      const participantsToRequest = participants.filter(
        p => !existingParticipantIds.includes(p.id)
      );

      if (participantsToRequest.length === 0) {
        toast.info("All participants have already been requested to review");
        setSubmitting(false);
        return;
      }

      const inserts = participantsToRequest.map(p => ({
        formulation_id: formulationId,
        participant_id: p.id,
        status: "pending",
      }));

      const { error } = await supabase
        .from("deal_room_formulation_reviews")
        .insert(inserts);

      if (error) throw error;
      toast.success(`Requested review from ${participantsToRequest.length} participants`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to request reviews");
    } finally {
      setSubmitting(false);
    }
  };

  const approvedCount = reviews.filter(r => r.status === "approved").length;
  const pendingCount = reviews.filter(r => r.status === "pending").length;
  const rejectedCount = reviews.filter(r => r.status === "rejected").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Partner Reviews</h3>
        </div>
        {isAdmin && status === "pending_review" && (
          <Button 
            variant="outline" 
            onClick={requestReviewFromAll}
            disabled={submitting}
            className="gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Request All Reviews
          </Button>
        )}
      </div>

      {/* Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Review Progress</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              {approvedCount} Approved
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Clock className="w-4 h-4" />
              {pendingCount} Pending
            </span>
            {rejectedCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="w-4 h-4" />
                {rejectedCount} Rejected
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* My Review Action (if participant) */}
      {myParticipant && status === "pending_review" && (
        <Card className="p-4 border-primary/50">
          <h4 className="font-medium mb-3">Your Review</h4>
          {myReview?.status === "approved" || myReview?.status === "rejected" ? (
            <div className="flex items-center gap-2">
              <Badge className={reviewStatusConfig[myReview.status]?.color}>
                {reviewStatusConfig[myReview.status]?.label}
              </Badge>
              {myReview.notes && (
                <span className="text-sm text-muted-foreground">"{myReview.notes}"</span>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any comments or conditions..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setReviewAction("approved");
                    setConfirmOpen(true);
                  }}
                  className="gap-2 flex-1"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReviewAction("changes_requested");
                    setConfirmOpen(true);
                  }}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setReviewAction("rejected");
                    setConfirmOpen(true);
                  }}
                  className="gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground">
            {status === "draft" 
              ? "Submit the formulation for review to collect partner approvals"
              : "Request reviews from participants to proceed with activation"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const StatusIcon = reviewStatusConfig[review.status]?.icon || Clock;
            
            return (
              <Card key={review.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {review.participant_name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{review.participant_name}</p>
                      <Badge className={reviewStatusConfig[review.status]?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {reviewStatusConfig[review.status]?.label}
                      </Badge>
                    </div>
                    {review.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        "{review.notes}"
                      </p>
                    )}
                    {review.reviewed_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed {format(new Date(review.reviewed_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Review</AlertDialogTitle>
            <AlertDialogDescription>
              {reviewAction === "approved" && "Are you sure you want to approve this formulation? This indicates you agree to the attribution rules."}
              {reviewAction === "rejected" && "Are you sure you want to reject this formulation? The formulation will need to be revised."}
              {reviewAction === "changes_requested" && "Are you sure you want to request changes? Please ensure you've added notes explaining what needs to change."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitReview}
              disabled={submitting}
              className={reviewAction === "rejected" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
