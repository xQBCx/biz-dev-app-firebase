import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Users,
  Receipt
} from "lucide-react";
import { format } from "date-fns";

interface Adjustment {
  id: string;
  deal_room_id: string;
  proposed_by: string;
  adjustment_type: string;
  amount: number;
  description: string;
  justification: string | null;
  status: string;
  approvals: Record<string, boolean | null>;
  created_at: string;
  resolved_at: string | null;
  proposer_name?: string;
  proposer_email?: string;
}

interface Participant {
  id: string;
  user_id: string;
  name: string;
  email: string;
}

interface SettlementAdjustmentProposalProps {
  dealRoomId: string;
  isAdmin: boolean;
  participants?: Participant[];
}

const adjustmentTypes = [
  { value: "expense_reimbursement", label: "Expense Reimbursement", icon: Receipt },
  { value: "bonus_payment", label: "Bonus Payment", icon: DollarSign },
  { value: "credit_adjustment", label: "Credit Adjustment", icon: AlertCircle },
  { value: "penalty_deduction", label: "Penalty/Deduction", icon: XCircle },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending Approval", color: "bg-amber-500/20 text-amber-600", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive", icon: XCircle },
  partial: { label: "Partial Approval", color: "bg-blue-500/20 text-blue-600", icon: Users },
};

