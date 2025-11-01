import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Sparkles, 
  Send, 
  TrendingUp, 
  Users, 
  DollarSign,
  Zap,
  Shield,
  Briefcase,
  FileText,
  ArrowRight,
  Plus
} from "lucide-react";

type Message = {
  role: "user" | "biz" | "dev";
  content: string;
  timestamp: Date;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [businessCount, setBusinessCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentConnections, setRecentConnections] = useState<any[]>([]);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const [businessesResult, applicationsResult, connectionsResult, businessesData, postsData, connectionsData] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("funding_applications").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("connections").select("*", { count: "exact", head: true }).or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted"),
        supabase.from("businesses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("posts").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(3),
        supabase.from("connections").select("*, profiles!connections_receiver_id_fkey(full_name, email)").eq("requester_id", user.id).order("created_at", { ascending: false }).limit(3)
      ]);

      setBusinessCount(businessesResult.count || 0);
      setApplicationCount(applicationsResult.count || 0);
      setConnectionCount(connectionsResult.count || 0);
      setBusinesses(businessesData.data || []);
      setRecentPosts(postsData.data || []);
      setRecentConnections(connectionsData.data || []);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "biz",
      content: "Hi! I'm Biz, your strategic AI agent. I can help with business planning, funding strategies, compliance, and scaling your business. What would you like to work on today?",
      timestamp: new Date()
    },
    {
      role: "dev",
      content: "And I'm Dev, your execution AI agent. I handle tools, workflows, automation, and technical setup. Ready to build something amazing together?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeAgent, setActiveAgent] = useState<"both" | "biz" | "dev">("both");

  const [isStreaming, setIsStreaming] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsStreaming(true);

    let assistantMessage = "";
    const tempMessages = [...messages, userMessage];

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: tempMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      // Add initial assistant message
      const agent = activeAgent === "both" ? "biz" : activeAgent;
      setMessages(prev => [...prev, { role: agent, content: "", timestamp: new Date() }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Handle special events
            if (parsed.type === 'task_created') {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), {
                  ...last,
                  content: last.content + `\n\n✅ Task created: ${parsed.task.subject}`
                }];
              });
            } else if (parsed.type === 'activity_logged') {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), {
                  ...last,
                  content: last.content + `\n\n✅ Activity logged: ${parsed.activity.subject}`
                }];
              });
            } else if (parsed.type === 'company_created') {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), {
                  ...last,
                  content: last.content + `\n\n✅ Company added to CRM: ${parsed.company.name}`
                }];
              });
            } else if (parsed.type === 'meeting_created') {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), {
                  ...last,
                  content: last.content + `\n\n✅ Meeting scheduled: ${parsed.meeting.subject}`
                }];
              });
            }
            
            // Handle content streaming
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), { ...last, content: assistantMessage }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error streaming AI response:', error);
      setMessages(prev => [...prev, {
        role: "dev",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-depth overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-full">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4 w-full overflow-x-hidden">
            {/* Quick Stats */}
            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Building2, label: "Businesses", value: businessCount.toString(), change: "Active" },
                  { icon: Users, label: "Connections", value: connectionCount.toString(), change: "Network" },
                  { icon: FileText, label: "Applications", value: applicationCount.toString(), change: "Total" }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{stat.value}</div>
                      <div className="text-xs text-primary">{stat.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => navigate('/create-entity')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Create Entity
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => navigate('/launchpad')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Launch Platforms
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => navigate('/tools')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Browse Tools
                </Button>
              </div>
            </Card>

            {/* Recent Businesses */}
            <Card className="p-4 shadow-elevated border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Your Businesses
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/directory')}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {businesses.length === 0 ? (
                  <div className="text-center py-4">
                    <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">No businesses yet</p>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/create-entity')}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Entity
                    </Button>
                  </div>
                ) : (
                  businesses.map((biz) => (
                    <div key={biz.id} className="p-2 rounded bg-muted/50 border border-border">
                      <p className="text-sm font-medium">{biz.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{biz.entity_type}</Badge>
                        <Badge variant={biz.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {biz.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent posts</p>
                ) : (
                  recentPosts.map((post: any) => (
                    <div key={post.id} className="text-sm">
                      <p className="font-medium">{post.profiles?.full_name || 'User'}</p>
                      <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Main Content - AI Chat */}
          <div className="lg:col-span-9 w-full overflow-x-hidden">
            <Card className="shadow-elevated border-0 h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] flex flex-col overflow-hidden w-full">
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-border bg-card/50 rounded-t-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[hsl(210_100%_63%)]" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">AI Agents</h2>
                      <p className="text-xs md:text-sm text-muted-foreground">Your business growth partners</p>
                    </div>
                  </div>
                  
                  <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as typeof activeAgent)} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                      <TabsTrigger value="both" className="text-xs md:text-sm">Both</TabsTrigger>
                      <TabsTrigger value="biz" className="text-xs md:text-sm">Biz</TabsTrigger>
                      <TabsTrigger value="dev" className="text-xs md:text-sm">Dev</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Agent Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div 
                    className="rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-300 cursor-pointer hover:shadow-avatar"
                    style={{
                      background: 'linear-gradient(to bottom right, rgba(46, 142, 255, 0.2) 0%, transparent 30%), #e0e0e0'
                    }}
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <Avatar 
                        className="w-10 h-10 md:w-12 md:h-12 shrink-0 transition-all duration-300 hover:shadow-avatar"
                        style={{
                          background: 'linear-gradient(to bottom right, #2e8eff 0%, rgba(46, 142, 255, 0) 30%), rgba(46, 142, 255, 0.2)'
                        }}
                      >
                        <div className="flex items-center justify-center w-full h-full font-bold text-white text-sm md:text-base">B</div>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs md:text-sm truncate">Biz Agent</h4>
                        <p className="text-xs text-muted-foreground truncate">Strategy & Planning</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">Business planning, funding, scaling, compliance</p>
                  </div>

                  <div 
                    className="rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-300 cursor-pointer hover:shadow-avatar"
                    style={{
                      background: 'linear-gradient(to bottom right, rgba(46, 142, 255, 0.2) 0%, transparent 30%), #e0e0e0'
                    }}
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <Avatar 
                        className="w-10 h-10 md:w-12 md:h-12 shrink-0 transition-all duration-300 hover:shadow-avatar"
                        style={{
                          background: 'linear-gradient(to bottom right, #2e8eff 0%, rgba(46, 142, 255, 0) 30%), rgba(46, 142, 255, 0.2)'
                        }}
                      >
                        <div className="flex items-center justify-center w-full h-full font-bold text-white text-sm md:text-base">D</div>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs md:text-sm truncate">Dev Agent</h4>
                        <p className="text-xs text-muted-foreground truncate">Execution & Automation</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">Tools, workflows, automation, technical setup</p>
                  </div>
                </div>
              </div>


              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-3 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 md:gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {message.role !== "user" && (
                        <Avatar 
                          className="w-8 h-8 md:w-10 md:h-10 shrink-0"
                          style={{
                            background: 'linear-gradient(to bottom right, #2e8eff 0%, rgba(46, 142, 255, 0) 30%), rgba(46, 142, 255, 0.2)'
                          }}
                        >
                          <div className="flex items-center justify-center w-full h-full font-bold text-white text-xs md:text-sm">
                            {message.role === "biz" ? "B" : "D"}
                          </div>
                        </Avatar>
                      )}
                      
                      <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[80%] md:max-w-[85%] lg:max-w-[70%]`}>
                        <div
                          className={`rounded-lg p-3 md:p-4 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground shadow-chrome"
                              : "bg-card border border-border shadow-elevated"
                          }`}
                        >
                          <p className="text-xs md:text-sm break-words">{message.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {message.role === "user" && (
                        <Avatar 
                          className="w-8 h-8 md:w-10 md:h-10 shrink-0"
                          style={{
                            background: 'linear-gradient(to bottom right, #2e8eff 0%, rgba(46, 142, 255, 0) 30%), rgba(46, 142, 255, 0.2)'
                          }}
                        >
                          <div className="flex items-center justify-center w-full h-full font-bold text-white text-xs md:text-sm">
                            U
                          </div>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-3 md:p-4 border-t border-border bg-card/50 rounded-b-xl">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isStreaming && handleSendMessage()}
                    placeholder="Type your message here... (e.g., 'log this: I spent 1 hour on sonicbrief ai')"
                    className="flex-1 text-sm"
                    disabled={isStreaming}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="shrink-0 h-10 w-10" disabled={isStreaming}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 hidden sm:block">
                  Try: "log this: 1 hour on sonicbrief" • "add CBRE to CRM" • "remind me to follow up"
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;