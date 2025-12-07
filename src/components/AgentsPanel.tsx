import { useState } from 'react';
import { useAgents, Agent, AgentRunResult } from '@/hooks/useAgents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Target, 
  MessageSquare, 
  ListChecks, 
  Calendar, 
  Receipt, 
  Newspaper,
  Bot,
  Sparkles,
  Crown,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  MessageSquare,
  ListChecks,
  Calendar,
  Receipt,
  Newspaper,
};

const categoryColors: Record<string, string> = {
  sales: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  operations: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  finance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  marketing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  legal: 'bg-red-500/20 text-red-400 border-red-500/30',
  hr: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

interface AgentCardProps {
  agent: Agent;
  isSubscribed: boolean;
  isEnabled: boolean;
  userAgentId?: string;
  isRunning: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  onToggle: (enabled: boolean) => void;
  onRun: () => void;
}

function AgentCard({ 
  agent, 
  isSubscribed, 
  isEnabled,
  userAgentId,
  isRunning,
  onSubscribe, 
  onUnsubscribe,
  onToggle,
  onRun
}: AgentCardProps) {
  const IconComponent = agent.icon ? iconMap[agent.icon] || Bot : Bot;
  const categoryColor = categoryColors[agent.category] || 'bg-muted text-muted-foreground';

  return (
    <Card className="p-4 border border-border hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{agent.name}</h4>
            {agent.is_premium && (
              <Crown className="h-3.5 w-3.5 text-amber-400" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {agent.description}
          </p>
          
          <Badge variant="outline" className={`text-[10px] ${categoryColor}`}>
            {agent.category}
          </Badge>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isSubscribed ? (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={onRun}
                  disabled={!isEnabled || isRunning}
                >
                  {isRunning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={onToggle}
                  className="scale-75"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 text-muted-foreground hover:text-destructive"
                onClick={onUnsubscribe}
              >
                Remove
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={onSubscribe}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Add
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function AgentsPanel() {
  const { 
    agents, 
    userAgents, 
    isLoading, 
    subscribe, 
    unsubscribe, 
    toggle,
    runAgent,
    isSubscribed,
    getUserAgent,
    isRunning,
    runningAgentId
  } = useAgents();
  
  const [filter, setFilter] = useState<'all' | 'subscribed'>('all');
  const [runResult, setRunResult] = useState<AgentRunResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const handleSubscribe = (agentId: string, agentName: string) => {
    subscribe(agentId, {
      onSuccess: () => toast.success(`${agentName} agent activated`),
      onError: () => toast.error('Failed to add agent'),
    });
  };

  const handleUnsubscribe = (userAgentId: string, agentName: string) => {
    unsubscribe(userAgentId, {
      onSuccess: () => toast.success(`${agentName} agent removed`),
      onError: () => toast.error('Failed to remove agent'),
    });
  };

  const handleToggle = (userAgentId: string, enabled: boolean) => {
    toggle({ userAgentId, enabled });
  };

  const handleRun = async (agentId: string, agentName: string) => {
    try {
      const result = await runAgent(agentId);
      setRunResult(result);
      setShowResultDialog(true);
      toast.success(`${agentName} analysis complete`);
    } catch (error) {
      toast.error('Failed to run agent');
    }
  };

  const filteredAgents = filter === 'subscribed' 
    ? agents.filter(a => isSubscribed(a.id))
    : agents;

  if (isLoading) {
    return (
      <Card className="p-4 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const priorityColors = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-green-400'
  };

  return (
    <>
      <Card className="p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Agents</h3>
            <Badge variant="secondary" className="text-xs">
              {userAgents.filter(ua => ua.is_enabled).length} active
            </Badge>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant={filter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              className="text-xs h-7"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'subscribed' ? 'secondary' : 'ghost'}
              size="sm"
              className="text-xs h-7"
              onClick={() => setFilter('subscribed')}
            >
              My Agents
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'subscribed' 
                  ? 'No agents activated yet' 
                  : 'No agents available'}
              </p>
            </div>
          ) : (
            filteredAgents.map(agent => {
              const userAgent = getUserAgent(agent.id);
              return (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSubscribed={!!userAgent}
                  isEnabled={userAgent?.is_enabled ?? false}
                  userAgentId={userAgent?.id}
                  isRunning={isRunning && runningAgentId === agent.id}
                  onSubscribe={() => handleSubscribe(agent.id, agent.name)}
                  onUnsubscribe={() => userAgent && handleUnsubscribe(userAgent.id, agent.name)}
                  onToggle={(enabled) => userAgent && handleToggle(userAgent.id, enabled)}
                  onRun={() => handleRun(agent.id, agent.name)}
                />
              );
            })
          )}
        </div>
      </Card>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              Agent Analysis Complete
            </DialogTitle>
          </DialogHeader>
          
          {runResult && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{runResult.summary}</p>
              
              {runResult.insights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Insights</h4>
                  {runResult.insights.map((insight, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className={`h-3.5 w-3.5 ${priorityColors[insight.priority]}`} />
                        <span className="text-sm font-medium">{insight.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                      {insight.action && (
                        <p className="text-xs text-primary mt-1">→ {insight.action}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {runResult.metrics && Object.keys(runResult.metrics).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(runResult.metrics).map(([key, value]) => (
                    <div key={key} className="text-center p-2 rounded bg-muted/30">
                      <div className="text-lg font-bold">{value}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
