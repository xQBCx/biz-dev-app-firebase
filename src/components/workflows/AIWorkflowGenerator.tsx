import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedWorkflow {
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  nodes: Array<{
    id: string;
    type: string;
    name: string;
    category: string;
    config: Record<string, any>;
    position: { x: number; y: number };
  }>;
}

interface AIWorkflowGeneratorProps {
  onGenerated: (workflow: GeneratedWorkflow) => void;
  onClose: () => void;
}

const examplePrompts = [
  "When a new deal is created over $10k, send a Slack notification and create a follow-up task",
  "Every Monday, generate a weekly sales summary using AI and email it to the team",
  "When a lead submits a form, analyze sentiment, score the lead, and route to the right salesperson",
  "Daily at 9am, check for overdue tasks and send reminder emails to assignees",
];

export function AIWorkflowGenerator({ onGenerated, onClose }: AIWorkflowGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<GeneratedWorkflow | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe what you want the workflow to do");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workflow", {
        body: { prompt },
      });

      if (error) throw error;
      if (!data?.workflow) throw new Error("No workflow generated");

      setPreview(data.workflow);
      toast.success("Workflow generated! Review and confirm below.");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate workflow");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onGenerated(preview);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Brain className="h-5 w-5" />
        <span className="font-semibold">Describe your workflow in plain English</span>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., When a new lead comes in, analyze it with AI, score it, and if high value, create a task for immediate follow-up..."
        rows={4}
        className="resize-none"
      />

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {examplePrompts.map((example, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="text-xs h-auto py-1 px-2"
            onClick={() => setPrompt(example)}
          >
            {example.slice(0, 50)}...
          </Button>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Generate Workflow
        </Button>
      </div>

      {preview && (
        <Card className="mt-4 border-primary/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {preview.name}
              </CardTitle>
              <Badge>{preview.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{preview.description}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{preview.trigger_type} trigger</Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{preview.nodes.length} nodes</span>
            </div>

            <div className="space-y-1">
              {preview.nodes.map((node, idx) => (
                <div
                  key={node.id}
                  className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{node.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {node.category}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPreview(null)}>
                Regenerate
              </Button>
              <Button onClick={handleConfirm}>
                <Sparkles className="h-4 w-4 mr-2" />
                Use This Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
