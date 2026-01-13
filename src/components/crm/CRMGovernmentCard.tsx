import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Landmark, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import { CRMGovernment } from "@/hooks/useCRMGovernments";
import { useState } from "react";

interface CRMGovernmentCardProps {
  government: CRMGovernment;
  onClick?: () => void;
  onResearch?: (id: string) => Promise<boolean>;
}

const jurisdictionColors: Record<string, string> = {
  federal: 'bg-blue-500',
  state: 'bg-purple-500',
  local: 'bg-green-500',
  tribal: 'bg-amber-500',
  international: 'bg-cyan-500',
  agency: 'bg-pink-500'
};

export function CRMGovernmentCard({ government, onClick, onResearch }: CRMGovernmentCardProps) {
  const [isResearching, setIsResearching] = useState(false);

  const handleResearch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onResearch) return;
    setIsResearching(true);
    await onResearch(government.id);
    setIsResearching(false);
  };

  const location = [government.locality, government.state_province, government.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Card 
      className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Landmark className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{government.name}</h3>
            {location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {location}
              </p>
            )}
          </div>
        </div>
        {government.jurisdiction_level && (
          <Badge className={`${jurisdictionColors[government.jurisdiction_level] || 'bg-muted'} text-white`}>
            {government.jurisdiction_level}
          </Badge>
        )}
      </div>

      {government.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {government.description}
        </p>
      )}

      {/* Match Score */}
      {government.potential_match_score > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Match Score</span>
            <span className="font-medium">{government.potential_match_score}%</span>
          </div>
          <Progress value={government.potential_match_score} className="h-1.5" />
        </div>
      )}

      {/* Resources */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {government.abundant_resources?.length > 0 && (
          <div className="text-xs">
            <div className="flex items-center gap-1 text-green-600 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">Abundant</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {government.abundant_resources.slice(0, 2).map((r, i) => (
                <Badge key={i} variant="outline" className="text-xs py-0">{r}</Badge>
              ))}
              {government.abundant_resources.length > 2 && (
                <Badge variant="outline" className="text-xs py-0">+{government.abundant_resources.length - 2}</Badge>
              )}
            </div>
          </div>
        )}
        {government.resource_deficits?.length > 0 && (
          <div className="text-xs">
            <div className="flex items-center gap-1 text-orange-600 mb-1">
              <TrendingDown className="w-3 h-3" />
              <span className="font-medium">Needs</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {government.resource_deficits.slice(0, 2).map((r, i) => (
                <Badge key={i} variant="outline" className="text-xs py-0">{r}</Badge>
              ))}
              {government.resource_deficits.length > 2 && (
                <Badge variant="outline" className="text-xs py-0">+{government.resource_deficits.length - 2}</Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1 text-sm mb-4">
        {government.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{government.email}</span>
          </div>
        )}
        {government.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{government.phone}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {government.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {government.tags.slice(0, 4).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        {government.website && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); window.open(government.website!, '_blank'); }}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Website
          </Button>
        )}
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
          {government.perplexity_last_researched ? 'Re-research' : 'Research'}
        </Button>
      </div>
    </Card>
  );
}
