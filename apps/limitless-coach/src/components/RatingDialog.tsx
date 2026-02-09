import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "packages/supabase-client/src";
import { useToast } from "@/hooks/use-toast";

type RatingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  onRatingSubmitted: () => void;
};

export function RatingDialog({
  open,
  onOpenChange,
  bookingId,
  onRatingSubmitted,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert service rating (customer rating the service)
      const { error } = await supabase.from("ratings").insert({
        booking_id: bookingId,
        rater_id: user.id,
        rated_user_id: user.id, // For service ratings, we rate ourselves (will be updated by admin)
        rating: rating,
        comment: comment || null,
        rating_type: "service_rating",
      });

      if (error) throw error;

      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });

      onRatingSubmitted();
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Your Service</DialogTitle>
          <DialogDescription>
            How was your cleaning experience? Your feedback helps us improve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Tell us more about your experience (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
