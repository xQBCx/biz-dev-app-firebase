import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Music, Clock, Phone, Globe, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookingForm from "@/components/BookingForm";
import ReviewsSection from "@/components/ReviewsSection";
import LiveFeedPlayer from "@/components/LiveFeedPlayer";

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [crowdAnalysis, setCrowdAnalysis] = useState<any>(null);

  const handleCrowdAnalysis = async (data: any) => {
    setCrowdAnalysis(data);
    // Refresh venue data to get updated crowd level
    if (id) {
      const { data: updatedVenue } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .single();
      if (updatedVenue) {
        setVenue(updatedVenue);
      }
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setVenue(data);

        // Check if venue is favorited
        if (user) {
          const { data: favoriteData } = await supabase
            .from("favorites")
            .select("*")
            .eq("venue_id", id)
            .eq("user_id", user.id)
            .single();
          
          setIsFavorite(!!favoriteData);
        }
      } catch (error) {
        console.error("Error fetching venue:", error);
        toast({
          title: "Error",
          description: "Failed to load venue details",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenue();
    }
  }, [id, user, navigate, toast]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("venue_id", id)
          .eq("user_id", user.id);
        
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
        });
      } else {
        await supabase
          .from("favorites")
          .insert({ venue_id: id, user_id: user.id });
        
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Venue not found</p>
        </div>
      </div>
    );
  }

  const crowdColors = {
    low: "bg-green-500/20 text-green-400 border-green-500/50",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    packed: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  const crowdLabels = {
    low: "Chill",
    medium: "Moderate",
    high: "Busy",
    packed: "Packed",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
          <img
            src={venue.image_url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745"}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          
          {/* Live Badge */}
          {venue.is_live && (
            <div className="absolute top-6 right-6">
              <Badge className="bg-red-500/90 text-white border-0 animate-pulse-glow text-lg px-4 py-2">
                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                LIVE
              </Badge>
            </div>
          )}

          {/* Crowd Level */}
          <div className="absolute top-6 left-6">
            <Badge className={`border text-lg px-4 py-2 ${crowdColors[venue.crowd_level as keyof typeof crowdColors]}`}>
              <Users className="w-4 h-4 mr-2" />
              {crowdLabels[venue.crowd_level as keyof typeof crowdLabels]}
            </Badge>
          </div>

          {/* Venue Info */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  {venue.name}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">{venue.type}</p>
                <div className="flex flex-wrap gap-3">
                  {venue.current_genre && (
                    <Badge variant="secondary" className="text-sm">
                      <Music className="w-4 h-4 mr-2" />
                      {venue.current_genre}
                    </Badge>
                  )}
                  {venue.address && (
                    <Badge variant="secondary" className="text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {venue.address}
                    </Badge>
                  )}
                  {venue.open_until && (
                    <Badge variant="secondary" className="text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      Until {venue.open_until}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant={isFavorite ? "default" : "secondary"}
                size="lg"
                onClick={toggleFavorite}
                className="rounded-full"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {(venue.phone || venue.website) && (
          <Card className="p-6 mb-8 bg-card border-border">
            <div className="flex flex-wrap gap-6">
              {venue.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href={`tel:${venue.phone}`} className="text-foreground hover:text-primary transition-colors">
                    {venue.phone}
                  </a>
                </div>
              )}
              {venue.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <a 
                    href={venue.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Description */}
        {venue.description && (
          <Card className="p-6 mb-8 bg-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="live">Live Feed</TabsTrigger>
            <TabsTrigger value="booking">Book Now</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            <LiveFeedPlayer
              venueId={venue.id}
              videoUrl={venue.video_feed_url}
              venueType={venue.type}
              onCrowdAnalysis={handleCrowdAnalysis}
            />

            {/* AI Analysis Summary */}
            {crowdAnalysis && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Latest AI Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {crowdAnalysis.energyLevel}/10
                    </div>
                    <p className="text-sm text-muted-foreground">Energy Level</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2 capitalize">
                      {crowdAnalysis.crowdLevel}
                    </div>
                    <p className="text-sm text-muted-foreground">Crowd Density</p>
                  </div>
                  {crowdAnalysis.estimatedCount && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {crowdAnalysis.estimatedCount}
                      </div>
                      <p className="text-sm text-muted-foreground">Est. People</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="booking">
            <BookingForm venueId={venue.id} venueName={venue.name} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsSection venueId={venue.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VenueDetail;
