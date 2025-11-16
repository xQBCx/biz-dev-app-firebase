import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, DollarSign, Package, TrendingUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  listing_type: string;
  category: string;
  target_market: string;
  price_range: string;
  commission_type: string;
  commission_value: number;
  expected_volume: number;
  marketing_materials_url: string;
  status: string;
  created_at: string;
}

export default function MarketplaceListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [marketerProfile, setMarketerProfile] = useState<any>(null);

  useEffect(() => {
    fetchListing();
    if (user) {
      checkMarketerProfile();
    }
  }, [id, user]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error: any) {
      toast.error("Failed to load listing");
      navigate("/marketplace/listings");
    } finally {
      setLoading(false);
    }
  };

  const checkMarketerProfile = async () => {
    try {
      const { data } = await supabase
        .from("marketer_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      
      setMarketerProfile(data);
    } catch (error) {
      // No profile found
    }
  };

  const handleRequestPartnership = async () => {
    if (!user) {
      toast.error("Please log in to request a partnership");
      navigate("/auth");
      return;
    }

    if (!marketerProfile) {
      toast.error("You need a marketer profile to request partnerships");
      navigate("/marketplace/marketer/create");
      return;
    }

    setRequesting(true);
    try {
      const { error } = await supabase.from("marketplace_connections").insert([{
        listing_id: id!,
        marketer_id: marketerProfile.id,
        product_owner_id: listing?.user_id!,
        status: "pending",
        commission_agreed: listing?.commission_value,
        commission_type: listing?.commission_type as "percentage" | "flat_fee" | "tiered",
      }]);

      if (error) throw error;

      toast.success("Partnership request sent!");
      navigate("/marketplace/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to send request");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace/listings")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <Badge variant={listing.listing_type === "product" ? "default" : "secondary"}>
                  {listing.listing_type}
                </Badge>
                <Badge variant="outline">{listing.category}</Badge>
              </div>
              <Badge>{listing.status}</Badge>
            </div>
            <CardTitle className="text-3xl text-foreground">{listing.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Commission Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="ml-2 text-sm font-medium capitalize">
                      {listing.commission_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Value:</span>
                    <span className="ml-2 text-sm font-medium text-primary">
                      {listing.commission_value}
                      {listing.commission_type === "percentage" ? "%" : " USD"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Market Info
                </h3>
                <div className="space-y-2">
                  {listing.target_market && (
                    <div>
                      <span className="text-sm text-muted-foreground">Target Market:</span>
                      <span className="ml-2 text-sm font-medium">{listing.target_market}</span>
                    </div>
                  )}
                  {listing.price_range && (
                    <div>
                      <span className="text-sm text-muted-foreground">Price Range:</span>
                      <span className="ml-2 text-sm font-medium">{listing.price_range}</span>
                    </div>
                  )}
                  {listing.expected_volume && (
                    <div>
                      <span className="text-sm text-muted-foreground">Expected Volume:</span>
                      <span className="ml-2 text-sm font-medium">{listing.expected_volume}/mo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {listing.marketing_materials_url && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Resources</h3>
                  <Button
                    variant="outline"
                    onClick={() => window.open(listing.marketing_materials_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Marketing Materials
                  </Button>
                </div>
              </>
            )}

            {user?.id !== listing.user_id && (
              <>
                <Separator />
                <div className="flex gap-4">
                  <Button
                    className="flex-1"
                    onClick={handleRequestPartnership}
                    disabled={requesting}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {requesting ? "Sending Request..." : "Request Partnership"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
