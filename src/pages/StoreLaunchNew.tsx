import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Globe, Github, Upload, ExternalLink, Smartphone, Apple, TabletSmartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SourceType = "lovable" | "replit" | "github" | "url" | "zip";

const StoreLaunchNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("url");
  const [sourceUrl, setSourceUrl] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["ios", "android"]);

  const createProject = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_projects")
        .insert({
          user_id: user?.id,
          name,
          connected_source_type: sourceType,
          source_url: sourceUrl || null,
          github_repo: githubRepo || null,
          platforms,
          status: "draft",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["store-launch-projects"] });
      toast({ title: "Project created", description: "Your app project has been created." });
      navigate(`/store-launch/project/${data.id}`);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const sources = [
    { id: "lovable", label: "Lovable.dev", icon: ExternalLink, description: "Connect via published URL or GitHub" },
    { id: "replit", label: "Replit", icon: ExternalLink, description: "Connect via deployed URL or GitHub" },
    { id: "url", label: "Hosted URL", icon: Globe, description: "Any web app via URL (recommended)" },
    { id: "github", label: "GitHub", icon: Github, description: "Import from repository" },
    { id: "zip", label: "Zip Upload", icon: Upload, description: "Upload your web app files" },
  ] as const;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/store-launch")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Store Launch
      </Button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Connect Your Web App</h1>
        <p className="text-muted-foreground">
          Start by connecting your existing web application
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>App Details</CardTitle>
          <CardDescription>Give your native app a name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">App Name</Label>
            <Input
              id="name"
              placeholder="My Awesome App"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Select Source</CardTitle>
          <CardDescription>How would you like to connect your web app?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  sourceType === source.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent/50"
                }`}
                onClick={() => setSourceType(source.id as SourceType)}
              >
                <source.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{source.label}</p>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                </div>
              </div>
            ))}
          </div>

          {(sourceType === "url" || sourceType === "lovable" || sourceType === "replit") && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="url">Web App URL</Label>
              <Input
                id="url"
                placeholder="https://your-app.com"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your web app will be loaded in a native webview container
              </p>
            </div>
          )}

          {sourceType === "github" && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="github">GitHub Repository URL</Label>
              <Input
                id="github"
                placeholder="https://github.com/user/repo"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
              />
            </div>
          )}

          {sourceType === "zip" && (
            <div className="space-y-2 pt-4 text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Zip upload coming soon</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Target Platforms</CardTitle>
          <CardDescription>Select which platforms to build for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                platforms.includes("ios") ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={() => togglePlatform("ios")}
            >
              <Apple className="h-8 w-8" />
              <span className="font-medium">iOS</span>
              <Checkbox checked={platforms.includes("ios")} />
            </div>
            <div
              className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                platforms.includes("android") ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={() => togglePlatform("android")}
            >
              <Smartphone className="h-8 w-8" />
              <span className="font-medium">Android</span>
              <Checkbox checked={platforms.includes("android")} />
            </div>
            <div
              className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors opacity-50`}
            >
              <TabletSmartphone className="h-8 w-8" />
              <span className="font-medium">Vision Pro</span>
              <span className="text-xs text-muted-foreground">Coming Soon</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Checkbox checked disabled />
            <div>
              <p className="font-medium">Free Tier Agreement</p>
              <p className="text-sm text-muted-foreground">
                By creating this project, you agree to the 5% lifetime revenue share on all app revenue
                generated through this platform. You'll connect a revenue verification source after setup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/store-launch")}>
          Cancel
        </Button>
        <Button
          onClick={() => createProject.mutate()}
          disabled={!name || (!sourceUrl && !githubRepo && sourceType !== "zip") || createProject.isPending}
        >
          {createProject.isPending ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </div>
  );
};

export default StoreLaunchNew;
