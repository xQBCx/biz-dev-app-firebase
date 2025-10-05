import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, DollarSign, TrendingUp, MapPin, Star, Eye } from "lucide-react";

interface FranchiseCardProps {
  franchise: any;
  onClick: () => void;
  isOwner?: boolean;
}

export function FranchiseCard({ franchise, onClick, isOwner }: FranchiseCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Banner Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        {franchise.banner_url ? (
          <img
            src={franchise.banner_url}
            alt={franchise.brand_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-16 h-16 text-primary/40" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {franchise.is_featured && (
            <Badge variant="default" className="gap-1">
              <Star className="w-3 h-3" />
              Featured
            </Badge>
          )}
          {isOwner && (
            <Badge variant="secondary">Your Listing</Badge>
          )}
        </div>

        {/* Logo */}
        {franchise.logo_url && (
          <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-lg border-4 border-background bg-card overflow-hidden shadow-lg">
            <img
              src={franchise.logo_url}
              alt={franchise.brand_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pt-10">
        <div className="mb-4">
          <h3 className="font-bold text-xl mb-1 line-clamp-1">{franchise.brand_name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{franchise.description}</p>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Investment
            </span>
            <span className="font-semibold">
              {formatCurrency(franchise.investment_min)} - {formatCurrency(franchise.investment_max)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Franchise Fee
            </span>
            <span className="font-semibold">{formatCurrency(franchise.franchise_fee)}</span>
          </div>

          {franchise.territories_available > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Territories
              </span>
              <Badge variant="outline">{franchise.territories_available} Available</Badge>
            </div>
          )}
        </div>

        {/* Industry Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{franchise.industry}</Badge>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {franchise.views_count || 0}
            </span>
            {franchise.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {franchise.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full mt-4" variant="outline" onClick={onClick}>
          View Details
        </Button>
      </div>
    </Card>
  );
}
