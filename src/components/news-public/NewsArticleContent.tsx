import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Share2, Clock, Eye, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface NewsArticleContentProps {
  article: any;
  coverImage?: any;
  audioInterview?: any;
}

export const NewsArticleContent = ({ 
  article, 
  coverImage, 
  audioInterview 
}: NewsArticleContentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(prog);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.subtitle,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const typeLabel = article.article_type === 'interview' ? 'Interview' :
                    article.article_type === 'tech_brief' ? 'Tech Brief' :
                    article.article_type === 'analysis' ? 'Analysis' : 'News';

  const imageUrl = coverImage?.asset_url || article.magazine_cover_url || article.featured_image_url;

  return (
    <article className="pb-16 md:pb-24">
      {/* Full Magazine Cover Display */}
      {imageUrl && (
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full h-auto rounded-lg border border-[hsl(var(--news-border))]"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* Article Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            to="/news"
            className="inline-flex items-center gap-2 text-[hsl(var(--news-muted))] hover:text-[hsl(var(--news-text))] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          <Badge 
            className="mb-4 bg-[hsl(var(--news-accent))] text-[hsl(var(--news-accent-foreground))] hover:bg-[hsl(var(--news-accent))]/90"
          >
            {typeLabel}
          </Badge>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[hsl(var(--news-text))] mb-4 leading-tight tracking-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-lg text-[hsl(var(--news-muted))] mb-6 max-w-2xl">
              {article.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-[hsl(var(--news-muted))] text-sm">
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(article.published_at), 'MMMM d, yyyy')}
              </span>
            )}
            {article.views_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views_count.toLocaleString()} views
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-[hsl(var(--news-muted))] hover:text-[hsl(var(--news-text))]"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Audio Player - from media assets or article audio_url */}
      {(audioInterview?.asset_url || article.audio_url) && (
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto bg-[hsl(var(--news-card))] border border-[hsl(var(--news-border))] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-[hsl(var(--news-accent))] flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-[hsl(var(--news-accent-foreground))]" />
                ) : (
                  <Play className="h-6 w-6 text-[hsl(var(--news-accent-foreground))] ml-1" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-[hsl(var(--news-muted))]" />
                  <span className="text-[hsl(var(--news-text))] font-medium">Listen to the Interview</span>
                </div>
                <div className="h-2 bg-[hsl(var(--news-border))] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--news-accent))] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioInterview?.asset_url || article.audio_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container mx-auto px-4 mt-12 md:mt-16">
        <div className="max-w-3xl mx-auto">
          {/* Content */}
          <div 
            className="prose prose-lg prose-neutral max-w-none
              prose-headings:font-semibold prose-headings:text-[hsl(var(--news-text))] prose-headings:tracking-tight
              prose-p:text-[hsl(var(--news-text))]/80 prose-p:leading-relaxed
              prose-a:text-[hsl(var(--news-text))] prose-a:underline hover:prose-a:no-underline
              prose-blockquote:border-l-[hsl(var(--news-border))] prose-blockquote:bg-[hsl(var(--news-card))] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-strong:text-[hsl(var(--news-text))]
              prose-img:rounded-lg
            "
            dangerouslySetInnerHTML={{ 
              __html: article.content || '<p>No content available.</p>' 
            }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[hsl(var(--news-border))]">
              <h4 className="text-sm font-medium text-[hsl(var(--news-muted))] mb-4 uppercase tracking-wider">
                Related Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="bg-[hsl(var(--news-card))] text-[hsl(var(--news-text))] hover:bg-[hsl(var(--news-border))]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Entity mentions */}
          {article.entity_mentions && Object.keys(article.entity_mentions).length > 0 && (
            <div className="mt-8 p-6 bg-[hsl(var(--news-card))] rounded-xl border border-[hsl(var(--news-border))]">
              <h4 className="text-sm font-medium text-[hsl(var(--news-muted))] mb-4 uppercase tracking-wider">
                Featured In This Article
              </h4>
              <div className="flex flex-wrap gap-4">
                {Object.entries(article.entity_mentions).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--news-accent))]/10 flex items-center justify-center">
                      <span className="text-[hsl(var(--news-accent))] font-bold">
                        {String(value)?.charAt(0) || key.charAt(0)}
                      </span>
                    </div>
                    <span className="text-[hsl(var(--news-text))] font-medium">
                      {String(value) || key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
