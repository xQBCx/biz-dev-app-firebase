import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Play, Pause, Image, Share2, Edit, Globe, Volume2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef } from "react";

interface ArticleViewerProps {
  articleId: string | null;
  onBack: () => void;
}

export function ArticleViewer({ articleId, onBack }: ArticleViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: article, isLoading } = useQuery({
    queryKey: ['news-article', articleId],
    queryFn: async () => {
      if (!articleId) return null;

      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
  });

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!articleId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Select an article to view</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
        <div className="h-8 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 rounded bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Article not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Newsroom
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
            {article.status}
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          {article.status !== 'published' && (
            <Button size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Magazine Cover */}
      {article.magazine_cover_url && (
        <Card className="mb-6 overflow-hidden">
          <img 
            src={article.magazine_cover_url} 
            alt="Magazine Cover"
            className="w-full h-auto max-h-[500px] object-contain bg-muted"
          />
        </Card>
      )}

      {/* Featured Image */}
      {article.featured_image_url && !article.magazine_cover_url && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img 
            src={article.featured_image_url} 
            alt={article.title}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Audio Player */}
      {article.audio_url && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleAudio}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Audio Interview
                </p>
                <p className="text-sm text-muted-foreground">
                  Listen to the full interview with dual-voice narration
                </p>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={article.audio_url}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Article Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
        
        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-xl text-muted-foreground mb-4">{article.subtitle}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span>{format(new Date(article.created_at), 'MMMM d, yyyy')}</span>
          <span>•</span>
          <Badge variant="outline">{article.article_type}</Badge>
          {article.views_count > 0 && (
            <>
              <span>•</span>
              <span>{article.views_count} views</span>
            </>
          )}
        </div>

        <Separator className="my-6" />

        {/* Content */}
        <div 
          className="whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: article.content?.replace(/\n/g, '<br/>') || '' 
          }}
        />
      </article>

      {/* Entity Tags */}
      {article.entity_tags && Array.isArray(article.entity_tags) && article.entity_tags.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Featured In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(article.entity_tags as any[]).map((tag: any, idx: number) => (
                <Badge key={idx} variant="secondary">
                  {tag.name}
                  {tag.title && ` - ${tag.title}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
