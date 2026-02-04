import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Send, Bot, User, Eye, EyeOff, AlertTriangle, 
  MessageSquare, Lightbulb, RefreshCw, Shield,
  ThumbsUp, ThumbsDown, Sparkles, CheckCircle2, XCircle,
  FileText, Users, ListTodo, Beaker
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Message {
  id: string;
  content: string;
  ai_response?: string | null;
  sender_type: string;
  message_type: string;
  visibility: string;
  requires_admin_approval: boolean;
  admin_approved?: boolean | null;
  created_at: string;
  participant_id?: string | null;
}

interface PendingAction {
  type: string;
  data: {
    terms?: Array<{
      title: string;
      content: string;
      section_type: string;
      is_required: boolean;
    }>;
    deliverables?: Array<{
      name: string;
      description: string;
      assigned_to_email?: string;
      due_date?: string;
      priority?: string;
    }>;
    participants?: Array<{
      name: string;
      email: string;
      role?: string;
      ownership_percent?: number;
      company?: string;
    }>;
    ingredients?: Array<{
      type: string;
      contributor: string;
      value_weight: number;
      ownership_percent?: number;
    }>;
    governance?: {
      voting_rule?: string;
      time_horizon?: string;
      category?: string;
    };
  };
}

interface FeedbackState {
  [messageId: string]: 'positive' | 'negative' | null;
}

interface DealRoomChatProps {
  dealRoomId: string;
  participantId?: string;
  isAdmin?: boolean;
}

