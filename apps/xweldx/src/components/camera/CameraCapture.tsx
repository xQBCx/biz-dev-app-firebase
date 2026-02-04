import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Video, Square, SwitchCamera, X, Upload, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CameraCaptureProps {
  inspectionId?: string;
  onMediaCaptured?: (url: string, type: 'photo' | 'video') => void;
  onClose?: () => void;
}

type CameraMode = 'photo' | 'video';
type CameraFacing = 'user' | 'environment';

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  inspectionId,
  onMediaCaptured,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<CameraMode>('photo');
  const [facing, setFacing] = useState<CameraFacing>('environment');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ blob: Blob; type: CameraMode } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  }, [facing, mode, stream]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Initialize camera on mount and mode/facing changes
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facing]);

  // Restart camera when mode changes to get audio for video
  useEffect(() => {
    if (stream) {
      startCamera();
    }
  }, [mode]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedMedia({ blob, type: 'photo' });
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  // Start video recording
  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setCapturedMedia({ blob, type: 'video' });
      stopCamera();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
  }, [stream, stopCamera]);

  // Stop video recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Switch camera facing
  const switchCamera = useCallback(() => {
    setFacing(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Upload media to Supabase storage
  const uploadMedia = useCallback(async () => {
    if (!capturedMedia) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to upload media');
        return;
      }

      const fileExt = capturedMedia.type === 'photo' ? 'jpg' : 'webm';
      const fileName = `${user.id}/${inspectionId || 'unsorted'}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('inspection-media')
        .upload(fileName, capturedMedia.blob, {
          contentType: capturedMedia.type === 'photo' ? 'image/jpeg' : 'video/webm',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('inspection-media')
        .getPublicUrl(data.path);

      // Log storage usage
      await supabase.from('storage_usage_log').insert({
        user_id: user.id,
        file_path: data.path,
        file_size_bytes: capturedMedia.blob.size,
        action: 'upload'
      });

      toast.success(`${capturedMedia.type === 'photo' ? 'Photo' : 'Video'} uploaded successfully`);
      onMediaCaptured?.(publicUrl, capturedMedia.type);
      
      // Reset state
      setCapturedMedia(null);
      startCamera();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  }, [capturedMedia, inspectionId, onMediaCaptured, startCamera]);

  // Discard captured media
  const discardMedia = useCallback(() => {
    setCapturedMedia(null);
    startCamera();
  }, [startCamera]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Camera Capture
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {/* Camera Preview / Captured Media */}
        <div className="relative aspect-video bg-black">
          {capturedMedia ? (
            capturedMedia.type === 'photo' ? (
              <img
                src={URL.createObjectURL(capturedMedia.blob)}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={URL.createObjectURL(capturedMedia.blob)}
                controls
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          {!capturedMedia && !isRecording && (
            <div className="flex justify-center gap-2">
              <Button
                variant={mode === 'photo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('photo')}
              >
                <Camera className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button
                variant={mode === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('video')}
              >
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
            </div>
          )}

          {/* Capture Controls */}
          <div className="flex justify-center items-center gap-4">
            {capturedMedia ? (
              <>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={discardMedia}
                  disabled={isUploading}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Discard
                </Button>
                <Button
                  size="lg"
                  onClick={uploadMedia}
                  disabled={isUploading}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={switchCamera}
                  disabled={isRecording}
                  className="rounded-full h-12 w-12"
                >
                  <SwitchCamera className="h-5 w-5" />
                </Button>

                {mode === 'photo' ? (
                  <Button
                    size="icon"
                    onClick={capturePhoto}
                    className="rounded-full h-16 w-16 bg-white hover:bg-gray-100 border-4 border-primary"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary" />
                  </Button>
                ) : isRecording ? (
                  <Button
                    size="icon"
                    onClick={stopRecording}
                    variant="destructive"
                    className="rounded-full h-16 w-16"
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    onClick={startRecording}
                    className="rounded-full h-16 w-16 bg-destructive hover:bg-destructive/90"
                  >
                    <div className="w-6 h-6 rounded-full bg-white" />
                  </Button>
                )}

                <div className="w-12 h-12" /> {/* Spacer for symmetry */}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
