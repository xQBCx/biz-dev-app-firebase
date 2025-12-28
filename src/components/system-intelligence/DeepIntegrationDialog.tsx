import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Github, Database, Globe, Key, Eye, EyeOff, Loader2 } from "lucide-react";

interface DeepIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeepIntegrationDialog({ open, onOpenChange, onSuccess }: DeepIntegrationDialogProps) {
  const [activeTab, setActiveTab] = useState("github");
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  
  // GitHub state
  const [githubToken, setGithubToken] = useState("");
  
  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");
  
  // Lovable state
  const [lovableProjectUrl, setLovableProjectUrl] = useState("");

  const handleGitHubConnect = async () => {
    if (!githubToken) {
      toast({ title: "Error", description: "Please enter your GitHub Personal Access Token", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Test the token by fetching user info
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error("Invalid GitHub token");
      }

      const githubUser = await response.json();

      // Create a connection record
      const { data: connection, error } = await supabase
        .from("user_platform_connections")
        .insert({
          platform: "github",
          connection_name: `GitHub - ${githubUser.login}`,
          status: "connected",
          credentials: {
            personal_access_token: githubToken,
            github_username: githubUser.login,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Discover repositories
      const { data: discoverData, error: discoverError } = await supabase.functions.invoke("github-discover", {
        body: { connectionId: connection.id, accessToken: githubToken },
      });

      if (discoverError) {
        console.error("Discovery error:", discoverError);
      }

      toast({
        title: "GitHub Connected!",
        description: `Found ${discoverData?.count || 0} repositories for ${githubUser.login}`,
      });

      setGithubToken("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseConnect = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast({ title: "Error", description: "Please enter project URL and anon key", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Create a connection record
      const { data: connection, error } = await supabase
        .from("user_platform_connections")
        .insert({
          platform: "supabase",
          connection_name: `Supabase - ${new URL(supabaseUrl).hostname}`,
          status: "connected",
          credentials: {
            project_url: supabaseUrl,
            anon_key: supabaseAnonKey,
            service_role_key: supabaseServiceKey || null,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Analyze the Supabase project
      const { data: analyzeData, error: analyzeError } = await supabase.functions.invoke("supabase-analyze", {
        body: {
          projectUrl: supabaseUrl,
          anonKey: supabaseAnonKey,
          serviceRoleKey: supabaseServiceKey || null,
        },
      });

      toast({
        title: "Supabase Connected!",
        description: `Discovered ${analyzeData?.analysis?.tablesDiscovered || 0} tables`,
      });

      setSupabaseUrl("");
      setSupabaseAnonKey("");
      setSupabaseServiceKey("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLovableConnect = async () => {
    if (!lovableProjectUrl) {
      toast({ title: "Error", description: "Please enter your Lovable project URL", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Extract project info from URL
      const urlMatch = lovableProjectUrl.match(/https?:\/\/([^.]+)\.lovable\.app/);
      const projectSlug = urlMatch?.[1] || lovableProjectUrl;

      // Create a project import record for manual entry
      const { error } = await supabase.from("platform_project_imports").insert({
        platform: "lovable",
        external_id: projectSlug,
        project_name: projectSlug,
        project_url: lovableProjectUrl.includes("http") ? lovableProjectUrl : `https://${projectSlug}.lovable.app`,
        status: "discovered",
        metadata: {
          entry_method: "manual_url",
          needs_github_connection: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Lovable Project Added!",
        description: "To analyze the codebase, connect GitHub where this project syncs.",
      });

      setLovableProjectUrl("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({ title: "Failed to Add Project", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Deep Platform Integration
          </DialogTitle>
          <DialogDescription>
            Connect your platforms to enable full code and database analysis
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github" className="flex items-center gap-1">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="supabase" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger value="lovable" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Lovable</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription className="text-sm">
                Create a Personal Access Token at GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) with <strong>repo</strong> scope.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="github-token">Personal Access Token</Label>
              <div className="relative">
                <Input
                  id="github-token"
                  type={showToken ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleGitHubConnect} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Github className="h-4 w-4 mr-2" />}
              Connect GitHub & Discover Repos
            </Button>
          </TabsContent>

          <TabsContent value="supabase" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription className="text-sm">
                Find these in your Supabase Dashboard → Project Settings → API. Service role key enables full schema analysis.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">Project URL</Label>
                <Input
                  id="supabase-url"
                  placeholder="https://xxxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabase-anon">Anon Key</Label>
                <Input
                  id="supabase-anon"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabase-service">Service Role Key (optional, for full access)</Label>
                <Input
                  id="supabase-service"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  value={supabaseServiceKey}
                  onChange={(e) => setSupabaseServiceKey(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSupabaseConnect} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Connect & Analyze Database
            </Button>
          </TabsContent>

          <TabsContent value="lovable" className="space-y-4 mt-4">
            <Alert>
              <AlertDescription className="text-sm">
                Enter your Lovable project URL. For full code analysis, also connect GitHub where the project syncs.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="lovable-url">Lovable Project URL</Label>
              <Input
                id="lovable-url"
                placeholder="https://myproject.lovable.app"
                value={lovableProjectUrl}
                onChange={(e) => setLovableProjectUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleLovableConnect} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
              Add Lovable Project
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
