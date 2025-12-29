import { useState, useEffect, useRef } from "react";
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
  AlertCircle
} from "lucide-react";

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
  { id: 'research', label: 'Research', icon: Globe, description: 'Market analysis' },
  { id: 'erp_design', label: 'Structure', icon: FolderTree, description: 'Organizational design' },
  { id: 'website', label: 'Website', icon: Building2, description: 'Web presence' },
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  if (!businessId && !requiresApproval) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold">Spawn Your Business</h1>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            Our AGI-powered system will guide you through creating a complete business with 
            organizational structure, website, content, and connections to complementary businesses.
          </p>

          <div className="grid grid-cols-3 gap-4 py-6">
            <div className="text-center">
              <FolderTree className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-sm font-medium">ERP Structure</div>
              <div className="text-xs text-muted-foreground">Auto-generated org</div>
            </div>
            <div className="text-center">
              <Globe className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-sm font-medium">Website</div>
              <div className="text-xs text-muted-foreground">SEO-optimized</div>
            </div>
            <div className="text-center">
              <Network className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-sm font-medium">Connections</div>
              <div className="text-xs text-muted-foreground">Find partners</div>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={startNewBusiness}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Start Building
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
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Phase Progress */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Business Creation Progress</h2>
            <Badge variant="outline">
              {business?.spawn_progress || 0}% Complete
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {PHASES.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = phase.id === currentPhase;
              const isComplete = index < getCurrentPhaseIndex();
              
              return (
                <div key={phase.id} className="flex items-center">
                  <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                    ${isActive ? 'bg-primary text-primary-foreground' : ''}
                    ${isComplete ? 'bg-primary/20 text-primary' : ''}
                    ${!isActive && !isComplete ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium whitespace-nowrap">{phase.label}</span>
                  </div>
                  {index < PHASES.length - 1 && (
                    <ArrowRight className="w-4 h-4 mx-1 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
          
          <Progress value={business?.spawn_progress || 0} className="h-2 mt-4" />
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <Card className="lg:col-span-2 flex flex-col h-[600px]">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AGI Business Architect
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                      max-w-[80%] rounded-lg p-3
                      ${msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'}
                    `}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.toolResults && msg.toolResults.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="text-xs opacity-70 mb-1">Actions taken:</div>
                          {msg.toolResults.map((tr, j) => (
                            <Badge key={j} variant="secondary" className="mr-1 mb-1">
                              {tr.function_name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your business vision..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4" />
                      ERP Structure
                    </span>
                    {business.erp_structure && Object.keys(business.erp_structure).length > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website Content
                    </span>
                    {business.website_data && Object.keys(business.website_data).length > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted" />
                    )}
                  </div>
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
                      <div className="font-medium">{match.business.business_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {match.type === 'supplier' ? 'Potential Supplier' : 'Potential Customer'}
                      </div>
                      <div className="text-xs text-primary mt-1">
                        Match: {(match.score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Launch Button */}
            {business && business.spawn_progress >= 70 && business.status !== 'active' && (
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={launchBusiness}
                disabled={isLoading}
              >
                <Rocket className="w-4 h-4" />
                Launch Business
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
