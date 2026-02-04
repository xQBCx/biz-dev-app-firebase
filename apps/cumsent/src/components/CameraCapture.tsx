import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Check, X, Loader2 } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

const CameraCapture = ({ onCapture, onCancel, isUploading = false }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [hasPhoto, setHasPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsInitializing(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please ensure you've granted camera permissions.");
      setIsInitializing(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Mirror the image for front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    setHasPhoto(true);
  }, [facingMode]);

  const retakePhoto = useCallback(() => {
    setHasPhoto(false);
  }, []);

  const confirmPhoto = useCallback(() => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture]);

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    setHasPhoto(false);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-xl min-h-[400px]">
        <Camera className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-destructive text-center mb-4">{error}</p>
        <div className="flex gap-3">
          <Button onClick={startCamera} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""} ${hasPhoto ? "hidden" : ""}`}
        />
        
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover ${hasPhoto ? "" : "hidden"}`}
        />
        
        {/* Face guide overlay */}
        {!hasPhoto && !isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-2 border-dashed border-primary/50 rounded-full" />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {!hasPhoto ? (
          <>
            <Button
              onClick={toggleCamera}
              variant="outline"
              size="icon"
              disabled={isInitializing}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              onClick={capturePhoto}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-8"
              disabled={isInitializing}
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={retakePhoto}
              variant="outline"
              size="lg"
              disabled={isUploading}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button
              onClick={confirmPhoto}
              size="lg"
              className="bg-success hover:bg-success/90 px-8"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              {isUploading ? "Uploading..." : "Confirm"}
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Position your face within the oval guide for best results
      </p>
    </div>
  );
};

export default CameraCapture;
