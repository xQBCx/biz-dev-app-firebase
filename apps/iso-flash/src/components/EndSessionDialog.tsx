import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EndSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
  userId: string;
}

export function EndSessionDialog({ open, onOpenChange, session, userId }: EndSessionDialogProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const isClient = userId === session?.client_id;

  const endSession = useMutation({
    mutationFn: async () => {
      if (!session?.id) throw new Error("No session");

      // Calculate duration and total amount
      const startedAt = new Date(session.started_at);
      const endedAt = new Date();
      const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);
      const totalAmount = (session.hourly_rate / 60) * durationMinutes;

      // Update session
      const { error: sessionError } = await supabase
        .from("sessions")
        .update({
          status: "completed",
          ended_at: endedAt.toISOString(),
          duration_minutes: durationMinutes,
          total_amount: parseFloat(totalAmount.toFixed(2)),
        })
        .eq("id", session.id);

      if (sessionError) throw sessionError;

      // If client, create rating
      if (isClient && rating > 0) {
        const { error: ratingError } = await supabase
          .from("ratings")
          .insert({
            session_id: session.id,
            photographer_id: session.photographer_id,
            client_id: session.client_id,
            rating,
            review: review || null,
          });

        if (ratingError) throw ratingError;

        // Update photographer stats
        const { data: ratings } = await supabase
          .from("ratings")
          .select("rating")
          .eq("photographer_id", session.photographer_id);

        if (ratings) {
          const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
          await supabase
            .from("profiles")
            .update({
              rating: avgRating,
              total_sessions: (session.photographer?.total_sessions || 0) + 1,
            })
            .eq("id", session.photographer_id);
        }
      }

      // Update client total sessions
      await supabase
        .from("profiles")
        .update({
          total_sessions: (session.client?.total_sessions || 0) + 1,
        })
        .eq("id", session.client_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", session?.id] });
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["photographer-sessions"] });
      toast.success("Session completed!");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to end session");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Session Duration</p>
            <p className="text-2xl font-bold">
              {session?.started_at
                ? Math.round((new Date().getTime() - new Date(session.started_at).getTime()) / 60000)
                : 0}{" "}
              minutes
            </p>
          </div>

          {isClient && (
            <>
              <div>
                <Label>Rate your photographer</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? "text-warning fill-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="review">Review (optional)</Label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => endSession.mutate()}
              disabled={endSession.isPending}
            >
              {endSession.isPending ? "Ending..." : "End Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
