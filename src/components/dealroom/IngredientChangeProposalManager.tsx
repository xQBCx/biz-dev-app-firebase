import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Edit3, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  Package,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  ingredient_type: string;
}

interface IngredientChangeProposal {
  id: string;
  deal_room_id: string;
  ingredient_id: string;
  proposed_by: string;
  change_type: string;
  proposed_changes: Record<string, any>;
  justification: string | null;
  status: string;
  approvals: Record<string, boolean | null>;
  created_at: string;
  resolved_at: string | null;
  ingredient?: Ingredient;
  proposer_name?: string;
}

interface Participant {
  id: string;
  user_id: string;
  name: string;
}

interface IngredientChangeProposalManagerProps {
  dealRoomId: string;
  ingredients: Ingredient[];
  isAdmin: boolean;
  onRefresh: () => void;
}

const changeTypeConfig: Record<string, { label: string; color: string }> = {
  modify: { label: "Modify", color: "bg-amber-500/20 text-amber-600" },
  remove: { label: "Remove", color: "bg-destructive/20 text-destructive" },
  add: { label: "Add New", color: "bg-emerald-500/20 text-emerald-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending Approval", color: "bg-amber-500/20 text-amber-600", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive", icon: XCircle },
};

export const IngredientChangeProposalManager = ({
  dealRoomId,
  ingredients,
  isAdmin,
  onRefresh
}: IngredientChangeProposalManagerProps) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<IngredientChangeProposal[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    ingredient_id: "",
    change_type: "modify",
    proposed_description: "",
    justification: "",
  });

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch proposals
    const { data: proposalData } = await supabase
      .from("ingredient_change_proposals" as any)
      .select("*")
      .eq("deal_room_id", dealRoomId)
      .order("created_at", { ascending: false });

    if (proposalData) {
      // Fetch proposer info and ingredient info
      const proposerIds = [...new Set((proposalData as any[]).map(p => p.proposed_by))];
      const ingredientIds = [...new Set((proposalData as any[]).map(p => p.ingredient_id).filter(Boolean))];

      const [{ data: proposerData }, { data: ingredientData }] = await Promise.all([
        supabase.from("deal_room_participants").select("id, name").in("id", proposerIds),
        ingredientIds.length > 0 
          ? supabase.from("blender_ingredients").select("id, name, description, ingredient_type").in("id", ingredientIds)
          : Promise.resolve({ data: [] })
      ]);

      const proposerMap = new Map((proposerData || []).map(p => [p.id, p.name]));
      const ingredientMap = new Map((ingredientData || []).map(i => [i.id, i]));

      const parsed = (proposalData as any[]).map(proposal => ({
        ...proposal,
        approvals: typeof proposal.approvals === 'string' 
          ? JSON.parse(proposal.approvals) 
          : (proposal.approvals || {}),
        proposer_name: proposerMap.get(proposal.proposed_by),
        ingredient: ingredientMap.get(proposal.ingredient_id),
      }));
      setProposals(parsed);
    }

    // Fetch participants
    const { data: participantData } = await supabase
      .from("deal_room_participants")
      .select("id, user_id, name")
      .eq("deal_room_id", dealRoomId);

    if (participantData) setParticipants(participantData);

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.ingredient_id && formData.change_type !== "add") {
      toast.error("Please select an ingredient");
      return;
    }

    const myParticipant = participants.find(p => p.user_id === user?.id);
    if (!myParticipant) {
      toast.error("You must be a participant to propose changes");
      return;
    }

    // Initialize approvals
    const initialApprovals: Record<string, boolean | null> = {};
    participants.forEach(p => {
      initialApprovals[p.id] = p.id === myParticipant.id ? true : null;
    });

    const { error } = await supabase
      .from("ingredient_change_proposals" as any)
      .insert([{
        deal_room_id: dealRoomId,
        ingredient_id: formData.ingredient_id || null,
        proposed_by: myParticipant.id,
        change_type: formData.change_type,
        proposed_changes: {
          description: formData.proposed_description,
        },
        justification: formData.justification || null,
        status: "pending",
        approvals: initialApprovals,
      }]);

    if (error) {
      console.error("Error creating proposal:", error);
      toast.error("Failed to create proposal");
    } else {
      toast.success("Change proposal submitted for approval");
      setDialogOpen(false);
      setFormData({
        ingredient_id: "",
        change_type: "modify",
        proposed_description: "",
        justification: "",
      });
      fetchData();
    }
  };

  const handleVote = async (proposalId: string, approve: boolean) => {
    const myParticipant = participants.find(p => p.user_id === user?.id);
    if (!myParticipant) {
      toast.error("You must be a participant to vote");
      return;
    }

    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    const newApprovals = { ...proposal.approvals, [myParticipant.id]: approve };

    const allVoted = participants.every(p => newApprovals[p.id] !== null && newApprovals[p.id] !== undefined);
    const allApproved = allVoted && participants.every(p => newApprovals[p.id] === true);
    const anyRejected = Object.values(newApprovals).some(v => v === false);

    let newStatus = "pending";
    if (anyRejected) {
      newStatus = "rejected";
    } else if (allApproved) {
      newStatus = "approved";
    }

    const { error } = await supabase
      .from("ingredient_change_proposals" as any)
      .update({ 
        approvals: newApprovals,
        status: newStatus,
        resolved_at: newStatus !== "pending" ? new Date().toISOString() : null
      })
      .eq("id", proposalId);

    if (error) {
      toast.error("Failed to record vote");
    } else {
      toast.success(approve ? "Approved" : "Rejected");
      fetchData();
      if (newStatus === "approved") {
        onRefresh(); // Refresh ingredients if approved
      }
    }
  };

  const hasVoted = (proposal: IngredientChangeProposal) => {
    const myParticipant = participants.find(p => p.user_id === user?.id);
    if (!myParticipant) return true;
    return proposal.approvals[myParticipant.id] !== null && proposal.approvals[myParticipant.id] !== undefined;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading proposals...</div>
      </div>
    );
  }

  const pendingProposals = proposals.filter(p => p.status === "pending");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Change Proposals</h4>
          <p className="text-sm text-muted-foreground">
            {pendingProposals.length} pending proposal{pendingProposals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit3 className="w-4 h-4" />
              Propose Change
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propose Ingredient Change</DialogTitle>
              <DialogDescription>
                Changes require approval from all participants before taking effect.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Change Type</Label>
                <Select
                  value={formData.change_type}
                  onValueChange={(v) => setFormData({ ...formData, change_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modify">Modify Existing</SelectItem>
                    <SelectItem value="remove">Remove</SelectItem>
                    <SelectItem value="add">Add New</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.change_type !== "add" && (
                <div>
                  <Label>Select Ingredient</Label>
                  <Select
                    value={formData.ingredient_id}
                    onValueChange={(v) => setFormData({ ...formData, ingredient_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose ingredient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id}>
                          {ing.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Proposed Changes</Label>
                <Textarea
                  value={formData.proposed_description}
                  onChange={(e) => setFormData({ ...formData, proposed_description: e.target.value })}
                  placeholder={
                    formData.change_type === "add" 
                      ? "Describe the new ingredient..."
                      : formData.change_type === "remove"
                      ? "Explain why this should be removed..."
                      : "Describe the modifications..."
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>Justification</Label>
                <Textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Why is this change needed?"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Submit Proposal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <div className="space-y-3">
          {pendingProposals.map((proposal) => {
            const config = changeTypeConfig[proposal.change_type] || changeTypeConfig.modify;
            const statusCfg = statusConfig[proposal.status] || statusConfig.pending;
            const Icon = statusCfg.icon;
            const voted = hasVoted(proposal);

            return (
              <Card key={proposal.id} className="p-4 border-amber-500/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {proposal.ingredient?.name || "New Ingredient"}
                    </span>
                    <Badge className={config.color}>{config.label}</Badge>
                  </div>
                  <Badge className={statusCfg.color}>
                    <Icon className="w-3 h-3 mr-1" />
                    {statusCfg.label}
                  </Badge>
                </div>

                {proposal.proposed_changes?.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {proposal.proposed_changes.description}
                  </p>
                )}

                {proposal.justification && (
                  <p className="text-xs text-muted-foreground italic mb-2">
                    "{proposal.justification}"
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Proposed by {proposal.proposer_name || "Unknown"} on{" "}
                    {format(new Date(proposal.created_at), "MMM d")}
                  </span>

                  {!voted && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive h-7"
                        onClick={() => handleVote(proposal.id, false)}
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1 h-7"
                        onClick={() => handleVote(proposal.id, true)}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pendingProposals.length === 0 && (
        <Card className="p-4 text-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No pending change proposals</p>
        </Card>
      )}
    </div>
  );
};
