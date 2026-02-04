import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Headphones, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsHeroSectionProps {
  article: any;
  isLoading: boolean;
}

export const NewsHeroSection = ({ article, isLoading }: NewsHeroSectionProps) => {
  if (isLoading) {
    return (
      <section className="relative h-[70vh] min-h-[500px] bg-[hsl(var(--news-card))]">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="relative h-[50vh] min-h-[400px] bg-gradient-to-br from-[hsl(var(--news-text))] to-[hsl(var(--news-muted))]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/80">
            <h2 className="text-3xl font-serif font-bold mb-4">Coming Soon</h2>
            <p>Be the first to read our exclusive interviews and insights.</p>
          </div>
        </div>
      </section>
    );
  }

  const articleType = article.article_type === 'interview' ? 'Featured Interview' : 
                      article.article_type === 'tech_brief' ? 'Tech Brief' : 'Featured Story';

  return (
    <section className="relative h-[75vh] min-h-[550px] overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[hsl(var(--news-text))]">
        {(article.featured_image_url || article.magazine_cover_url) && (
          <img
            src={article.magazine_cover_url || article.featured_image_url}
            alt={article.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-700"
          />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12 md:pb-16">
        <div className="max-w-4xl">
          {/* Badge */}
          <Badge 
            className="mb-4 bg-[hsl(var(--news-accent))] text-[hsl(var(--news-accent-foreground))] hover:bg-[hsl(var(--news-accent))]/90 font-medium uppercase tracking-wider text-xs px-3 py-1"
          >
            {articleType}
          </Badge>

          {/* Title */}
          <Link to={`/news/article/${article.slug}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight tracking-tight hover:opacity-80 transition-opacity">
              {article.title}
            </h1>
          </Link>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl font-light leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-6">
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
            {article.audio_url && (
              <span className="flex items-center gap-1 text-[hsl(var(--news-accent))]">
                <Headphones className="h-4 w-4" />
                Audio Available
              </span>
            )}
          </div>

          {/* CTA */}
          <Link 
            to={`/news/article/${article.slug}`}
            className="inline-flex items-center gap-2 text-white font-medium hover:text-[hsl(var(--news-accent))] transition-colors group/link"
          >
            Read Article
            <ArrowRight className="h-5 w-5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
