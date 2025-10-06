import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Code2, Loader2, FileCode, CheckCircle2, Copy } from "lucide-react";

interface CodeFile {
  path: string;
  content: string;
  description: string;
}

interface GeneratedCode {
  files: CodeFile[];
  explanation: string;
  dependencies?: string[];
}

interface CodeGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CodeGenerationModal = ({ open, onOpenChange, onSuccess }: CodeGenerationModalProps) => {
  const [requirement, setRequirement] = useState("");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!requirement.trim()) {
      toast.error("Please describe what you want to build");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: { requirement, context },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedCode(data.code);
      setGenerationId(data.generation_id);
      toast.success("Code generated successfully! Review before applying.");
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast.error(error.message || "Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!generationId) return;

    try {
      const { error } = await supabase
        .from('mcp_code_generations')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      if (error) throw error;

      toast.success("Code approved! You can now implement it in your project.");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error approving code:', error);
      toast.error(error.message || "Failed to approve code");
    }
  };

  const handleReject = async () => {
    if (!generationId) return;

    try {
      const { error } = await supabase
        .from('mcp_code_generations')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      if (error) throw error;

      toast.success("Code generation rejected");
      handleClose();
    } catch (error: any) {
      console.error('Error rejecting code:', error);
      toast.error(error.message || "Failed to reject code");
    }
  };

  const handleClose = () => {
    setRequirement("");
    setContext("");
    setGeneratedCode(null);
    setGenerationId(null);
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            AI Code Generation
          </DialogTitle>
        </DialogHeader>

        {!generatedCode ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="requirement">What do you want to build?</Label>
              <Textarea
                id="requirement"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Example: Create a contact form component with name, email, and message fields. Include validation and submit to Supabase."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="context">Additional Context (optional)</Label>
              <Input
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Example: Use the existing design system, integrate with CRM contacts table"
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !requirement.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code2 className="w-4 h-4 mr-2" />
                  Generate Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Explanation */}
            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold mb-2">Implementation Plan</h3>
              <p className="text-sm text-muted-foreground">{generatedCode.explanation}</p>
            </Card>

            {/* Dependencies */}
            {generatedCode.dependencies && generatedCode.dependencies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Required Dependencies</h3>
                <div className="flex flex-wrap gap-2">
                  {generatedCode.dependencies.map((dep) => (
                    <Badge key={dep} variant="secondary">{dep}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Files */}
            <div>
              <h3 className="font-semibold mb-3">Generated Files ({generatedCode.files.length})</h3>
              <Tabs defaultValue={generatedCode.files[0]?.path || "0"}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  {generatedCode.files.map((file, index) => (
                    <TabsTrigger key={index} value={file.path} className="gap-2">
                      <FileCode className="w-3 h-3" />
                      {file.path.split('/').pop()}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {generatedCode.files.map((file, index) => (
                  <TabsContent key={index} value={file.path} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{file.path}</p>
                        <p className="text-xs text-muted-foreground">{file.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(file.content)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{file.content}</code>
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleApprove} className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve & Save
              </Button>
              <Button onClick={handleReject} variant="outline" className="flex-1">
                Reject
              </Button>
              <Button onClick={handleGenerate} variant="secondary">
                Regenerate
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Review the generated code carefully before approving. You'll need to manually implement it in your project.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
