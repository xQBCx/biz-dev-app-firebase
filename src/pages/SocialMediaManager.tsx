import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Search, Plus, Users, Bot, BarChart3, Calendar, MessageSquare } from "lucide-react";
import { PlatformGrid } from "@/components/social/PlatformGrid";
import { ConnectedAccounts } from "@/components/social/ConnectedAccounts";
import { PostScheduler } from "@/components/social/PostScheduler";
import { DelegationManager } from "@/components/social/DelegationManager";
import { SocialAnalytics } from "@/components/social/SocialAnalytics";

interface Platform {
  id: string;
  platform_name: string;
  platform_slug: string;
  category: string;
  display_order: number;
  logo_url: string | null;
  api_available: boolean;
  requires_app_review: boolean;
  auth_type: string;
  connector_config: any;
}

const SocialMediaManager = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stats, setStats] = useState({
    connectedAccounts: 0,
    scheduledPosts: 0,
    activeDelegations: 0,
    totalReach: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadPlatforms();
      loadStats();
    }
  }, [user]);

  const loadPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from("social_platforms")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error("Error loading platforms:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [accountsRes, postsRes, delegationsRes] = await Promise.all([
        supabase
          .from("social_accounts")
          .select("id", { count: "exact" })
          .eq("user_id", user?.id)
          .eq("status", "active"),
        supabase
          .from("social_posts")
          .select("id", { count: "exact" })
          .eq("user_id", user?.id)
          .eq("status", "scheduled"),
        supabase
          .from("platform_delegations")
          .select("id", { count: "exact" })
          .eq("user_id", user?.id)
          .eq("is_active", true)
      ]);

      setStats({
        connectedAccounts: accountsRes.count || 0,
        scheduledPosts: postsRes.count || 0,
        activeDelegations: delegationsRes.count || 0,
        totalReach: 0 // Will be calculated from analytics
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const categories = [
    { value: "all", label: "All Platforms" },
    { value: "social_media", label: "Social Media" },
    { value: "messaging", label: "Messaging" },
    { value: "video", label: "Video" },
    { value: "professional", label: "Professional" },
    { value: "local_business", label: "Local Business" },
    { value: "creative", label: "Creative" },
    { value: "audio", label: "Audio" },
    { value: "emerging", label: "Emerging" },
    { value: "regional", label: "Regional" },
    { value: "niche", label: "Niche" }
  ];

  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch = platform.platform_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || platform.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media Manager</h1>
          <p className="text-muted-foreground">Manage all 60 platforms from one unified interface</p>
        </div>
        <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Account
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connectedAccounts}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledPosts}</div>
            <p className="text-xs text-muted-foreground">Ready to publish</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Delegations</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDelegations}</div>
            <p className="text-xs text-muted-foreground">AI & Human managed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined followers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">
            <MessageSquare className="h-4 w-4 mr-2" />
            All Platforms
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Users className="h-4 w-4 mr-2" />
            Connected Accounts
          </TabsTrigger>
          <TabsTrigger value="scheduler">
            <Calendar className="h-4 w-4 mr-2" />
            Post Scheduler
          </TabsTrigger>
          <TabsTrigger value="delegation">
            <Bot className="h-4 w-4 mr-2" />
            Delegation
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Platforms ({filteredPlatforms.length})</CardTitle>
              <CardDescription>
                Connect and manage accounts across 60 social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search platforms..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Platform Grid */}
              <PlatformGrid platforms={filteredPlatforms} onRefresh={loadStats} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connected Accounts Tab */}
        <TabsContent value="accounts">
          <ConnectedAccounts onUpdate={loadStats} />
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler">
          <PostScheduler onUpdate={loadStats} />
        </TabsContent>

        {/* Delegation Tab */}
        <TabsContent value="delegation">
          <DelegationManager onUpdate={loadStats} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <SocialAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaManager;