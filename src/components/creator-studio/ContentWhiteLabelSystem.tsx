import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Loader2, Copy, Eye, MessageSquare, Mail, Video, PenTool, Megaphone } from "lucide-react";

const CONTENT_TYPES = [
  { value: "social_post", label: "Social Post", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "video_script", label: "Video Script", icon: Video },
  { value: "blog", label: "Blog Article", icon: PenTool },
  { value: "ad_copy", label: "Ad Copy", icon: Megaphone },
];

const TONES = [
  { value: "authentic", label: "Authentic" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Enthusiastic" },
];

export const ContentWhiteLabelSystem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    template_name: "",
    content_type: "social_post",
    template_body: "",
    tone: "authentic",
    is_public: false,
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["content-templates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("creator_content_templates")
        .select("*")
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      // Extract variables from template ({{variable_name}} pattern)
      const variableMatches = formData.template_body.match(/\{\{([^}]+)\}\}/g) || [];
      const variables = variableMatches.map(v => v.replace(/\{\{|\}\}/g, '').trim());
      
      const { error } = await supabase.from("creator_content_templates").insert({
        user_id: user.id,
        template_name: formData.template_name,
        content_type: formData.content_type,
        template_body: formData.template_body,
        variables: variables,
        tone: formData.tone,
        is_public: formData.is_public,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Content template created!");
      queryClient.invalidateQueries({ queryKey: ["content-templates"] });
      setFormData({
        template_name: "",
        content_type: "social_post",
        template_body: "",
        tone: "authentic",
        is_public: false,
      });
    },
    onError: (error) => {
      toast.error("Failed to create template: " + error.message);
    },
  });

  const copyTemplate = (body: string) => {
    navigator.clipboard.writeText(body);
    toast.success("Template copied to clipboard!");
  };

  const myTemplates = templates?.filter(t => t.user_id === user?.id) || [];
  const publicTemplates = templates?.filter(t => t.is_public && t.user_id !== user?.id) || [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Content Template
          </CardTitle>
          <CardDescription>
            Generate organic-feeling promotional content. Use {"{{variable}}"} for placeholders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., Product Launch Announcement"
              value={formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={formData.content_type} onValueChange={(v) => setFormData({ ...formData, content_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>{tone.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-body">Template Content</Label>
            <Textarea
              id="template-body"
              placeholder="Hey everyone! 🎉 Just launched {{product_name}} and I'm so excited to share {{main_benefit}} with you all..."
              value={formData.template_body}
              onChange={(e) => setFormData({ ...formData, template_body: e.target.value })}
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{variable_name}}"} for dynamic content. E.g., {"{{product_name}}"}, {"{{benefit}}"}, {"{{cta_link}}"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="is-public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
              <Label htmlFor="is-public" className="text-sm">Share publicly</Label>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => createMutation.mutate()}
            disabled={!formData.template_name || !formData.template_body || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><FileText className="h-4 w-4 mr-2" /> Create Template</>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Templates</CardTitle>
            <CardDescription>Your content library</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : myTemplates.length > 0 ? (
              <div className="space-y-3">
                {myTemplates.map((template) => {
                  const TypeIcon = CONTENT_TYPES.find(t => t.value === template.content_type)?.icon || FileText;
                  const variables = Array.isArray(template.variables) ? template.variables : [];
                  
                  return (
                    <div key={template.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{template.template_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {template.is_public && (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 text-xs">
                              <Eye className="h-3 w-3 mr-1" /> Public
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">{template.tone}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.template_body}</p>
                      {variables.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {variables.map((v: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Used {template.use_count || 0} times</span>
                        <Button size="sm" variant="ghost" onClick={() => copyTemplate(template.template_body)}>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No templates yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {publicTemplates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Community Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {publicTemplates.slice(0, 3).map((template) => {
                  const TypeIcon = CONTENT_TYPES.find(t => t.value === template.content_type)?.icon || FileText;
                  return (
                    <div key={template.id} className="p-2 border rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{template.template_name}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => copyTemplate(template.template_body)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
