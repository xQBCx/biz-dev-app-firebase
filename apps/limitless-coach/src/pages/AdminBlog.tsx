import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plus, Trash2, Edit, Eye, EyeOff, Sparkles, FileText, 
  Image, Video, Link as LinkIcon, Loader2, Wand2, Calendar,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  content_type: string;
  media_url: string | null;
  external_link: string | null;
  tags: string[] | null;
  is_published: boolean;
  is_ai_generated: boolean;
  ai_prompt: string | null;
  published_at: string | null;
  created_at: string;
}

const contentTypeIcons = {
  article: FileText,
  image: Image,
  video: Video,
  link: LinkIcon,
};

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentType, setContentType] = useState<string>("article");
  const [mediaUrl, setMediaUrl] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      navigate("/");
      return;
    }

    fetchPosts();
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setExcerpt("");
    setContentType("article");
    setMediaUrl("");
    setExternalLink("");
    setTags("");
    setIsPublished(false);
    setAiPrompt("");
    setEditingPost(null);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content || "");
    setExcerpt(post.excerpt || "");
    setContentType(post.content_type);
    setMediaUrl(post.media_url || "");
    setExternalLink(post.external_link || "");
    setTags(post.tags?.join(", ") || "");
    setIsPublished(post.is_published);
    setAiPrompt(post.ai_prompt || "");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

      const postData = {
        title,
        content,
        excerpt: excerpt || content?.substring(0, 150),
        content_type: contentType,
        media_url: mediaUrl || null,
        external_link: externalLink || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
        ai_prompt: aiPrompt || null,
        is_ai_generated: !!aiPrompt,
        created_by: session?.user.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert(postData);

        if (error) throw error;
        toast.success("Post created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Post deleted");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null,
        })
        .eq("id", post.id);

      if (error) throw error;
      toast.success(post.is_published ? "Post unpublished" : "Post published");
      fetchPosts();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Failed to update post");
    }
  };

  const generateContent = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a topic or prompt");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-content", {
        body: { prompt: aiPrompt, contentType },
      });

      if (error) throw error;

      if (data.title) setTitle(data.title);
      if (data.content) setContent(data.content);
      if (data.excerpt) setExcerpt(data.excerpt);
      if (data.tags) setTags(data.tags.join(", "));

      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!title.trim() && !aiPrompt.trim()) {
      toast.error("Please enter a title or prompt first");
      return;
    }

    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-image", {
        body: { prompt: aiPrompt || title },
      });

      if (error) throw error;

      if (data.imageUrl) {
        setMediaUrl(data.imageUrl);
        setContentType("image");
        toast.success("Image generated successfully!");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Blog Management</h1>
                <p className="text-muted-foreground mt-1">Create and manage blog content with AI assistance</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="content" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="ai">AI Generate</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Topic / Prompt</Label>
                        <Textarea
                          placeholder="Enter a topic like 'Benefits of morning workouts' or 'Quick protein-packed breakfast ideas'..."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={generateContent} disabled={generating} className="flex-1">
                          {generating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4 mr-2" />
                          )}
                          Generate Article
                        </Button>
                        <Button onClick={generateImage} disabled={generatingImage} variant="outline">
                          {generatingImage ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Image className="h-4 w-4 mr-2" />
                          )}
                          Generate Image
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        AI will research current information and generate relevant content based on your topic.
                      </p>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Content Type</Label>
                          <Select value={contentType} onValueChange={setContentType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 flex items-end">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isPublished}
                              onCheckedChange={setIsPublished}
                            />
                            <Label>Publish immediately</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          placeholder="Post title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                          placeholder="Write your content here..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={8}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Excerpt</Label>
                        <Textarea
                          placeholder="Brief summary (auto-generated if left empty)"
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          rows={2}
                        />
                      </div>

                      {(contentType === "image" || contentType === "video") && (
                        <div className="space-y-2">
                          <Label>Media URL</Label>
                          <Input
                            placeholder="https://..."
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                          />
                          {mediaUrl && contentType === "image" && (
                            <img src={mediaUrl} alt="Preview" className="w-full max-h-48 object-cover rounded-lg mt-2" />
                          )}
                        </div>
                      )}

                      {contentType === "link" && (
                        <div className="space-y-2">
                          <Label>External Link</Label>
                          <Input
                            placeholder="https://..."
                            value={externalLink}
                            onChange={(e) => setExternalLink(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Tags (comma-separated)</Label>
                        <Input
                          placeholder="fitness, nutrition, workout"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <Button variant="outline" onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave}>
                          {editingPost ? "Update" : "Create"} Post
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first post to get started</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {posts.map((post) => {
                  const Icon = contentTypeIcons[post.content_type as keyof typeof contentTypeIcons] || FileText;
                  return (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {post.media_url && post.content_type === "image" && (
                            <img
                              src={post.media_url}
                              alt={post.title}
                              className="w-full sm:w-32 h-32 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                {post.content_type}
                              </Badge>
                              {post.is_ai_generated && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  AI
                                </Badge>
                              )}
                              <Badge variant={post.is_published ? "default" : "secondary"}>
                                {post.is_published ? "Published" : "Draft"}
                              </Badge>
                            </div>

                            <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                            {post.excerpt && (
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.created_at), "MMM d, yyyy")}
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePublish(post)}
                            >
                              {post.is_published ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(post)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(post.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminBlog;
