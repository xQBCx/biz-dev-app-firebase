import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface Platform {
  id: string;
  platform_name: string;
}

interface CreateDelegationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateDelegationDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateDelegationDialogProps) => {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [delegationType, setDelegationType] = useState<"ai" | "human">("ai");
  
  // AI delegation fields
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [aiAgentName, setAiAgentName] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [postFrequency, setPostFrequency] = useState("daily");
  
  // Human delegation fields
  const [teamMemberEmail, setTeamMemberEmail] = useState("");
  const [permissions, setPermissions] = useState({
    can_post: true,
    can_delete: false,
    can_schedule: true,
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      loadPlatforms();
    }
  }, [open]);

  const loadPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from("social_platforms")
        .select("id, platform_name")
        .order("display_order");

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error("Error loading platforms:", error);
      toast.error("Failed to load platforms");
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlatform) {
      toast.error("Please select a platform");
      return;
    }

    if (delegationType === "human" && !teamMemberEmail) {
      toast.error("Please enter team member email");
      return;
    }

    if (delegationType === "ai" && !aiAgentName) {
      toast.error("Please enter AI agent name");
      return;
    }

    setLoading(true);
    try {
      let delegatedToUser = null;

      // For human delegation, find the user by email
      if (delegationType === "human") {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", teamMemberEmail)
          .single();

        if (profileError || !profileData) {
          toast.error("User not found. Please invite them first.");
          setLoading(false);
          return;
        }
        delegatedToUser = profileData.id;
      }

      const delegationData = {
        user_id: user?.id,
        platform_id: selectedPlatform,
        delegation_type: delegationType,
        delegated_to_user: delegatedToUser,
        ai_agent_config: delegationType === "ai" ? {
          agent_name: aiAgentName,
          instructions: aiInstructions,
          post_frequency: postFrequency,
        } : {},
        permissions: delegationType === "human" ? permissions : {},
        notes: notes || null,
        is_active: true,
      };

      const { error } = await supabase
        .from("platform_delegations")
        .insert(delegationData);

      if (error) throw error;

      toast.success("Delegation created successfully");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating delegation:", error);
      toast.error("Failed to create delegation");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPlatform("");
    setAiAgentName("");
    setAiInstructions("");
    setPostFrequency("daily");
    setTeamMemberEmail("");
    setPermissions({ can_post: true, can_delete: false, can_schedule: true });
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Delegation</DialogTitle>
          <DialogDescription>
            Delegate platform management to an AI agent or team member
          </DialogDescription>
        </DialogHeader>

        <Tabs value={delegationType} onValueChange={(v) => setDelegationType(v as "ai" | "human")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI Agent</TabsTrigger>
            <TabsTrigger value="human">Team Member</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.platform_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agentName">AI Agent Name</Label>
              <Input
                id="agentName"
                placeholder="e.g., Social Media Bot"
                value={aiAgentName}
                onChange={(e) => setAiAgentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Describe how the AI should manage this platform..."
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Post Frequency</Label>
              <Select value={postFrequency} onValueChange={setPostFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiNotes">Notes (Optional)</Label>
              <Textarea
                id="aiNotes"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="human" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.platform_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Team Member Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="team@example.com"
                value={teamMemberEmail}
                onChange={(e) => setTeamMemberEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permissions.can_post}
                    onChange={(e) => setPermissions({ ...permissions, can_post: e.target.checked })}
                  />
                  Can create posts
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permissions.can_schedule}
                    onChange={(e) => setPermissions({ ...permissions, can_schedule: e.target.checked })}
                  />
                  Can schedule posts
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permissions.can_delete}
                    onChange={(e) => setPermissions({ ...permissions, can_delete: e.target.checked })}
                  />
                  Can delete posts
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="humanNotes">Notes (Optional)</Label>
              <Textarea
                id="humanNotes"
                placeholder="Additional notes for the team member..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Create Delegation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
