import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Volume2, Image } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface NewsFeedProps {
  onViewArticle: (id: string) => void;
}

export function NewsFeed({ onViewArticle }: NewsFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [articleType, setArticleType] = useState<string>('all');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['news-feed', searchQuery, articleType],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .eq('access_level', 'public')
        .order('published_at', { ascending: false });

      if (articleType !== 'all') {
        query = query.eq('article_type', articleType);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={articleType} onValueChange={setArticleType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="interview">Interviews</SelectItem>
            <SelectItem value="tech_brief">Tech Briefs</SelectItem>
            <SelectItem value="partner_spotlight">Partner Spotlights</SelectItem>
            <SelectItem value="business_news">Business News</SelectItem>
            <SelectItem value="podcast">Podcasts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-5 bg-muted animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articles && articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card 
              key={article.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onViewArticle(article.id)}
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-muted">
                {article.magazine_cover_url || article.featured_image_url ? (
                  <img
                    src={article.magazine_cover_url || article.featured_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                {/* Media badges */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {article.audio_url && (
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                      <Volume2 className="h-3 w-3" />
                    </Badge>
                  )}
                  {article.magazine_cover_url && (
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                      <Image className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">
                  {article.article_type.replace('_', ' ')}
                </Badge>
                <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                {article.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {article.subtitle}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {article.published_at 
                    ? format(new Date(article.published_at), 'MMM d, yyyy')
                    : format(new Date(article.created_at), 'MMM d, yyyy')
                  }
                  {article.views_count > 0 && ` • ${article.views_count} views`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Published Articles</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'No articles match your search criteria.'
                : 'There are no published articles yet.'
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
