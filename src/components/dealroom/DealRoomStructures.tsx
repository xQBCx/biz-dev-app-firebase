import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Vote, 
  ThumbsUp, 
  ThumbsDown, 
  Edit2, 
  CheckCircle,
  Sparkles,
  Plus
} from "lucide-react";

interface Structure {
  id: string;
  deal_room_id: string;
  name: string;
  structure_type: string | null;
  is_ai_generated: boolean;
  is_selected: boolean;
  allocation_rules: any;
  payment_terms: any;
  exit_terms: any;
  ip_terms: any;
  plain_english_summary: string | null;
  created_at: string;
  votes?: Vote[];
}

interface Vote {
  id: string;
  structure_id: string;
  participant_id: string;
  vote_type: string;
  reasoning: string | null;
}

interface DealRoomStructuresProps {
  dealRoomId: string;
  myParticipantId: string | null;
  isAdmin: boolean;
  votingRule: string;
}

const structureTypeLabels: Record<string, string> = {
  conservative: "Conservative",
  aggressive: "Aggressive Upside",
  ip_heavy: "IP-Heavy",
  cash_light: "Cash-Light / Equity-Heavy",
};

export const DealRoomStructures = ({ 
  dealRoomId, 
  myParticipantId,
  isAdmin,
  votingRule 
}: DealRoomStructuresProps) => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [myVotes, setMyVotes] = useState<Record<string, Vote>>({});
  const [votingReasoning, setVotingReasoning] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStructures();
  }, [dealRoomId]);

  const fetchStructures = async () => {
    try {
      const { data, error } = await supabase
        .from("deal_structures")
        .select(`
          *,
          votes:deal_votes(*)
        `)
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setStructures(data || []);

      // Find my votes
      if (myParticipantId) {
        const votesMap: Record<string, Vote> = {};
        data?.forEach(s => {
          const myVote = s.votes?.find((v: Vote) => v.participant_id === myParticipantId);
          if (myVote) votesMap[s.id] = myVote;
        });
        setMyVotes(votesMap);
      }
    } catch (error) {
      console.error("Error fetching structures:", error);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (structureId: string, voteType: 'approve' | 'reject' | 'modify') => {
    if (!myParticipantId) {
      toast.error("You are not a participant");
      return;
    }

    try {
      const existingVote = myVotes[structureId];
      
      if (existingVote) {
        const { error } = await supabase
          .from("deal_votes")
          .update({
            vote_type: voteType,
            reasoning: votingReasoning[structureId] || null,
          })
          .eq("id", existingVote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("deal_votes")
          .insert({
            structure_id: structureId,
            participant_id: myParticipantId,
            vote_type: voteType,
            reasoning: votingReasoning[structureId] || null,
          });
        if (error) throw error;
      }

      toast.success(`Vote recorded: ${voteType}`);
      fetchStructures();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to record vote");
    }
  };

  const selectStructure = async (structureId: string) => {
    try {
      // Deselect all others first
      await supabase
        .from("deal_structures")
        .update({ is_selected: false })
        .eq("deal_room_id", dealRoomId);

      // Select this one
      const { error } = await supabase
        .from("deal_structures")
        .update({ is_selected: true })
        .eq("id", structureId);

      if (error) throw error;
      toast.success("Structure selected");
      fetchStructures();
    } catch (error) {
      toast.error("Failed to select structure");
    }
  };

  const getVoteSummary = (structure: Structure) => {
    const votes = structure.votes || [];
    const approve = votes.filter(v => v.vote_type === 'approve').length;
    const reject = votes.filter(v => v.vote_type === 'reject').length;
    const modify = votes.filter(v => v.vote_type === 'modify').length;
    return { approve, reject, modify, total: votes.length };
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deal Structures</h3>
          <p className="text-sm text-muted-foreground">
            Voting rule: {votingRule.replace("_", " ")}
          </p>
        </div>
        {isAdmin && (
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Propose Structure
          </Button>
        )}
      </div>

      {structures.length === 0 ? (
        <Card className="p-8 text-center">
          <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Structures Yet</h3>
          <p className="text-muted-foreground mb-4">
            Structures will appear here once contributions are analyzed and proposals are made.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {structures.map((structure) => {
            const summary = getVoteSummary(structure);
            const myVote = myVotes[structure.id];

            return (
              <Card key={structure.id} className={`p-6 ${structure.is_selected ? 'border-primary' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{structure.name}</h3>
                      {structure.is_ai_generated && (
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI Generated
                        </Badge>
                      )}
                      {structure.is_selected && (
                        <Badge className="bg-primary gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Selected
                        </Badge>
                      )}
                    </div>
                    {structure.structure_type && (
                      <Badge variant="outline">
                        {structureTypeLabels[structure.structure_type] || structure.structure_type}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-600">{summary.approve} approve</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-destructive">{summary.reject} reject</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-amber-600">{summary.modify} modify</span>
                  </div>
                </div>

                {structure.plain_english_summary && (
                  <p className="text-muted-foreground mb-4">{structure.plain_english_summary}</p>
                )}

                {/* Voting section */}
                {myParticipantId && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Your vote:</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={myVote?.vote_type === 'approve' ? 'default' : 'outline'}
                          className="gap-1"
                          onClick={() => castVote(structure.id, 'approve')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant={myVote?.vote_type === 'reject' ? 'destructive' : 'outline'}
                          className="gap-1"
                          onClick={() => castVote(structure.id, 'reject')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant={myVote?.vote_type === 'modify' ? 'secondary' : 'outline'}
                          className="gap-1"
                          onClick={() => castVote(structure.id, 'modify')}
                        >
                          <Edit2 className="w-3 h-3" />
                          Modify
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Textarea
                        placeholder="Add reasoning for your vote (optional)..."
                        value={votingReasoning[structure.id] || ''}
                        onChange={(e) => setVotingReasoning({
                          ...votingReasoning,
                          [structure.id]: e.target.value
                        })}
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {isAdmin && !structure.is_selected && (
                  <div className="border-t pt-4 mt-4">
                    <Button onClick={() => selectStructure(structure.id)} variant="secondary">
                      Select This Structure
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
