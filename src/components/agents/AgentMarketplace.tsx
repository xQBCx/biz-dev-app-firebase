import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bot, Search, Star, Zap, TrendingUp, Users, Clock, 
  CheckCircle2, XCircle, Settings, Play, Pause, Sparkles,
  Filter, Grid3X3, List, Crown, Shield, Cpu
} from "lucide-react";
import { toast } from "sonner";

interface Agent {
  id: string;
  agent_name: string;
  agent_slug: string;
  agent_type: string;
  active: boolean;
  architecture_layer: number | null;
  human_oversight_required: boolean | null;
  security_classification: string | null;
  rate_limit_config: any;
  resource_limits: any;
  created_at: string;
}

interface UserAgent {
  id: string;
  agent_id: string;
  is_enabled: boolean;
  config: any;
  run_count: number | null;
  last_run_at: string | null;
}

const PRICING_TIERS = {
  free: { label: "Free", credits: 0, color: "bg-muted text-muted-foreground" },
  starter: { label: "Starter", credits: 10, color: "bg-blue-500/10 text-blue-500" },
  professional: { label: "Pro", credits: 50, color: "bg-purple-500/10 text-purple-500" },
  enterprise: { label: "Enterprise", credits: 200, color: "bg-amber-500/10 text-amber-500" },
};

const CATEGORIES = [
  { id: "all", label: "All Agents", icon: Grid3X3 },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "operations", label: "Operations", icon: Settings },
  { id: "finance", label: "Finance", icon: Crown },
  { id: "marketing", label: "Marketing", icon: Sparkles },
];

