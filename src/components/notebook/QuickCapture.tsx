import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  Upload, Link, Mic, Camera, FileText, Youtube, Image, 
  Globe, Loader2, X, Plus, Brain, Inbox, Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface QuickCaptureProps {
  onCaptureComplete?: () => void;
  compact?: boolean;
}

const ACCEPTED_FILE_TYPES = {
  documents: ".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls",
  images: ".png,.jpg,.jpeg,.gif,.webp,.heic",
  audio: ".mp3,.wav,.m4a,.ogg,.webm",
  video: ".mp4,.mov,.avi,.webm"
};

export function QuickCapture({ onCaptureComplete, compact = false }: QuickCaptureProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("drop");
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureMutation = useMutation({
    mutationFn: async (params: {
      content?: string;
      file?: File;
      sourceUrl?: string;
      sourceType: string;
      sourcePlatform?: string;
      title?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let filePath: string | undefined;
      let fileType: string | undefined;
      let fileSize: number | undefined;

      // Upload file if present
      if (params.file) {
        const ext = params.file.name.split('.').pop();
        filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from("knowledge-hub")
          .upload(filePath, params.file);

        if (uploadError) throw uploadError;
        
        fileType = params.file.type;
        fileSize = params.file.size;
      }

      // Create inbox item first (quick capture)
      const { data: inboxItem, error: inboxError } = await supabase
        .from("knowledge_inbox")
        .insert({
          user_id: user.id,
          content: params.content,
          file_path: filePath,
          source_url: params.sourceUrl,
          source_type: params.sourceType,
          source_platform: params.sourcePlatform,
          status: "processing",
        })
        .select()
        .single();

      if (inboxError) throw inboxError;

      // Create the knowledge item
      const { data: knowledgeItem, error: itemError } = await supabase
        .from("knowledge_items")
        .insert({
          user_id: user.id,
          title: params.title || params.sourceUrl || params.file?.name || "Captured content",
          content: params.content,
          source_url: params.sourceUrl,
          source_type: params.sourceType,
          source_platform: params.sourcePlatform,
          file_path: filePath,
          file_type: fileType,
          file_size: fileSize,
          processing_status: "pending",
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Update inbox to link to knowledge item
      await supabase
        .from("knowledge_inbox")
        .update({ 
          status: "processed", 
          knowledge_item_id: knowledgeItem.id 
        })
        .eq("id", inboxItem.id);

      // Trigger AI processing
      await supabase.functions.invoke("process-knowledge-item", {
        body: { itemId: knowledgeItem.id },
      });

      return knowledgeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-items"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-inbox"] });
      toast.success("Captured! AI is processing your content.");
      setIsOpen(false);
      resetForm();
      onCaptureComplete?.();
    },
    onError: (error) => {
      toast.error("Failed to capture: " + error.message);
    },
  });

  const resetForm = () => {
    setUrlInput("");
    setTextInput("");
    setTextTitle("");
    setActiveTab("drop");
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileCapture(files[0]);
    }

    // Check for URL in text
    const text = e.dataTransfer.getData("text");
    if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
      handleUrlCapture(text);
    }
  }, []);

  const handleFileCapture = (file: File) => {
    const type = file.type;
    let sourceType = "document";
    
    if (type.startsWith("image/")) sourceType = "image";
    else if (type.startsWith("audio/")) sourceType = "audio";
    else if (type.startsWith("video/")) sourceType = "video";
    else if (type.includes("pdf")) sourceType = "pdf";

    captureMutation.mutate({
      file,
      sourceType,
      title: file.name,
    });
  };

  const handleUrlCapture = (url: string) => {
    let sourceType = "url";
    let sourcePlatform: string | undefined;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      sourceType = "youtube";
      sourcePlatform = "youtube";
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      sourcePlatform = "twitter";
    } else if (url.includes("linkedin.com")) {
      sourcePlatform = "linkedin";
    } else if (url.includes("instagram.com")) {
      sourcePlatform = "instagram";
    } else if (url.includes("tiktok.com")) {
      sourcePlatform = "tiktok";
    }

    captureMutation.mutate({
      sourceUrl: url,
      sourceType,
      sourcePlatform,
      title: url,
    });
    setUrlInput("");
  };

  const handleTextCapture = () => {
    if (!textInput.trim()) return;
    
    captureMutation.mutate({
      content: textInput,
      sourceType: "text",
      title: textTitle || textInput.substring(0, 50) + "...",
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `voice-memo-${Date.now()}.webm`, { type: "audio/webm" });
        
        captureMutation.mutate({
          file,
          sourceType: "voice_memo",
          title: `Voice Memo - ${new Date().toLocaleString()}`,
        });

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

    } catch (error) {
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Capture
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Quick Capture
            </DialogTitle>
          </DialogHeader>
          <CaptureContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDragging={isDragging}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileCapture={handleFileCapture}
            handleUrlCapture={handleUrlCapture}
            handleTextCapture={handleTextCapture}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            textInput={textInput}
            setTextInput={setTextInput}
            textTitle={textTitle}
            setTextTitle={setTextTitle}
            isRecording={isRecording}
            recordingTime={recordingTime}
            startRecording={startRecording}
            stopRecording={stopRecording}
            formatTime={formatTime}
            isPending={captureMutation.isPending}
            fileInputRef={fileInputRef}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Inbox className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Quick Capture</h3>
        <span className="text-xs text-muted-foreground ml-auto">Drop anything here</span>
      </div>
      <CaptureContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDragging={isDragging}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleFileCapture={handleFileCapture}
        handleUrlCapture={handleUrlCapture}
        handleTextCapture={handleTextCapture}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        textInput={textInput}
        setTextInput={setTextInput}
        textTitle={textTitle}
        setTextTitle={setTextTitle}
        isRecording={isRecording}
        recordingTime={recordingTime}
        startRecording={startRecording}
        stopRecording={stopRecording}
        formatTime={formatTime}
        isPending={captureMutation.isPending}
        fileInputRef={fileInputRef}
      />
    </Card>
  );
}

