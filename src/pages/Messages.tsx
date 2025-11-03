import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AIAssistant } from "@/components/AIAssistant";
import { ComposeEmail } from "@/components/ComposeEmail";
import { AIReceptionist } from "@/components/AIReceptionist";
import { AccessRequestManager } from "@/components/AccessRequestManager";
import { EmailIdentitySetup } from "@/components/EmailIdentitySetup";
import { PhoneManager } from "@/components/PhoneManager";
import { LindyIntegration } from "@/components/LindyIntegration";
import { ContentCreationTools } from "@/components/ContentCreationTools";
import { VoIPDialer } from "@/components/VoIPDialer";
import { CallHistory } from "@/components/CallHistory";
import { SMSComposer } from "@/components/SMSComposer";
import { SMSConversations } from "@/components/SMSConversations";
import { 
  Mail, 
  Search, 
  Star, 
  Archive,
  Trash2,
  RefreshCw,
  Send,
  Paperclip,
  Phone,
  Brain,
  Settings,
  Sparkles,
  FileText,
  MessageSquare,
  PhoneCall
} from "lucide-react";

type Message = {
  id: string;
  subject: string | null;
  body: string | null;
  communication_type: string;
  status: string;
  created_at: string;
  direction: string | null;
  is_draft?: boolean;
  metadata?: any;
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
  const [selectedFolder, setSelectedFolder] = useState<"inbox" | "starred" | "sent" | "drafts" | "archive" | "trash">("inbox");

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
        .from("communications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
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

  const filteredMessages = messages.filter((msg) => {
    // First apply search filter
    const matchesSearch =
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Then apply folder filter
    switch (selectedFolder) {
      case "inbox":
        return (msg.direction === "inbound" || msg.direction === null) && !msg.is_draft;
      case "sent":
        return msg.direction === "outbound" && !msg.is_draft;
      case "drafts":
        return msg.is_draft === true;
      case "starred":
      case "archive":
      case "trash":
        // These require additional database fields - show empty for now
        return false;
      default:
        return true;
    }
  });

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Communications Hub</h1>
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

        <Tabs defaultValue="inbox" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="inbox">
              <Mail className="w-4 h-4 mr-2" />
              Email
              {messages.filter(m => m.status !== 'completed' && !m.is_draft).length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {messages.filter(m => m.status !== 'completed' && !m.is_draft).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="voip">
              <PhoneCall className="w-4 h-4 mr-2" />
              VoIP
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="content">
              <Sparkles className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="phone">
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="ai-receptionist">
              <Brain className="w-4 h-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="lindy">
              <Settings className="w-4 h-4 mr-2" />
              Lindy
            </TabsTrigger>
            <TabsTrigger value="identities">
              <Mail className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox">
            <div className="flex gap-6">
              {/* Sidebar */}
              <div className="w-64 space-y-2">
                <Button 
                  variant={selectedFolder === "inbox" ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder("inbox")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Inbox
                  {messages.filter(m => m.direction === "inbound" || m.direction === null).length > 0 && (
                    <Badge className="ml-auto">{messages.filter(m => m.direction === "inbound" || m.direction === null).length}</Badge>
                  )}
                </Button>
                <Button 
                  variant={selectedFolder === "starred" ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder("starred")}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Starred
                </Button>
                <Button 
                  variant={selectedFolder === "sent" ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder("sent")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Sent
                  {messages.filter(m => m.direction === "outbound" && !m.is_draft).length > 0 && (
                    <Badge className="ml-auto">{messages.filter(m => m.direction === "outbound" && !m.is_draft).length}</Badge>
                  )}
                </Button>
                <Button 
                  variant={selectedFolder === "drafts" ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder("drafts")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Drafts
                  {messages.filter(m => m.is_draft === true).length > 0 && (
                    <Badge className="ml-auto">{messages.filter(m => m.is_draft === true).length}</Badge>
                  )}
                </Button>
                <Button 
                  variant={selectedFolder === "archive" ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder("archive")}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
                <Button 
                  variant={selectedFolder === "trash" ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder("trash")}
                >
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
                        Connect your email accounts in the Email Accounts tab
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map((message) => {
                      const isAccessRequest = message.metadata?.type === 'access_request';
                      
                      const handleClick = () => {
                        if (isAccessRequest) {
                          // Scroll to the Access Request Management section
                          const element = document.getElementById('access-request-management');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        } else {
                          setSelectedMessage(message);
                        }
                      };

                      return (
                        <div
                          key={message.id}
                          className={`p-4 cursor-pointer transition-all rounded-lg ${
                            message.status !== 'completed' ? "bg-card shadow-elevated" : ""
                          }`}
                          onClick={handleClick}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${message.status !== 'completed' ? "font-bold" : ""}`}>
                                {message.communication_type}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {message.communication_type}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm font-medium mb-1">{message.subject}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                            {message.body}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voip">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <VoIPDialer />
                <SMSComposer />
              </div>
              <CallHistory />
            </div>
          </TabsContent>

          <TabsContent value="sms">
            <SMSConversations />
          </TabsContent>

          <TabsContent value="content">
            <ContentCreationTools />
          </TabsContent>

          <TabsContent value="phone">
            <PhoneManager />
          </TabsContent>

          <TabsContent value="ai-receptionist">
            <AIReceptionist />
          </TabsContent>

          <TabsContent value="lindy">
            <LindyIntegration />
          </TabsContent>

          <TabsContent value="identities">
            <EmailIdentitySetup />
          </TabsContent>
        </Tabs>

        {/* Access Request Management Section */}
        <div id="access-request-management" className="mt-12 pt-8 border-t scroll-mt-8">
          <h2 className="text-3xl font-bold mb-6">Access Request Management</h2>
          <AccessRequestManager />
        </div>
      </div>

      <ComposeEmail open={composeOpen} onOpenChange={setComposeOpen} />
      <AIAssistant 
        context={{ 
          type: "messages", 
          unreadCount: messages.filter(m => m.status !== 'completed').length 
        }} 
      />
    </div>
  );
};

export default Messages;