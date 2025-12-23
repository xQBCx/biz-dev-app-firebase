import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Brain, Sparkles } from "lucide-react";

interface CreateSituationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  onSuccess: () => void;
}

export function CreateSituationDialog({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: CreateSituationDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [situationType, setSituationType] = useState("general");
  const [severity, setSeverity] = useState("medium");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      situation_type: string;
      severity: string;
      context_summary?: string;
      recommended_action?: string;
      urgency_score?: number;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      
      const { error } = await supabase.from("situations").insert({
        user_id: userId,
        ...data,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create situation");
      console.error(error);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSituationType("general");
    setSeverity("medium");
  };

  const handleAnalyzeAndCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Call AI to analyze the situation
      const { data, error } = await supabase.functions.invoke("analyze-situation", {
        body: { title, description, situation_type: situationType },
      });

      if (error) throw error;

      // Create with AI analysis
      createMutation.mutate({
        title,
        description,
        situation_type: situationType,
        severity: data?.severity || severity,
        context_summary: data?.context_summary,
        recommended_action: data?.recommended_action,
        urgency_score: data?.urgency_score || 50,
      });
    } catch (error) {
      console.error("AI analysis failed, creating without analysis:", error);
      // Fallback to creating without AI analysis
      createMutation.mutate({
        title,
        description,
        situation_type: situationType,
        severity,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickCreate = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    createMutation.mutate({
      title,
      description,
      situation_type: situationType,
      severity,
    });
  };

  const isLoading = createMutation.isPending || isAnalyzing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            New Situation
          </DialogTitle>
          <DialogDescription>
            Describe what's happening. Sytuation will analyze and recommend actions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">What's the situation?</Label>
            <Input
              id="title"
              placeholder="e.g., Contractor no-show, Deal stuck, Vendor dispute..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what's happening, who's involved, what constraints exist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={situationType} onValueChange={setSituationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Initial Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleQuickCreate} disabled={isLoading}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Quick Create
          </Button>
          <Button onClick={handleAnalyzeAndCreate} disabled={isLoading}>
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze & Create
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
