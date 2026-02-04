import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Rocket, 
  Send, 
  Building2, 
  Globe, 
  FolderTree, 
  FileText,
  Sparkles,
  Network,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileSearch,
  ArrowLeft,
  Zap
} from "lucide-react";
import { SpawnEmotionalFeedback } from "@/components/spawn/SpawnEmotionalFeedback";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolResults?: any[];
}

interface Business {
  id: string;
  business_name: string;
  status: string;
  spawn_progress: number;
  industry?: string;
  description?: string;
  erp_structure?: any;
  website_data?: any;
  offers_tags?: string[];
  needs_tags?: string[];
}

const PHASES = [
  { id: 'discovery', label: 'Discovery', icon: Sparkles, description: 'Understanding your vision' },
  { id: 'research', label: 'Research', icon: FileSearch, description: 'Market analysis' },
  { id: 'erp_design', label: 'Structure', icon: FolderTree, description: 'Organizational design' },
  { id: 'website', label: 'Website', icon: Globe, description: 'Web presence' },
  { id: 'content', label: 'Content', icon: FileText, description: 'Marketing materials' },
  { id: 'launch', label: 'Launch', icon: Rocket, description: 'Go live!' }
];

export default function BusinessSpawn() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("discovery");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [networkMatches, setNetworkMatches] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState<'chat' | 'erp' | 'website' | 'research'>('chat');
  const [researchData, setResearchData] = useState<any>(null);
  const [emotionalState, setEmotionalState] = useState({ excitement: 0, progress: 0, phase: 'discovery' });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update emotional state based on progress
  useEffect(() => {
    if (business) {
      const phaseExcitement: Record<string, number> = {
        'discovery': 20,
        'research': 40,
        'erp_design': 60,
        'website': 80,
        'content': 90,
        'launch': 100
      };
      setEmotionalState({
        excitement: phaseExcitement[currentPhase] || 0,
        progress: business.spawn_progress || 0,
        phase: currentPhase
      });
    }
  }, [business, currentPhase]);

  const startNewBusiness = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to create a business");
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke('business-spawn', {
        body: { action: 'start' }
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;

      if (data.requiresApproval) {
        setRequiresApproval(true);
        toast.info("You need approval to create additional businesses");
        return;
      }

      setBusinessId(data.businessId);
      setMessages([{ role: 'assistant', content: data.message }]);
      toast.success("Let's build your business!");
    } catch (error: any) {
      toast.error(error.message || "Failed to start business creation");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !businessId || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('business-spawn', {
        body: {
          action: 'chat',
          businessId,
          message: userMessage,
          phase: currentPhase
        }
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        toolResults: data.toolResults
      }]);

      if (data.business) {
        setBusiness(data.business);
        
        // Extract research data from tool results
        if (data.toolResults) {
          const researchResult = data.toolResults.find((tr: any) => 
            tr.function_name === 'web_research' || tr.function_name === 'update_business_profile'
          );
          if (researchResult) {
            setResearchData(researchResult.result);
          }
        }
        
        // Detect phase changes from status
        const statusPhaseMap: Record<string, string> = {
          'draft': 'discovery',
          'researching': 'research',
          'generating_erp': 'erp_design',
          'generating_website': 'website',
          'generating_content': 'content',
          'pending_approval': 'review',
          'active': 'launch'
        };
        if (data.business.status && statusPhaseMap[data.business.status]) {
          setCurrentPhase(statusPhaseMap[data.business.status]);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const launchBusiness = async () => {
    if (!businessId) return;
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('business-spawn', {
        body: { action: 'launch', businessId }
      });

      if (response.error) throw new Error(response.error.message);

      toast.success("🎉 Your business is now live!");
      setBusiness(response.data.business);
      setCurrentPhase('launch');

      // Fetch network matches
      const matchResponse = await supabase.functions.invoke('business-spawn', {
        body: { action: 'find_matches', businessId }
      });
      
      if (matchResponse.data?.matches) {
        setNetworkMatches(matchResponse.data.matches);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to launch business");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPhaseIndex = () => {
    return PHASES.findIndex(p => p.id === currentPhase);
  };

  const handleHeartbeat = useCallback(() => {
    // Could add sound effects or haptic feedback here
    console.log('Emotional peak - heartbeat triggered');
  }, []);

  if (!businessId && !requiresApproval) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 text-center space-y-6 relative overflow-hidden">
          {/* Ambient animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-pulse" />
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Rocket className="w-12 h-12 text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Spawn Your Business</h1>
            <p className="text-lg text-primary/80 font-medium">AGI-Powered Business Creation</p>
          </div>
          
          <p className="text-muted-foreground max-w-md mx-auto relative">
            Our AGI-powered system will guide you through creating a complete business with 
            organizational structure, website, content, and connections to complementary businesses.
          </p>

          <div className="grid grid-cols-3 gap-4 py-6 relative">
            <div className="text-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <FolderTree className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-sm font-medium">ERP Structure</div>
              <div className="text-xs text-muted-foreground">Auto-generated org</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <Globe className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-sm font-medium">Website</div>
              <div className="text-xs text-muted-foreground">SEO-optimized</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <Network className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-sm font-medium">Connections</div>
              <div className="text-xs text-muted-foreground">Find partners</div>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={startNewBusiness}
            disabled={isLoading}
            className="gap-2 text-lg px-8 py-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/10 to-primary-foreground/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
            Begin Creation
          </Button>
        </Card>
      </div>
    );
  }

  if (requiresApproval) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <AlertCircle className="w-16 h-16 mx-auto text-warning" />
          <h2 className="text-2xl font-bold">Approval Required</h2>
          <p className="text-muted-foreground">
            You already have a business registered. To create additional businesses, 
            please submit a request for admin approval.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-depth relative">
      {/* Emotional feedback layer */}
      <SpawnEmotionalFeedback state={emotionalState} onHeartbeat={handleHeartbeat} />

      {/* Back to Dashboard */}
      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl pt-16">
        {/* Phase Progress with visual indicators */}
        <Card className="p-4 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          
          <div className="flex items-center justify-between mb-4 relative">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Business Creation Progress
            </h2>
            <Badge variant="outline" className={cn(
              "transition-colors",
              (business?.spawn_progress || 0) >= 80 && "bg-green-500/10 border-green-500/50 text-green-600"
            )}>
              {business?.spawn_progress || 0}% Complete
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 relative">
            {PHASES.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = phase.id === currentPhase;
              const isComplete = index < getCurrentPhaseIndex();
              
              return (
                <div key={phase.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
                    isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                    isComplete && "bg-primary/20 text-primary",
                    !isActive && !isComplete && "bg-muted text-muted-foreground",
                    isActive && isLoading && "animate-pulse"
                  )}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className={cn("w-4 h-4", isActive && isLoading && "animate-spin")} />
                    )}
                    <span className="text-sm font-medium whitespace-nowrap">{phase.label}</span>
                  </div>
                  {index < PHASES.length - 1 && (
                    <ArrowRight className={cn(
                      "w-4 h-4 mx-1",
                      isComplete ? "text-primary" : "text-muted-foreground"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          
          <Progress 
            value={business?.spawn_progress || 0} 
            className="h-2 mt-4"
          />
        </Card>

        {/* Quick access panels */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'chat', label: 'AGI Chat', icon: Sparkles, always: true },
            { id: 'research', label: 'Research', icon: FileSearch, show: researchData },
            { id: 'erp', label: 'ERP', icon: FolderTree, show: business?.erp_structure },
            { id: 'website', label: 'Website', icon: Globe, show: business?.website_data },
          ].map((panel) => {
            if (!panel.always && !panel.show) return null;
            const Icon = panel.icon;
            return (
              <Button
                key={panel.id}
                variant={activePanel === panel.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePanel(panel.id as any)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {panel.label}
                {panel.show && panel.id !== 'chat' && (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
              </Button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Panel - Chat or Visualization */}
          <Card className="lg:col-span-2 flex flex-col h-[600px] overflow-hidden">
            {activePanel === 'chat' ? (
              <>
                <div className="p-4 border-b bg-muted/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AGI Business Architect
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Describe your vision and I'll build your business
                  </p>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={cn(
                          "max-w-[85%] rounded-xl p-4 transition-all",
                          msg.role === 'user' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted/50 border"
                        )}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          
                          {msg.toolResults && msg.toolResults.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="text-xs opacity-70 mb-2 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Actions executed:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {msg.toolResults.map((tr, j) => (
                                  <Badge 
                                    key={j} 
                                    variant="secondary" 
                                    className="text-xs cursor-pointer hover:bg-primary/20"
                                    onClick={() => {
                                      if (tr.function_name === 'generate_erp_structure') setActivePanel('erp');
                                      if (tr.function_name === 'generate_website') setActivePanel('website');
                                      if (tr.function_name === 'web_research') setActivePanel('research');
                                    }}
                                  >
                                    {tr.function_name}
                                    <Eye className="w-3 h-3 ml-1" />
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 border rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/30">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe your business vision..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : activePanel === 'erp' && business?.erp_structure ? (
              <div className="p-6 overflow-auto h-full">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <FolderTree className="w-5 h-5 text-primary" />
                  ERP Structure
                </h3>
                <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(business.erp_structure, null, 2)}
                </pre>
              </div>
            ) : activePanel === 'website' && business?.website_data ? (
              <div className="p-6 overflow-auto h-full">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-primary" />
                  Website Content
                </h3>
                <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(business.website_data, null, 2)}
                </pre>
              </div>
            ) : activePanel === 'research' && researchData ? (
              <div className="p-6 overflow-auto h-full">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <FileSearch className="w-5 h-5 text-primary" />
                  Market Research
                </h3>
                <div className="prose prose-sm dark:prose-invert">
                  {typeof researchData === 'string' ? (
                    <p className="whitespace-pre-wrap">{researchData}</p>
                  ) : (
                    <pre className="text-xs">{JSON.stringify(researchData, null, 2)}</pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a panel to view</p>
              </div>
            )}
          </Card>

          {/* Business Overview Panel */}
          <div className="space-y-4">
            {/* Business Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business Profile
              </h3>
              
              {business ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{business.business_name}</div>
                  </div>
                  
                  {business.industry && (
                    <div>
                      <div className="text-muted-foreground">Industry</div>
                      <div className="font-medium">{business.industry}</div>
                    </div>
                  )}
                  
                  {business.description && (
                    <div>
                      <div className="text-muted-foreground">Description</div>
                      <div className="text-xs">{business.description}</div>
                    </div>
                  )}
                  
                  {business.offers_tags && business.offers_tags.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Offers</div>
                      <div className="flex flex-wrap gap-1">
                        {business.offers_tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {business.needs_tags && business.needs_tags.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Needs</div>
                      <div className="flex flex-wrap gap-1">
                        {business.needs_tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Profile will populate as you describe your business
                </p>
              )}
            </Card>

            {/* Generated Assets */}
            {business && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Generated Assets</h3>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-sm"
                    onClick={() => setActivePanel('erp')}
                    disabled={!business.erp_structure}
                  >
                    <span className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4" />
                      ERP Structure
                    </span>
                    {business.erp_structure && Object.keys(business.erp_structure).length > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted animate-pulse" />
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-sm"
                    onClick={() => setActivePanel('website')}
                    disabled={!business.website_data}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website Content
                    </span>
                    {business.website_data && Object.keys(business.website_data).length > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted animate-pulse" />
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Network Matches */}
            {networkMatches.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Network Matches
                </h3>
                <div className="space-y-2">
                  {networkMatches.slice(0, 5).map((match, i) => (
                    <div key={i} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium">{match.business_name}</div>
                      <div className="text-xs text-muted-foreground">{match.industry}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Launch Button */}
            {business && (business.spawn_progress || 0) >= 60 && business.status !== 'active' && (
              <Button 
                size="lg" 
                onClick={launchBusiness}
                disabled={isLoading}
                className="w-full gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/20 to-primary-foreground/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                Launch Business
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
