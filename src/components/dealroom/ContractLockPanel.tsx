import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Lock, 
  Unlock, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  Users,
  Vote
} from "lucide-react";
import { format } from "date-fns";

interface Participant {
  id: string;
  name: string;
  email: string;
  user_id: string | null;
}

interface TermAcceptance {
  termId: string;
  agreedBy: string[];
}

interface ContractLockPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
  participants: Participant[];
  votingEnabled: boolean;
  contractLocked: boolean;
  contractLockedAt: string | null;
  onUpdate: () => void;
}

export const ContractLockPanel = ({
  dealRoomId,
  isAdmin,
  participants,
  votingEnabled,
  contractLocked,
  contractLockedAt,
  onUpdate
}: ContractLockPanelProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [termsAcceptance, setTermsAcceptance] = useState<TermAcceptance[]>([]);
  const [allTermsAccepted, setAllTermsAccepted] = useState(false);

  useEffect(() => {
    checkTermsAcceptance();
  }, [dealRoomId, participants]);

  const checkTermsAcceptance = async () => {
    try {
      // Fetch all terms and their acceptance status
      const { data: terms, error } = await supabase
        .from("deal_room_terms")
        .select("id, agreed_by, is_required")
        .eq("deal_room_id", dealRoomId);

      if (error) throw error;

      const requiredTerms = terms?.filter(t => t.is_required) || [];
      const participantUserIds = participants
        .filter(p => p.user_id)
        .map(p => p.user_id);

      // Check if all participants have agreed to all required terms
      const allAccepted = requiredTerms.every(term => {
        const agreedBy = (term.agreed_by as string[]) || [];
        return participantUserIds.every(userId => 
          userId && agreedBy.includes(userId)
        );
      });

      setAllTermsAccepted(allAccepted);
      setTermsAcceptance(requiredTerms.map(t => ({
        termId: t.id,
        agreedBy: (t.agreed_by as string[]) || []
      })));
    } catch (error) {
      console.error("Error checking terms acceptance:", error);
    }
  };

  const toggleVoting = async (enabled: boolean) => {
    if (contractLocked) {
      toast.error("Cannot change voting settings while contract is locked");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("deal_rooms")
        .update({ voting_enabled: enabled })
        .eq("id", dealRoomId);

      if (error) throw error;
      toast.success(enabled ? "Voting enabled" : "Voting disabled");
      onUpdate();
    } catch (error) {
      console.error("Error toggling voting:", error);
      toast.error("Failed to update voting settings");
    } finally {
      setLoading(false);
    }
  };

  const lockContract = async () => {
    if (!allTermsAccepted) {
      toast.error("All participants must accept terms before locking");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("deal_rooms")
        .update({
          contract_locked: true,
          contract_locked_at: new Date().toISOString(),
          contract_locked_by: user?.id,
          status: "approved"
        })
        .eq("id", dealRoomId);

      if (error) throw error;
      toast.success("Smart Contract has been locked and activated");
      onUpdate();
    } catch (error) {
      console.error("Error locking contract:", error);
      toast.error("Failed to lock contract");
    } finally {
      setLoading(false);
    }
  };

  const unlockContract = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("deal_rooms")
        .update({
          contract_locked: false,
          contract_locked_at: null,
          contract_locked_by: null,
          status: "active"
        })
        .eq("id", dealRoomId);

      if (error) throw error;
      toast.success("Smart Contract has been unlocked");
      onUpdate();
    } catch (error) {
      console.error("Error unlocking contract:", error);
      toast.error("Failed to unlock contract");
    } finally {
      setLoading(false);
    }
  };

  const acceptedCount = participants.filter(p => {
    if (!p.user_id) return false;
    return termsAcceptance.every(ta => ta.agreedBy.includes(p.user_id!));
  }).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Smart Contract Controls</h3>
        </div>
        <Badge className={contractLocked ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"}>
          {contractLocked ? (
            <>
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 mr-1" />
              Unlocked
            </>
          )}
        </Badge>
      </div>

      {/* Contract Status */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Participant Acceptance</p>
              <p className="text-sm text-muted-foreground">
                {acceptedCount} of {participants.length} participants have accepted all terms
              </p>
            </div>
          </div>
          {allTermsAccepted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          )}
        </div>

        {contractLocked && contractLockedAt && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-emerald-600">
              Contract locked on {format(new Date(contractLockedAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        )}
      </div>

      {/* Voting Toggle */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Vote className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="voting-toggle" className="font-medium">Enable Voting</Label>
                <p className="text-sm text-muted-foreground">
                  Allow participants to vote on questions and proposals
                </p>
              </div>
            </div>
            <Switch
              id="voting-toggle"
              checked={votingEnabled}
              onCheckedChange={toggleVoting}
              disabled={loading || contractLocked}
            />
          </div>

          {/* Lock/Unlock Actions */}
          <div className="flex gap-2">
            {!contractLocked ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="flex-1 gap-2" 
                    disabled={loading || !allTermsAccepted}
                  >
                    <Lock className="w-4 h-4" />
                    Lock Smart Contract
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Lock Smart Contract?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will activate the smart contract. After locking:
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>Deliverables cannot be edited directly</li>
                        <li>Terms cannot be modified</li>
                        <li>Changes require a formal Change Order</li>
                      </ul>
                      <br />
                      This action can be undone by an admin, but doing so will require re-acceptance from all participants.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={lockContract}>
                      Lock Contract
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-2" disabled={loading}>
                    <Unlock className="w-4 h-4" />
                    Unlock Contract
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unlock Smart Contract?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Warning: Unlocking the contract will:
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>Allow editing of deliverables and terms</li>
                        <li>Require all participants to re-accept terms before re-locking</li>
                        <li>This may affect trust and audit trail</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={unlockContract} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Unlock Contract
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {!allTermsAccepted && !contractLocked && (
            <p className="text-sm text-muted-foreground text-center">
              All participants must accept terms before the contract can be locked
            </p>
          )}
        </div>
      )}

      {!isAdmin && (
        <p className="text-sm text-muted-foreground text-center">
          Only the deal room admin can lock or unlock the smart contract
        </p>
      )}
    </Card>
  );
};
