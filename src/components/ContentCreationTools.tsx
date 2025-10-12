import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranslationPanel } from "@/components/TranslationPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileText, 
  Languages, 
  Video, 
  Mic, 
  Download,
  Copy,
  Loader2,
  Sparkles
} from "lucide-react";

export const ContentCreationTools = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const generateContent = async (type: string) => {
    if (!title.trim()) {
      toast.error('Please enter a title or topic');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          title,
          type,
          additionalContext: content,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      toast.success('Content generated successfully');
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Content Creation & Translation Studio</h2>
      </div>
      <p className="text-muted-foreground">
        Create multilingual content for your business communications with AI-powered tools
      </p>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">
            <FileText className="w-4 h-4 mr-2" />
            Create Content
          </TabsTrigger>
          <TabsTrigger value="translate">
            <Languages className="w-4 h-4 mr-2" />
            Translate
          </TabsTrigger>
          <TabsTrigger value="media">
            <Video className="w-4 h-4 mr-2" />
            Media Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="content-title">Content Title/Topic</Label>
                <Input
                  id="content-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Product Launch Announcement, Sales Email, Marketing Copy"
                />
              </div>

              <div>
                <Label htmlFor="additional-context">Additional Context (Optional)</Label>
                <Textarea
                  id="additional-context"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add any specific details, tone preferences, or requirements..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => generateContent('email')}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Generate Email
                </Button>
                <Button 
                  onClick={() => generateContent('post')}
                  disabled={isGenerating}
                  variant="outline"
                >
                  Generate Social Post
                </Button>
                <Button 
                  onClick={() => generateContent('article')}
                  disabled={isGenerating}
                  variant="outline"
                >
                  Generate Article
                </Button>
                <Button 
                  onClick={() => generateContent('script')}
                  disabled={isGenerating}
                  variant="outline"
                >
                  Generate Script
                </Button>
              </div>

              {generatedContent && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated Content</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent}
                    readOnly
                    className="min-h-[300px] bg-muted"
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="translate">
          <TranslationPanel mode="formal" />
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Media Translation Tools</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4 border-2 border-dashed">
                  <Mic className="w-8 h-8 text-muted-foreground mb-3" />
                  <h4 className="font-medium mb-2">Audio Translation</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload audio files to translate spoken content across languages
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    <Mic className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                </Card>

                <Card className="p-4 border-2 border-dashed">
                  <Video className="w-8 h-8 text-muted-foreground mb-3" />
                  <h4 className="font-medium mb-2">Video Dubbing</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Translate and dub video content with voice synthesis
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    <Video className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                </Card>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Advanced media translation features will integrate with
                  real-time communication tools for live call translation and video conferencing support.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
