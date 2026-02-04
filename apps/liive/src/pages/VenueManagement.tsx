import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Calendar, MessageSquare } from "lucide-react";
import { VenueForm } from "@/components/VenueForm";

interface Venue {
  id: string;
  name: string;
  type: string;
  category: string;
  image_url: string | null;
  is_live: boolean;
  verified: boolean;
}

interface VenueStats {
  totalBookings: number;
  pendingBookings: number;
  totalReviews: number;
  averageRating: number;
}

export default function VenueManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [stats, setStats] = useState<Record<string, VenueStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchVenues(session.user.id);
  };

  const fetchVenues = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("owner_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load venues",
        variant: "destructive",
      });
    } else {
      setVenues(data || []);
      // Fetch stats for each venue
      (data || []).forEach(venue => fetchVenueStats(venue.id));
    }
    setIsLoading(false);
  };

  const fetchVenueStats = async (venueId: string) => {
    const [bookingsData, reviewsData] = await Promise.all([
      supabase
        .from("bookings")
        .select("status")
        .eq("venue_id", venueId),
      supabase
        .from("reviews")
        .select("rating")
        .eq("venue_id", venueId)
    ]);

    const bookings = bookingsData.data || [];
    const reviews = reviewsData.data || [];

    setStats(prev => ({
      ...prev,
      [venueId]: {
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === "pending").length,
        totalReviews: reviews.length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0
      }
    }));
  };

  const handleVenueCreated = async () => {
    setShowForm(false);
    setSelectedVenue(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      fetchVenues(session.user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Venue Management</h1>
          <p className="text-muted-foreground mt-2">Manage your venues and track performance</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Venue
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{selectedVenue ? "Edit Venue" : "Add New Venue"}</CardTitle>
            <CardDescription>
              {selectedVenue ? "Update venue information" : "Create a new venue listing"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VenueForm
              venue={selectedVenue}
              onSuccess={handleVenueCreated}
              onCancel={() => {
                setShowForm(false);
                setSelectedVenue(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {venues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No venues yet. Create your first venue!</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Venue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {venues.map((venue) => {
            const venueStats = stats[venue.id];
            return (
              <Card key={venue.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {venue.image_url && (
                        <img
                          src={venue.image_url}
                          alt={venue.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <CardTitle>{venue.name}</CardTitle>
                        <CardDescription>
                          {venue.type} • {venue.category}
                          {venue.verified && (
                            <span className="ml-2 text-primary">✓ Verified</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedVenue(venue);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="bookings">Bookings</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-semibold">
                              {venue.is_live ? "Live" : "Offline"}
                            </p>
                          </div>
                        </div>
                        {venueStats && (
                          <>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Bookings</p>
                                <p className="font-semibold">{venueStats.totalBookings}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="font-semibold">{venueStats.pendingBookings}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Reviews</p>
                                <p className="font-semibold">
                                  {venueStats.averageRating.toFixed(1)} ({venueStats.totalReviews})
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="bookings">
                      <p className="text-muted-foreground">Bookings management coming soon</p>
                    </TabsContent>
                    <TabsContent value="reviews">
                      <p className="text-muted-foreground">Reviews management coming soon</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
