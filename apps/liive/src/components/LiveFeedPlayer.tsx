import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, Pause, Radio, Eye, Users, Activity } from "lucide-react";

interface LiveFeedPlayerProps {
  venueId: string;
  videoUrl: string | null;
  venueType: string;
  onCrowdAnalysis?: (data: any) => void;
}

const LiveFeedPlayer = ({ venueId, videoUrl, venueType, onCrowdAnalysis }: LiveFeedPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const captureFrame = async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const analyzeCrowd = async () => {
    setIsAnalyzing(true);

    try {
      // Capture current frame
      const imageData = await captureFrame();

      if (!imageData) {
        toast.error("Could not capture video frame");
        return;
      }

      // Call AI analysis edge function
      const { data, error } = await supabase.functions.invoke("analyze-crowd", {
        body: {
          imageUrl: imageData,
          venueType,
        },
      });

      if (error) {
        throw error;
      }

      setAnalysis(data);
      onCrowdAnalysis?.(data);

      // Update venue crowd level in database
      if (data.crowdLevel && data.energyLevel) {
        await supabase
          .from("venues")
          .update({
            crowd_level: data.crowdLevel,
            energy_level: data.energyLevel,
            is_live: true,
          })
          .eq("id", venueId);
      }

      toast.success("Crowd analysis complete!");
    } catch (error: any) {
      console.error("Error analyzing crowd:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit reached. Please try again in a moment.");
      } else if (error.message?.includes("402")) {
        toast.error("AI credits depleted. Please add credits to continue.");
      } else {
        toast.error("Failed to analyze crowd");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!videoUrl) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Live Feed Available</h3>
          <p className="text-muted-foreground">
            This venue doesn't have a live feed set up yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0 relative">
          <div className="relative bg-black rounded-t-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full aspect-video object-cover"
              controls={false}
              playsInline
              loop
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Live indicator */}
            <Badge className="absolute top-4 left-4 bg-red-500 animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              LIVE
            </Badge>

            {/* Play/Pause overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full w-16 h-16"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Feed Analysis
              </h3>
              <Button
                size="sm"
                onClick={analyzeCrowd}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Crowd"}
              </Button>
            </div>

            {analysis && (
              <div className="space-y-3 pt-3 border-t">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Crowd Level</p>
                    <p className="font-semibold capitalize">{analysis.crowdLevel}</p>
                  </div>
                  <div className="text-center">
                    <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Energy</p>
                    <p className="font-semibold">{analysis.energyLevel}/10</p>
                  </div>
                  {analysis.estimatedCount && (
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs text-muted-foreground">Est. Count</p>
                      <p className="font-semibold">{analysis.estimatedCount}</p>
                    </div>
                  )}
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-foreground">{analysis.analysis}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Privacy Notice</h4>
              <p className="text-xs text-muted-foreground">
                AI analysis is performed on captured frames for crowd insights only. 
                No personal data is stored or shared.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveFeedPlayer;
