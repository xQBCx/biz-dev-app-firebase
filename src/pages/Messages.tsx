import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AIAssistant } from "@/components/AIAssistant";
import { ComposeEmail } from "@/components/ComposeEmail";
import { 
  Mail, 
  Search, 
  Star, 
  Archive,
  Trash2,
  RefreshCw,
  Send,
  Paperclip
} from "lucide-react";

type Message = {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  snippet: string | null;
  is_read: boolean;
  is_starred: boolean;
  message_date: string;
  has_attachments: boolean;
};

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user?.id)
        .order("message_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Unified Inbox</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadMessages}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync
            </Button>
            <Button onClick={() => setComposeOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              Inbox
              {messages.filter(m => !m.is_read).length > 0 && (
                <Badge className="ml-auto">{messages.filter(m => !m.is_read).length}</Badge>
              )}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Star className="mr-2 h-4 w-4" />
              Starred
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Send className="mr-2 h-4 w-4" />
              Sent
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Trash2 className="mr-2 h-4 w-4" />
              Trash
            </Button>
          </div>

          {/* Messages List */}
          <div className="flex-1">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-lg divide-y">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm mt-2">
                    Connect your email accounts in{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => navigate("/integrations")}
                    >
                      Integrations
                    </Button>
                  </p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                      !message.is_read ? "bg-accent/50" : ""
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${!message.is_read ? "font-bold" : ""}`}>
                          {message.from_name || message.from_email}
                        </span>
                        {message.has_attachments && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {message.is_starred && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.message_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium mb-1">{message.subject}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {message.snippet}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ComposeEmail open={composeOpen} onOpenChange={setComposeOpen} />
      <AIAssistant 
        context={{ 
          type: "messages", 
          unreadCount: messages.filter(m => !m.is_read).length 
        }} 
      />
    </div>
  );
};

export default Messages;