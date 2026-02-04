import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Heart, Calendar, Star, MapPin, Clock, Users } from "lucide-react";

interface Booking {
  id: string;
  booking_date: string;
  party_size: number;
  status: string;
  special_requests: string | null;
  venue: {
    id: string;
    name: string;
    address: string;
    image_url: string;
  };
}

interface Favorite {
  id: string;
  venue: {
    id: string;
    name: string;
    type: string;
    image_url: string;
    address: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  venue: {
    id: string;
    name: string;
    image_url: string;
  };
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await Promise.all([fetchBookings(user.id), fetchFavorites(user.id), fetchReviews(user.id)]);
    setLoading(false);
  };

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        party_size,
        status,
        special_requests,
        venue:venues(id, name, address, image_url)
      `)
      .eq("user_id", userId)
      .order("booking_date", { ascending: false });

    if (error) {
      toast.error("Failed to load bookings");
      return;
    }
    setBookings(data as any);
  };

  const fetchFavorites = async (userId: string) => {
    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        venue:venues(id, name, type, image_url, address)
      `)
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to load favorites");
      return;
    }
    setFavorites(data as any);
  };

  const fetchReviews = async (userId: string) => {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        venue:venues(id, name, image_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load reviews");
      return;
    }
    setReviews(data as any);
  };

  const removeFavorite = async (favoriteId: string) => {
    const { error } = await supabase.from("favorites").delete().eq("id", favoriteId);
    if (error) {
      toast.error("Failed to remove favorite");
      return;
    }
    toast.success("Removed from favorites");
    setFavorites(favorites.filter((f) => f.id !== favoriteId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="w-4 h-4 mr-2" />
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4 mt-6">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No bookings yet. Start exploring venues!
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={booking.venue.image_url}
                      alt={booking.venue.name}
                      className="w-full md:w-48 h-48 object-cover"
                    />
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="text-xl font-bold cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/venue/${booking.venue.id}`)}
                        >
                          {booking.venue.name}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.venue.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(booking.booking_date).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Party of {booking.party_size}
                        </div>
                        {booking.special_requests && (
                          <p className="mt-2">
                            <strong>Special requests:</strong> {booking.special_requests}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4 mt-6">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No favorites yet. Start exploring venues!
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="overflow-hidden">
                    <img
                      src={favorite.venue.image_url}
                      alt={favorite.venue.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3
                        className="text-lg font-bold mb-2 cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/venue/${favorite.venue.id}`)}
                      >
                        {favorite.venue.name}
                      </h3>
                      <Badge className="mb-2">{favorite.venue.type}</Badge>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {favorite.venue.address}
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => removeFavorite(favorite.id)}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Remove Favorite
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-6">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No reviews yet. Visit venues and share your experience!
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <img
                          src={review.venue.image_url}
                          alt={review.venue.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <CardTitle
                            className="cursor-pointer hover:text-primary"
                            onClick={() => navigate(`/venue/${review.venue.id}`)}
                          >
                            {review.venue.name}
                          </CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
