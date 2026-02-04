import { useState, useEffect } from "react";
import { useInstincts } from "@/hooks/useInstincts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Building2,
  Shield,
  Search,
  Users,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  Briefcase,
  Globe,
  MapPin,
  Send,
  Vote,
  Filter,
  Loader2,
  Image as ImageIcon,
  Video,
  Newspaper
} from "lucide-react";

type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  profiles?: {
    full_name: string | null;
    email: string | null;
    bd_id_verified: boolean | null;
  };
  businesses?: {
    name: string | null;
    industry: string | null;
    state: string | null;
  }[];
};


const Social = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();
  const { trackContent, trackEntityCreated } = useInstincts();
  const [activeTab, setActiveTab] = useState("feed");
  const [newPost, setNewPost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (effectiveUserId) {
      loadPosts();
      loadProfile();
      loadStats();
      loadMyBusinesses();
      loadLikedPosts();
    }
  }, [effectiveUserId]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            full_name,
            email,
            bd_id_verified
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data as any || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadMyBusinesses = async () => {
    if (!effectiveUserId) return;
    
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", effectiveUserId)
        .limit(3);

      if (error) throw error;
      setMyBusinesses(data || []);
    } catch (error) {
      console.error("Error loading businesses:", error);
    }
  };

  const loadLikedPosts = async () => {
    if (!effectiveUserId) return;
    
    try {
      const { data, error } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", effectiveUserId);

      if (error) throw error;
      setLikedPosts(new Set((data || []).map(like => like.post_id)));
    } catch (error) {
      console.error("Error loading liked posts:", error);
    }
  };

  const loadStats = async () => {
    if (!effectiveUserId) return;

    try {
      const [connectionsResult, postsResult] = await Promise.all([
        supabase
          .from("connections")
          .select("*", { count: "exact", head: true })
          .or(`requester_id.eq.${effectiveUserId},receiver_id.eq.${effectiveUserId}`)
          .eq("status", "accepted"),
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", effectiveUserId)
      ]);

      setConnectionCount(connectionsResult.count || 0);
      setPostCount(postsResult.count || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: newPost
        });

      if (error) throw error;

      trackEntityCreated('social', 'post', 'new', newPost.substring(0, 50));
      toast.success("Post created!");
      setNewPost("");
      await loadPosts();
      await loadStats();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please log in to like posts");
      return;
    }

    try {
      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        toast.success("Like removed");
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
        
        setLikedPosts(prev => new Set([...prev, postId]));
        toast.success("Post liked!");
      }

      await loadPosts();
    } catch (error: any) {
      console.error("Error toggling like:", error);
      if (error.code !== "23505") {
        toast.error("Failed to update like");
      }
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - User Profile */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="text-center mb-4">
                <Avatar className="w-20 h-20 mx-auto mb-3 bg-gradient-primary">
                  <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-primary-foreground">
                    {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </div>
                </Avatar>
                <h3 className="font-semibold text-lg">{profile?.full_name || 'User'}</h3>
                <p className="text-sm text-muted-foreground mb-2">{profile?.email}</p>
                {profile?.bd_id_verified && (
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    <Shield className="w-3 h-3 mr-1" />
                    BD-ID Verified
                  </Badge>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                {myBusinesses.length > 0 ? (
                  myBusinesses.map((business, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{business.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">No businesses yet</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border mt-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{connectionCount}</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{postCount}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">-</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  My Network
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Vote className="w-4 h-4 mr-2" />
                  CivicPulse™ Votes
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Opportunities
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content - Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post */}
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 bg-gradient-primary shrink-0">
                  <div className="flex items-center justify-center w-full h-full font-bold text-primary-foreground">
                    JD
                  </div>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share insights, ask questions, or post opportunities..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Newspaper className="w-4 h-4 mr-2" />
                        Article
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Vote className="w-4 h-4 mr-2" />
                        Poll
                      </Button>
                    </div>
                    <Button onClick={handlePost} disabled={!newPost.trim() || isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Filter */}
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="feed">Latest</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Posts */}
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="space-y-4">
                {posts.length === 0 && (
                  <Card className="p-12 text-center shadow-elevated border border-border">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">Be the first to share something with the community!</p>
                  </Card>
                )}
                {posts.map((post) => (
                  <Card key={post.id} className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all">
                    <div className="flex gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-chrome shrink-0">
                        <div className="flex items-center justify-center w-full h-full font-bold text-navy-deep">
                          {post.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{post.profiles?.full_name || 'Anonymous'}</h4>
                              {post.profiles?.bd_id_verified && (
                                <Shield className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{post.profiles?.email}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{getRelativeTime(post.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm mb-4 leading-relaxed">{post.content}</p>

                        <div className="flex items-center gap-6 pt-3 border-t border-border">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={likedPosts.has(post.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart className={`w-4 h-4 mr-2 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                            {post.likes_count}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {post.comments_count}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <Share2 className="w-4 h-4 mr-2" />
                            {post.shares_count}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Sidebar - Trending & Suggestions */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {[
                  { topic: "AI Automation", posts: 342 },
                  { topic: "Series A Funding", posts: 187 },
                  { topic: "B-Corp Certification", posts: 156 },
                  { topic: "Remote Teams", posts: 289 }
                ].map((item, idx) => (
                  <div key={idx} className="cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors">
                    <div className="font-semibold text-sm">#{item.topic}</div>
                    <div className="text-xs text-muted-foreground">{item.posts} posts</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4">Suggested Connections</h3>
              <div className="space-y-3">
                {[
                  { name: "Alex Kumar", company: "DataViz Pro", industry: "Analytics" },
                  { name: "Emma Wilson", company: "GreenTech Inc", industry: "Sustainability" }
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gradient-chrome">
                      <div className="flex items-center justify-center w-full h-full font-bold text-navy-deep text-sm">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{person.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{person.company}</div>
                    </div>
                    <Button size="sm" variant="outline">Connect</Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-gradient-primary border-0 shadow-glow">
              <h3 className="font-semibold mb-2 text-primary-foreground">CivicPulse™</h3>
              <p className="text-sm text-primary-foreground/80 mb-3">
                Vote on platform features and community guidelines
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                <Vote className="w-4 h-4 mr-2" />
                View Active Votes
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;