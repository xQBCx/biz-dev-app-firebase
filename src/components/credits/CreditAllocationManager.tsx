import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Settings2, 
  Cpu, 
  Zap, 
  Target, 
  DollarSign,
  Users,
  Bot,
  ArrowRight,
  Percent,
  Calendar,
  Plus,
  Save,
  Trash2,
  Edit2,
  CircleDot
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealRoom {
  id: string;
  name: string;
  category: string;
  status: string;
}

interface CreditRule {
  id: string;
  deal_room_id: string;
  compute_to_usd: number;
  action_to_usd: number;
  outcome_to_usd: number;
  attribution_rules: {
    human_split: number;
    agent_split: number;
    referrer_split: number;
  } | null;
  min_payout_threshold: number;
  payout_frequency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface AllocationFlow {
  source: 'user' | 'agent' | 'deal';
  target: 'user' | 'agent' | 'deal';
  creditType: 'compute' | 'action' | 'outcome';
  percentage: number;
}

const defaultFlows: AllocationFlow[] = [
  { source: 'agent', target: 'deal', creditType: 'compute', percentage: 100 },
  { source: 'user', target: 'deal', creditType: 'action', percentage: 70 },
  { source: 'agent', target: 'deal', creditType: 'action', percentage: 30 },
  { source: 'deal', target: 'user', creditType: 'outcome', percentage: 60 },
  { source: 'deal', target: 'agent', creditType: 'outcome', percentage: 40 },
];

export function CreditAllocationManager() {
  const queryClient = useQueryClient();
  const [selectedDealRoom, setSelectedDealRoom] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<CreditRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [flows, setFlows] = useState<AllocationFlow[]>(defaultFlows);

  // Form state
  const [formState, setFormState] = useState({
    compute_to_usd: 0.001,
    action_to_usd: 0.01,
    outcome_to_usd: 0.10,
    min_payout_threshold: 10,
    payout_frequency: 'monthly',
    human_split: 60,
    agent_split: 30,
    referrer_split: 10,
  });

  // Fetch deal rooms
  const { data: dealRooms } = useQuery({
    queryKey: ['deal-rooms-for-allocation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_rooms')
        .select('id, name, category, status')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DealRoom[];
    }
  });

  // Fetch credit rules
  const { data: creditRules, isLoading: rulesLoading } = useQuery({
    queryKey: ['credit-allocation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_room_credit_rules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CreditRule[];
    }
  });

