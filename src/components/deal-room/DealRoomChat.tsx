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
  MessageSquare, Lightbulb, RefreshCw, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

interface DealRoomChatProps {
  dealRoomId: string;
  participantId: string;
  isAdmin?: boolean;
}

export function DealRoomChat({ dealRoomId, participantId, isAdmin = false }: DealRoomChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
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

    // Filter messages based on visibility if not admin
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
    if (!newMessage.trim()) return;

    setIsAskingAI(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('deal-room-agent', {
        body: {
          deal_room_id: dealRoomId,
          participant_id: participantId,
          question: newMessage,
        },
      });

      if (response.error) throw response.error;

      if (response.data?.is_change_proposal) {
        toast({
          title: "Change Proposal Detected",
          description: "Your request has been flagged for admin review",
        });
      }

      setNewMessage("");
    } catch (error) {
      console.error('Error asking AI:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsAskingAI(false);
    }
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
      default: return null;
    }
  };

  const getMessageTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      'question': 'bg-blue-500/10 text-blue-500',
      'change_proposal': 'bg-amber-500/10 text-amber-500',
      'clarification': 'bg-green-500/10 text-green-500',
      'negotiation': 'bg-purple-500/10 text-purple-500',
    };
    
    return variants[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Deal Room Chat
          </CardTitle>
          {isAdmin && (
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              Admin View
            </Badge>
          )}
        </div>
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
                      {message.sender_type === 'ai_agent' ? 'AI Assistant' : 'Participant'}
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
                      <p className="text-sm text-muted-foreground">
                        <Bot className="h-3 w-3 inline mr-1" />
                        {message.ai_response}
                      </p>
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
            
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <Separator />
        
        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message or ask a question..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isLoading || isAskingAI}
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !newMessage.trim()}
              size="icon"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={askAI}
              disabled={isAskingAI || !newMessage.trim()}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              {isAskingAI ? 'Thinking...' : 'Ask AI for Clarification'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
