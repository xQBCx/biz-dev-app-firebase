import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, Eye, EyeOff, Check, X, MessageSquare,
  ChevronDown, ChevronUp, AlertTriangle, Clock, ThumbsUp, ThumbsDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ChangeProposal {
  id: string;
  deal_room_id: string;
  proposed_by_participant_id: string;
  proposal_type: string;
  title: string;
  description: string;
  current_state: unknown;
  proposed_state: unknown;
  status: string;
  admin_visibility_decision: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface ChangeProposalManagerProps {
  dealRoomId: string;
}

const PROPOSAL_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_admin_review: { label: 'Pending Review', color: 'bg-amber-500/10 text-amber-500', icon: <Clock className="h-3 w-3" /> },
  visible_for_discussion: { label: 'Open for Discussion', color: 'bg-blue-500/10 text-blue-500', icon: <MessageSquare className="h-3 w-3" /> },
  voting: { label: 'Voting', color: 'bg-purple-500/10 text-purple-500', icon: <ThumbsUp className="h-3 w-3" /> },
  approved: { label: 'Approved', color: 'bg-green-500/10 text-green-500', icon: <Check className="h-3 w-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-500', icon: <X className="h-3 w-3" /> },
  withdrawn: { label: 'Withdrawn', color: 'bg-muted text-muted-foreground', icon: <X className="h-3 w-3" /> },
};

export function ChangeProposalManager({ dealRoomId }: ChangeProposalManagerProps) {
  const [proposals, setProposals] = useState<ChangeProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchProposals();
  }, [dealRoomId]);

  const fetchProposals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('deal_room_change_proposals')
      .select('*')
      .eq('deal_room_id', dealRoomId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
    } else {
      setProposals(data || []);
      // Initialize admin notes
      const notes: Record<string, string> = {};
      data?.forEach(p => { notes[p.id] = p.admin_notes || ''; });
      setAdminNotes(notes);
    }
    setIsLoading(false);
  };

  const updateProposalVisibility = async (proposalId: string, decision: string) => {
    try {
      const newStatus = decision === 'show_to_all' ? 'visible_for_discussion' : 
                       decision === 'reject_privately' ? 'rejected' : 'pending_admin_review';

      const { error } = await supabase
        .from('deal_room_change_proposals')
        .update({
          status: newStatus,
          admin_visibility_decision: decision,
          admin_visibility_decision_at: new Date().toISOString(),
          admin_notes: adminNotes[proposalId] || null,
        })
        .eq('id', proposalId);

      if (error) throw error;

      setProposals(prev => 
        prev.map(p => p.id === proposalId ? { 
          ...p, 
          status: newStatus,
          admin_visibility_decision: decision,
          admin_notes: adminNotes[proposalId] || null,
        } : p)
      );

      toast({
        title: "Decision Saved",
        description: decision === 'show_to_all' 
          ? "Proposal is now visible to all participants"
          : "Proposal has been handled",
      });
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to update proposal",
        variant: "destructive",
      });
    }
  };

  const startVoting = async (proposalId: string) => {
    try {
      const { error } = await supabase
        .from('deal_room_change_proposals')
        .update({ status: 'voting' })
        .eq('id', proposalId);

      if (error) throw error;

      setProposals(prev => 
        prev.map(p => p.id === proposalId ? { ...p, status: 'voting' } : p)
      );

      toast({
        title: "Voting Started",
        description: "Participants can now vote on this proposal",
      });
    } catch (error) {
      console.error('Error starting voting:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = PROPOSAL_STATUS_CONFIG[status] || { 
      label: status, 
      color: 'bg-muted text-muted-foreground', 
      icon: null 
    };
    
    return (
      <Badge className={`${config.color} gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const pendingCount = proposals.filter(p => p.status === 'pending_admin_review').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Change Proposals
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount} pending
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Review and manage change requests from participants
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No change proposals yet</p>
            <p className="text-sm">Proposals will appear here when participants request changes</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-3">
              {proposals.map((proposal) => (
                <Collapsible
                  key={proposal.id}
                  open={expandedProposal === proposal.id}
                  onOpenChange={(open) => setExpandedProposal(open ? proposal.id : null)}
                >
                  <div className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3 text-left">
                          {proposal.status === 'pending_admin_review' && (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{proposal.title}</span>
                              {getStatusBadge(proposal.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {proposal.proposal_type.replace(/_/g, ' ')} • {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        {expandedProposal === proposal.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <Separator />
                      <div className="p-4 space-y-4 bg-muted/30">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm text-muted-foreground">{proposal.description}</p>
                        </div>

                        {proposal.current_state && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Current State</h4>
                            <pre className="text-xs bg-background p-2 rounded overflow-auto">
                              {JSON.stringify(proposal.current_state, null, 2)}
                            </pre>
                          </div>
                        )}

                        {proposal.proposed_state && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Proposed State</h4>
                            <pre className="text-xs bg-background p-2 rounded overflow-auto">
                              {JSON.stringify(proposal.proposed_state, null, 2)}
                            </pre>
                          </div>
                        )}

                        {proposal.status === 'pending_admin_review' && (
                          <>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Admin Notes</h4>
                              <Textarea
                                value={adminNotes[proposal.id] || ''}
                                onChange={(e) => setAdminNotes(prev => ({ ...prev, [proposal.id]: e.target.value }))}
                                placeholder="Add private notes about this proposal..."
                                rows={2}
                              />
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Button
                                onClick={() => updateProposalVisibility(proposal.id, 'show_to_all')}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Show to All
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => updateProposalVisibility(proposal.id, 'show_to_selected')}
                                className="gap-2"
                              >
                                <EyeOff className="h-4 w-4" />
                                Show to Selected
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => updateProposalVisibility(proposal.id, 'reject_privately')}
                                className="gap-2"
                              >
                                <X className="h-4 w-4" />
                                Reject Privately
                              </Button>
                            </div>
                          </>
                        )}

                        {proposal.status === 'visible_for_discussion' && (
                          <Button
                            onClick={() => startVoting(proposal.id)}
                            className="gap-2"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Start Voting
                          </Button>
                        )}

                        {proposal.admin_notes && proposal.status !== 'pending_admin_review' && (
                          <div className="p-3 bg-muted rounded-lg">
                            <h4 className="text-sm font-medium mb-1">Admin Notes</h4>
                            <p className="text-sm text-muted-foreground">{proposal.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