  // Save rule mutation
  const saveMutation = useMutation({
    mutationFn: async (rule: Partial<CreditRule>) => {
      const attribution_rules = {
        human_split: formState.human_split,
        agent_split: formState.agent_split,
        referrer_split: formState.referrer_split,
      };

      if (editingRule) {
        const { error } = await supabase
          .from('deal_room_credit_rules')
          .update({
            compute_to_usd: formState.compute_to_usd,
            action_to_usd: formState.action_to_usd,
            outcome_to_usd: formState.outcome_to_usd,
            min_payout_threshold: formState.min_payout_threshold,
            payout_frequency: formState.payout_frequency,
            attribution_rules,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRule.id);
        
        if (error) throw error;
      } else {
        if (!selectedDealRoom) throw new Error('Please select a deal room');
        
        const { error } = await supabase
          .from('deal_room_credit_rules')
          .insert({
            deal_room_id: selectedDealRoom,
            compute_to_usd: formState.compute_to_usd,
            action_to_usd: formState.action_to_usd,
            outcome_to_usd: formState.outcome_to_usd,
            min_payout_threshold: formState.min_payout_threshold,
            payout_frequency: formState.payout_frequency,
            attribution_rules,
            active: true,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-allocation-rules'] });
      setIsDialogOpen(false);
      setEditingRule(null);
      toast.success(editingRule ? 'Rule updated successfully' : 'Rule created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('deal_room_credit_rules')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-allocation-rules'] });
      toast.success('Rule status updated');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deal_room_credit_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-allocation-rules'] });
      toast.success('Rule deleted');
    }
  });

  const handleEdit = (rule: CreditRule) => {
    setEditingRule(rule);
    setFormState({
      compute_to_usd: rule.compute_to_usd,
      action_to_usd: rule.action_to_usd,
      outcome_to_usd: rule.outcome_to_usd,
      min_payout_threshold: rule.min_payout_threshold,
      payout_frequency: rule.payout_frequency,
      human_split: rule.attribution_rules?.human_split || 60,
      agent_split: rule.attribution_rules?.agent_split || 30,
      referrer_split: rule.attribution_rules?.referrer_split || 10,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRule(null);
    setFormState({
      compute_to_usd: 0.001,
      action_to_usd: 0.01,
      outcome_to_usd: 0.10,
      min_payout_threshold: 10,
      payout_frequency: 'monthly',
      human_split: 60,
      agent_split: 30,
      referrer_split: 10,
    });
    setIsDialogOpen(true);
  };

  const getDealRoomName = (id: string) => {
    return dealRooms?.find(dr => dr.id === id)?.name || 'Unknown';
  };

  const getCreditTypeColor = (type: string) => {
    switch (type) {
      case 'compute': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'action': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'outcome': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'agent': return <Bot className="h-4 w-4" />;
      case 'deal': return <DollarSign className="h-4 w-4" />;
      default: return <CircleDot className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Credit Allocation Manager</h2>
          <p className="text-muted-foreground">Define how credits flow between agents, deals, and users</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Allocation Rule' : 'Create Allocation Rule'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Deal Room Selection */}
              {!editingRule && (
                <div className="space-y-2">
                  <Label>Deal Room</Label>
                  <Select value={selectedDealRoom || ''} onValueChange={setSelectedDealRoom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal room" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealRooms?.map(dr => (
                        <SelectItem key={dr.id} value={dr.id}>
                          {dr.name} ({dr.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Credit Rates */}
              <div className="space-y-4">
                <Label className="text-base">Credit to USD Conversion Rates</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      Compute
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.0001"
                        value={formState.compute_to_usd}
                        onChange={(e) => setFormState(s => ({ ...s, compute_to_usd: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Action
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.001"
                        value={formState.action_to_usd}
                        onChange={(e) => setFormState(s => ({ ...s, action_to_usd: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-500" />
                      Outcome
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formState.outcome_to_usd}
                        onChange={(e) => setFormState(s => ({ ...s, outcome_to_usd: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribution Splits */}
              <div className="space-y-4">
                <Label className="text-base">Attribution Splits</Label>
                <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Human Contributors
                      </Label>
                      <span className="font-mono text-sm">{formState.human_split}%</span>
                    </div>
                    <Slider
                      value={[formState.human_split]}
                      onValueChange={([v]) => setFormState(s => ({ 
                        ...s, 
                        human_split: v,
                        agent_split: Math.max(0, 100 - v - s.referrer_split)
                      }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm flex items-center gap-2">
                        <Bot className="h-4 w-4 text-purple-500" />
                        AI Agents
                      </Label>
                      <span className="font-mono text-sm">{formState.agent_split}%</span>
                    </div>
                    <Slider
                      value={[formState.agent_split]}
                      onValueChange={([v]) => setFormState(s => ({ 
                        ...s, 
                        agent_split: v,
                        human_split: Math.max(0, 100 - v - s.referrer_split)
                      }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm flex items-center gap-2">
                        <Percent className="h-4 w-4 text-amber-500" />
                        Referrers
                      </Label>
                      <span className="font-mono text-sm">{formState.referrer_split}%</span>
                    </div>
                    <Slider
                      value={[formState.referrer_split]}
                      onValueChange={([v]) => setFormState(s => ({ 
                        ...s, 
                        referrer_split: v,
                        human_split: Math.max(0, 100 - v - s.agent_split)
                      }))}
                      max={30}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Total: {formState.human_split + formState.agent_split + formState.referrer_split}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Payout Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Payout Threshold</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formState.min_payout_threshold}
                      onChange={(e) => setFormState(s => ({ ...s, min_payout_threshold: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payout Frequency</Label>
                  <Select value={formState.payout_frequency} onValueChange={(v) => setFormState(s => ({ ...s, payout_frequency: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => saveMutation.mutate({})}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Rule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Allocation Rules</TabsTrigger>
          <TabsTrigger value="flows">Credit Flows</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          {/* Rules List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rulesLoading ? (
              <div className="col-span-2 text-center py-12 text-muted-foreground">Loading rules...</div>
            ) : creditRules?.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <Settings2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Allocation Rules</h3>
                  <p className="text-muted-foreground mb-4">Create your first credit allocation rule to define how credits convert to payouts.</p>
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              creditRules?.map(rule => (
                <Card key={rule.id} className={cn(!rule.active && 'opacity-60')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{getDealRoomName(rule.deal_room_id)}</CardTitle>
                        <CardDescription>Credit allocation rule</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.active}
                          onCheckedChange={(active) => toggleMutation.mutate({ id: rule.id, active })}
                        />
                        <Badge variant={rule.active ? 'default' : 'secondary'}>
                          {rule.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Conversion Rates */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span className="font-mono">${rule.compute_to_usd}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="font-mono">${rule.action_to_usd}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Target className="h-4 w-4 text-emerald-500" />
                        <span className="font-mono">${rule.outcome_to_usd}</span>
                      </div>
                    </div>

                    {/* Attribution */}
                    {rule.attribution_rules && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{rule.attribution_rules.human_split}%</span>
                        <span className="text-muted-foreground">|</span>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <span>{rule.attribution_rules.agent_split}%</span>
                        <span className="text-muted-foreground">|</span>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span>{rule.attribution_rules.referrer_split}%</span>
                      </div>
                    )}

                    {/* Payout Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Min: ${rule.min_payout_threshold}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{rule.payout_frequency}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(rule)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="flows" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Flow Visualization</CardTitle>
              <CardDescription>How credits flow between entities in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flows.map((flow, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    {/* Source */}
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className={cn(
                        "p-2 rounded-full",
                        flow.source === 'user' ? 'bg-blue-500/20' : 
                        flow.source === 'agent' ? 'bg-purple-500/20' : 'bg-emerald-500/20'
                      )}>
                        {getEntityIcon(flow.source)}
                      </div>
                      <span className="font-medium capitalize">{flow.source}</span>
                    </div>

                    {/* Arrow with Credit Type */}
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <Badge className={getCreditTypeColor(flow.creditType)}>
                        {flow.creditType === 'compute' && <Cpu className="h-3 w-3 mr-1" />}
                        {flow.creditType === 'action' && <Zap className="h-3 w-3 mr-1" />}
                        {flow.creditType === 'outcome' && <Target className="h-3 w-3 mr-1" />}
                        {flow.percentage}%
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Target */}
                    <div className="flex items-center gap-2 min-w-[100px] justify-end">
                      <span className="font-medium capitalize">{flow.target}</span>
                      <div className={cn(
                        "p-2 rounded-full",
                        flow.target === 'user' ? 'bg-blue-500/20' : 
                        flow.target === 'agent' ? 'bg-purple-500/20' : 'bg-emerald-500/20'
                      )}>
                        {getEntityIcon(flow.target)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg border border-dashed bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  Credit flows are automatically calculated based on the active allocation rules and contribution events.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}