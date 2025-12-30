import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MapPin, 
  Droplets, 
  Shield, 
  ShieldCheck,
  Activity,
  Clock,
  ArrowLeft,
  Plus,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Listing {
  id: string;
  product_type: string;
  product_grade: string | null;
  quantity: number;
  quantity_unit: string;
  location: string;
  origin_country: string | null;
  price_type: string;
  price_per_unit: number | null;
  currency: string;
  delivery_terms: string | null;
  verification_status: string;
  tank_level_percent: number | null;
  okari_device_id: string | null;
  status: string;
  created_at: string;
  seller: {
    company_name: string | null;
    trust_tier: string;
    okari_enabled: boolean;
  } | null;
}

const PRODUCT_TYPES = [
  "All Products",
  "D6 Fuel Oil",
  "D2 Diesel",
  "Jet A1",
  "Crude Oil",
  "LNG",
  "Gold",
  "Silver",
  "Copper",
  "Agricultural"
];

const verificationBadge = (status: string, okariEnabled: boolean) => {
  if (okariEnabled && status === 'okari_live') {
    return (
      <Badge className="bg-emerald-500 gap-1">
        <Activity className="h-3 w-3 animate-pulse" />
        Okari Live
      </Badge>
    );
  }
  if (status === 'fully_verified') {
    return (
      <Badge className="bg-blue-500 gap-1">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </Badge>
    );
  }
  if (status === 'document_verified') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Shield className="h-3 w-3" />
        Doc Verified
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="h-3 w-3" />
      Pending
    </Badge>
  );
};

const tierBadge = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return <Badge className="bg-primary text-primary-foreground">Platinum</Badge>;
    case 'gold':
      return <Badge className="bg-amber-500">Gold</Badge>;
    default:
      return <Badge variant="secondary">Silver</Badge>;
  }
};

export default function XCommodityMarketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState("All Products");
  const [verificationFilter, setVerificationFilter] = useState("all");

  useEffect(() => {
    fetchListings();
  }, [productFilter, verificationFilter]);

  const fetchListings = async () => {
    setLoading(true);
    
    let query = supabase
      .from('commodity_listings')
      .select(`
        *,
        seller:commodity_user_profiles!commodity_listings_seller_id_fkey(
          company_name,
          trust_tier,
          okari_enabled
        )
      `)
      .in('status', ['active', 'verified'])
      .order('created_at', { ascending: false });

    if (productFilter !== "All Products") {
      query = query.eq('product_type', productFilter);
    }

    if (verificationFilter === 'okari') {
      query = query.eq('verification_status', 'okari_live');
    } else if (verificationFilter === 'verified') {
      query = query.in('verification_status', ['document_verified', 'fully_verified', 'okari_live']);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load listings");
      console.error(error);
    } else {
      setListings(data || []);
    }
    
    setLoading(false);
  };

  const filteredListings = listings.filter(listing => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.product_type.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.seller?.company_name?.toLowerCase().includes(query)
    );
  });

  const formatQuantity = (qty: number, unit: string) => {
    if (qty >= 1e6) return `${(qty / 1e6).toFixed(1)}M ${unit}`;
    if (qty >= 1e3) return `${(qty / 1e3).toFixed(0)}K ${unit}`;
    return `${qty.toLocaleString()} ${unit}`;
  };

  const formatPrice = (price: number | null, currency: string, priceType: string) => {
    if (priceType === 'negotiable') return 'Negotiable';
    if (priceType === 'platts_linked') return 'Platts Linked';
    if (!price) return 'Contact';
    return `${currency} ${price.toFixed(2)}/unit`;
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/xcommodity')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Verified Marketplace</h1>
            <p className="text-muted-foreground">
              {filteredListings.length} verified listings available
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchListings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/xcommodity/listings/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products, locations, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Product Type" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="okari">Okari Live</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="h-8 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No listings found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or create a new listing
            </p>
            <Button onClick={() => navigate('/xcommodity/listings/new')}>
              Create Listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map(listing => (
            <Card 
              key={listing.id}
              className="cursor-pointer transition-all hover:border-primary/50"
              onClick={() => navigate(`/xcommodity/listings/${listing.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{listing.product_type}</CardTitle>
                    {listing.product_grade && (
                      <p className="text-sm text-muted-foreground">{listing.product_grade}</p>
                    )}
                  </div>
                  {verificationBadge(
                    listing.verification_status, 
                    listing.seller?.okari_enabled || false
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Tank Level Visual (if Okari enabled) */}
                {listing.tank_level_percent !== null && (
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${listing.tank_level_percent}%` }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{formatQuantity(listing.quantity, listing.quantity_unit)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">
                      {formatPrice(listing.price_per_unit, listing.currency, listing.price_type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {listing.location}
                  {listing.origin_country && ` • ${listing.origin_country}`}
                </div>

                {listing.delivery_terms && (
                  <Badge variant="outline" className="text-xs">
                    {listing.delivery_terms}
                  </Badge>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    {listing.seller?.company_name || 'Private Seller'}
                  </div>
                  {listing.seller?.trust_tier && tierBadge(listing.seller.trust_tier)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
