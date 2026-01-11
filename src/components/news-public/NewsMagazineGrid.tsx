import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Headphones, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NewsMagazineGridProps {
  articles: any[];
  isLoading: boolean;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  { label: "All", value: null },
  { label: "Interviews", value: "interview" },
  { label: "Tech Briefs", value: "tech_brief" },
  { label: "News", value: "news" },
  { label: "Analysis", value: "analysis" },
];

export const NewsMagazineGrid = ({ 
  articles, 
  isLoading, 
  selectedCategory, 
  onCategoryChange 
}: NewsMagazineGridProps) => {
  return (
    <section className="py-16 md:py-24 bg-[hsl(var(--news-bg))]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[hsl(var(--news-text))]">
            Latest Stories
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => onCategoryChange(cat.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all",
                  selectedCategory === cat.value
                    ? "bg-[hsl(var(--news-text))] text-[hsl(var(--news-bg))]"
                    : "bg-[hsl(var(--news-card))] text-[hsl(var(--news-muted))] hover:bg-[hsl(var(--news-border))] hover:text-[hsl(var(--news-text))]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && articles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[hsl(var(--news-muted))] text-lg">
              No articles found in this category yet.
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && articles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                featured={index === 0}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {articles.length >= 9 && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-8 py-3 bg-[hsl(var(--news-card))] text-[hsl(var(--news-text))] font-medium rounded-full hover:bg-[hsl(var(--news-border))] transition-colors">
              Load More Stories
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const ArticleCard = ({ article, featured }: { article: any; featured?: boolean }) => {
  const typeLabel = article.article_type === 'interview' ? 'Interview' :
                    article.article_type === 'tech_brief' ? 'Tech Brief' :
                    article.article_type === 'analysis' ? 'Analysis' : 'News';

  return (
    <Link 
      to={`/news/article/${article.slug}`}
      className={cn(
        "group block bg-[hsl(var(--news-card))] rounded-xl overflow-hidden border border-[hsl(var(--news-border))] hover:border-[hsl(var(--news-accent))]/50 transition-all hover:shadow-xl",
        featured && "md:col-span-2 lg:col-span-1"
      )}
    >
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden bg-[hsl(var(--news-border))]">
        {(article.featured_image_url || article.magazine_cover_url) ? (
          <img
            src={article.magazine_cover_url || article.featured_image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--news-accent))]/20 to-[hsl(var(--news-accent))]/5">
            <span className="text-5xl font-serif font-bold text-[hsl(var(--news-accent))]/30">
              {article.title?.charAt(0) || 'B'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          <Badge 
            variant="secondary" 
            className="bg-[hsl(var(--news-accent))]/10 text-[hsl(var(--news-accent))] hover:bg-[hsl(var(--news-accent))]/20 text-xs font-medium"
          >
            {typeLabel}
          </Badge>
          {article.audio_url && (
            <span className="flex items-center gap-1 text-[hsl(var(--news-accent))] text-xs">
              <Headphones className="h-3 w-3" />
              Audio
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-serif font-bold text-[hsl(var(--news-text))] mb-2 line-clamp-2 group-hover:text-[hsl(var(--news-accent))] transition-colors">
          {article.title}
        </h3>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-[hsl(var(--news-muted))] text-sm mb-4 line-clamp-2">
            {article.subtitle}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[hsl(var(--news-muted))]">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.published_at 
              ? format(new Date(article.published_at), 'MMM d, yyyy')
              : 'Coming Soon'
            }
          </span>
          {article.views_count > 0 && (
            <span>{article.views_count.toLocaleString()} views</span>
          )}
        </div>
      </div>
    </Link>
  );
};

const ArticleCardSkeleton = () => (
  <div className="bg-[hsl(var(--news-card))] rounded-xl overflow-hidden border border-[hsl(var(--news-border))]">
    <Skeleton className="aspect-[16/10] w-full" />
    <div className="p-6 space-y-3">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);
