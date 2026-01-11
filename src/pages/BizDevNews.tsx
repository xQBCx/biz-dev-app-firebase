import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, Mic, FileText, Radio, LayoutGrid } from "lucide-react";
import { NewsroomDashboard } from "@/components/bizdev-news/NewsroomDashboard";
import { InterviewConductor } from "@/components/bizdev-news/InterviewConductor";
import { ArticleViewer } from "@/components/bizdev-news/ArticleViewer";
import { NewsFeed } from "@/components/bizdev-news/NewsFeed";

const BizDevNews = () => {
  const [activeTab, setActiveTab] = useState("newsroom");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Newspaper className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">BizDev.news</h1>
              <p className="text-sm text-muted-foreground">
                Business Intelligence Media Platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="newsroom" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Newsroom</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Interview</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Articles</span>
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="newsroom" className="mt-6">
            <NewsroomDashboard 
              onViewArticle={(id) => {
                setSelectedArticleId(id);
                setActiveTab("articles");
              }}
              onStartInterview={() => setActiveTab("interview")}
            />
          </TabsContent>

          <TabsContent value="interview" className="mt-6">
            <InterviewConductor 
              onComplete={(articleId) => {
                setSelectedArticleId(articleId);
                setActiveTab("articles");
              }}
            />
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            <ArticleViewer 
              articleId={selectedArticleId}
              onBack={() => setSelectedArticleId(null)}
            />
          </TabsContent>

          <TabsContent value="feed" className="mt-6">
            <NewsFeed 
              onViewArticle={(id) => {
                setSelectedArticleId(id);
                setActiveTab("articles");
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BizDevNews;
