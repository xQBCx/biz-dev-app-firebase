import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  description: string;
  listing_type: "product" | "service";
  category: string;
  commission_type: string;
  commission_value: number;
  status: string;
  created_at: string;
}

export default function MarketplaceListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || listing.listing_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Product Listings</h1>
            <p className="text-muted-foreground">Browse products and services seeking marketers</p>
          </div>
          {user && (
            <Button onClick={() => navigate("/marketplace/listings/create")}>
              Create Listing
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Products</SelectItem>
              <SelectItem value="service">Services</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No listings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={listing.listing_type === "product" ? "default" : "secondary"}>
                      {listing.listing_type}
                    </Badge>
                    <Badge variant="outline">{listing.category}</Badge>
                  </div>
                  <CardTitle className="text-foreground">{listing.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {listing.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-primary">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">
                        {listing.commission_value}%
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground capitalize">
                      {listing.commission_type}
                    </span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/marketplace/listings/${listing.id}`)}
                  >
                    View Details
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
