import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInstincts } from "@/hooks/useInstincts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { AgentsPanel } from "@/components/AgentsPanel";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { OnboardingTour } from "@/components/OnboardingTour";
import { IntelligentCapture } from "@/components/dashboard/IntelligentCapture";
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
  Plus,
  Mic
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
      setRecentConnections([]);
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Listen for intelligent capture submissions
  const handleCaptureSubmit = useCallback((event: CustomEvent<{ text: string; files: File[] }>) => {
    const { text, files } = event.detail;
    if (text) {
      setInputMessage(text);
      // Trigger send after a small delay
      setTimeout(() => {
        const sendButton = document.querySelector('[data-send-message]') as HTMLButtonElement;
        sendButton?.click();
      }, 100);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('intelligent-capture-submit', handleCaptureSubmit as EventListener);
    return () => {
      window.removeEventListener('intelligent-capture-submit', handleCaptureSubmit as EventListener);
    };
  }, [handleCaptureSubmit]);
  const handleVoiceInput = async () => {
    if (isRecording && mediaRecorder) {
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            
            if (!base64Audio) {
              console.error('Failed to convert audio to base64');
              return;
            }

            try {
              // Get session token
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                throw new Error('Please log in to use voice input');
              }

              // Send to transcription edge function
              const { data, error } = await supabase.functions.invoke('transcribe-voice', {
                body: { audio: base64Audio }
              });

              if (error) throw error;

              // Set the transcribed text as the input message
              if (data?.text) {
                setInputMessage(data.text);
              }
            } catch (error) {
              console.error('Error transcribing audio:', error);
            }
          };

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

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
      // Get the user's session token for authenticated requests
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

      // Add initial assistant message
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
            
            // Handle tool calls
            const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
            const finishReason = parsed.choices?.[0]?.finish_reason;
            
            if (toolCalls && toolCalls.length > 0) {
              // Process tool call
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
            
            // Handle special events
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
    <div className="min-h-screen bg-background">
      <OnboardingTour open={showOnboarding} onComplete={completeOnboarding} />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
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
          <main className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Intelligent Capture Zone */}
            <IntelligentCapture />
            
            <Card className="flex flex-col h-[calc(100vh-20rem)]">
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <div>
                      <h2 className="text-lg font-semibold">AI Agents</h2>
                      <p className="text-xs text-muted-foreground">Your business growth partners</p>
                    </div>
                  </div>
                  
                  <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as typeof activeAgent)} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                      <TabsTrigger value="both" className="text-xs">Both</TabsTrigger>
                      <TabsTrigger value="biz" className="text-xs">Biz</TabsTrigger>
                      <TabsTrigger value="dev" className="text-xs">Dev</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Agent Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8 bg-foreground">
                        <div className="flex items-center justify-center w-full h-full font-semibold text-background text-xs">B</div>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm">Biz Agent</h4>
                        <p className="text-xs text-muted-foreground">Strategy & Planning</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Business planning, funding, scaling, compliance</p>
                  </div>

                  <div className="rounded-lg border border-border p-3 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8 bg-foreground">
                        <div className="flex items-center justify-center w-full h-full font-semibold text-background text-xs">D</div>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm">Dev Agent</h4>
                        <p className="text-xs text-muted-foreground">Execution & Automation</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Tools, workflows, automation, technical setup</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1">
                <div className="space-y-3 p-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {message.role !== "user" && (
                        <Avatar className="w-7 h-7 bg-muted shrink-0">
                          <div className="flex items-center justify-center w-full h-full font-medium text-foreground text-xs">
                            {message.role === "biz" ? "B" : "D"}
                          </div>
                        </Avatar>
                      )}
                      
                      <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            message.role === "user"
                              ? "bg-black text-white"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm text-inherit">{message.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="w-7 h-7 bg-foreground shrink-0">
                          <div className="flex items-center justify-center w-full h-full font-medium text-background text-xs">
                            U
                          </div>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="border-t border-border p-4">
                <p className="text-xs text-muted-foreground mb-2 hidden sm:block">
                  Try: "log this: 1 hour on sonicbrief" • "add CBRE to CRM" • "remind me to follow up"
                </p>
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isStreaming && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isStreaming}
                  />
                  <Button onClick={handleSendMessage} size="icon" disabled={isStreaming} data-send-message>
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={handleVoiceInput}
                    size="icon" 
                    variant={isRecording ? "destructive" : "outline"}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;