import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AnalyticsData {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  totalEngagement: number;
  platformBreakdown: { name: string; count: number; color: string }[];
  engagementTrend: { date: string; engagement: number }[];
  topPosts: any[];
}

export const SocialAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    totalEngagement: 0,
    platformBreakdown: [],
    engagementTrend: [],
    topPosts: []
  });

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("social_posts")
        .select("*, social_platforms(platform_name)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const totalPosts = posts?.length || 0;
      const publishedPosts = posts?.filter(p => p.status === "published").length || 0;
      const scheduledPosts = posts?.filter(p => p.status === "scheduled").length || 0;

      const totalEngagement = posts?.reduce((sum, post) => {
        const metrics = post.engagement_data as any;
        return sum + (metrics?.likes || 0) + (metrics?.comments || 0) + (metrics?.shares || 0);
      }, 0) || 0;

      const platformCounts = posts?.reduce((acc: any, post) => {
        const platform = (post as any).social_platforms?.platform_name || "Unknown";
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});

      const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
      const platformBreakdown = Object.entries(platformCounts || {}).map(([name, count], idx) => ({
        name,
        count: count as number,
        color: colors[idx % colors.length]
      }));

      const engagementByDate = posts?.reduce((acc: any, post) => {
        if (post.published_at) {
          const date = new Date(post.published_at).toLocaleDateString();
          const metrics = post.engagement_data as any;
          const engagement = (metrics?.likes || 0) + (metrics?.comments || 0) + (metrics?.shares || 0);
          acc[date] = (acc[date] || 0) + engagement;
        }
        return acc;
      }, {});

      const engagementTrend = Object.entries(engagementByDate || {})
        .map(([date, engagement]) => ({ date, engagement: engagement as number }))
        .slice(-7);

      const topPosts = posts?.filter(p => p.status === "published")
        .sort((a, b) => {
          const aMetrics = a.engagement_data as any;
          const bMetrics = b.engagement_data as any;
          const aTotal = (aMetrics?.likes || 0) + (aMetrics?.comments || 0) + (aMetrics?.shares || 0);
          const bTotal = (bMetrics?.likes || 0) + (bMetrics?.comments || 0) + (bMetrics?.shares || 0);
          return bTotal - aTotal;
        })
        .slice(0, 5) || [];

      setAnalytics({
        totalPosts,
        publishedPosts,
        scheduledPosts,
        totalEngagement,
        platformBreakdown,
        engagementTrend,
        topPosts
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (analytics.totalPosts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Analytics</CardTitle>
          <CardDescription>Track performance across all connected platforms</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground text-center">
            Connect accounts and publish posts to see analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.publishedPosts} published, {analytics.scheduledPosts} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalPosts > 0 
                ? `${((analytics.publishedPosts / analytics.totalPosts) * 100).toFixed(0)}% of total`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEngagement}</div>
            <p className="text-xs text-muted-foreground">
              Likes, comments & shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.publishedPosts > 0 
                ? Math.round(analytics.totalEngagement / analytics.publishedPosts)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per published post
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trend</CardTitle>
              <CardDescription>Last 7 days of activity</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.engagementTrend.length > 0 ? (
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.engagementTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No engagement data yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posts by Platform</CardTitle>
              <CardDescription>Distribution across connected platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.platformBreakdown.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.platformBreakdown}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {analytics.platformBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.platformBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No platform data yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Posts with highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topPosts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topPosts.map((post) => {
                    const metrics = post.engagement_data as any;
                    const totalEngagement = (metrics?.likes || 0) + (metrics?.comments || 0) + (metrics?.shares || 0);
                    return (
                      <div key={post.id} className="flex items-start justify-between border-b pb-4">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">{post.content}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(post.published_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold">{totalEngagement}</p>
                          <p className="text-xs text-muted-foreground">engagement</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No published posts yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};