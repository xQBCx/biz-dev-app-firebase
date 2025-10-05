import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface FranchiseReviewsProps {
  franchiseId: string;
}

export function FranchiseReviews({ franchiseId }: FranchiseReviewsProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["franchise-reviews", franchiseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("franchise_reviews")
        .select("*")
        .eq("franchise_id", franchiseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No reviews yet. Be the first to review this franchise!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Franchisee</span>
                    {review.verified_franchisee && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-1">{review.title}</h4>
                <p className="text-muted-foreground text-sm">{review.review_text}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
