import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Copy, Save, Facebook, Instagram, Linkedin, Mail, MessageSquare, FileText, Image, Send, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ContentType = 'social_post' | 'email_template' | 'ad_copy' | 'direct_mail' | 'sms_template';
type LeadType = 'office_building' | 'golf_course' | 'high_income_neighborhood' | 'dealership_small' | 'dealership_luxury' | 'fleet_company';

interface GeneratedContent {
  id?: string;
  title: string;
  content: string;
  content_type: ContentType;
  platforms: string[];
  target_audience: LeadType[];
  status: string;
}

const contentTypeLabels: Record<ContentType, { label: string; icon: React.ElementType }> = {
  social_post: { label: "Social Media Post", icon: Facebook },
  email_template: { label: "Email Template", icon: Mail },
  ad_copy: { label: "Ad Copy", icon: FileText },
  direct_mail: { label: "Direct Mail", icon: Mail },
  sms_template: { label: "SMS Template", icon: MessageSquare }
};

const audienceLabels: Record<LeadType, string> = {
  office_building: "Office Buildings",
  golf_course: "Golf Courses",
  high_income_neighborhood: "High-Income Neighborhoods",
  dealership_small: "Small/Medium Dealerships",
  dealership_luxury: "Luxury Dealerships",
  fleet_company: "Fleet Companies"
};

export default function AdminContent() {
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [savedContent, setSavedContent] = useState<GeneratedContent[]>([]);
  const [contentType, setContentType] = useState<ContentType>("social_post");
  const [targetAudience, setTargetAudience] = useState<LeadType>("office_building");
  const [platform, setPlatform] = useState("facebook");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [title, setTitle] = useState("");
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedContent();
  }, []);

  const fetchSavedContent = async () => {
    const { data, error } = await supabase
      .from('marketing_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setSavedContent(data as GeneratedContent[]);
    }
  };

  const generateContent = async () => {
    if (!topic) {
      toast({ title: "Error", description: "Please enter a topic or prompt", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-marketing-content', {
        body: {
          contentType,
          targetAudience,
          platform,
          topic,
          businessName: "DetailPro Mobile Auto Detailing"
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      setTitle(data.title || `${contentTypeLabels[contentType].label} - ${audienceLabels[targetAudience]}`);
      toast({ title: "Success", description: "Content generated!" });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({ title: "Error", description: "Failed to generate content. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const saveContent = async () => {
    if (!generatedContent || !title) {
      toast({ title: "Error", description: "No content to save", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('marketing_content').insert({
      title,
      content: generatedContent,
      content_type: contentType,
      platforms: [platform],
      target_audience: [targetAudience],
      status: 'draft'
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save content", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Content saved!" });
      fetchSavedContent();
    }
  };

  const generateImage = async () => {
    const promptToUse = imagePrompt || `Professional marketing image for mobile auto detailing service targeting ${audienceLabels[targetAudience]}. ${topic}`;
    
    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-marketing-image', {
        body: { prompt: promptToUse }
      });

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
      toast({ title: "Success", description: "Image generated!" });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({ title: "Error", description: "Failed to generate image. Please try again.", variant: "destructive" });
    } finally {
      setGeneratingImage(false);
    }
  };

  const copyToClipboard = (text?: string) => {
    navigator.clipboard.writeText(text || generatedContent);
    toast({ title: "Copied!", description: "Content copied to clipboard" });
  };

  const useContentForCampaign = (content: GeneratedContent) => {
    setGeneratedContent(content.content);
    setTitle(content.title);
    setContentType(content.content_type);
    toast({ title: "Content loaded", description: "You can now edit and use this content" });
  };

  const deleteContent = async (id: string) => {
    const { error } = await supabase.from('marketing_content').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete content", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Content removed from library" });
      fetchSavedContent();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Content Creator</h1>
        <p className="text-muted-foreground">Generate marketing content and images for social media, emails, and ads</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generator Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate Content
            </CardTitle>
            <CardDescription>Use AI to create targeted marketing content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(contentTypeLabels).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Audience</Label>
              <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as LeadType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(audienceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {contentType === "social_post" && (
              <div>
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="google_business">Google Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Topic / Prompt</Label>
              <Textarea 
                placeholder="e.g., Promote our fleet maintenance services to logistics companies..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={generateContent} disabled={generating} className="w-full">
              {generating ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Preview and edit your content before saving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Content title"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea 
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                placeholder="Generated content will appear here..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => copyToClipboard()} disabled={!generatedContent}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={saveContent} disabled={!generatedContent}>
                <Save className="h-4 w-4 mr-2" />
                Save to Library
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Generator Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-blue-500" />
              AI Image Generator
            </CardTitle>
            <CardDescription>Generate marketing images for your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label>Image Prompt (optional - will auto-generate based on content settings)</Label>
                  <Textarea 
                    placeholder="e.g., Professional photo of a luxury car being detailed at a golf course clubhouse..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={generateImage} disabled={generatingImage} className="w-full">
                  {generatingImage ? (
                    <>Generating Image...</>
                  ) : (
                    <>
                      <Image className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg">
                {generatedImage ? (
                  <img src={generatedImage} alt="Generated marketing image" className="max-w-full max-h-[300px] rounded-lg" />
                ) : (
                  <p className="text-muted-foreground">Generated image will appear here</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Content Library */}
      <Card>
        <CardHeader>
          <CardTitle>Content Library</CardTitle>
          <CardDescription>Previously generated and saved content - use these for campaigns, social posts, or emails</CardDescription>
        </CardHeader>
        <CardContent>
          {savedContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No saved content yet. Generate and save content above.
            </div>
          ) : (
            <div className="space-y-4">
              {savedContent.map((content) => (
                <Card key={content.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{content.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{contentTypeLabels[content.content_type]?.label}</Badge>
                        {content.platforms?.map((p) => (
                          <Badge key={p} variant="secondary">{p}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge>{content.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{content.content}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(content.content)}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => useContentForCampaign(content)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{content.title}</DialogTitle>
                          <DialogDescription>
                            {contentTypeLabels[content.content_type]?.label} for {content.target_audience?.map(a => audienceLabels[a]).join(', ')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="whitespace-pre-wrap text-sm">{content.content}</div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="destructive" onClick={() => content.id && deleteContent(content.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
