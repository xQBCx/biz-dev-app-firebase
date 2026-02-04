import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Video, 
  Image as ImageIcon, 
  Dumbbell, 
  Target, 
  Utensils, 
  Sparkles,
  Upload,
  Play,
  Share2,
  Eye,
  Heart,
  Trash2,
  Edit
} from "lucide-react";

interface CoachContent {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  media_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  platforms_published: any;
  status: string;
  view_count: number;
  like_count: number;
  created_at: string;
}

const contentTypeConfig = {
  video: { label: "Video", icon: Video, color: "bg-red-500" },
  image: { label: "Image", icon: ImageIcon, color: "bg-blue-500" },
  workout_demo: { label: "Workout Demo", icon: Dumbbell, color: "bg-orange-500" },
  form_tip: { label: "Form Tip", icon: Target, color: "bg-green-500" },
  meal_prep: { label: "Meal Prep", icon: Utensils, color: "bg-purple-500" },
  motivation: { label: "Motivation", icon: Sparkles, color: "bg-pink-500" },
};

export default function AdminContentLibrary() {
  const [content, setContent] = useState<CoachContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "video",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("coach_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title) {
      toast({
        title: "Missing Info",
        description: "Please provide a title and select a file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${formData.content_type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("coach-content")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("coach-content")
        .getPublicUrl(filePath);

      // Create content record
      const { error: insertError } = await supabase
        .from("coach_content")
        .insert({
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          media_url: publicUrl,
          created_by: session.user.id,
          status: "draft",
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Content uploaded successfully!",
      });

      setIsDialogOpen(false);
      setFormData({ title: "", description: "", content_type: "video" });
      setSelectedFile(null);
      fetchContent();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload content",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from("coach_content")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Published", description: "Content is now live!" });
      fetchContent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      const { error } = await supabase
        .from("coach_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Content removed" });
      fetchContent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const filteredContent = selectedTab === "all" 
    ? content 
    : content.filter(c => c.content_type === selectedTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            Upload workout videos, form tips, meal prep, and motivational content
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title..."
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your content..."
                />
              </div>
              <div>
                <Label>Content Type</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contentTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>File</Label>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <Button onClick={handleUpload} disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload Content"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(contentTypeConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key}>
              <config.icon className="h-4 w-4 mr-1" />
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredContent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No content yet</h3>
                <p className="text-muted-foreground">
                  Upload your first piece of content to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item) => {
                const config = contentTypeConfig[item.content_type as keyof typeof contentTypeConfig];
                const IconComponent = config?.icon || Video;

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      {item.content_type === "video" ? (
                        <video
                          src={item.media_url}
                          className="w-full h-full object-cover"
                          poster={item.thumbnail_url || undefined}
                        />
                      ) : (
                        <img
                          src={item.media_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge className={config?.color || "bg-primary"}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {config?.label || item.content_type}
                        </Badge>
                      </div>
                      {item.content_type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-3">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {item.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {item.like_count}
                        </span>
                        <Badge variant={item.status === "published" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {item.status !== "published" && (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(item.id)}
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/admin/content/deploy/${item.id}`, "_blank")}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Deploy
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}