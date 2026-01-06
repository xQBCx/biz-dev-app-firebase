import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, Image, Loader2, Sparkles, Check, X, 
  FileText, Camera, Brain, Wand2, ChevronRight, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DetectedWorkflow {
  name: string;
  description: string;
  category: string;
  confidence: number;
  suggestedNodes: Array<{
    type: string;
    name: string;
    category: string;
    description: string;
  }>;
}

interface ScreenshotWorkflowGeneratorProps {
  onWorkflowsGenerated: (workflows: DetectedWorkflow[]) => void;
  onClose: () => void;
}

export function ScreenshotWorkflowGenerator({ 
  onWorkflowsGenerated, 
  onClose 
}: ScreenshotWorkflowGeneratorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedWorkflows, setDetectedWorkflows] = useState<DetectedWorkflow[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<number>>(new Set());

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Process with AI
    setIsProcessing(true);
    setDetectedWorkflows([]);
    setSelectedWorkflows(new Set());

    try {
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve((r.result as string).split(',')[1]);
        r.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-workflow-screenshot', {
        body: { image: base64, mimeType: file.type }
      });

      if (error) throw error;

      if (data?.workflows && data.workflows.length > 0) {
        setDetectedWorkflows(data.workflows);
        // Auto-select all by default
        setSelectedWorkflows(new Set(data.workflows.map((_: any, i: number) => i)));
        toast.success(`Detected ${data.workflows.length} workflow${data.workflows.length > 1 ? 's' : ''}`);
      } else {
        toast.info("No workflows detected. Try a clearer image or different format.");
      }
    } catch (err: any) {
      console.error('Screenshot analysis error:', err);
      toast.error(err.message || 'Failed to analyze screenshot');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const toggleWorkflowSelection = (index: number) => {
    setSelectedWorkflows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleGenerate = () => {
    const selected = detectedWorkflows.filter((_, i) => selectedWorkflows.has(i));
    if (selected.length === 0) {
      toast.error("Select at least one workflow to generate");
      return;
    }
    onWorkflowsGenerated(selected);
  };

  const reset = () => {
    setUploadedImage(null);
    setDetectedWorkflows([]);
    setSelectedWorkflows(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!uploadedImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center 
            cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all group"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">Upload Workflow Screenshot</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a screenshot showing workflow names, automation lists, or process diagrams
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">PNG</Badge>
              <Badge variant="outline" className="text-xs">JPG</Badge>
              <Badge variant="outline" className="text-xs">WebP</Badge>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={uploadedImage} 
                alt="Uploaded workflow reference" 
                className="w-full max-h-64 object-contain bg-muted/30"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-primary animate-pulse mx-auto mb-3" />
                    <p className="font-medium">Analyzing image...</p>
                    <p className="text-sm text-muted-foreground">Detecting workflow patterns</p>
                  </div>
                </div>
              )}
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={reset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Detected Workflows */}
          {detectedWorkflows.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Detected Workflows
                  </span>
                  <Badge variant="secondary">{selectedWorkflows.size} selected</Badge>
                </CardTitle>
              </CardHeader>
              <ScrollArea className="max-h-[300px]">
                <CardContent className="space-y-2 py-0 pb-4">
                  {detectedWorkflows.map((workflow, index) => (
                    <div
                      key={index}
                      onClick={() => toggleWorkflowSelection(index)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        selectedWorkflows.has(index)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          selectedWorkflows.has(index) 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground/50"
                        )}>
                          {selectedWorkflows.has(index) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{workflow.name}</p>
                            <Badge variant="outline" className="text-[10px]">
                              {Math.round(workflow.confidence * 100)}% match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {workflow.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {workflow.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {workflow.suggestedNodes.length} nodes
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {uploadedImage && !isProcessing && (
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Another
            </Button>
          )}
          {detectedWorkflows.length > 0 && (
            <Button onClick={handleGenerate} disabled={selectedWorkflows.size === 0}>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate {selectedWorkflows.size} Workflow{selectedWorkflows.size !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p className="font-medium">Tips for best results:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Include workflow names or titles clearly visible</li>
          <li>Screenshots of automation tools, CRM workflows, or process diagrams work well</li>
          <li>Higher resolution images yield better detection accuracy</li>
        </ul>
      </div>
    </div>
  );
}
