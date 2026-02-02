import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Globe, Sparkles, Zap, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function DomainMarketplace() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedDomain, setSearchedDomain] = useState("");

  // Fetch available domains
  const { data: domains, isLoading } = useQuery({
    queryKey: ["marketplace-domains", searchedDomain],
    queryFn: async () => {
      let query = supabase
        .from("tld_registered_domains")
        .select(`
          *,
          owned_tlds (tld_name, display_name)
        `)
        .eq("status", "available")
        .order("is_premium", { ascending: false })
        .order("price_usd", { ascending: false })
        .limit(50);

      if (searchedDomain) {
        query = query.ilike("domain_name", `%${searchedDomain}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch featured/premium domains
  const { data: featuredDomains } = useQuery({
    queryKey: ["featured-domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tld_registered_domains")
        .select(`
          *,
          owned_tlds (tld_name, display_name)
        `)
        .eq("status", "available")
        .eq("is_premium", true)
        .order("price_usd", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const handleSearch = () => {
    setSearchedDomain(searchQuery);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 px-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Web3 Domain Registry
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Own Your Piece of the
            <span className="text-primary"> .globalnet</span> Universe
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium blockchain-backed domains for your business, brand, or investment.
            Pay with XDK tokens via XODIAK wallet.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for a domain name..."
                className="pl-12 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Premium Domains */}
      {featuredDomains && featuredDomains.length > 0 && (
        <div className="px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold">Premium Domains</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredDomains.map((domain) => (
                <Card
                  key={domain.id}
                  className="group cursor-pointer hover:shadow-lg transition-all border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-background dark:from-amber-900/10"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {domain.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold mb-2">{domain.full_domain}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(Number(domain.price_usd))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Number(domain.price_xdk).toLocaleString()} XDK
                        </p>
                      </div>
                      <Button size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Available Domains */}
      <div className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {searchedDomain ? `Results for "${searchedDomain}"` : "Available Domains"}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-8 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : domains && domains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domains.map((domain) => (
                <Card
                  key={domain.id}
                  className={cn(
                    "group cursor-pointer hover:shadow-md transition-all",
                    domain.is_premium && "border-amber-200/50"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {domain.full_domain}
                      </p>
                      {domain.is_premium && (
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {domain.category || "General"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        .{(domain as any).owned_tlds?.tld_name}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-primary">
                          {domain.price_usd
                            ? formatPrice(Number(domain.price_usd))
                            : "Make Offer"}
                        </p>
                        {domain.price_xdk && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {Number(domain.price_xdk).toLocaleString()} XDK
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Domains Found</h3>
              <p className="text-muted-foreground">
                {searchedDomain
                  ? `No available domains matching "${searchedDomain}"`
                  : "No domains are currently available for sale"}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="px-6 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Find Your Domain</h3>
              <p className="text-sm text-muted-foreground">
                Search for available .globalnet domains that match your brand or business
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Pay with XDK</h3>
              <p className="text-sm text-muted-foreground">
                Connect your XODIAK wallet and pay with XDK tokens for instant settlement
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Own Your Domain</h3>
              <p className="text-sm text-muted-foreground">
                The domain NFT is transferred to your wallet. Configure DNS and launch!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
