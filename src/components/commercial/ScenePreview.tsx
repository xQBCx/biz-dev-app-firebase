import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Video, Loader2, AlertCircle, CheckCircle } from "lucide-react";

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

interface ScenePreviewProps {
  scenes: Scene[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  pending_api_key: { label: "Awaiting API Key", variant: "secondary", icon: <AlertCircle className="h-3 w-3" /> },
  generating: { label: "Generating", variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  processing: { label: "Processing", variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  completed: { label: "Ready", variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
  failed: { label: "Failed", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
};

export function ScenePreview({ scenes }: ScenePreviewProps) {
  if (scenes.length === 0) {
    return (
      <Card className="border-dashed border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Video className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Your parsed scenes will appear here after you submit your script.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Video className="h-5 w-5 text-primary" />
        Scenes ({scenes.length})
      </h3>
      
      <div className="grid gap-4">
        {scenes.map((scene) => {
          const status = statusConfig[scene.status] || statusConfig.pending;
          
          return (
            <Card key={scene.id} className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Scene {scene.scene_order}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {scene.duration_seconds}s
                    </Badge>
                    <Badge variant={status.variant} className="text-xs flex items-center gap-1">
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm">{scene.description}</p>
                </div>
                
                {scene.voiceover_text && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Voiceover</p>
                    <p className="text-sm italic text-muted-foreground">"{scene.voiceover_text}"</p>
                  </div>
                )}

                {scene.video_clip_url && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <video
                      src={scene.video_clip_url}
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
