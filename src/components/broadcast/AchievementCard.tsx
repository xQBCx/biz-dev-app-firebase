import { Trophy, TrendingUp, Zap, CheckCircle, Eye, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BDAchievement } from '@/hooks/useBroadcast';
import { useInstincts } from '@/hooks/useInstincts';

interface AchievementCardProps {
  achievement: BDAchievement;
  onView?: () => void;
  onConnect?: () => void;
}

export function AchievementCard({ achievement, onView, onConnect }: AchievementCardProps) {
  const { trackClick } = useInstincts();
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deal_closed':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'project_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'milestone':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Zap className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deal_closed':
        return 'Deal Closed';
      case 'project_completed':
        return 'Project Completed';
      case 'milestone':
        return 'Milestone';
      default:
        return 'Achievement';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(achievement.achievement_type)}
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(achievement.achievement_type)}
            </Badge>
          </div>
          {achievement.verified && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              BD-ID Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="font-semibold">{achievement.title}</h3>
        
        {achievement.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>
        )}

        {/* Metrics */}
        <div className="flex gap-4 text-xs">
          {achievement.risk_tolerance !== null && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Risk Tolerance:</span>
              <span className="font-medium">{Math.round(achievement.risk_tolerance * 100)}%</span>
            </div>
          )}
          {achievement.execution_speed !== null && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Execution Speed:</span>
              <span className="font-medium">{Math.round(achievement.execution_speed * 100)}%</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => {
            trackClick('broadcast', 'achievement_viewed', {
              achievement_id: achievement.id,
              achievement_title: achievement.title,
              achievement_type: achievement.achievement_type,
            });
            onView?.();
          }}>
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button variant="default" size="sm" onClick={() => {
            trackClick('broadcast', 'achievement_connect', {
              achievement_id: achievement.id,
              achievement_title: achievement.title,
              user_id: achievement.user_id,
            });
            onConnect?.();
          }}>
            <MessageSquare className="h-3 w-3 mr-1" />
            Connect
          </Button>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          {new Date(achievement.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}