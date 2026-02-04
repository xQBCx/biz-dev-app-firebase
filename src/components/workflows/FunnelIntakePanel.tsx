import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, Image, FileText, Mic, Loader2, Sparkles, 
  Check, X, Wand2, Zap, ArrowRight, Save, Play 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ParsedStage {
  name: string;
  description: string;
  action_type: string;
  integrations?: string[];
  conditions?: string[];
}

interface ParsedFunnel {
  name: string;
  description: string;
  category: string;
  stages: ParsedStage[];
  integrations_needed: string[];
}

interface FunnelIntakePanelProps {
  onFunnelCreated?: (funnelId: string) => void;
  onClose?: () => void;
}

export function FunnelIntakePanel({ onFunnelCreated, onClose }: FunnelIntakePanelProps) {
  const [activeTab, setActiveTab] = useState("images");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedFunnel, setParsedFunnel] = useState<ParsedFunnel | null>(null);
  const [funnelName, setFunnelName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    setParsedFunnel(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
    setParsedFunnel(null);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const uploadAndParse = async () => {
    if (files.length === 0 && !audioBlob) {
      toast.error("Please add files or record a voice memo");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload files to storage
      const uploadedPaths: string[] = [];
      const totalFiles = files.length + (audioBlob ? 1 : 0);
      let uploaded = 0;

      for (const file of files) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('funnel-uploads')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        uploadedPaths.push(filePath);
        uploaded++;
        setProgress(10 + (uploaded / totalFiles) * 40);
      }

      if (audioBlob) {
        const audioPath = `${user.id}/${Date.now()}-voice-memo.webm`;
        const { error: uploadError } = await supabase.storage
          .from('funnel-uploads')
          .upload(audioPath, audioBlob);
        
        if (uploadError) throw uploadError;
        uploadedPaths.push(audioPath);
      }

      setUploading(false);
      setParsing(true);
      setProgress(50);

      // Call parsing edge function
      const { data, error } = await supabase.functions.invoke('parse-funnel-intake', {
        body: { 
          filePaths: uploadedPaths,
          sourceType: activeTab === 'images' ? 'screenshot' : activeTab === 'documents' ? 'document' : 'voice'
        }
      });

      if (error) throw error;
      
      setProgress(100);
      setParsedFunnel(data.parsed);
      setFunnelName(data.parsed.name || "");
      toast.success("Funnel parsed successfully!");

    } catch (err: any) {
      console.error("Upload/parse error:", err);
      toast.error(err.message || "Failed to process files");
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const saveFunnel = async (createWorkflow: boolean = false) => {
    if (!parsedFunnel) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('funnel_blueprints')
        .insert({
          user_id: user.id,
          name: funnelName || parsedFunnel.name,
          description: parsedFunnel.description,
          category: parsedFunnel.category,
          source_type: activeTab,
          source_files: files.map(f => f.name),
          stages: JSON.parse(JSON.stringify(parsedFunnel.stages)),
          integrations_needed: parsedFunnel.integrations_needed,
          status: createWorkflow ? 'active' : 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(createWorkflow ? "Funnel saved & workflow created!" : "Funnel saved as draft");
      onFunnelCreated?.(data.id);
      onClose?.();

    } catch (err: any) {
      toast.error(err.message || "Failed to save funnel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Funnel Intake</h3>
          <p className="text-sm text-muted-foreground">
            Upload screenshots, docs, or voice memos to auto-generate workflows
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="images" className="gap-2">
            <Image className="w-4 h-4" />
            Screenshots
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="w-4 h-4" />
            Voice Memo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4 mt-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Drop screenshots here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG, WEBP - Multiple files supported
            </p>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('doc-upload')?.click()}
          >
            <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Drop documents here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, DOCX, TXT supported
            </p>
            <input
              id="doc-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="text-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="w-32 h-32 rounded-full"
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic className={cn("w-12 h-12", isRecording && "animate-pulse")} />
              </Button>
              <p className="mt-4 font-medium">
                {isRecording ? "Recording... Click to stop" : "Click to record"}
              </p>
              {audioBlob && !isRecording && (
                <Badge className="mt-2" variant="secondary">
                  <Check className="w-3 h-3 mr-1" />
                  Voice memo recorded
                </Badge>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Preview */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Uploaded Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      {file.type.startsWith('image/') ? (
                        <Image className="w-4 h-4 text-blue-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                      )}
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeFile(idx)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {(uploading || parsing) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{uploading ? "Uploading files..." : "AI parsing content..."}</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Parse Button */}
      {!parsedFunnel && (files.length > 0 || audioBlob) && (
        <Button 
          onClick={uploadAndParse} 
          disabled={uploading || parsing}
          className="w-full"
        >
          {uploading || parsing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Parse & Extract Workflow
        </Button>
      )}

      {/* Parsed Result */}
      {parsedFunnel && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Parsed Funnel
              </CardTitle>
              <Badge>{parsedFunnel.category}</Badge>
            </div>
            <CardDescription>{parsedFunnel.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Funnel Name</Label>
              <Input 
                value={funnelName} 
                onChange={(e) => setFunnelName(e.target.value)}
                placeholder="Enter a name for this funnel"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Stages ({parsedFunnel.stages.length})</Label>
              <div className="mt-2 space-y-2">
                {parsedFunnel.stages.map((stage, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{stage.name}</p>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                      {stage.integrations && stage.integrations.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {stage.integrations.map((int, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{int}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>

            {parsedFunnel.integrations_needed.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Required Integrations</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {parsedFunnel.integrations_needed.map((int, idx) => (
                    <Badge key={idx} variant="secondary">{int}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => saveFunnel(false)}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button className="flex-1" onClick={() => saveFunnel(true)}>
                <Play className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
