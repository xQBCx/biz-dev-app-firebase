import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Edit3, 
  Save, 
  X, 
  Sparkles, 
  Globe,
  Loader2,
  RefreshCw
} from "lucide-react";

interface DealRoomDescriptionEditorProps {
  dealRoomId: string;
  currentDescription: string | null;
  dealName: string;
  isAdmin: boolean;
  onUpdate: () => void;
}

export const DealRoomDescriptionEditor = ({
  dealRoomId,
  currentDescription,
  dealName,
  isAdmin,
  onUpdate
}: DealRoomDescriptionEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(currentDescription || "");
  const [researchUrl, setResearchUrl] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [researchedContent, setResearchedContent] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("deal_rooms")
        .update({ description })
        .eq("id", dealRoomId);

      if (error) throw error;
      toast.success("Description updated");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving description:", error);
      toast.error("Failed to save description");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIResearch = async () => {
    if (!researchUrl.trim()) {
      toast.error("Please enter a URL or company/product name to research");
      return;
    }

    setIsResearching(true);
    setResearchedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke('research-company', {
        body: {
          query: researchUrl,
          dealName: dealName,
          context: "deal room description"
        }
      });

      if (error) throw error;

      if (data?.description) {
        setResearchedContent(data.description);
        toast.success("Research complete! Review the suggested description below.");
      } else {
        toast.error("Could not generate a description. Try a different search term.");
      }
    } catch (error) {
      console.error("Research error:", error);
      toast.error("Research failed. Please try again.");
    } finally {
      setIsResearching(false);
    }
  };

  const applyResearchedContent = () => {
    if (researchedContent) {
      setDescription(researchedContent);
      setResearchedContent(null);
      toast.success("Applied researched description. Click Save when ready.");
    }
  };

  if (!isEditing) {
    return (
      <div className="group relative">
        <p className="text-muted-foreground max-w-2xl">
          {currentDescription || "No description provided."}
        </p>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4 border-primary/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Edit Description</Label>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setIsEditing(false);
              setDescription(currentDescription || "");
              setResearchedContent(null);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Research Section */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Research
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter URL or company/product name (e.g., www.theviewpro.com)"
                value={researchUrl}
                onChange={(e) => setResearchUrl(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleAIResearch}
              disabled={isResearching || !researchUrl.trim()}
              className="gap-2"
            >
              {isResearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              Research
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Our AI will research the company or product and generate a professional description.
          </p>
        </div>

        {/* Researched Content Preview */}
        {researchedContent && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI Suggested
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResearchedContent(null)}
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={applyResearchedContent}
                  className="gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Use This
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{researchedContent}</p>
          </div>
        )}

        {/* Manual Edit */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">
            Or write your own description:
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this deal is about, the products/services involved, and the value proposition..."
            rows={5}
            className="resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setDescription(currentDescription || "");
              setResearchedContent(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Description
          </Button>
        </div>
      </div>
    </Card>
  );
};
