import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Car, LogOut, User, Star } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { RatingDialog } from "@/components/RatingDialog";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  address: string;
  city: string;
  zip_code: string;
  notes: string | null;
  vehicle_info: string | null;
  created_at: string;
  hasRating?: boolean;
};

type Profile = {
  full_name: string | null;
  customer_rating: number;
  avatar_url: string | null;
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [receivedRatings, setReceivedRatings] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const [bookingsRes, profileRes, ratingsRes, receivedRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("full_name, customer_rating, avatar_url")
          .eq("id", session?.user.id)
          .single(),
        supabase
          .from("ratings")
          .select("booking_id")
          .eq("rater_id", session?.user.id)
          .eq("rating_type", "service_rating"),
        supabase
          .from("ratings")
          .select(`
            *,
            bookings (
              service_type,
              preferred_date
            )
          `)
          .eq("rated_user_id", session?.user.id)
          .eq("rating_type", "customer_rating")
          .order("created_at", { ascending: false })
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      
      // Mark bookings that already have ratings
      const ratedBookingIds = new Set(ratingsRes.data?.map(r => r.booking_id) || []);
      const bookingsWithRatings = (bookingsRes.data || []).map(booking => ({
        ...booking,
        hasRating: ratedBookingIds.has(booking.id)
      }));
      
      setBookings(bookingsWithRatings);
      setReceivedRatings(receivedRes.data || []);
      
      if (!profileRes.error) {
        setProfile(profileRes.data);
      }
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

  const handleRateService = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setRatingDialogOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/ratings-history")}>
                <Star className="h-4 w-4 mr-2" />
                Ratings
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          
          {profile && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {profile.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{profile.full_name || "Guest"}</p>
                <p className="text-sm text-muted-foreground">
                  ⭐ {profile.customer_rating.toFixed(1)} customer rating
                </p>
              </div>
            </div>
          )}
          
          <p className="text-muted-foreground mt-4">{bookings.length} booking(s)</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Recent Ratings Received */}
        {receivedRatings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Ratings from Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receivedRatings.slice(0, 3).map((rating) => (
                  <div key={rating.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{rating.rating}/5</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rating.bookings?.service_type}
                    </p>
                    {rating.comment && (
                      <p className="text-sm italic mt-2">"{rating.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
              {receivedRatings.length > 3 && (
                <Button
                  variant="link"
                  onClick={() => navigate("/ratings-history")}
                  className="mt-4 w-full"
                >
                  View All Ratings
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
              <Button onClick={() => navigate("/booking")}>Book a Service</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{booking.service_type}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Booking ID: {booking.id.slice(0, 8)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.preferred_date} at {booking.preferred_time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.address}<br />
                          {booking.city}, {booking.zip_code}
                        </p>
                      </div>
                    </div>

                    {booking.vehicle_info && (
                      <div className="flex items-start gap-3">
                        <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Vehicle</p>
                          <p className="text-sm text-muted-foreground">{booking.vehicle_info}</p>
                        </div>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="pt-3 border-t">
                        <p className="font-medium mb-1">Notes</p>
                        <p className="text-sm text-muted-foreground">{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  {booking.status === "completed" && !booking.hasRating && (
                    <Button
                      onClick={() => handleRateService(booking.id)}
                      variant="outline"
                      className="w-full"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate This Service
                    </Button>
                  )}

                  {booking.hasRating && (
                    <div className="text-center text-sm text-muted-foreground">
                      ✓ You've rated this service
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <RatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        bookingId={selectedBookingId || ""}
        onRatingSubmitted={fetchBookings}
      />
    </div>
  );
}