export function AgentMarketplace() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userAgents, setUserAgents] = useState<UserAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);

  useEffect(() => {
    fetchAgents();
    fetchUserAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agent_registry")
        .select("*")
        .eq("active", true)
        .order("agent_name");

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load agents");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("instincts_user_agents")
        .select("*");

      if (error) throw error;
      setUserAgents(data || []);
    } catch (error) {
      console.error("Error fetching user agents:", error);
    }
  };

  const isSubscribed = (agentId: string) => {
    return userAgents.some((ua) => ua.agent_id === agentId);
  };

  const isAgentEnabled = (agentId: string) => {
    const userAgent = userAgents.find((ua) => ua.agent_id === agentId);
    return userAgent?.is_enabled ?? false;
  };

  const handleSubscribe = async (agent: Agent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to subscribe");
        return;
      }

      const { error } = await supabase
        .from("instincts_user_agents")
        .insert({
          user_id: user.id,
          agent_id: agent.id,
          is_enabled: true,
          config: {},
        });

      if (error) throw error;
      
      toast.success(`Subscribed to ${agent.agent_name}`);
      fetchUserAgents();
      setShowSubscribeDialog(false);
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to subscribe");
    }
  };

  const handleUnsubscribe = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("instincts_user_agents")
        .delete()
        .eq("agent_id", agentId);

      if (error) throw error;
      
      toast.success("Unsubscribed successfully");
      fetchUserAgents();
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to unsubscribe");
    }
  };

  const handleToggleAgent = async (agentId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("instincts_user_agents")
        .update({ is_enabled: enabled })
        .eq("agent_id", agentId);

      if (error) throw error;
      
      toast.success(enabled ? "Agent enabled" : "Agent paused");
      fetchUserAgents();
    } catch (error) {
      console.error("Error toggling agent:", error);
      toast.error("Failed to update agent");
    }
  };

  const getPricingTier = (agent: Agent) => {
    const layer = agent.architecture_layer || 1;
    if (layer <= 1) return PRICING_TIERS.free;
    if (layer === 2) return PRICING_TIERS.starter;
    if (layer === 3) return PRICING_TIERS.professional;
    return PRICING_TIERS.enterprise;
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.agent_slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || agent.agent_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subscribedAgents = agents.filter((a) => isSubscribed(a.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agent Marketplace</h2>
          <p className="text-muted-foreground">
            Browse, subscribe, and manage AI agents for your workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Bot className="h-3 w-3" />
            {subscribedAgents.length} Subscribed
          </Badge>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredAgents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">No agents found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSubscribed={isSubscribed(agent.id)}
                  isEnabled={isAgentEnabled(agent.id)}
                  pricingTier={getPricingTier(agent)}
                  userAgent={userAgents.find((ua) => ua.agent_id === agent.id)}
                  onSubscribe={() => {
                    setSelectedAgent(agent);
                    setShowSubscribeDialog(true);
                  }}
                  onUnsubscribe={() => handleUnsubscribe(agent.id)}
                  onToggle={(enabled) => handleToggleAgent(agent.id, enabled)}
                />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredAgents.map((agent) => (
                  <AgentListItem
                    key={agent.id}
                    agent={agent}
                    isSubscribed={isSubscribed(agent.id)}
                    isEnabled={isAgentEnabled(agent.id)}
                    pricingTier={getPricingTier(agent)}
                    userAgent={userAgents.find((ua) => ua.agent_id === agent.id)}
                    onSubscribe={() => {
                      setSelectedAgent(agent);
                      setShowSubscribeDialog(true);
                    }}
                    onUnsubscribe={() => handleUnsubscribe(agent.id)}
                    onToggle={(enabled) => handleToggleAgent(agent.id, enabled)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Subscribe to {selectedAgent?.agent_name}
            </DialogTitle>
            <DialogDescription>
              Enable this agent to automate tasks and earn credits on your behalf.
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedAgent.agent_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pricing Tier</span>
                  <Badge className={getPricingTier(selectedAgent).color}>
                    {getPricingTier(selectedAgent).label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credits/Run</span>
                  <span className="font-medium">
                    {getPricingTier(selectedAgent).credits || "Free"}
                  </span>
                </div>
                {selectedAgent.human_oversight_required && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Shield className="h-4 w-4" />
                    Requires human approval for actions
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedAgent && handleSubscribe(selectedAgent)}>
              <Zap className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AgentCardProps {
  agent: Agent;
  isSubscribed: boolean;
  isEnabled: boolean;
  pricingTier: { label: string; credits: number; color: string };
  userAgent?: UserAgent;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  onToggle: (enabled: boolean) => void;
}

function AgentCard({
  agent,
  isSubscribed,
  isEnabled,
  pricingTier,
  userAgent,
  onSubscribe,
  onUnsubscribe,
  onToggle,
}: AgentCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{agent.agent_name}</CardTitle>
              <CardDescription className="capitalize">{agent.agent_type}</CardDescription>
            </div>
          </div>
          <Badge className={pricingTier.color}>{pricingTier.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="h-4 w-4" />
            <span>{pricingTier.credits || "0"} credits per run</span>
          </div>
          {userAgent && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{userAgent.run_count || 0} total runs</span>
            </div>
          )}
          {agent.human_oversight_required && (
            <div className="flex items-center gap-2 text-amber-600">
              <Shield className="h-4 w-4" />
              <span>Human oversight required</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        {isSubscribed ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={onToggle}
                id={`toggle-${agent.id}`}
              />
              <Label htmlFor={`toggle-${agent.id}`} className="text-sm">
                {isEnabled ? "Active" : "Paused"}
              </Label>
            </div>
            <Button variant="ghost" size="sm" onClick={onUnsubscribe}>
              Unsubscribe
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={onSubscribe}>
            <Zap className="h-4 w-4 mr-2" />
            Subscribe
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function AgentListItem({
  agent,
  isSubscribed,
  isEnabled,
  pricingTier,
  userAgent,
  onSubscribe,
  onUnsubscribe,
  onToggle,
}: AgentCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{agent.agent_name}</span>
              <Badge className={pricingTier.color} variant="secondary">
                {pricingTier.label}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {agent.agent_type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>{pricingTier.credits || "0"} credits/run</span>
              {userAgent && <span>{userAgent.run_count || 0} runs</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={onToggle}
                  id={`toggle-list-${agent.id}`}
                />
                <Label htmlFor={`toggle-list-${agent.id}`} className="text-sm">
                  {isEnabled ? "Active" : "Paused"}
                </Label>
              </div>
              <Button variant="ghost" size="sm" onClick={onUnsubscribe}>
                Unsubscribe
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onSubscribe}>
              <Zap className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
