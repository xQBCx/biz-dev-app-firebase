import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInstincts } from "@/hooks/useInstincts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { AgentsPanel } from "@/components/AgentsPanel";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { OnboardingTour } from "@/components/OnboardingTour";
import { UnifiedChatBar } from "@/components/dashboard/UnifiedChatBar";
import { 
  Building2, 
  Sparkles, 
  TrendingUp, 
  Users, 
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
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const { trackClick } = useInstincts();
  const [businessCount, setBusinessCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  
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
      const [businessesResult, applicationsResult, connectionsResult, businessesData] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("funding_applications").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("connections").select("*", { count: "exact", head: true }).or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted"),
        supabase.from("businesses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3)
      ]);

      setBusinessCount(businessesResult.count || 0);
      setApplicationCount(applicationsResult.count || 0);
      setConnectionCount(connectionsResult.count || 0);
      setBusinesses(businessesData.data || []);
      setRecentPosts([]);
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
  const [isRecording, setIsRecording] = useState(false);

  const handleSendMessage = async (message?: string) => {
    const textToSend = message || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsStreaming(true);

    let assistantMessage = "";
    const tempMessages = [...messages, userMessage];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to use the AI assistant');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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

      const agent = activeAgent === "both" ? "dev" : activeAgent;
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
            
            const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
            
            if (toolCalls && toolCalls.length > 0) {
              const toolCall = toolCalls[0];
              if (toolCall.function?.name === "create_task") {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  assistantMessage = `✅ Creating task: "${args.title}"\n\nPriority: ${args.priority}\nDue: ${new Date(args.due_date).toLocaleString()}\n\nYour task has been added to your task list.`;
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    return [...prev.slice(0, -1), { ...last, content: assistantMessage }];
                  });
                } catch (e) {
                  console.error("Error parsing tool call:", e);
                }
              }
            }
            
            if (parsed.type === 'task_created') {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), {
                  ...last,
                  content: last.content + `\n\n✅ Task created successfully!`
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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      <OnboardingTour open={showOnboarding} onComplete={completeOnboarding} />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar - Hidden on mobile, shown on lg+ */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Quick Stats
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Building2, label: "Businesses", value: businessCount.toString(), sub: "Active" },
                  { icon: Users, label: "Connections", value: connectionCount.toString(), sub: "Network" },
                  { icon: FileText, label: "Applications", value: applicationCount.toString(), sub: "Total" }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{stat.value}</span>
                      <span className="text-xs text-muted-foreground ml-1">{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="space-y-1.5">
                <Button variant="ghost" className="w-full justify-start h-9" size="sm" onClick={() => navigate('/create-entity')}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Create Entity
                </Button>
                <Button variant="ghost" className="w-full justify-start h-9" size="sm" onClick={() => navigate('/launchpad')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Launch Platforms
                </Button>
                <Button variant="ghost" className="w-full justify-start h-9" size="sm" onClick={() => navigate('/tools')}>
                  <Zap className="w-4 h-4 mr-2" />
                  Browse Tools
                </Button>
              </div>
            </Card>

            {/* Recent Businesses */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Your Businesses
                </h3>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate('/directory')}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {businesses.length === 0 ? (
                  <div className="text-center py-3">
                    <Building2 className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-2">No businesses yet</p>
                    <Button size="sm" onClick={() => navigate('/create-entity')}>
                      <Plus className="w-3 h-3 mr-1" />
                      Create Entity
                    </Button>
                  </div>
                ) : (
                  businesses.map((biz) => (
                    <div key={biz.id} className="p-2 rounded-md bg-muted/50">
                      <p className="text-sm font-medium">{biz.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-xs">{biz.entity_type}</Badge>
                        <Badge variant={biz.status === 'active' ? 'default' : 'secondary'} className="text-xs">{biz.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* AI Recommendations */}
            <RecommendationsPanel />

            {/* AI Agents */}
            <AgentsPanel />

            {/* Recent Activity */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {recentPosts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent activity</p>
                ) : (
                  recentPosts.map((post: any) => (
                    <div key={post.id} className="text-sm">
                      <p className="font-medium">{post.profiles?.full_name || 'User'}</p>
                      <p className="text-muted-foreground text-xs line-clamp-2">{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </aside>

          {/* Main Content - AI Chat */}
          <main className="lg:col-span-8 xl:col-span-9 flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]">
            {/* Unified Chat Bar at top */}
            <UnifiedChatBar
              onSendMessage={handleSendMessage}
              inputValue={inputMessage}
              onInputChange={setInputMessage}
              isStreaming={isStreaming}
              isRecording={isRecording}
              onVoiceInput={() => setIsRecording(!isRecording)}
            />
            
            <Card className="flex flex-col flex-1 mt-4 overflow-hidden">
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-border shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-semibold truncate">AI Agents</h2>
                      <p className="text-xs text-muted-foreground hidden sm:block">Your business growth partners</p>
                    </div>
                  </div>
                  
                  <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as typeof activeAgent)}>
                    <TabsList className="h-8">
                      <TabsTrigger value="both" className="text-xs px-2 sm:px-3">Both</TabsTrigger>
                      <TabsTrigger value="biz" className="text-xs px-2 sm:px-3">Biz</TabsTrigger>
                      <TabsTrigger value="dev" className="text-xs px-2 sm:px-3">Dev</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Agent Cards - Hidden on small screens */}
                <div className="hidden sm:grid grid-cols-2 gap-3 mt-3">
                  <div className="rounded-lg border border-border p-2.5 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7 bg-foreground">
                        <div className="flex items-center justify-center w-full h-full font-semibold text-background text-xs">B</div>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm">Biz Agent</h4>
                        <p className="text-xs text-muted-foreground truncate">Strategy & Planning</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-2.5 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7 bg-foreground">
                        <div className="flex items-center justify-center w-full h-full font-semibold text-background text-xs">D</div>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm">Dev Agent</h4>
                        <p className="text-xs text-muted-foreground truncate">Execution & Automation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1">
                <div className="space-y-3 p-3 sm:p-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {message.role !== "user" && (
                        <Avatar className="w-6 h-6 sm:w-7 sm:h-7 bg-muted shrink-0">
                          <div className="flex items-center justify-center w-full h-full font-medium text-foreground text-xs">
                            {message.role === "biz" ? "B" : "D"}
                          </div>
                        </Avatar>
                      )}
                      
                      <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[80%]`}>
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-xs sm:text-sm text-inherit whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="w-6 h-6 sm:w-7 sm:h-7 bg-foreground shrink-0">
                          <div className="flex items-center justify-center w-full h-full font-medium text-background text-xs">
                            U
                          </div>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
