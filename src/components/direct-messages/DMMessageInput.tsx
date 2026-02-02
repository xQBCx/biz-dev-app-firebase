import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Paperclip, 
  Image, 
  Mic, 
  X, 
  Loader2,
  Link as LinkIcon,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface DMMessageInputProps {
  onSend: (
    content: string,
    messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice_memo' | 'link',
    metadata?: Record<string, any>,
    file?: File
  ) => Promise<void>;
  sending: boolean;
  disabled?: boolean;
}

export function DMMessageInput({ onSend, sending, disabled }: DMMessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (disabled || sending) return;

    try {
      if (selectedFile) {
        const messageType = getMessageType(selectedFile.type);
        await onSend(message || selectedFile.name, messageType, {}, selectedFile);
        setSelectedFile(null);
      } else if (message.trim()) {
        // Check if message is a URL
        const urlPattern = /^(https?:\/\/[^\s]+)$/;
        const isLink = urlPattern.test(message.trim());
        await onSend(message.trim(), isLink ? 'link' : 'text', isLink ? { url: message.trim() } : {});
      }
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const getMessageType = (mimeType: string): 'image' | 'video' | 'audio' | 'file' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File too large', { description: 'Maximum file size is 50MB' });
        return;
      }
      setSelectedFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice-memo-${Date.now()}.webm`, { type: 'audio/webm' });
        
        try {
          await onSend('Voice memo', 'voice_memo', { duration: recordingTime }, file);
        } catch (err) {
          toast.error('Failed to send voice memo');
        }

        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Could not access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 bg-background">
      {selectedFile && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-lg">
          {selectedFile.type.startsWith('image/') && (
            <Image className="h-4 w-4 text-muted-foreground" />
          )}
          {selectedFile.type.startsWith('video/') && (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
          {!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/') && (
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm truncate flex-1">{selectedFile.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setSelectedFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-3 mb-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            Recording... {formatRecordingTime(recordingTime)}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={stopVoiceRecording}
            className="ml-auto"
          >
            Stop & Send
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={disabled || sending || isRecording}>
              <Paperclip className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
              }
            }}>
              <Image className="h-4 w-4 mr-2" />
              Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'video/*';
                fileInputRef.current.click();
              }
            }}>
              <FileText className="h-4 w-4 mr-2" />
              Video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = '*';
                fileInputRef.current.click();
              }
            }}>
              <Paperclip className="h-4 w-4 mr-2" />
              File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={disabled || sending}
          className={isRecording ? 'text-red-500' : ''}
        >
          <Mic className="h-5 w-5" />
        </Button>

        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending || isRecording}
          className="flex-1"
        />

        <Button
          onClick={handleSend}
          disabled={disabled || sending || isRecording || (!message.trim() && !selectedFile)}
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
