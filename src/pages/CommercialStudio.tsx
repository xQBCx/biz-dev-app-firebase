import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ScriptEditor } from "@/components/commercial/ScriptEditor";
import { ScenePreview } from "@/components/commercial/ScenePreview";
import { CommercialPreviewPlayer } from "@/components/commercial/CommercialPreviewPlayer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Film, Sparkles, DollarSign, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface Scene {
  id: string;
  scene_order: number;
  description: string;
  visual_prompt: string;
  voiceover_text?: string | null;
  duration_seconds: number;
  status: string;
  video_clip_url: string | null;
}

interface Project {
  id: string;
  title: string;
  script_text: string;
  status: string;
  voiceover_url: string | null;
  final_video_url: string | null;
  watermarked_video_url: string | null;
  price_cents: number;
}

export default function CommercialStudio() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isPurchased, setIsPurchased] = useState(false);

  const projectId = searchParams.get("project_id");
  const success = searchParams.get("success");

  useEffect(() => {
    if (success === "true" && projectId) {
      toast.success("Purchase successful! You can now download your commercial.");
      setIsPurchased(true);
    }
  }, [success, projectId]);

  useEffect(() => {
    if (projectId && user) {
      loadProject(projectId);
    }
  }, [projectId, user]);

  const loadProject = async (id: string) => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("commercial_projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);
      setIsPurchased(projectData.status === "purchased");

      const { data: scenesData, error: scenesError } = await supabase
        .from("commercial_scenes")
        .select("*")
        .eq("project_id", id)
        .order("scene_order");

      if (scenesError) throw scenesError;
      setScenes(scenesData || []);
    } catch (error: any) {
      console.error("Error loading project:", error);
      toast.error("Failed to load project");
    }
  };

  const handleScriptSubmit = async (title: string, script: string) => {
    if (!user) {
      toast.error("Please sign in to create commercials");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-commercial-script", {
        body: { title, script_text: script },
      });

      if (error) throw error;

      toast.success(`Script parsed into ${data.scenes_count} scenes!`);
      
      // Load the created project
      if (data.project_id) {
        await loadProject(data.project_id);
        
        // Generate voiceover
        generateVoiceover(data.project_id, data.full_voiceover);
      }
    } catch (error: any) {
      console.error("Error parsing script:", error);
      toast.error(error.message || "Failed to parse script");
    } finally {
      setIsLoading(false);
    }
  };

  const generateVoiceover = async (projectId: string, text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-commercial-voiceover", {
        body: { project_id: projectId, text },
      });

      if (error) throw error;

      if (data.status === "pending_api_key") {
        toast.info("ElevenLabs API key not configured. Voiceover generation will be available once configured.");
      } else {
        toast.success("Voiceover generated successfully!");
        loadProject(projectId);
      }
    } catch (error: any) {
      console.error("Error generating voiceover:", error);
    }
  };

  const generateVideoClips = async () => {
    if (!project) return;

    for (const scene of scenes) {
      if (scene.status !== "completed") {
        try {
          await supabase.functions.invoke("generate-video-clip", {
            body: {
              scene_id: scene.id,
              visual_prompt: scene.visual_prompt,
              duration_seconds: scene.duration_seconds,
            },
          });
        } catch (error) {
          console.error("Error generating clip for scene:", scene.id, error);
        }
      }
    }
    
    toast.info("Video generation started. This may take several minutes.");
    loadProject(project.id);
  };

  const handlePurchase = async () => {
    if (!project) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("commercial-checkout", {
        body: { project_id: project.id },
      });

      if (error) throw error;

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error(error.message || "Failed to create checkout");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Film className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access the Commercial Studio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Film className="h-8 w-8 text-primary" />
                Commercial Studio
              </h1>
              <p className="text-muted-foreground">
                Create professional AI-generated video commercials
              </p>
            </div>
          </div>
          
          {project && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {scenes.reduce((sum, s) => sum + s.duration_seconds, 0)}s
              </Badge>
              <Badge variant="outline" className="text-sm">
                <DollarSign className="h-3 w-3 mr-1" />
                {(project.price_cents / 100).toFixed(2)}
              </Badge>
            </div>
          )}
        </div>

        {/* Features Banner */}
        {!project && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <Sparkles className="h-10 w-10 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">AI-Powered Video Generation</h2>
                  <p className="text-sm text-muted-foreground">
                    Write a script, and our AI will generate professional video clips, voiceover, and assemble your commercial automatically.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {!project ? (
              <ScriptEditor onSubmit={handleScriptSubmit} isLoading={isLoading} />
            ) : (
              <>
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge
                        variant={
                          project.status === "purchased"
                            ? "default"
                            : project.status === "preview"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadProject(project.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Status
                      </Button>
                      <Button
                        size="sm"
                        onClick={generateVideoClips}
                        disabled={scenes.every((s) => s.status === "completed")}
                      >
                        <Film className="h-4 w-4 mr-2" />
                        Generate Videos
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <ScenePreview scenes={scenes} />
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CommercialPreviewPlayer
              videoUrl={isPurchased ? project?.final_video_url : project?.watermarked_video_url}
              isPurchased={isPurchased}
              onPurchase={handlePurchase}
              isLoading={isLoading}
            />

            {/* Pricing Card */}
            {project && !isPurchased && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Unlock Your Commercial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      ✓ Full HD 1080p video (no watermark)
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Professional voiceover included
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Unlimited downloads
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Commercial use license
                    </li>
                  </ul>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={isLoading}
                  >
                    Purchase for ${(project.price_cents / 100).toFixed(2)}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
