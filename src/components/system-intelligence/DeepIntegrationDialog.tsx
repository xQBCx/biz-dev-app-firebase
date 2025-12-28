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

// Platform IDs from external_platform_registry
const PLATFORM_IDS = {
  github: "aa4de0d5-79e4-45cc-bc65-47792ee2da6b",
  supabase: "acf04eb8-ebc8-43bd-8430-5e63e4b65fa1",
  lovable: "b9cb7ff8-4f52-4c36-ac53-39a0f24eb3f4",
};

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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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

      // Create a connection record with correct column names
      const { data: connection, error } = await supabase
        .from("user_platform_connections")
        .insert({
          user_id: user.id,
          platform_id: PLATFORM_IDS.github,
          connection_name: `GitHub - ${githubUser.login}`,
          connection_status: "connected",
          auth_method: "personal_access_token",
          access_token_encrypted: githubToken, // Will be encrypted by edge function later
          external_account_id: githubUser.id?.toString(),
          external_account_name: githubUser.login,
          platform_metadata: {
            avatar_url: githubUser.avatar_url,
            html_url: githubUser.html_url,
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Extract project ID from URL
      const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
      const projectId = urlMatch?.[1] || "unknown";

      // Create a connection record with correct column names
      const { data: connection, error } = await supabase
        .from("user_platform_connections")
        .insert({
          user_id: user.id,
          platform_id: PLATFORM_IDS.supabase,
          connection_name: `Database - ${projectId}`,
          connection_status: "connected",
          auth_method: "api_key",
          api_key_encrypted: supabaseAnonKey, // Anon key
          external_account_id: projectId,
          external_account_name: projectId,
          platform_metadata: {
            project_url: supabaseUrl,
            has_service_key: !!supabaseServiceKey,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Analyze the project
      const { data: analyzeData, error: analyzeError } = await supabase.functions.invoke("supabase-analyze", {
        body: {
          connectionId: connection.id,
          projectUrl: supabaseUrl,
          anonKey: supabaseAnonKey,
          serviceRoleKey: supabaseServiceKey || null,
        },
      });

      if (analyzeError) {
        console.error("Analysis error:", analyzeError);
      }

      toast({
        title: "Database Connected!",
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Extract project info from URL
      const urlMatch = lovableProjectUrl.match(/https?:\/\/([^.]+)\.lovable\.app/);
      const projectSlug = urlMatch?.[1] || lovableProjectUrl;
      const projectUrl = lovableProjectUrl.includes("http") 
        ? lovableProjectUrl 
        : `https://${projectSlug}.lovable.app`;

      // First create a connection for Lovable platform
      const { data: connection, error: connError } = await supabase
        .from("user_platform_connections")
        .insert({
          user_id: user.id,
          platform_id: PLATFORM_IDS.lovable,
          connection_name: `Lovable - ${projectSlug}`,
          connection_status: "connected",
          auth_method: "url_entry",
          external_account_id: projectSlug,
          external_account_name: projectSlug,
          platform_metadata: {
            project_url: projectUrl,
            entry_method: "manual_url",
            needs_github_for_code: true,
          },
        })
        .select()
        .single();

      if (connError) throw connError;

      // Create a project import record
      const { error } = await supabase.from("platform_project_imports").insert({
        connection_id: connection.id,
        user_id: user.id,
        external_project_id: projectSlug,
        external_project_name: projectSlug,
        external_project_url: projectUrl,
        import_status: "discovered",
        analysis_data: {
          entry_method: "manual_url",
          needs_github_connection: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Lovable Project Added!",
        description: "To analyze the codebase, also connect GitHub where this project syncs.",
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
                Find these in your project's Dashboard → Project Settings → API. Service role key enables full schema analysis.
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
