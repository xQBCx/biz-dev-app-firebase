import { useState } from 'react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Target, 
  MessageSquare, 
  ListChecks, 
  Calendar, 
  Receipt, 
  Newspaper,
  Bot,
  Sparkles,
  Crown
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
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  onToggle: (enabled: boolean) => void;
}

function AgentCard({ 
  agent, 
  isSubscribed, 
  isEnabled,
  userAgentId,
  onSubscribe, 
  onUnsubscribe,
  onToggle 
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
              <Switch
                checked={isEnabled}
                onCheckedChange={onToggle}
                className="scale-75"
              />
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
    isSubscribed,
    getUserAgent 
  } = useAgents();
  
  const [filter, setFilter] = useState<'all' | 'subscribed'>('all');

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

  return (
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
                onSubscribe={() => handleSubscribe(agent.id, agent.name)}
                onUnsubscribe={() => userAgent && handleUnsubscribe(userAgent.id, agent.name)}
                onToggle={(enabled) => userAgent && handleToggle(userAgent.id, enabled)}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}
