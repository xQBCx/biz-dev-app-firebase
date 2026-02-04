import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Music, Clock, Phone, Globe, Heart, ArrowLeft, Play, Zap } from "lucide-react";
import { getVenueBySlug, MockVenue } from "@/data/mockVenues";

const VenueDetailMock = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<MockVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (slug) {
      const foundVenue = getVenueBySlug(slug);
      setVenue(foundVenue || null);
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground mb-4">Venue not found</p>
          <Button onClick={() => navigate("/")} variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
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
      
      <div className="container mx-auto px-3 sm:px-4 py-20 sm:py-24">
        {/* Back Button */}
        <Button 
          onClick={() => navigate("/")} 
          variant="ghost" 
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Explore
        </Button>

        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8">
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Live Badge */}
          {venue.is_live && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <Badge className="bg-red-500/90 text-white border-0 animate-pulse text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full mr-2" />
                LIVE
              </Badge>
            </div>
          )}

          {/* Crowd Level */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <Badge className={`border text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2 ${crowdColors[venue.crowd_level]}`}>
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {crowdLabels[venue.crowd_level]}
            </Badge>
          </div>

          {/* Venue Info */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-1 sm:mb-2 truncate">
                  {venue.name}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mb-2 sm:mb-4">{venue.type}</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {venue.current_genre && (
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      <Music className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {venue.current_genre}
                    </Badge>
                  )}
                  {venue.open_until && (
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Until {venue.open_until}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant={isFavorite ? "default" : "secondary"}
                size="lg"
                onClick={() => setIsFavorite(!isFavorite)}
                className="rounded-full shrink-0 self-end"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Address */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-card border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <span className="text-sm sm:text-base">{venue.address}</span>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-card border-border">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <a href={`tel:${venue.phone}`} className="text-foreground hover:text-primary transition-colors text-sm sm:text-base">
                {venue.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <a 
                href={venue.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors text-sm sm:text-base truncate"
              >
                Visit Website
              </a>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-card border-border">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">About</h2>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{venue.description}</p>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
            <TabsTrigger value="live" className="text-xs sm:text-sm">Live Feed</TabsTrigger>
            <TabsTrigger value="booking" className="text-xs sm:text-sm">Book Now</TabsTrigger>
            <TabsTrigger value="info" className="text-xs sm:text-sm">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            {/* Live Feed Placeholder */}
            <Card className="relative aspect-video bg-card border-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">Live feed will be available soon</p>
                  {venue.is_live && (
                    <Badge className="mt-3 bg-red-500/20 text-red-400 border-red-500/50">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse" />
                      Stream Starting Soon
                    </Badge>
                  )}
                </div>
              </div>
              {/* Scanline effect */}
              <div 
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
                }}
              />
            </Card>

            {/* Energy & Crowd Stats */}
            <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Current Vibe
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
                    {venue.energy_level}/10
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Energy Level</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2 capitalize">
                    {venue.crowd_level}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Crowd Density</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="booking">
            <Card className="p-4 sm:p-6 bg-card border-border">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Make a Reservation</h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Sign in to book a table or VIP experience at {venue.name}.
              </p>
              <div className="space-y-4">
                <Button className="w-full" size="lg" asChild>
                  <Link to="/auth">Sign In to Book</Link>
                </Button>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Don't have an account? <Link to="/auth" className="text-primary hover:underline">Create one</Link>
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <Card className="p-4 sm:p-6 bg-card border-border">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Venue Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground text-sm sm:text-base">Category</span>
                  <span className="text-foreground capitalize text-sm sm:text-base">{venue.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground text-sm sm:text-base">Type</span>
                  <span className="text-foreground text-sm sm:text-base">{venue.type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground text-sm sm:text-base">Open Until</span>
                  <span className="text-foreground text-sm sm:text-base">{venue.open_until}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground text-sm sm:text-base">Current Music</span>
                  <span className="text-foreground text-sm sm:text-base">{venue.current_genre}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground text-sm sm:text-base">Live Stream</span>
                  <Badge variant={venue.is_live ? "default" : "secondary"} className="text-xs">
                    {venue.is_live ? "Available" : "Offline"}
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VenueDetailMock;
