import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Camera, 
  Video, 
  Square, 
  SwitchCamera, 
  X, 
  Upload, 
  Trash2, 
  Mic, 
  MicOff,
  Settings,
  ZoomIn,
  ZoomOut,
  FlashlightOff,
  Flashlight,
  Focus,
  Grid3X3,
  Timer,
  Pause,
  Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EnhancedCameraCaptureProps {
  inspectionId?: string;
  onMediaCaptured?: (url: string, type: 'photo' | 'video' | 'audio') => void;
  onClose?: () => void;
  compact?: boolean;
}

type CameraMode = 'photo' | 'video' | 'audio';
type CameraFacing = 'user' | 'environment';

export const EnhancedCameraCapture: React.FC<EnhancedCameraCaptureProps> = ({
  inspectionId,
  onMediaCaptured,
  onClose,
  compact = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<CameraMode>('photo');
  const [facing, setFacing] = useState<CameraFacing>('environment');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ blob: Blob; type: CameraMode } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Enhanced features
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timerDelay, setTimerDelay] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(10).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      if (mode === 'audio') {
        // Audio only mode
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setStream(newStream);
        setupAudioVisualization(newStream);
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          // @ts-ignore - zoom is supported in some browsers
          zoom: zoom,
        },
        audio: mode === 'video',
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Apply zoom if supported
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number } };
        if (capabilities.zoom) {
          const settings = {
            advanced: [{ zoom: zoom }]
          };
          // @ts-ignore
          await videoTrack.applyConstraints(settings);
        }
      }

      // Setup audio visualization for video mode
      if (mode === 'video') {
        setupAudioVisualization(newStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  }, [facing, mode, zoom, stream]);

  const setupAudioVisualization = (mediaStream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(mediaStream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 32;

      const updateLevels = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray.slice(0, 10)).map(v => v / 255);
        setAudioLevels(levels);
        if (isRecording || mode === 'audio') {
          requestAnimationFrame(updateLevels);
        }
      };
      updateLevels();
    } catch (error) {
      console.error('Audio visualization error:', error);
    }
  };

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stream]);

  // Initialize camera on mount and mode/facing changes
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facing, mode]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && timerDelay > 0) {
      // Timer finished, perform capture
      if (mode === 'photo') {
        performPhotoCapture();
      } else {
        startRecording();
      }
      setTimerDelay(0);
    }
  }, [countdown]);

  // Capture photo
  const performPhotoCapture = useCallback(() => {
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
        toast.success('Photo captured!');
      }
    }, 'image/jpeg', 0.95);
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (timerDelay > 0) {
      setCountdown(timerDelay);
    } else {
      performPhotoCapture();
    }
  }, [timerDelay, performPhotoCapture]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    const mimeType = mode === 'audio' ? 'audio/webm;codecs=opus' : 'video/webm;codecs=vp9,opus';
    
    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { 
        type: mode === 'audio' ? 'audio/webm' : 'video/webm' 
      });
      setCapturedMedia({ blob, type: mode });
      stopCamera();
      toast.success(`${mode === 'audio' ? 'Audio' : 'Video'} recording saved!`);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);
  }, [stream, mode, stopCamera]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  // Pause/resume recording
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

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

      const extensions: Record<CameraMode, string> = {
        photo: 'jpg',
        video: 'webm',
        audio: 'webm'
      };
      const mimeTypes: Record<CameraMode, string> = {
        photo: 'image/jpeg',
        video: 'video/webm',
        audio: 'audio/webm'
      };

      const fileExt = extensions[capturedMedia.type];
      const fileName = `${user.id}/${inspectionId || 'unsorted'}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('inspection-media')
        .upload(fileName, capturedMedia.blob, {
          contentType: mimeTypes[capturedMedia.type],
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

      toast.success(`${capturedMedia.type.charAt(0).toUpperCase() + capturedMedia.type.slice(1)} uploaded successfully`);
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

  const timerOptions = [0, 3, 5, 10];

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            {mode === 'audio' ? 'Audio Recorder' : 'Camera'}
          </CardTitle>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              REC
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!capturedMedia && mode !== 'audio' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8"
            >
              <Settings className={cn("h-4 w-4", showSettings && "text-primary")} />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Camera Preview / Captured Media / Audio Visualizer */}
        <div className="relative aspect-video bg-black">
          {capturedMedia ? (
            capturedMedia.type === 'photo' ? (
              <img
                src={URL.createObjectURL(capturedMedia.blob)}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            ) : capturedMedia.type === 'video' ? (
              <video
                src={URL.createObjectURL(capturedMedia.blob)}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-secondary">
                <Mic className="h-16 w-16 text-primary" />
                <audio
                  src={URL.createObjectURL(capturedMedia.blob)}
                  controls
                  className="w-3/4"
                />
              </div>
            )
          ) : mode === 'audio' ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-secondary to-background">
              <div className="flex items-end gap-1 h-32">
                {audioLevels.map((level, i) => (
                  <motion.div
                    key={i}
                    className="w-4 bg-primary rounded-t"
                    animate={{ height: `${Math.max(8, level * 128)}px` }}
                    transition={{ duration: 0.05 }}
                  />
                ))}
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 text-destructive">
                  <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                  <span className="text-2xl font-mono font-bold">{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: `scale(${zoom})` }}
              />
              
              {/* Grid overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                </div>
              )}

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full">
                  <motion.div
                    animate={{ opacity: isPaused ? 0.5 : [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: isPaused ? 0 : Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-white"
                  />
                  <span className="text-sm font-bold font-mono">{formatTime(recordingTime)}</span>
                  {isPaused && <span className="text-xs">PAUSED</span>}
                </div>
              )}

              {/* Countdown overlay */}
              <AnimatePresence>
                {countdown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50"
                  >
                    <span className="text-8xl font-bold text-white">{countdown}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Zoom indicator */}
              {zoom > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                  {zoom.toFixed(1)}x
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && !capturedMedia && mode !== 'audio' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Zoom control */}
                <div className="flex items-center gap-3">
                  <ZoomOut className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[zoom]}
                    onValueChange={([val]) => setZoom(val)}
                    min={1}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Quick settings */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={showGrid ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={flashEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFlashEnabled(!flashEnabled)}
                    >
                      {flashEnabled ? <Flashlight className="h-4 w-4" /> : <FlashlightOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Timer options */}
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-muted-foreground mr-1" />
                    {timerOptions.map(t => (
                      <Button
                        key={t}
                        variant={timerDelay === t ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimerDelay(t)}
                        className="w-8 h-8 p-0"
                      >
                        {t === 0 ? 'Off' : `${t}s`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <Button
                variant={mode === 'audio' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('audio')}
              >
                <Mic className="h-4 w-4 mr-2" />
                Audio
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
                {mode !== 'audio' && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={switchCamera}
                    disabled={isRecording}
                    className="rounded-full h-12 w-12"
                  >
                    <SwitchCamera className="h-5 w-5" />
                  </Button>
                )}

                {mode === 'photo' ? (
                  <Button
                    size="icon"
                    onClick={capturePhoto}
                    disabled={countdown > 0}
                    className="rounded-full h-16 w-16 bg-white hover:bg-gray-100 border-4 border-primary"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary" />
                  </Button>
                ) : isRecording ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      onClick={togglePause}
                      variant="outline"
                      className="rounded-full h-12 w-12"
                    >
                      {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    </Button>
                    <Button
                      size="icon"
                      onClick={stopRecording}
                      variant="destructive"
                      className="rounded-full h-16 w-16"
                    >
                      <Square className="h-6 w-6" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="icon"
                    onClick={() => {
                      if (timerDelay > 0) {
                        setCountdown(timerDelay);
                      } else {
                        startRecording();
                      }
                    }}
                    className={cn(
                      "rounded-full h-16 w-16",
                      mode === 'audio' 
                        ? "bg-primary hover:bg-primary/90" 
                        : "bg-destructive hover:bg-destructive/90"
                    )}
                  >
                    {mode === 'audio' ? (
                      <Mic className="h-6 w-6 text-white" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white" />
                    )}
                  </Button>
                )}

                {mode !== 'audio' && <div className="w-12 h-12" />}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