export function DealRoomChat({ dealRoomId, participantId, isAdmin = false }: DealRoomChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackType, setFeedbackType] = useState<'wrong' | 'too_detailed' | 'not_detailed' | 'other'>('wrong');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    
    const channel = supabase
      .channel(`deal-room-messages-${dealRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deal_room_messages',
        filter: `deal_room_id=eq.${dealRoomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealRoomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('deal_room_messages')
      .select('*')
      .eq('deal_room_id', dealRoomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const filteredMessages = isAdmin 
      ? data 
      : data?.filter(m => 
          m.visibility === 'visible_to_all' || 
          m.participant_id === participantId ||
          m.sender_type === 'ai_agent'
        );

    setMessages(filteredMessages || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('deal_room_messages')
        .insert({
          deal_room_id: dealRoomId,
          participant_id: participantId,
          sender_type: 'participant',
          message_type: 'comment',
          content: newMessage,
          visibility: 'visible_to_all',
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const askAI = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a question to ask the AI.",
        variant: "destructive",
      });
      return;
    }

    setIsAskingAI(true);
    setPendingAction(null);

    try {
      console.log('[DealRoomChat] Asking AI:', { dealRoomId, participantId, question: newMessage });
      
      const response = await supabase.functions.invoke('deal-room-agent', {
        body: {
          deal_room_id: dealRoomId,
          participant_id: participantId || null,
          question: newMessage,
        },
      });

      console.log('[DealRoomChat] AI Response:', response);

      if (response.error) {
        console.error('[DealRoomChat] Error:', response.error);
        throw new Error(response.error.message || 'Failed to get AI response');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      // Check if there's a pending action to confirm
      if (response.data?.action_detected && response.data?.pending_action) {
        console.log('[DealRoomChat] Action detected:', response.data.pending_action);
        setPendingAction(response.data.pending_action);
      }

      if (response.data?.is_change_proposal) {
        toast({
          title: "Change Proposal Detected",
          description: "Your request has been flagged for admin review",
        });
      }

      await fetchMessages();
      setNewMessage("");
      
    } catch (error) {
      console.error('[DealRoomChat] Error asking AI:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsAskingAI(false);
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    setIsExecutingAction(true);

    try {
      console.log('[DealRoomChat] Confirming action:', pendingAction);
      
      const response = await supabase.functions.invoke('deal-room-agent', {
        body: {
          deal_room_id: dealRoomId,
          participant_id: participantId || null,
          question: "Confirm action",
          confirm_action: true,
          pending_action: pendingAction,
        },
      });

      console.log('[DealRoomChat] Action execution response:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to execute action');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Changes Applied",
        description: "The deal has been updated successfully.",
      });

      setPendingAction(null);
      await fetchMessages();
      
    } catch (error) {
      console.error('[DealRoomChat] Error executing action:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply changes",
        variant: "destructive",
      });
    } finally {
      setIsExecutingAction(false);
    }
  };

  const cancelAction = () => {
    setPendingAction(null);
    toast({
      title: "Action Cancelled",
      description: "No changes were made to the deal.",
    });
  };

  const handleFeedback = async (messageId: string, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      setFeedback(prev => ({ ...prev, [messageId]: 'positive' }));
      
      try {
        await supabase.from('ai_message_feedback').insert({
          message_id: messageId,
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          feedback_type: 'positive',
        });
        
        toast({
          title: "Thanks for the feedback!",
          description: "Your feedback helps improve the AI.",
        });
      } catch (error) {
        console.error('Error saving feedback:', error);
      }
    } else {
      setFeedbackMessageId(messageId);
      setFeedbackDialogOpen(true);
    }
  };

  const submitNegativeFeedback = async () => {
    if (!feedbackMessageId) return;

    setFeedback(prev => ({ ...prev, [feedbackMessageId]: 'negative' }));
    
    try {
      const reasonText = feedbackType === 'other' 
        ? feedbackReason 
        : feedbackType === 'wrong' 
          ? 'Response was incorrect'
          : feedbackType === 'too_detailed'
            ? 'Response was too detailed'
            : 'Response was not detailed enough';

      await supabase.from('ai_message_feedback').insert({
        message_id: feedbackMessageId,
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        feedback_type: 'negative',
        feedback_reason: reasonText,
      });
      
      toast({
        title: "Feedback received",
        description: "We'll use this to improve the AI responses.",
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
    
    setFeedbackDialogOpen(false);
    setFeedbackMessageId(null);
    setFeedbackReason("");
    setFeedbackType('wrong');
  };

  const toggleVisibility = async (messageId: string, currentVisibility: string) => {
    if (!isAdmin) return;

    const newVisibility = currentVisibility === 'visible_to_all' ? 'admin_only' : 'visible_to_all';

    const { error } = await supabase
      .from('deal_room_messages')
      .update({ visibility: newVisibility })
      .eq('id', messageId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    } else {
      setMessages(prev => 
        prev.map(m => m.id === messageId ? { ...m, visibility: newVisibility } : m)
      );
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <MessageSquare className="h-3 w-3" />;
      case 'change_proposal': return <AlertTriangle className="h-3 w-3" />;
      case 'clarification': return <Lightbulb className="h-3 w-3" />;
      case 'action_request': return <CheckCircle2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const getMessageTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      'question': 'bg-blue-500/10 text-blue-500',
      'change_proposal': 'bg-amber-500/10 text-amber-500',
      'clarification': 'bg-green-500/10 text-green-500',
      'negotiation': 'bg-purple-500/10 text-purple-500',
      'action_request': 'bg-primary/10 text-primary',
    };
    
    return variants[type] || 'bg-muted text-muted-foreground';
  };

  // Render action preview card
  const renderActionPreview = () => {
    if (!pendingAction) return null;

    const { data } = pendingAction;
    const hasTerms = data.terms && data.terms.length > 0;
    const hasParticipants = data.participants && data.participants.length > 0;
    const hasDeliverables = data.deliverables && data.deliverables.length > 0;
    const hasIngredients = data.ingredients && data.ingredients.length > 0;
    const hasGovernance = data.governance && Object.keys(data.governance).length > 0;

    return (
      <div className="mx-4 mb-4 p-4 border-2 border-primary/30 rounded-lg bg-primary/5 space-y-4">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Sparkles className="h-5 w-5" />
          <span>Pending Action Preview</span>
        </div>

        {hasTerms && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Contract Terms ({data.terms!.length})
            </div>
            <div className="pl-6 space-y-1">
              {data.terms!.map((t, i) => (
                <div key={i} className="text-sm p-2 bg-background/50 rounded border">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    [{t.section_type}] {t.is_required ? '(Required)' : ''}
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground line-clamp-2">
                    {t.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasParticipants && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              Participants ({data.participants!.length})
            </div>
            <div className="pl-6 space-y-1">
              {data.participants!.map((p, i) => (
                <div key={i} className="text-sm p-2 bg-background/50 rounded border flex justify-between items-center">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground ml-2">({p.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{p.role || 'partner'}</Badge>
                    {p.ownership_percent && (
                      <Badge variant="secondary" className="text-xs">{p.ownership_percent}%</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasDeliverables && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              Deliverables ({data.deliverables!.length})
            </div>
            <div className="pl-6 space-y-1">
              {data.deliverables!.map((d, i) => (
                <div key={i} className="text-sm p-2 bg-background/50 rounded border">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{d.name}</span>
                    {d.due_date && (
                      <Badge variant="outline" className="text-xs">Due: {d.due_date}</Badge>
                    )}
                  </div>
                  {d.description && (
                    <div className="text-xs text-muted-foreground mt-1">{d.description}</div>
                  )}
                  {d.assigned_to_email && (
                    <div className="text-xs text-primary mt-1">→ {d.assigned_to_email}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasIngredients && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Beaker className="h-4 w-4 text-muted-foreground" />
              Ingredients ({data.ingredients!.length})
            </div>
            <div className="pl-6 space-y-1">
              {data.ingredients!.map((ing, i) => (
                <div key={i} className="text-sm p-2 bg-background/50 rounded border flex justify-between items-center">
                  <div>
                    <span className="font-medium">{ing.type}</span>
                    <span className="text-muted-foreground ml-2">by {ing.contributor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Weight: {ing.value_weight}</Badge>
                    {ing.ownership_percent && (
                      <Badge variant="secondary" className="text-xs">{ing.ownership_percent}%</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasGovernance && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Governance Settings
            </div>
            <div className="pl-6 flex flex-wrap gap-2">
              {data.governance!.voting_rule && (
                <Badge variant="outline">Voting: {data.governance!.voting_rule}</Badge>
              )}
              {data.governance!.time_horizon && (
                <Badge variant="outline">Timeline: {data.governance!.time_horizon}</Badge>
              )}
              {data.governance!.category && (
                <Badge variant="outline">Category: {data.governance!.category}</Badge>
              )}
            </div>
          </div>
        )}

        <Separator />

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={cancelAction}
            disabled={isExecutingAction}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={confirmAction}
            disabled={isExecutingAction}
            className="gap-2"
          >
            {isExecutingAction ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Confirm & Apply
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Deal Room AI Agent
            </CardTitle>
            {isAdmin && (
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin View
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Ask questions, add terms, set up deliverables, or configure the entire deal from a prompt
          </p>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex gap-3 ${
                    message.sender_type === 'ai_agent' ? 'bg-primary/5 rounded-lg p-3 -mx-1' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={
                      message.sender_type === 'ai_agent' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }>
                      {message.sender_type === 'ai_agent' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {message.sender_type === 'ai_agent' ? 'AI Agent' : 'Participant'}
                      </span>
                      
                      <Badge variant="secondary" className={`text-xs ${getMessageTypeBadge(message.message_type)}`}>
                        {getMessageTypeIcon(message.message_type)}
                        <span className="ml-1">{message.message_type}</span>
                      </Badge>
                      
                      {message.visibility !== 'visible_to_all' && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <EyeOff className="h-3 w-3" />
                          {message.visibility}
                        </Badge>
                      )}
                      
                      {message.requires_admin_approval && !message.admin_approved && (
                        <Badge variant="destructive" className="text-xs">
                          Pending Review
                        </Badge>
                      )}
                      
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(message.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    
                    <p className="text-sm">{message.content}</p>
                    
                    {message.ai_response && (
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          <Bot className="h-3 w-3 inline mr-1" />
                          {message.ai_response}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">Was this helpful?</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${feedback[message.id] === 'positive' ? 'text-green-500 bg-green-500/10' : ''}`}
                            onClick={() => handleFeedback(message.id, 'positive')}
                            disabled={!!feedback[message.id]}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${feedback[message.id] === 'negative' ? 'text-red-500 bg-red-500/10' : ''}`}
                            onClick={() => handleFeedback(message.id, 'negative')}
                            disabled={!!feedback[message.id]}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {isAdmin && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(message.id, message.visibility)}
                          className="h-6 text-xs"
                        >
                          {message.visibility === 'visible_to_all' ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Show
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isAskingAI && (
                <div className="flex gap-3 bg-primary/5 rounded-lg p-3 -mx-1 animate-pulse">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">AI Agent</span>
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Analyzing...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-muted-foreground ml-2">Processing your request...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {messages.length === 0 && !isAskingAI && (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                  <p className="font-medium">Deal Room AI Agent</p>
                  <p className="text-sm mt-1">
                    I can answer questions, add contract terms, set up deliverables, and configure your deal
                  </p>
                  <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
                    <p className="text-xs text-muted-foreground">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Who is involved in this deal?",
                        "What are the payment terms?",
                        "Add confidentiality terms",
                        "Set up deliverables for this partnership"
                      ].map((q) => (
                        <Button
                          key={q}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1.5"
                          onClick={() => setNewMessage(q)}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {renderActionPreview()}
          
          <Separator />
          
          <div className="p-4 space-y-2">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask questions, paste terms, or describe the deal you want to set up..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askAI();
                  }
                }}
                disabled={isLoading || isAskingAI || isExecutingAction}
              />
              <Button 
                onClick={askAI} 
                disabled={isAskingAI || !newMessage.trim() || isExecutingAction}
                className="gap-2"
              >
                {isAskingAI ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Ask AI
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={sendMessage}
                disabled={isLoading || !newMessage.trim() || isExecutingAction}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Send as Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What was wrong with this response?</DialogTitle>
            <DialogDescription>
              Your feedback helps improve the AI's understanding of deal questions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <RadioGroup value={feedbackType} onValueChange={(v) => setFeedbackType(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wrong" id="wrong" />
                <Label htmlFor="wrong">The response was incorrect</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="too_detailed" id="too_detailed" />
                <Label htmlFor="too_detailed">Too much detail</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_detailed" id="not_detailed" />
                <Label htmlFor="not_detailed">Not enough detail</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other reason</Label>
              </div>
            </RadioGroup>
            
            {feedbackType === 'other' && (
              <Textarea
                placeholder="Please describe what was wrong..."
                value={feedbackReason}
                onChange={(e) => setFeedbackReason(e.target.value)}
              />
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitNegativeFeedback}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
