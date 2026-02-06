import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Camera, 
  Video, 
  Mic, 
  Upload, 
  X, 
  Play, 
  Pause, 
  Square,
  Image as ImageIcon,
  Volume2,
  Trash2
} from 'lucide-react';

interface MediaFile {
  id: string;
  type: 'photo' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
  uploaded?: boolean;
}

interface MediaCaptureProps {
  onMediaUpdate: (media: MediaFile[]) => void;
  maxFiles?: number;
}

export const MediaCapture = ({ onMediaUpdate, maxFiles = 10 }: MediaCaptureProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isRecording, setIsRecording] = useState<'video' | 'audio' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (context) {
      context.drawImage(video, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const newFile: MediaFile = {
            id: generateId(),
            type: 'photo',
            url,
            name: `photo-${Date.now()}.jpg`,
            size: blob.size,
            uploaded: false
          };
          
          const updatedFiles = [...mediaFiles, newFile];
          setMediaFiles(updatedFiles);
          onMediaUpdate(updatedFiles);
          
          await uploadFile(blob, newFile, 'maintenance-photos');
        }
      }, 'image/jpeg', 0.8);
    }
    stopCamera();
  };

  // Video recording functions
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const newFile: MediaFile = {
          id: generateId(),
          type: 'video',
          url,
          name: `video-${Date.now()}.webm`,
          size: blob.size,
          uploaded: false
        };
        
        const updatedFiles = [...mediaFiles, newFile];
        setMediaFiles(updatedFiles);
        onMediaUpdate(updatedFiles);
        
        await uploadFile(blob, newFile, 'maintenance-videos');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording('video');
    } catch (error) {
      toast({
        title: "Video Error",
        description: "Could not start video recording. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording === 'video') {
      mediaRecorderRef.current.stop();
      setIsRecording(null);
      stopCamera();
    }
  };

  // Audio recording functions
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        const newFile: MediaFile = {
          id: generateId(),
          type: 'audio',
          url,
          name: `voice-note-${Date.now()}.webm`,
          size: blob.size,
          uploaded: false
        };
        
        const updatedFiles = [...mediaFiles, newFile];
        setMediaFiles(updatedFiles);
        onMediaUpdate(updatedFiles);
        
        await uploadFile(blob, newFile, 'maintenance-audio');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording('audio');
    } catch (error) {
      toast({
        title: "Audio Error",
        description: "Could not start audio recording. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording === 'audio') {
      mediaRecorderRef.current.stop();
      setIsRecording(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // File upload functions
  const uploadFile = async (blob: Blob, file: MediaFile, bucket: string) => {
    if (!user) return;

    try {
      setIsUploading(true);
      const filePath = `${user.id}/${file.name}`;
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob);

      if (error) throw error;

      // Update file as uploaded
      setMediaFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, uploaded: true, url: `${bucket}/${filePath}` }
            : f
        )
      );

      toast({
        title: "Upload Successful",
        description: `${file.type} uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(async (file) => {
      if (mediaFiles.length >= maxFiles) {
        toast({
          title: "Max Files Reached",
          description: `You can only upload up to ${maxFiles} files.`,
          variant: "destructive",
        });
        return;
      }

      const url = URL.createObjectURL(file);
      let type: 'photo' | 'video' | 'audio' = 'photo';
      let bucket = 'maintenance-photos';

      if (file.type.startsWith('video/')) {
        type = 'video';
        bucket = 'maintenance-videos';
      } else if (file.type.startsWith('audio/')) {
        type = 'audio';
        bucket = 'maintenance-audio';
      }

      const newFile: MediaFile = {
        id: generateId(),
        type,
        url,
        name: file.name,
        size: file.size,
        uploaded: false
      };

      const updatedFiles = [...mediaFiles, newFile];
      setMediaFiles(updatedFiles);
      onMediaUpdate(updatedFiles);

      await uploadFile(file, newFile, bucket);
    });
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = mediaFiles.filter(f => f.id !== fileId);
    setMediaFiles(updatedFiles);
    onMediaUpdate(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attach Media</h3>
            <Badge variant="outline">
              {mediaFiles.length}/{maxFiles} files
            </Badge>
          </div>

          {/* Camera/Video preview */}
          <div className="mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full max-w-md mx-auto rounded-lg bg-gray-100 hidden"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Media capture buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Button
              variant="outline"
              onClick={streamRef.current ? capturePhoto : startCamera}
              disabled={isRecording !== null || isUploading}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Camera className="h-6 w-6" />
              <span className="text-sm">
                {streamRef.current ? 'Take Photo' : 'Camera'}
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={isRecording === 'video' ? stopVideoRecording : startVideoRecording}
              disabled={isRecording === 'audio' || isUploading}
              className="flex flex-col gap-2 h-auto py-4"
            >
              {isRecording === 'video' ? <Square className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              <span className="text-sm">
                {isRecording === 'video' ? 'Stop Video' : 'Record Video'}
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={isRecording === 'audio' ? stopAudioRecording : startAudioRecording}
              disabled={isRecording === 'video' || isUploading}
              className="flex flex-col gap-2 h-auto py-4"
            >
              {isRecording === 'audio' ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              <span className="text-sm">
                {isRecording === 'audio' ? 'Stop Recording' : 'Voice Note'}
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording !== null || isUploading}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Upload Files</span>
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-700 font-medium">
                Recording {isRecording === 'video' ? 'video' : 'audio'}...
              </span>
            </div>
          )}

          {/* Media files grid */}
          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaFiles.map((file) => (
                <Card key={file.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {file.type === 'photo' && <ImageIcon className="h-4 w-4" />}
                        {file.type === 'video' && <Video className="h-4 w-4" />}
                        {file.type === 'audio' && <Volume2 className="h-4 w-4" />}
                        <span className="text-sm font-medium capitalize">{file.type}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Media preview */}
                    {file.type === 'photo' && (
                      <img
                        src={file.url}
                        alt="Captured"
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    {file.type === 'video' && (
                      <video
                        src={file.url}
                        controls
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    {file.type === 'audio' && (
                      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(file.url)}
                          className="h-8 w-8 p-0"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <span className="text-sm text-gray-600">Voice Note</span>
                      </div>
                    )}

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                      {file.uploaded ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Uploaded
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                          Uploading...
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Hidden audio element for playback */}
          <audio ref={audioRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};