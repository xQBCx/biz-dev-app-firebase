import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsPublicHeader } from "@/components/news-public/NewsPublicHeader";
import { NewsHeroSection } from "@/components/news-public/NewsHeroSection";
import { NewsMagazineGrid } from "@/components/news-public/NewsMagazineGrid";
import { NewsFooter } from "@/components/news-public/NewsFooter";
import { Helmet } from "react-helmet-async";

const NewsPublic = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['public-news-articles', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .eq('access_level', 'public')
        .order('published_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('article_type', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <>
      <Helmet>
        <title>BizDev.news | Business Development Intelligence</title>
        <meta name="description" content="Discover the latest in business development, exclusive interviews, and industry insights. BizDev.news delivers premium content for modern professionals." />
        <meta property="og:title" content="BizDev.news | Business Development Intelligence" />
        <meta property="og:description" content="Discover the latest in business development, exclusive interviews, and industry insights." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-[hsl(var(--news-bg))]">
        <NewsPublicHeader />
        
        <main>
          <NewsHeroSection 
            article={featuredArticle} 
            isLoading={isLoading} 
          />
          
          <NewsMagazineGrid 
            articles={remainingArticles}
            isLoading={isLoading}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </main>

        <NewsFooter />
      </div>
    </>
  );
};

export default NewsPublic;
