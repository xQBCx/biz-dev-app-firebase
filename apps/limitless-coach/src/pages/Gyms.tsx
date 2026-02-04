import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, Dumbbell, Clock, DollarSign, Star, ExternalLink, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GymLocation {
  id: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  website: string | null;
  amenities: string[];
  monthly_price_estimate: number | null;
  has_personal_training: boolean;
  featured: boolean;
  referral_link: string | null;
  promo_code: string | null;
  gym_brands: {
    name: string;
    logo_url: string | null;
  } | null;
}

export default function Gyms() {
  const [searchZip, setSearchZip] = useState("");
  const [searchCity, setSearchCity] = useState("Houston");
  const [searchState, setSearchState] = useState("TX");
  const { toast } = useToast();

  const { data: gyms, isLoading, refetch } = useQuery({
    queryKey: ["gym-locations", searchCity, searchState, searchZip],
    queryFn: async () => {
      let query = supabase
        .from("gym_locations")
        .select(`
          *,
          gym_brands (
            name,
            logo_url
          )
        `)
        .eq("is_active", true)
        .order("featured", { ascending: false });

      if (searchZip) {
        query = query.eq("zip_code", searchZip);
      } else if (searchCity && searchState) {
        query = query.ilike("city", `%${searchCity}%`).eq("state", searchState);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GymLocation[];
    },
  });

  const handleReferralClick = async (gym: GymLocation) => {
    // Track the referral click
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("gym_referrals").insert({
      user_id: user?.id || null,
      gym_location_id: gym.id,
      source: "app",
      referral_code: gym.promo_code,
    });

    // Open the referral link or website
    const url = gym.referral_link || gym.website;
    if (url) {
      window.open(url, "_blank");
    }

    toast({
      title: "Opening gym website",
      description: gym.promo_code ? `Use code: ${gym.promo_code}` : "Check out their membership options!",
    });
  };

  const getAmenityIcon = (amenity: string) => {
    return <Badge key={amenity} variant="secondary" className="text-xs">{amenity}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Dumbbell className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Gym</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover partner gyms near you with exclusive member benefits and promo codes
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto bg-card rounded-xl p-6 shadow-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">City</label>
                <Input
                  placeholder="Houston"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Input
                  placeholder="TX"
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value.toUpperCase())}
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Zip Code</label>
                <Input
                  placeholder="77001"
                  value={searchZip}
                  onChange={(e) => setSearchZip(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={() => refetch()} className="w-full mt-4" size="lg">
              <Search className="mr-2 h-5 w-5" />
              Search Gyms
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            {gyms?.length || 0} Gyms Found
            {searchCity && ` in ${searchCity}, ${searchState}`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : gyms && gyms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <Card key={gym.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${gym.featured ? 'ring-2 ring-primary' : ''}`}>
                {gym.featured && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                    <Star className="h-3 w-3 inline mr-1" />
                    Featured
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{gym.name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {gym.address && `${gym.address}, `}{gym.city}, {gym.state} {gym.zip_code}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gym.gym_brands?.name && (
                    <Badge variant="outline">{gym.gym_brands.name}</Badge>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(gym.amenities) && gym.amenities.slice(0, 4).map((amenity) => getAmenityIcon(amenity))}
                    {Array.isArray(gym.amenities) && gym.amenities.length > 4 && (
                      <Badge variant="secondary" className="text-xs">+{gym.amenities.length - 4} more</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {gym.monthly_price_estimate && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ~${gym.monthly_price_estimate}/mo
                      </span>
                    )}
                    {gym.has_personal_training && (
                      <Badge variant="secondary">Personal Training</Badge>
                    )}
                  </div>

                  {gym.promo_code && (
                    <div className="bg-primary/10 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Exclusive Promo Code</p>
                      <p className="font-mono font-bold text-primary">{gym.promo_code}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleReferralClick(gym)} 
                      className="flex-1"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Get Membership
                    </Button>
                    {gym.phone && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={`tel:${gym.phone}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Dumbbell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No gyms found in this area</h3>
            <p className="text-muted-foreground mb-4">
              We're actively adding partner gyms. Try a different location or check back soon!
            </p>
            <Button variant="outline" onClick={() => {
              setSearchCity("Houston");
              setSearchState("TX");
              setSearchZip("");
            }}>
              Search Houston, TX
            </Button>
          </div>
        )}

        {/* Partner CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Own a Gym?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Partner with Limitless Coach to reach motivated fitness enthusiasts. 
            Get exposure to our community of users looking for gym memberships.
          </p>
          <Button size="lg" variant="outline">
            Become a Partner Gym
          </Button>
        </div>
      </div>
    </div>
  );
}
