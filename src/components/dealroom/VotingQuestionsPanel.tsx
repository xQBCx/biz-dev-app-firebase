import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Vote, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  MinusCircle,
  CheckCircle2,
  Users
} from "lucide-react";

interface VotingQuestion {
  id: string;
  question_text: string;
  question_type: 'template' | 'custom';
  template_id: string | null;
  is_active: boolean;
  created_at: string;
  responses?: VotingResponse[];
}

interface VotingResponse {
  id: string;
  question_id: string;
  participant_id: string;
  vote_value: 'yes' | 'no' | 'abstain';
  reasoning: string | null;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  user_id: string | null;
}

interface VotingQuestionsPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
  votingEnabled: boolean;
  participants: Participant[];
  myParticipantId: string | null;
}

// Template questions for common voting scenarios
const templateQuestions = [
  { id: 'terms_fair', text: 'Do you agree that the proposed terms are fair to all parties?' },
  { id: 'timeline_acceptable', text: 'Is the proposed timeline acceptable for your deliverables?' },
  { id: 'compensation_fair', text: 'Do you agree that the compensation structure is equitable?' },
  { id: 'ready_proceed', text: 'Are you ready to proceed with this deal structure?' },
  { id: 'ip_terms_clear', text: 'Are the IP ownership terms clearly defined and acceptable?' },
  { id: 'exit_terms_fair', text: 'Are the exit terms and conditions fair to all parties?' },
];

export const VotingQuestionsPanel = ({
  dealRoomId,
  isAdmin,
  votingEnabled,
  participants,
  myParticipantId
}: VotingQuestionsPanelProps) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<VotingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [votingReasoning, setVotingReasoning] = useState<Record<string, string>>({});

  useEffect(() => {
    if (votingEnabled) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [dealRoomId, votingEnabled]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("deal_room_voting_questions")
        .select(`
          *,
          responses:deal_room_voting_responses(*)
        `)
        .eq("deal_room_id", dealRoomId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setQuestions((data || []) as VotingQuestion[]);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (isTemplate: boolean) => {
    const questionText = isTemplate 
      ? templateQuestions.find(t => t.id === selectedTemplate)?.text 
      : customQuestion;

    if (!questionText?.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      const { error } = await supabase
        .from("deal_room_voting_questions")
        .insert({
          deal_room_id: dealRoomId,
          question_text: questionText,
          question_type: isTemplate ? 'template' : 'custom',
          template_id: isTemplate ? selectedTemplate : null,
          created_by: user?.id
        });

      if (error) throw error;
      toast.success("Question added");
      setShowAddDialog(false);
      setSelectedTemplate('');
      setCustomQuestion('');
      fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    }
  };

  const castVote = async (questionId: string, voteValue: 'yes' | 'no' | 'abstain') => {
    if (!myParticipantId) {
      toast.error("You must be a participant to vote");
      return;
    }

    try {
      // Check if vote exists
      const existingVote = questions
        .find(q => q.id === questionId)
        ?.responses?.find(r => r.participant_id === myParticipantId);

      if (existingVote) {
        const { error } = await supabase
          .from("deal_room_voting_responses")
          .update({
            vote_value: voteValue,
            reasoning: votingReasoning[questionId] || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingVote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("deal_room_voting_responses")
          .insert({
            question_id: questionId,
            participant_id: myParticipantId,
            vote_value: voteValue,
            reasoning: votingReasoning[questionId] || null
          });
        if (error) throw error;
      }

      toast.success("Vote recorded");
      fetchQuestions();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to record vote");
    }
  };

  const removeQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("deal_room_voting_questions")
        .update({ is_active: false })
        .eq("id", questionId);

      if (error) throw error;
      toast.success("Question removed");
      fetchQuestions();
    } catch (error) {
      console.error("Error removing question:", error);
      toast.error("Failed to remove question");
    }
  };

  const getVoteSummary = (question: VotingQuestion) => {
    const responses = question.responses || [];
    return {
      yes: responses.filter(r => r.vote_value === 'yes').length,
      no: responses.filter(r => r.vote_value === 'no').length,
      abstain: responses.filter(r => r.vote_value === 'abstain').length,
      total: responses.length
    };
  };

  const getMyVote = (question: VotingQuestion) => {
    if (!myParticipantId) return null;
    return question.responses?.find(r => r.participant_id === myParticipantId);
  };

  if (!votingEnabled) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Vote className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Voting</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Vote className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Voting is not enabled for this deal room.</p>
          {isAdmin && (
            <p className="text-sm mt-2">
              Enable voting in the Smart Contract Controls to allow participants to vote on questions.
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Vote className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Voting Questions</h3>
          <Badge variant="secondary">{questions.length}</Badge>
        </div>
        
        {isAdmin && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Voting Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Use Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template question..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templateQuestions.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.text}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <Button 
                      className="w-full mt-2" 
                      onClick={() => addQuestion(true)}
                    >
                      Add Template Question
                    </Button>
                  )}
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Custom Question</Label>
                  <Textarea
                    placeholder="Enter your custom question..."
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => addQuestion(false)}
                    disabled={!customQuestion.trim()}
                  >
                    Add Custom Question
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Vote className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No voting questions yet.</p>
          {isAdmin && <p className="text-sm mt-1">Click "Add Question" to create a voting question.</p>}
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-4">
            {questions.map((question) => {
              const summary = getVoteSummary(question);
              const myVote = getMyVote(question);
              const allVoted = summary.total === participants.length;

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{question.question_text}</p>
                        {question.question_type === 'template' && (
                          <Badge variant="outline" className="text-xs">Template</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <ThumbsUp className="w-3 h-3" />
                          {summary.yes} Yes
                        </span>
                        <span className="flex items-center gap-1 text-destructive">
                          <ThumbsDown className="w-3 h-3" />
                          {summary.no} No
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MinusCircle className="w-3 h-3" />
                          {summary.abstain} Abstain
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {summary.total}/{participants.length} voted
                        </span>
                        {allVoted && (
                          <Badge className="bg-emerald-500/20 text-emerald-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeQuestion(question.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Voting section */}
                  {myParticipantId && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm font-medium">Your vote:</span>
                        <RadioGroup
                          value={myVote?.vote_value || ''}
                          onValueChange={(value) => castVote(question.id, value as 'yes' | 'no' | 'abstain')}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                            <Label htmlFor={`${question.id}-yes`} className="text-emerald-600 cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`${question.id}-no`} />
                            <Label htmlFor={`${question.id}-no`} className="text-destructive cursor-pointer">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="abstain" id={`${question.id}-abstain`} />
                            <Label htmlFor={`${question.id}-abstain`} className="text-muted-foreground cursor-pointer">Abstain</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <Input
                        placeholder="Add reasoning (optional)..."
                        value={votingReasoning[question.id] || myVote?.reasoning || ''}
                        onChange={(e) => setVotingReasoning({
                          ...votingReasoning,
                          [question.id]: e.target.value
                        })}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
