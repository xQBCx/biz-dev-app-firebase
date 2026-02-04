import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

interface NewsRelatedArticlesProps {
  articles: any[];
}

export const NewsRelatedArticles = ({ articles }: NewsRelatedArticlesProps) => {
  if (articles.length === 0) return null;

  return (
    <section className="py-16 bg-[hsl(var(--news-card))] border-t border-[hsl(var(--news-border))]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[hsl(var(--news-text))]">
            More Like This
          </h2>
          <Link 
            to="/news"
            className="text-[hsl(var(--news-accent))] font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/news/article/${article.slug}`}
              className="group"
            >
              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[hsl(var(--news-border))] mb-4">
                {(article.featured_image_url || article.magazine_cover_url) ? (
                  <img
                    src={article.magazine_cover_url || article.featured_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--news-accent))]/20 to-[hsl(var(--news-accent))]/5">
                    <span className="text-4xl font-serif font-bold text-[hsl(var(--news-accent))]/30">
                      {article.title?.charAt(0) || 'B'}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-serif font-bold text-[hsl(var(--news-text))] mb-2 line-clamp-2 group-hover:text-[hsl(var(--news-accent))] transition-colors">
                {article.title}
              </h3>

              <p className="text-sm text-[hsl(var(--news-muted))]">
                {article.published_at 
                  ? format(new Date(article.published_at), 'MMMM d, yyyy')
                  : 'Coming Soon'
                }
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
