import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, MessageSquare, Share2, ThumbsUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BroadcastSegment } from '@/hooks/useBroadcast';
import { BroadcastQA } from './BroadcastQA';

interface BroadcastPlayerProps {
  segment: BroadcastSegment;
  onInteraction?: (type: string) => void;
}

export function BroadcastPlayer({ segment, onInteraction }: BroadcastPlayerProps) {
  const [showQA, setShowQA] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onInteraction?.('like');
  };

  const handleShare = () => {
    onInteraction?.('share');
    if (navigator.share) {
      navigator.share({
        title: segment.title,
        text: segment.summary || '',
        url: window.location.href,
      });
    }
  };

  const handleQAToggle = () => {
    setShowQA(!showQA);
    if (!showQA) {
      onInteraction?.('qa_open');
    }
  };

  return (
    <Card className="overflow-hidden border-border">
      {/* Video/Content Area */}
      <div className="relative aspect-video bg-muted flex items-center justify-center">
        {segment.video_url ? (
          <video
            src={segment.video_url}
            className="w-full h-full object-cover"
            controls
          />
        ) : (
          <div className="text-center p-8 max-w-2xl">
            <Badge variant="outline" className="mb-4">
              {segment.sector || 'General'}
            </Badge>
            <h2 className="text-2xl font-bold mb-4">{segment.title}</h2>
            <p className="text-muted-foreground">{segment.summary}</p>
          </div>
        )}
        
        {/* Overlay Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground">
            UPN BROADCAST
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title and Meta */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{segment.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {segment.published_at ? new Date(segment.published_at).toLocaleDateString() : 'Recent'}
            </span>
            {segment.sector && (
              <Badge variant="secondary" className="text-xs">
                {segment.sector}
              </Badge>
            )}
          </div>
        </div>

        {/* Tags */}
        {segment.tags && segment.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {segment.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant={liked ? "default" : "ghost"}
              size="sm"
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {liked ? 'Liked' : 'Like'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          <Button
            variant={showQA ? "default" : "outline"}
            size="sm"
            onClick={handleQAToggle}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Ask About This
          </Button>
        </div>

        {/* Q&A Section */}
        {showQA && (
          <div className="mt-4 pt-4 border-t border-border">
            <BroadcastQA segmentId={segment.id} segmentTitle={segment.title} />
          </div>
        )}

        {/* Full Content (expandable) */}
        {segment.content && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Read Full Story
            </summary>
            <div className="mt-2 text-sm prose prose-sm max-w-none">
              {segment.content.split('\n').map((p, i) => (
                <p key={i} className="mb-2">{p}</p>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}