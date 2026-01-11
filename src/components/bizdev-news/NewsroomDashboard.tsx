import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle, Eye, Mic } from "lucide-react";
import { format } from "date-fns";

interface NewsroomDashboardProps {
  onViewArticle: (id: string) => void;
  onStartInterview: () => void;
}

export function NewsroomDashboard({ onViewArticle, onStartInterview }: NewsroomDashboardProps) {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: interviews } = useQuery({
    queryKey: ['news-interviews'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('news_interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const stats = {
    drafts: articles?.filter(a => a.status === 'draft').length || 0,
    review: articles?.filter(a => a.status === 'review').length || 0,
    published: articles?.filter(a => a.status === 'published').length || 0,
    totalViews: articles?.reduce((sum, a) => sum + (a.views_count || 0), 0) || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'review':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Review</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-500">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Drafts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.drafts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              In Review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.review}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Published
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={onStartInterview} className="gap-2">
            <Mic className="h-4 w-4" />
            Start Interview
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Write Article
          </Button>
        </CardContent>
      </Card>

      {/* Recent Interviews */}
      {interviews && interviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Interviews</CardTitle>
            <CardDescription>Continue or complete your interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interviews.map((interview) => (
                <div 
                  key={interview.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => interview.article_id && onViewArticle(interview.article_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{interview.subject_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {interview.subject_title} {interview.subject_company && `• ${interview.subject_company}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={interview.interview_status === 'completed' ? 'default' : 'secondary'}>
                    {interview.interview_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Articles</CardTitle>
          <CardDescription>Your content library</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map((article) => (
                <div 
                  key={article.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onViewArticle(article.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{article.title}</h3>
                      {getStatusBadge(article.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(article.created_at), 'MMM d, yyyy')} • {article.article_type}
                      {article.views_count > 0 && ` • ${article.views_count} views`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {article.audio_url && <Badge variant="outline">Audio</Badge>}
                    {article.magazine_cover_url && <Badge variant="outline">Cover</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No articles yet</p>
              <p className="text-sm">Start an interview to create your first article</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