export const SettlementAdjustmentProposal = ({
  dealRoomId,
  isAdmin,
  participants: externalParticipants
}: SettlementAdjustmentProposalProps) => {
  const { user } = useAuth();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    adjustment_type: "expense_reimbursement",
    amount: "",
    description: "",
    justification: "",
  });

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch adjustments using raw query to handle type generation delay
    const { data: adjustmentData, error: adjError } = await supabase
      .from("settlement_adjustments" as any)
      .select("*")
      .eq("deal_room_id", dealRoomId)
      .order("created_at", { ascending: false });

    if (adjError) {
      console.error("Error fetching adjustments:", adjError);
    }

    if (adjustmentData) {
      // Fetch proposer info separately
      const proposerIds = [...new Set((adjustmentData as any[]).map(a => a.proposed_by))];
      const { data: proposerData } = await supabase
        .from("deal_room_participants")
        .select("id, name, email")
        .in("id", proposerIds);

      const proposerMap = new Map((proposerData || []).map(p => [p.id, p]));

      const parsed = (adjustmentData as any[]).map(adj => ({
        ...adj,
        approvals: typeof adj.approvals === 'string' 
          ? JSON.parse(adj.approvals) 
          : (adj.approvals || {}),
        proposer_name: proposerMap.get(adj.proposed_by)?.name,
        proposer_email: proposerMap.get(adj.proposed_by)?.email,
      }));
      setAdjustments(parsed);
    }

    // Fetch participants if not provided
    if (!externalParticipants) {
      const { data: participantData } = await supabase
        .from("deal_room_participants")
        .select("id, user_id, name, email")
        .eq("deal_room_id", dealRoomId);

      if (participantData) setParticipants(participantData);
    } else {
      setParticipants(externalParticipants);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error("Please provide a description");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Find current user's participant ID
    const myParticipant = participants.find(p => p.user_id === user?.id);
    if (!myParticipant) {
      toast.error("You must be a participant to propose adjustments");
      return;
    }

    // Initialize approvals object with all participants set to null (pending)
    const initialApprovals: Record<string, boolean | null> = {};
    participants.forEach(p => {
      initialApprovals[p.id] = p.id === myParticipant.id ? true : null; // Proposer auto-approves
    });

    const { error } = await supabase
      .from("settlement_adjustments" as any)
      .insert([{
        deal_room_id: dealRoomId,
        proposed_by: myParticipant.id,
        adjustment_type: formData.adjustment_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        justification: formData.justification || null,
        status: "pending",
        approvals: initialApprovals,
      }]);

    if (error) {
      console.error("Error creating adjustment:", error);
      toast.error("Failed to create adjustment proposal");
    } else {
      toast.success("Adjustment proposal submitted for approval");
      setDialogOpen(false);
      setFormData({
        adjustment_type: "expense_reimbursement",
        amount: "",
        description: "",
        justification: "",
      });
      fetchData();
    }
  };

  const handleVote = async (adjustmentId: string, approve: boolean) => {
    const myParticipant = participants.find(p => p.user_id === user?.id);
    if (!myParticipant) {
      toast.error("You must be a participant to vote");
      return;
    }

    const adjustment = adjustments.find(a => a.id === adjustmentId);
    if (!adjustment) return;

    const newApprovals = { ...adjustment.approvals, [myParticipant.id]: approve };

    // Check if all have voted
    const allVoted = participants.every(p => newApprovals[p.id] !== null && newApprovals[p.id] !== undefined);
    const allApproved = allVoted && participants.every(p => newApprovals[p.id] === true);
    const anyRejected = Object.values(newApprovals).some(v => v === false);

    let newStatus = "pending";
    if (anyRejected) {
      newStatus = "rejected";
    } else if (allApproved) {
      newStatus = "approved";
    } else if (allVoted) {
      newStatus = "partial";
    }

    const { error } = await supabase
      .from("settlement_adjustments" as any)
      .update({ 
        approvals: newApprovals,
        status: newStatus,
        resolved_at: newStatus !== "pending" ? new Date().toISOString() : null
      })
      .eq("id", adjustmentId);

    if (error) {
      toast.error("Failed to record vote");
    } else {
      toast.success(approve ? "Approved" : "Rejected");
      fetchData();
    }
  };

  const getApprovalProgress = (adjustment: Adjustment) => {
    const total = participants.length;
    const approved = Object.values(adjustment.approvals).filter(v => v === true).length;
    const rejected = Object.values(adjustment.approvals).filter(v => v === false).length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  };

  const hasVoted = (adjustment: Adjustment) => {
    const myParticipant = participants.find(p => p.user_id === user?.id);
    if (!myParticipant) return true;
    return adjustment.approvals[myParticipant.id] !== null && adjustment.approvals[myParticipant.id] !== undefined;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading adjustments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Settlement Adjustments</h3>
          <p className="text-sm text-muted-foreground">
            Propose expense reimbursements or payment adjustments. All participants must approve.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Propose Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propose Settlement Adjustment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Adjustment Type</Label>
                <Select
                  value={formData.adjustment_type}
                  onValueChange={(v) => setFormData({ ...formData, adjustment_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Client dinner at The Capital Grille - discussed partnership terms"
                  rows={3}
                />
              </div>

              <div>
                <Label>Justification (optional)</Label>
                <Textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Why is this adjustment needed? Who authorized it?"
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

      {/* Adjustments List */}
      {adjustments.length === 0 ? (
        <Card className="p-8 text-center">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Adjustments Yet</h3>
          <p className="text-muted-foreground">
            Settlement adjustments allow participants to propose expense reimbursements or payment modifications that require unanimous approval.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {adjustments.map((adjustment) => {
            const progress = getApprovalProgress(adjustment);
            const config = statusConfig[adjustment.status] || statusConfig.pending;
            const Icon = config.icon;
            const voted = hasVoted(adjustment);
            const typeConfig = adjustmentTypes.find(t => t.value === adjustment.adjustment_type);

            return (
              <Card key={adjustment.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {typeConfig ? <typeConfig.icon className="w-5 h-5 text-primary" /> : <Receipt className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{typeConfig?.label || adjustment.adjustment_type}</span>
                        <Badge className={config.color}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Proposed by {adjustment.proposer_name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ${adjustment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-3">{adjustment.description}</p>
                {adjustment.justification && (
                  <p className="text-xs text-muted-foreground mb-3 italic">
                    "{adjustment.justification}"
                  </p>
                )}

                {/* Approval Progress */}
                <div className="flex items-center gap-4 text-xs mb-3">
                  <span className="text-emerald-500">{progress.approved} approved</span>
                  <span className="text-destructive">{progress.rejected} rejected</span>
                  <span className="text-muted-foreground">{progress.pending} pending</span>
                </div>

                {/* Vote Buttons */}
                {adjustment.status === "pending" && !voted && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => handleVote(adjustment.id, false)}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => handleVote(adjustment.id, true)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <span>Proposed {format(new Date(adjustment.created_at), "MMM d, yyyy")}</span>
                  {adjustment.resolved_at && (
                    <span>Resolved {format(new Date(adjustment.resolved_at), "MMM d, yyyy")}</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
