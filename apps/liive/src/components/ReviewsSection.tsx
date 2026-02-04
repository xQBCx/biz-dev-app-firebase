import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface ReviewsSectionProps {
  venueId: string;
}

const ReviewsSection = ({ venueId }: ReviewsSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [venueId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles for each review
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const reviewsWithProfiles = data.map(review => ({
          ...review,
          profiles: profilesMap.get(review.user_id) || { full_name: "Anonymous", avatar_url: null }
        }));
        
        setReviews(reviewsWithProfiles as Review[]);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (newRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          venue_id: venueId,
          user_id: user.id,
          rating: newRating,
          comment: newComment,
        });

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your experience",
      });

      setNewRating(0);
      setNewComment("");
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400"
            } ${interactive ? "cursor-pointer hover:text-yellow-400 transition-colors" : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <Card className="p-6 bg-card border-border">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">{averageRating}</div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(parseFloat(averageRating)))}
          </div>
          <p className="text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
      </Card>

      {/* Add Review Form */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">Write a Review</h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Rating
            </label>
            {renderStars(newRating, true, setNewRating)}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Review
            </label>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Customer Reviews</h3>
        {loading ? (
          <Card className="p-6 bg-card border-border">
            <p className="text-muted-foreground text-center">Loading reviews...</p>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="p-6 bg-card border-border">
            <p className="text-muted-foreground text-center">No reviews yet. Be the first to review!</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-6 bg-card border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {review.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {review.profiles?.full_name || "Anonymous"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
