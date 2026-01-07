import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Lock, Download, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommercialPreviewPlayerProps {
  videoUrl: string | null;
  watermarkText?: string;
  isPurchased: boolean;
  onPurchase: () => void;
  isLoading?: boolean;
}

export function CommercialPreviewPlayer({
  videoUrl,
  watermarkText = "BIZ DEV APP",
  isPurchased,
  onPurchase,
  isLoading,
}: CommercialPreviewPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!videoUrl || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    if (!ctx) return;

    const drawFrame = () => {
      if (video.paused || video.ended) return;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add watermark if not purchased
      if (!isPurchased) {
        ctx.save();
        
        // Semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Main watermark
        ctx.font = "bold 48px system-ui";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Rotate and draw multiple watermarks
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        
        for (let y = -canvas.height; y < canvas.height * 2; y += 150) {
          for (let x = -canvas.width; x < canvas.width * 2; x += 300) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        
        ctx.restore();

        // Lock icon overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "white";
        ctx.font = "24px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔒", canvas.width / 2, canvas.height / 2);
      }

      requestAnimationFrame(drawFrame);
    };

    video.addEventListener("play", drawFrame);
    video.addEventListener("timeupdate", () => {
      setProgress((video.currentTime / video.duration) * 100);
    });

    // Set canvas size
    video.addEventListener("loadedmetadata", () => {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
    });

    return () => {
      video.removeEventListener("play", drawFrame);
    };
  }, [videoUrl, isPurchased, watermarkText]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Prevent right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  if (!videoUrl) {
    return (
      <Card className="border-dashed border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Your commercial preview will appear here once generated.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {isPurchased ? (
            <>
              <Download className="h-4 w-4 text-green-500" />
              Purchased - Ready to Download
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 text-yellow-500" />
              Preview (Watermarked)
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div
          className="relative aspect-video bg-black"
          onContextMenu={handleContextMenu}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="hidden"
            muted={isMuted}
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onContextMenu={handleContextMenu}
          />
          
          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {!isPurchased && (
                <Button
                  size="sm"
                  onClick={onPurchase}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase to Download
                </Button>
              )}
              
              {isPurchased && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = videoUrl;
                    a.download = "commercial.mp4";
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download HD
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
