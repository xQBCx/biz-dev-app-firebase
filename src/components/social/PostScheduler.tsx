import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePostDialog } from "./CreatePostDialog";
import { Calendar, Plus, Clock, CheckCircle, XCircle, Loader, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface PostSchedulerProps {
  onUpdate: () => void;
}

interface Post {
  id: string;
  content: string;
  media_urls: string[];
  scheduled_for: string;
  status: string;
  published_at: string | null;
  social_accounts: {
    account_name: string;
    social_platforms: {
      platform_name: string;
      logo_url: string | null;
    };
  };
}

export const PostScheduler = ({ onUpdate }: PostSchedulerProps) => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("social_posts")
        .select(`
          id,
          content,
          media_urls,
          scheduled_for,
          status,
          published_at,
          social_accounts (
            account_name,
            social_platforms (
              platform_name,
              logo_url
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduled posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("social_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({ title: "Post deleted" });
      loadPosts();
      onUpdate();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      scheduled: { variant: "default", icon: Clock },
      published: { variant: "secondary", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
      draft: { variant: "outline", icon: Edit },
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const scheduledPosts = posts.filter(p => p.status === "scheduled");
  const draftPosts = posts.filter(p => p.status === "draft");
  const publishedPosts = posts.filter(p => p.status === "published");

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Post Scheduler</CardTitle>
              <CardDescription>
                Create and schedule posts across all connected platforms
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Scheduled Posts</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first post to start scheduling content
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="scheduled" className="space-y-4">
              <TabsList>
                <TabsTrigger value="scheduled">
                  Scheduled ({scheduledPosts.length})
                </TabsTrigger>
                <TabsTrigger value="drafts">
                  Drafts ({draftPosts.length})
                </TabsTrigger>
                <TabsTrigger value="published">
                  Published ({publishedPosts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scheduled" className="space-y-3">
                {scheduledPosts.map(post => (
                  <Card key={post.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {post.social_accounts?.social_platforms?.logo_url && (
                              <img
                                src={post.social_accounts.social_platforms.logo_url}
                                alt=""
                                className="h-5 w-5 rounded"
                              />
                            )}
                            <span className="text-sm font-medium">
                              {post.social_accounts?.account_name}
                            </span>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm">{post.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(post.scheduled_for), "PPP 'at' p")}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="drafts" className="space-y-3">
                {draftPosts.map(post => (
                  <Card key={post.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {post.social_accounts?.social_platforms?.logo_url && (
                              <img
                                src={post.social_accounts.social_platforms.logo_url}
                                alt=""
                                className="h-5 w-5 rounded"
                              />
                            )}
                            <span className="text-sm font-medium">
                              {post.social_accounts?.account_name}
                            </span>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm">{post.content}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="published" className="space-y-3">
                {publishedPosts.map(post => (
                  <Card key={post.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {post.social_accounts?.social_platforms?.logo_url && (
                              <img
                                src={post.social_accounts.social_platforms.logo_url}
                                alt=""
                                className="h-5 w-5 rounded"
                              />
                            )}
                            <span className="text-sm font-medium">
                              {post.social_accounts?.account_name}
                            </span>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm">{post.content}</p>
                          {post.published_at && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3" />
                              Published {format(new Date(post.published_at), "PPP 'at' p")}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <CreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          loadPosts();
          onUpdate();
        }}
      />
    </>
  );
};