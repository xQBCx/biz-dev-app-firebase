import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Globe, 
  Users, 
  DollarSign,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Factory,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { CRMRegion } from "@/hooks/useCRMRegions";
import { useState } from "react";

interface CRMRegionCardProps {
  region: CRMRegion;
  onClick?: () => void;
  onResearch?: (id: string) => Promise<boolean>;
}

const regionTypeColors: Record<string, string> = {
  metropolitan: 'bg-blue-500',
  rural: 'bg-green-500',
  economic_zone: 'bg-purple-500',
  trade_corridor: 'bg-amber-500',
  county: 'bg-cyan-500',
  district: 'bg-pink-500',
  territory: 'bg-orange-500'
};

export function CRMRegionCard({ region, onClick, onResearch }: CRMRegionCardProps) {
  const [isResearching, setIsResearching] = useState(false);

  const handleResearch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onResearch) return;
    setIsResearching(true);
    await onResearch(region.id);
    setIsResearching(false);
  };

  const location = [region.state_province, region.country]
    .filter(Boolean)
    .join(', ');

  const formatNumber = (num: number | null) => {
    if (!num) return null;
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card 
      className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{region.name}</h3>
            {location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {location}
              </p>
            )}
          </div>
        </div>
        {region.region_type && (
          <Badge className={`${regionTypeColors[region.region_type] || 'bg-muted'} text-white`}>
            {region.region_type.replace('_', ' ')}
          </Badge>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {region.population && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{formatNumber(region.population)} pop.</span>
          </div>
        )}
        {region.gdp_estimate && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>${formatNumber(region.gdp_estimate)} GDP</span>
          </div>
        )}
      </div>

      {/* Match Score */}
      {region.potential_match_score > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Match Score</span>
            <span className="font-medium">{region.potential_match_score}%</span>
          </div>
          <Progress value={region.potential_match_score} className="h-1.5" />
        </div>
      )}

      {/* Major Industries */}
      {region.major_industries?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Factory className="w-3 h-3" />
            <span>Major Industries</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {region.major_industries.slice(0, 3).map((ind, i) => (
              <Badge key={i} variant="outline" className="text-xs py-0">{ind}</Badge>
            ))}
            {region.major_industries.length > 3 && (
              <Badge variant="outline" className="text-xs py-0">+{region.major_industries.length - 3}</Badge>
            )}
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {region.abundant_resources?.length > 0 && (
          <div className="text-xs">
            <div className="flex items-center gap-1 text-green-600 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">Abundant</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {region.abundant_resources.slice(0, 2).map((r, i) => (
                <Badge key={i} variant="outline" className="text-xs py-0">{r}</Badge>
              ))}
              {region.abundant_resources.length > 2 && (
                <Badge variant="outline" className="text-xs py-0">+{region.abundant_resources.length - 2}</Badge>
              )}
            </div>
          </div>
        )}
        {region.resource_deficits?.length > 0 && (
          <div className="text-xs">
            <div className="flex items-center gap-1 text-orange-600 mb-1">
              <TrendingDown className="w-3 h-3" />
              <span className="font-medium">Deficits</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {region.resource_deficits.slice(0, 2).map((r, i) => (
                <Badge key={i} variant="outline" className="text-xs py-0">{r}</Badge>
              ))}
              {region.resource_deficits.length > 2 && (
                <Badge variant="outline" className="text-xs py-0">+{region.resource_deficits.length - 2}</Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sustainability Challenges */}
      {region.sustainability_challenges?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-medium">Sustainability Challenges</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {region.sustainability_challenges.slice(0, 2).map((c, i) => (
              <Badge key={i} variant="outline" className="text-xs py-0 border-amber-300">{c}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {region.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {region.tags.slice(0, 4).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end pt-2 border-t">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleResearch}
          disabled={isResearching}
        >
          {isResearching ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-1" />
          )}
          {region.perplexity_last_researched ? 'Re-research' : 'Research'}
        </Button>
      </div>
    </Card>
  );
}
