import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { 
  Building2, 
  Sparkles, 
  Send, 
  TrendingUp, 
  Users, 
  DollarSign,
  Zap,
  Menu,
  Shield,
  Briefcase,
  FileText,
  Settings,
  Globe
} from "lucide-react";

type Message = {
  role: "user" | "biz" | "dev";
  content: string;
  timestamp: Date;
};

const Dashboard = () => {
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

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const agent = activeAgent === "both" ? (Math.random() > 0.5 ? "biz" : "dev") : activeAgent;
      const responses = {
        biz: [
          "Great question! Let me analyze the best strategic approach for that...",
          "Based on market trends, I recommend focusing on...",
          "Let's look at the funding options available for your situation..."
        ],
        dev: [
          "I can set that up for you right away. Here's what I'll do...",
          "Perfect! I'll automate that workflow using...",
          "Let me configure those integrations across your platforms..."
        ]
      };

      const response: Message = {
        role: agent,
        content: responses[agent][Math.floor(Math.random() * responses[agent].length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Biz Dev Dashboard</h1>
                <p className="text-xs text-muted-foreground">Verified Business Owner</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/social'}>
                <Globe className="w-4 h-4 mr-2" />
                Network
              </Button>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Quick Stats */}
            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                {[
                  { icon: TrendingUp, label: "Revenue", value: "$0", change: "+0%" },
                  { icon: Users, label: "Customers", value: "0", change: "New" },
                  { icon: DollarSign, label: "MRR", value: "$0", change: "+0%" }
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
                  onClick={() => window.location.href = '/create-entity'}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Create Entity
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => window.location.href = '/launchpad'}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Launch Platforms
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content - AI Chat */}
          <div className="lg:col-span-9">
            <Card className="shadow-elevated border border-border h-[calc(100vh-12rem)] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-border bg-gradient-primary rounded-t-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-foreground/30 blur-lg rounded-full"></div>
                      <Sparkles className="w-8 h-8 text-primary-foreground relative z-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary-foreground">AI Agents</h2>
                      <p className="text-sm text-primary-foreground/80">Your business growth partners</p>
                    </div>
                  </div>
                  
                  <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as typeof activeAgent)}>
                    <TabsList className="bg-primary-foreground/20">
                      <TabsTrigger value="both">Both</TabsTrigger>
                      <TabsTrigger value="biz">Biz</TabsTrigger>
                      <TabsTrigger value="dev">Dev</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Agent Cards */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 border border-primary-foreground/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8 bg-gradient-chrome">
                        <div className="flex items-center justify-center w-full h-full font-bold text-navy-deep">B</div>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-primary-foreground text-sm">Biz Agent</h4>
                        <p className="text-xs text-primary-foreground/70">Strategy & Planning</p>
                      </div>
                    </div>
                    <p className="text-xs text-primary-foreground/80">Business planning, funding, scaling, compliance</p>
                  </div>

                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 border border-primary-foreground/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8 bg-gradient-chrome">
                        <div className="flex items-center justify-center w-full h-full font-bold text-navy-deep">D</div>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-primary-foreground text-sm">Dev Agent</h4>
                        <p className="text-xs text-primary-foreground/70">Execution & Automation</p>
                      </div>
                    </div>
                    <p className="text-xs text-primary-foreground/80">Tools, workflows, automation, technical setup</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {message.role !== "user" && (
                        <Avatar className="w-10 h-10 bg-gradient-chrome shrink-0">
                          <div className="flex items-center justify-center w-full h-full font-bold text-navy-deep">
                            {message.role === "biz" ? "B" : "D"}
                          </div>
                        </Avatar>
                      )}
                      
                      <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[70%]`}>
                        <div
                          className={`rounded-lg p-4 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground shadow-chrome"
                              : "bg-card border border-border shadow-elevated"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="w-10 h-10 bg-primary shrink-0">
                          <div className="flex items-center justify-center w-full h-full font-bold text-primary-foreground">
                            U
                          </div>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-card/50 rounded-b-xl">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Ask ${activeAgent === "both" ? "Biz or Dev" : activeAgent === "biz" ? "Biz" : "Dev"} anything...`}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  AI agents can help with business strategy, technical setup, automation, and more
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