import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  TrendingUp, 
  PiggyBank, 
  Building2, 
  Repeat,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Briefcase,
  Shield
} from 'lucide-react';
import { useLifecycleTranslation } from '@/hooks/useArchetypeTranslation';
import { cn } from '@/lib/utils';

interface LifecyclePhase {
  key: string;
  label: string;
  icon: typeof Coins;
  color: string;
  bgColor: string;
  description: string;
  metrics: {
    current: number;
    target: number;
    unit: string;
  };
}

export function LifecycleFlowVisualization() {
  const { user } = useAuth();
  const { TL } = useLifecycleTranslation();
  const [activePhase, setActivePhase] = useState<string | null>(null);

  // Fetch lifecycle metrics
  const { data: workforceData } = useQuery({
    queryKey: ['lifecycle-workforce', user?.id],
    queryFn: async () => {
      if (!user?.id) return { totalEarnings: 0, activeEngagements: 0 };
      
      const { data: engagements } = await supabase
        .from('workforce_engagements')
        .select('*')
        .eq('user_id', user.id);
      
      const { data: timeEntries } = await supabase
        .from('workforce_time_entries')
        .select('*')
        .eq('user_id', user.id);
      
      // hours is the correct field name
      const totalEarnings = timeEntries?.reduce((sum, entry) => 
        sum + (entry.billable ? (entry.hours * 100) : 0), 0) || 0;
      
      return {
        totalEarnings,
        activeEngagements: engagements?.filter(e => e.status === 'active').length || 0,
      };
    },
    enabled: !!user?.id,
  });

  const { data: capitalData } = useQuery({
    queryKey: ['lifecycle-capital', user?.id],
    queryFn: async () => {
      if (!user?.id) return { totalInvested: 0, equityStakes: 0 };
      
      const { data: investments } = await supabase
        .from('capital_investments')
        .select('*')
        .eq('user_id', user.id);
      
      const { data: stakes } = await supabase
        .from('equity_stakes')
        .select('*')
        .eq('user_id', user.id);
      
      // amount is the correct field for capital_investments
      const totalInvested = investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
      
      return {
        totalInvested,
        equityStakes: stakes?.length || 0,
        // current_valuation is the correct field for equity_stakes
        totalEquityValue: stakes?.reduce((sum, s) => sum + (s.current_valuation || 0), 0) || 0,
      };
    },
    enabled: !!user?.id,
  });

  const { data: erosData } = useQuery({
    queryKey: ['lifecycle-eros', user?.id],
    queryFn: async () => {
      if (!user?.id) return { deploymentsCompleted: 0, totalHoursServed: 0 };
      
      const { data: profile } = await supabase
        .from('eros_responder_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return {
        deploymentsCompleted: profile?.total_deployments || 0,
        // total_hours_served is the correct field
        totalHoursServed: profile?.total_hours_served || 0,
      };
    },
    enabled: !!user?.id,
  });

  const phases: LifecyclePhase[] = [
    {
      key: 'earn',
      label: 'Earn',
      icon: Coins,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      description: 'Generate income through EROS deployments and Workforce engagements',
      metrics: {
        current: (workforceData?.totalEarnings || 0) + ((erosData?.totalHoursServed || 0) * 50),
        target: 10000,
        unit: '$',
      },
    },
    {
      key: 'trade',
      label: 'Trade',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      description: 'Apply rules-based trading to grow your capital through Trading Command',
      metrics: {
        current: 0, // Would come from trading module
        target: 5000,
        unit: '$',
      },
    },
    {
      key: 'invest',
      label: 'Invest',
      icon: PiggyBank,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      description: 'Allocate capital into ecosystem companies and opportunities',
      metrics: {
        current: capitalData?.totalInvested || 0,
        target: 25000,
        unit: '$',
      },
    },
    {
      key: 'own',
      label: 'Own',
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      description: 'Build equity stakes and ownership positions in businesses',
      metrics: {
        current: capitalData?.equityStakes || 0,
        target: 5,
        unit: 'positions',
      },
    },
    {
      key: 'compound',
      label: 'Compound',
      icon: Repeat,
      color: 'text-rose-600',
      bgColor: 'bg-rose-500/10',
      description: 'Reinvest returns to accelerate portfolio growth',
      metrics: {
        current: capitalData?.totalEquityValue || 0,
        target: 100000,
        unit: '$',
      },
    },
  ];

  const getPhaseProgress = (phase: LifecyclePhase) => {
    return Math.min((phase.metrics.current / phase.metrics.target) * 100, 100);
  };

  const getPhaseStatus = (phase: LifecyclePhase) => {
    const progress = getPhaseProgress(phase);
    if (progress >= 100) return { label: 'Complete', icon: CheckCircle2, color: 'text-emerald-600' };
    if (progress >= 50) return { label: 'In Progress', icon: Clock, color: 'text-amber-600' };
    return { label: 'Starting', icon: AlertCircle, color: 'text-muted-foreground' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-primary" />
          Lifecycle Flow
        </CardTitle>
        <CardDescription>
          Track your progression: Earn → Trade → Invest → Own → Compound
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flow Visualization */}
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {phases.map((phase, idx) => {
            const status = getPhaseStatus(phase);
            const isActive = activePhase === phase.key;
            
            return (
              <div key={phase.key} className="flex items-center">
                <button
                  onClick={() => setActivePhase(isActive ? null : phase.key)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg transition-all min-w-[90px]",
                    isActive ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn("p-3 rounded-full", phase.bgColor)}>
                    <phase.icon className={cn("h-6 w-6", phase.color)} />
                  </div>
                  <span className="text-sm font-medium">{phase.label}</span>
                  <Badge variant="outline" className={cn("text-xs", status.color)}>
                    {Math.round(getPhaseProgress(phase))}%
                  </Badge>
                </button>
                {idx < phases.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Active Phase Details */}
        {activePhase && (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-4">
              {(() => {
                const phase = phases.find(p => p.key === activePhase);
                if (!phase) return null;
                const status = getPhaseStatus(phase);
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={cn("font-semibold flex items-center gap-2", phase.color)}>
                          <phase.icon className="h-5 w-5" />
                          {phase.label} Phase
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {phase.description}
                        </p>
                      </div>
                      <Badge className={status.color}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress to Target</span>
                        <span className="font-medium">
                          {phase.metrics.unit === '$' ? '$' : ''}{phase.metrics.current.toLocaleString()}
                          {' / '}
                          {phase.metrics.unit === '$' ? '$' : ''}{phase.metrics.target.toLocaleString()}
                          {phase.metrics.unit !== '$' ? ` ${phase.metrics.unit}` : ''}
                        </span>
                      </div>
                      <Progress value={getPhaseProgress(phase)} className="h-2" />
                    </div>

                    {/* Phase-specific actions */}
                    <div className="flex gap-2 pt-2">
                      {phase.key === 'earn' && (
                        <>
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {erosData?.deploymentsCompleted || 0} EROS Deployments
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Briefcase className="h-3 w-3" />
                            {workforceData?.activeEngagements || 0} Active Engagements
                          </Badge>
                        </>
                      )}
                      {phase.key === 'own' && (
                        <Badge variant="secondary" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          {capitalData?.equityStakes || 0} Equity Stakes
                        </Badge>
                      )}
                      {phase.key === 'compound' && (
                        <Badge variant="secondary" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${(capitalData?.totalEquityValue || 0).toLocaleString()} Total Value
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-lg font-bold">{erosData?.deploymentsCompleted || 0}</p>
                <p className="text-xs text-muted-foreground">EROS Missions</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{workforceData?.activeEngagements || 0}</p>
                <p className="text-xs text-muted-foreground">Engagements</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-lg font-bold">{capitalData?.equityStakes || 0}</p>
                <p className="text-xs text-muted-foreground">Equity Stakes</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-lg font-bold">${((capitalData?.totalEquityValue || 0) / 100).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
