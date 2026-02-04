import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Conversation {
  id: string;
  peer_number: string;
  our_number: string;
  last_message_at: string;
  contact_name: string | null;
}

interface Message {
  id: string;
  direction: string;
  body: string;
  created_at: string;
  status: string;
}

export const SMSConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
    }
  }, [selectedConv]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConv || !newMessage.trim()) return;

    try {
      const { error } = await supabase.functions.invoke('sms-send', {
        body: {
          to: selectedConv.peer_number,
          from: selectedConv.our_number,
          body: newMessage,
        },
      });

      if (error) throw error;

      setNewMessage("");
      await loadMessages(selectedConv.id);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Send failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading conversations...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No conversations yet
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedConv?.id === conv.id ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <p className="font-medium text-sm">
                    {conv.contact_name || conv.peer_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(conv.last_message_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedConv
              ? selectedConv.contact_name || selectedConv.peer_number
              : 'Select a conversation'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedConv ? (
            <div className="space-y-4">
              <div className="h-96 overflow-y-auto space-y-2 p-4 border rounded-lg">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        msg.direction === 'outbound'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.body}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(msg.created_at), 'h:mm a')}
                        {msg.direction === 'outbound' && ` • ${msg.status}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-20">
              Select a conversation to view messages
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