interface CaptureContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileCapture: (file: File) => void;
  handleUrlCapture: (url: string) => void;
  handleTextCapture: () => void;
  urlInput: string;
  setUrlInput: (url: string) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  textTitle: string;
  setTextTitle: (title: string) => void;
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => void;
  stopRecording: () => void;
  formatTime: (seconds: number) => string;
  isPending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

function CaptureContent({
  activeTab,
  setActiveTab,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileCapture,
  handleUrlCapture,
  handleTextCapture,
  urlInput,
  setUrlInput,
  textInput,
  setTextInput,
  textTitle,
  setTextTitle,
  isRecording,
  recordingTime,
  startRecording,
  stopRecording,
  formatTime,
  isPending,
  fileInputRef,
}: CaptureContentProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 w-full mb-4">
        <TabsTrigger value="drop" className="gap-1.5 text-xs">
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Drop</span>
        </TabsTrigger>
        <TabsTrigger value="url" className="gap-1.5 text-xs">
          <Link className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">URL</span>
        </TabsTrigger>
        <TabsTrigger value="text" className="gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Text</span>
        </TabsTrigger>
        <TabsTrigger value="voice" className="gap-1.5 text-xs">
          <Mic className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Voice</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="drop" className="mt-0">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }
          `}
        >
          {isPending ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Processing...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2 mb-3">
                <Image className="h-6 w-6 text-muted-foreground" />
                <FileText className="h-6 w-6 text-muted-foreground" />
                <Mic className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Drop files, screenshots, or links</p>
              <p className="text-sm text-muted-foreground mt-1">
                Images, PDFs, audio, documents — anything
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={`${ACCEPTED_FILE_TYPES.documents},${ACCEPTED_FILE_TYPES.images},${ACCEPTED_FILE_TYPES.audio},${ACCEPTED_FILE_TYPES.video}`}
            onChange={(e) => e.target.files?.[0] && handleFileCapture(e.target.files[0])}
          />
        </div>
      </TabsContent>

      <TabsContent value="url" className="mt-0 space-y-3">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            <Globe className="h-3 w-3" /> Web
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            <Youtube className="h-3 w-3" /> YouTube
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            Social Posts
          </span>
        </div>
        <Input
          placeholder="Paste URL (article, video, tweet, post...)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && urlInput.trim() && handleUrlCapture(urlInput)}
        />
        <Button 
          onClick={() => handleUrlCapture(urlInput)}
          disabled={!urlInput.trim() || isPending}
          className="w-full"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Capture & Analyze
        </Button>
      </TabsContent>

      <TabsContent value="text" className="mt-0 space-y-3">
        <Input
          placeholder="Title (optional)"
          value={textTitle}
          onChange={(e) => setTextTitle(e.target.value)}
        />
        <Textarea
          placeholder="Paste text, notes, ideas..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <Button 
          onClick={handleTextCapture}
          disabled={!textInput.trim() || isPending}
          className="w-full"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Save & Process
        </Button>
      </TabsContent>

      <TabsContent value="voice" className="mt-0">
        <div className="text-center py-6">
          {isRecording ? (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                <Mic className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-2xl font-mono">{formatTime(recordingTime)}</p>
              <Button variant="destructive" onClick={stopRecording}>
                <X className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Record a voice memo, idea, or thought
              </p>
              <Button onClick={startRecording} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Start Recording
              </Button>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}