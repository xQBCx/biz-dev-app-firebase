import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecommendations, Recommendation } from '@/hooks/useRecommendations';
import { 
  Lightbulb, 
  X, 
  Check, 
  RefreshCw, 
  Workflow, 
  Bot, 
  Zap, 
  LayoutGrid, 
  Users,
  ChevronRight
} from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  workflow: <Workflow className="h-4 w-4" />,
  agent: <Bot className="h-4 w-4" />,
  action: <Zap className="h-4 w-4" />,
  module: <LayoutGrid className="h-4 w-4" />,
  entity: <Users className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  workflow: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  agent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  action: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  module: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  entity: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss: () => void;
  onComplete: () => void;
  onNavigate: () => void;
}

function RecommendationCard({ recommendation, onDismiss, onComplete, onNavigate }: RecommendationCardProps) {
  return (
    <div className="group relative p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-md ${typeColors[recommendation.recommendation_type] || 'bg-muted'}`}>
          {typeIcons[recommendation.recommendation_type] || <Lightbulb className="h-4 w-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{recommendation.title}</h4>
            <Badge variant="outline" className="text-xs capitalize">
              {recommendation.recommendation_type}
            </Badge>
          </div>
          
          {recommendation.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {recommendation.description}
            </p>
          )}
          
          {recommendation.reason && (
            <p className="text-xs text-muted-foreground/80 italic">
              {recommendation.reason}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-green-500"
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            title="Mark as done"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          {recommendation.action_path && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onNavigate}
              title="Go"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecommendationsPanel() {
  const navigate = useNavigate();
  const { recommendations, isLoading, dismiss, complete, refresh } = useRecommendations();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Recommendations
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refresh} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recommendations yet</p>
            <p className="text-xs">Keep using the app to get personalized suggestions</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
              Generate Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onDismiss={() => dismiss(rec.id)}
                onComplete={() => complete(rec.id)}
                onNavigate={() => {
                  if (rec.action_path) {
                    complete(rec.id);
                    navigate(rec.action_path);
                  }
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
