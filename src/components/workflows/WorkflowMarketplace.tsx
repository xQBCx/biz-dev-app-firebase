import { useState } from "react";
import { useWorkflowMarketplace, MarketplaceListing } from "@/hooks/useWorkflowMarketplace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Star, Download, TrendingUp, Sparkles, Shield, Building,
  DollarSign, Check, Clock, Users, BarChart3, Filter, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  sales: { label: 'Sales & CRM', icon: TrendingUp, color: 'text-blue-500' },
  marketing: { label: 'Marketing', icon: Users, color: 'text-purple-500' },
  ai_content: { label: 'AI & Content', icon: Sparkles, color: 'text-pink-500' },
  operations: { label: 'Operations', icon: BarChart3, color: 'text-orange-500' },
  erp_audit: { label: 'ERP & Audit', icon: Building, color: 'text-emerald-500' },
};

const complianceConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  standard: { label: 'Standard', color: 'bg-slate-500/10 text-slate-500', icon: Check },
  enterprise: { label: 'Enterprise', color: 'bg-blue-500/10 text-blue-500', icon: Building },
  government: { label: 'Government', color: 'bg-purple-500/10 text-purple-500', icon: Shield },
};

export function WorkflowMarketplace() {
  const {
    listings,
    subscriptions,
    isLoading,
    subscribe,
    isSubscribed,
    getFeaturedListings,
    searchListings,
    getListingsByCategory,
  } = useWorkflowMarketplace();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

  const displayedListings = searchQuery
    ? searchListings(searchQuery)
    : selectedCategory
    ? getListingsByCategory(selectedCategory)
    : listings;

  const featuredListings = getFeaturedListings().slice(0, 3);

  const formatPrice = (listing: MarketplaceListing) => {
    if (listing.pricing_model === "free") return "Free";
    const price = (listing.price_cents / 100).toFixed(2);
    if (listing.pricing_model === "subscription") {
      return `$${price}/${listing.subscription_interval || 'month'}`;
    }
    return `$${price}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Workflows */}
      {featuredListings.length > 0 && !searchQuery && !selectedCategory && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Featured Workflows
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSubscribed={isSubscribed(listing.id)}
                onSubscribe={() => subscribe.mutate(listing.id)}
                onViewDetails={() => setSelectedListing(listing)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="gap-1"
            >
              <config.icon className={cn("w-4 h-4", selectedCategory !== key && config.color)} />
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {displayedListings.length === 0 ? (
        <Card className="p-12 text-center">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No workflows match your criteria</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSubscribed={isSubscribed(listing.id)}
              onSubscribe={() => subscribe.mutate(listing.id)}
              onViewDetails={() => setSelectedListing(listing)}
            />
          ))}
        </div>
      )}

      {/* Listing Detail Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <ListingDetail
              listing={selectedListing}
              isSubscribed={isSubscribed(selectedListing.id)}
              onSubscribe={() => {
                subscribe.mutate(selectedListing.id);
                setSelectedListing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListingCard({
  listing,
  isSubscribed,
  onSubscribe,
  onViewDetails,
  featured = false,
}: {
  listing: MarketplaceListing;
  isSubscribed: boolean;
  onSubscribe: () => void;
  onViewDetails: () => void;
  featured?: boolean;
}) {
  const category = categoryConfig[listing.category] || categoryConfig.operations;
  const compliance = complianceConfig[listing.compliance_level] || complianceConfig.standard;

  const formatPrice = () => {
    if (listing.pricing_model === "free") return "Free";
    const price = (listing.price_cents / 100).toFixed(2);
    if (listing.pricing_model === "subscription") {
      return `$${price}/${listing.subscription_interval || 'mo'}`;
    }
    return `$${price}`;
  };

  return (
    <Card className={cn(
      "hover:border-primary/50 transition-colors cursor-pointer",
      featured && "border-yellow-500/50 bg-yellow-500/5"
    )}>
      <CardHeader className="pb-3" onClick={onViewDetails}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <category.icon className={cn("w-5 h-5", category.color)} />
            <CardTitle className="text-base line-clamp-1">{listing.name}</CardTitle>
          </div>
          {featured && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {listing.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3" onClick={onViewDetails}>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className={compliance.color}>
            <compliance.icon className="w-3 h-3 mr-1" />
            {compliance.label}
          </Badge>
          {listing.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            {listing.average_rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {listing.total_installs}
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {listing.total_runs}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className={cn(
          "font-semibold",
          listing.pricing_model === "free" ? "text-green-500" : "text-primary"
        )}>
          {formatPrice()}
        </span>
        {isSubscribed ? (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            <Check className="w-3 h-3 mr-1" />
            Subscribed
          </Badge>
        ) : (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onSubscribe(); }}>
            {listing.pricing_model === "free" ? "Install" : "Subscribe"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ListingDetail({
  listing,
  isSubscribed,
  onSubscribe,
}: {
  listing: MarketplaceListing;
  isSubscribed: boolean;
  onSubscribe: () => void;
}) {
  const category = categoryConfig[listing.category] || categoryConfig.operations;
  const compliance = complianceConfig[listing.compliance_level] || complianceConfig.standard;

  const formatPrice = () => {
    if (listing.pricing_model === "free") return "Free";
    const price = (listing.price_cents / 100).toFixed(2);
    if (listing.pricing_model === "subscription") {
      return `$${price}/${listing.subscription_interval || 'month'}`;
    }
    return `$${price}`;
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", category.color, "bg-current/10")}>
            <category.icon className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-xl">{listing.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">Version {listing.version}</p>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-semibold">{listing.average_rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">{listing.review_count} reviews</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Download className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-semibold">{listing.total_installs}</p>
            <p className="text-xs text-muted-foreground">Installs</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <BarChart3 className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-semibold">{listing.total_runs}</p>
            <p className="text-xs text-muted-foreground">Total Runs</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-semibold">{formatPrice()}</p>
            <p className="text-xs text-muted-foreground">{listing.pricing_model}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={compliance.color}>
            <compliance.icon className="w-3 h-3 mr-1" />
            {compliance.label} Compliance
          </Badge>
          <Badge variant="secondary">
            <category.icon className="w-3 h-3 mr-1" />
            {category.label}
          </Badge>
          {listing.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">
            {listing.long_description || listing.description}
          </p>
        </div>

        {/* Documentation link */}
        {listing.documentation_url && (
          <div>
            <h3 className="font-semibold mb-2">Documentation</h3>
            <a
              href={listing.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Documentation →
            </a>
          </div>
        )}
      </div>

      <DialogFooter>
        {isSubscribed ? (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-sm py-2 px-4">
            <Check className="w-4 h-4 mr-2" />
            Already Subscribed
          </Badge>
        ) : (
          <Button onClick={onSubscribe} className="w-full sm:w-auto">
            {listing.pricing_model === "free" ? "Install Workflow" : `Subscribe for ${formatPrice()}`}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
