import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsPublicHeader } from "@/components/news-public/NewsPublicHeader";
import { NewsFooter } from "@/components/news-public/NewsFooter";
import { NewsArticleContent } from "@/components/news-public/NewsArticleContent";
import { NewsRelatedArticles } from "@/components/news-public/NewsRelatedArticles";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewsArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['public-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('access_level', 'public')
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('news_articles')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);

      return data;
    },
    enabled: !!slug
  });

  const { data: mediaAssets = [] } = useQuery({
    queryKey: ['article-media', article?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_media_assets')
        .select('*')
        .eq('article_id', article?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!article?.id
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['related-articles', article?.article_type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .eq('access_level', 'public')
        .eq('article_type', article?.article_type)
        .neq('id', article?.id)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!article?.article_type
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--news-bg))] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--news-accent))]" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[hsl(var(--news-bg))]">
        <NewsPublicHeader />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-serif font-bold text-[hsl(var(--news-text))] mb-4">
            Article Not Found
          </h1>
          <p className="text-[hsl(var(--news-muted))] mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/news">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Button>
          </Link>
        </div>
        <NewsFooter />
      </div>
    );
  }

  const coverImage = mediaAssets.find(m => m.asset_type === 'cover_image');
  const audioInterview = mediaAssets.find(m => m.asset_type === 'audio_interview');
  
  // Map url to asset_url for components
  const coverImageMapped = coverImage ? { ...coverImage, asset_url: coverImage.url } : undefined;
  const audioInterviewMapped = audioInterview ? { ...audioInterview, asset_url: audioInterview.url } : undefined;

  return (
    <>
      <Helmet>
        <title>{article.title} | BizDev.news</title>
        <meta name="description" content={article.subtitle || article.content?.slice(0, 160)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.subtitle || article.content?.slice(0, 160)} />
        <meta property="og:type" content="article" />
        {coverImageMapped?.asset_url && (
          <meta property="og:image" content={coverImageMapped.asset_url} />
        )}
      </Helmet>

      <div className="min-h-screen bg-[hsl(var(--news-bg))]">
        <NewsPublicHeader />
        
        <main>
        <NewsArticleContent 
            article={article}
            coverImage={coverImageMapped}
            audioInterview={audioInterviewMapped}
          />
          
          {relatedArticles.length > 0 && (
            <NewsRelatedArticles articles={relatedArticles} />
          )}
        </main>

        <NewsFooter />
      </div>
    </>
  );
};

export default NewsArticlePage;
