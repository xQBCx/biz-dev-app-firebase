import { 
  AlertTriangle, 
  Clock, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  Building,
  DollarSign,
  Scale,
  Truck,
  AlertOctagon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type Situation = {
  id: string;
  title: string;
  description: string | null;
  situation_type: string;
  severity: string;
  status: string;
  context_summary: string | null;
  recommended_action: string | null;
  urgency_score: number;
  risk_level: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

interface SituationCardProps {
  situation: Situation;
  onClick: () => void;
  isSelected: boolean;
}

const typeIcons: Record<string, React.ElementType> = {
  general: AlertTriangle,
  operational: Zap,
  financial: DollarSign,
  legal: Scale,
  logistics: Truck,
  emergency: AlertOctagon,
};

const severityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-primary/10 text-primary border border-primary/20",
  critical: "bg-destructive/10 text-destructive border border-destructive/20",
};

const statusIcons: Record<string, React.ElementType> = {
  active: AlertTriangle,
  monitoring: Clock,
  resolving: Zap,
  resolved: CheckCircle2,
  escalated: AlertOctagon,
};

export function SituationCard({ situation, onClick, isSelected }: SituationCardProps) {
  const TypeIcon = typeIcons[situation.situation_type] || AlertTriangle;
  const StatusIcon = statusIcons[situation.status] || AlertTriangle;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50 bg-card",
        situation.severity === 'critical' && !isSelected && "border-destructive/30"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Urgency indicator */}
        <div 
          className={cn(
            "w-1 h-full min-h-[60px] rounded-full",
            situation.severity === 'critical' && "bg-destructive",
            situation.severity === 'high' && "bg-primary",
            situation.severity === 'medium' && "bg-muted-foreground",
            situation.severity === 'low' && "bg-muted"
          )}
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-medium truncate">{situation.title}</h3>
            </div>
            <Badge variant="outline" className={cn("text-xs", severityColors[situation.severity])}>
              {situation.severity}
            </Badge>
          </div>

          {/* Description or Context */}
          {(situation.context_summary || situation.description) && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {situation.context_summary || situation.description}
            </p>
          )}

          {/* Recommended Action */}
          {situation.recommended_action && situation.status !== 'resolved' && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs flex items-center gap-2">
              <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="truncate">{situation.recommended_action}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground capitalize">{situation.status}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(situation.updated_at), { addSuffix: true })}
            </span>
          </div>

          {/* Tags */}
          {situation.tags && situation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {situation.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {situation.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{situation.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
