import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ArrowLeft } from "lucide-react";

type Rating = {
  id: string;
  rating: number;
  comment: string | null;
  rating_type: string;
  created_at: string;
  booking_id: string;
  rater_id: string;
  rated_user_id: string;
  bookings?: {
    service_type: string;
    preferred_date: string;
  };
  rater_profile?: {
    full_name: string;
  };
  rated_profile?: {
    full_name: string;
  };
};

export default function RatingsHistory() {
  const [receivedRatings, setReceivedRatings] = useState<Rating[]>([]);
  const [givenRatings, setGivenRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!roleData);
    fetchRatings(user.id);
  };

  const fetchRatings = async (userId: string) => {
    try {
      // Fetch ratings received by the user
      const { data: received, error: receivedError } = await supabase
        .from("ratings")
        .select(`
          *,
          bookings (
            service_type,
            preferred_date
          )
        `)
        .eq("rated_user_id", userId)
        .order("created_at", { ascending: false });

      if (receivedError) throw receivedError;

      // Fetch rater profiles for received ratings
      const raterIds = received?.map(r => r.rater_id) || [];
      const { data: raterProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", raterIds);

      // Fetch ratings given by the user
      const { data: given, error: givenError } = await supabase
        .from("ratings")
        .select(`
          *,
          bookings (
            service_type,
            preferred_date
          )
        `)
        .eq("rater_id", userId)
        .order("created_at", { ascending: false });

      if (givenError) throw givenError;

      // Fetch rated profiles for given ratings
      const ratedIds = given?.map(r => r.rated_user_id) || [];
      const { data: ratedProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ratedIds);

      // Combine data
      const receivedWithProfiles = received?.map(r => ({
        ...r,
        rater_profile: raterProfiles?.find(p => p.id === r.rater_id)
      }));

      const givenWithProfiles = given?.map(r => ({
        ...r,
        rated_profile: ratedProfiles?.find(p => p.id === r.rated_user_id)
      }));

      setReceivedRatings(receivedWithProfiles || []);
      setGivenRatings(givenWithProfiles || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingCard = (rating: Rating, type: "received" | "given") => {
    const otherUserName = type === "received" 
      ? rating.rater_profile?.full_name || "Unknown"
      : rating.rated_profile?.full_name || "Unknown";
    
    const roleLabel = rating.rating_type === "customer_rating" 
      ? "Customer Rating" 
      : "Service Rating";

    return (
      <Card key={rating.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {type === "received" ? `From: ${otherUserName}` : `To: ${otherUserName}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {rating.bookings?.service_type} - {new Date(rating.bookings?.preferred_date || "").toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline">{roleLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            {renderStars(rating.rating)}
            <span className="font-semibold">{rating.rating}/5</span>
          </div>
          {rating.comment && (
            <p className="text-sm text-muted-foreground italic">"{rating.comment}"</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(rating.created_at).toLocaleDateString()} at {new Date(rating.created_at).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading ratings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Ratings History</h1>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="received">
              Received ({receivedRatings.length})
            </TabsTrigger>
            <TabsTrigger value="given">
              Given ({givenRatings.length})
            </TabsTrigger>
          </TabsList>

          <Separator className="my-6" />

          <TabsContent value="received">
            {receivedRatings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No ratings received yet
                </CardContent>
              </Card>
            ) : (
              <div>
                {receivedRatings.map((rating) => renderRatingCard(rating, "received"))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="given">
            {givenRatings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No ratings given yet
                </CardContent>
              </Card>
            ) : (
              <div>
                {givenRatings.map((rating) => renderRatingCard(rating, "given"))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
