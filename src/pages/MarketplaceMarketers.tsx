import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Briefcase, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface MarketerProfile {
  id: string;
  user_id: string;
  business_name: string;
  specialization: string[];
  experience_years: number;
  target_industries: string[];
  marketing_channels: string[];
  bio: string;
  verified: boolean;
  rating: number;
  total_deals: number;
}

export default function MarketplaceMarketers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [marketers, setMarketers] = useState<MarketerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMarketers();
  }, []);

  const fetchMarketers = async () => {
    try {
      const { data, error } = await supabase
        .from("marketer_profiles")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      setMarketers(data || []);
    } catch (error: any) {
      toast.error("Failed to load marketers");
    } finally {
      setLoading(false);
    }
  };

  const filteredMarketers = marketers.filter((marketer) =>
    marketer.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marketer.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Marketer Profiles</h1>
            <p className="text-muted-foreground">Connect with proven marketing professionals</p>
          </div>
          {user && (
            <Button onClick={() => navigate("/marketplace/marketer/create")}>
              Create Profile
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search marketers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Marketers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading marketers...</p>
          </div>
        ) : filteredMarketers.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No marketers found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarketers.map((marketer) => (
              <Card key={marketer.id} className="bg-card border-border hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-foreground">{marketer.business_name}</CardTitle>
                    {marketer.verified && (
                      <Badge variant="default">Verified</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {marketer.bio}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{marketer.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({marketer.total_deals} deals)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{marketer.experience_years} years experience</span>
                    </div>

                    {marketer.specialization && marketer.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {marketer.specialization.slice(0, 3).map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/marketplace/marketers/${marketer.id}`)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
