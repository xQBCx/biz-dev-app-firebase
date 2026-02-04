import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Briefcase, 
  TrendingUp, 
  Building2,
  Users,
  Clock,
  DollarSign,
  Plus,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLifecycleTranslation } from '@/hooks/useArchetypeTranslation';

interface XEventLifecycleIntegrationProps {
  eventId: string;
  eventName: string;
  participants: Array<{
    id: string;
    user_id?: string;
    email: string;
    name?: string;
    role?: string;
  }>;
}

export function XEventLifecycleIntegration({ 
  eventId, 
  eventName, 
  participants 
}: XEventLifecycleIntegrationProps) {
  const { user } = useAuth();
  const { TL, tl } = useLifecycleTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreating, setIsCreating] = useState(false);

  // EROS Incident creation
  const [erosDialogOpen, setErosDialogOpen] = useState(false);
  const [erosForm, setErosForm] = useState({
    title: '',
    type: 'natural_disaster',
    severity: 'medium',
    description: '',
  });

  // Workforce Engagement creation
  const [workforceDialogOpen, setWorkforceDialogOpen] = useState(false);
  const [workforceForm, setWorkforceForm] = useState({
    title: '',
    type: 'project',
    rate: '',
    description: '',
  });

  // Capital Opportunity creation
  const [capitalDialogOpen, setCapitalDialogOpen] = useState(false);
  const [capitalForm, setCapitalForm] = useState({
    name: '',
    targetAmount: '',
    description: '',
  });

  const handleCreateErosIncident = async () => {
    if (!user?.id || !erosForm.title) return;
    setIsCreating(true);
    
    try {
      // Use correct field names from eros_incidents table
      const { error } = await supabase.from('eros_incidents').insert([{
        title: erosForm.title,
        incident_type: erosForm.type as 'natural_disaster' | 'medical' | 'infrastructure' | 'security' | 'community' | 'environmental' | 'industrial',
        severity: erosForm.severity as 'low' | 'medium' | 'high' | 'critical',
        description: `Event: ${eventName}\n\n${erosForm.description}`,
        user_id: user.id,
        status: 'active' as const,
        metadata: { source_event_id: eventId },
      }]);

      if (error) throw error;
      
      toast.success(`${TL('incidents')} created from event`);
      setErosDialogOpen(false);
      setErosForm({ title: '', type: 'natural_disaster', severity: 'medium', description: '' });
    } catch (err) {
      console.error('Error creating incident:', err);
      toast.error('Failed to create incident');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateWorkforceEngagement = async () => {
    if (!user?.id || !workforceForm.title) return;
    setIsCreating(true);
    
    try {
      // Use correct field names from workforce_engagements table
      const { error } = await supabase.from('workforce_engagements').insert([{
        user_id: user.id,
        title: workforceForm.title,
        engagement_type: workforceForm.type,
        hourly_rate: workforceForm.rate ? parseInt(workforceForm.rate) * 100 : null,
        description: `Event: ${eventName}\n\n${workforceForm.description}`,
        status: 'active',
        start_date: new Date().toISOString(),
      }]);

      if (error) throw error;
      
      toast.success(`${TL('engagements')} created from event`);
      setWorkforceDialogOpen(false);
      setWorkforceForm({ title: '', type: 'project', rate: '', description: '' });
    } catch (err) {
      console.error('Error creating engagement:', err);
      toast.error('Failed to create engagement');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateCapitalOpportunity = async () => {
    if (!user?.id || !capitalForm.name) return;
    setIsCreating(true);
    
    try {
      // Use correct field names from capital_investments table
      const { error } = await supabase.from('capital_investments').insert([{
        user_id: user.id,
        investment_type: 'opportunity',
        amount: capitalForm.targetAmount ? parseInt(capitalForm.targetAmount) * 100 : 0,
        notes: `${capitalForm.name}\nEvent: ${eventName}\n\n${capitalForm.description}`,
        transaction_date: new Date().toISOString(),
      }]);

      if (error) throw error;
      
      toast.success('Capital opportunity created from event');
      setCapitalDialogOpen(false);
      setCapitalForm({ name: '', targetAmount: '', description: '' });
    } catch (err) {
      console.error('Error creating capital opportunity:', err);
      toast.error('Failed to create capital opportunity');
    } finally {
      setIsCreating(false);
    }
  };

  const lifecyclePhases = [
    { 
      key: 'eros', 
      label: TL('incidents'), 
      icon: AlertTriangle, 
      color: 'text-red-500',
      description: 'Spawn emergency response or crisis coordination from event',
      action: () => setErosDialogOpen(true),
    },
    { 
      key: 'workforce', 
      label: TL('engagements'), 
      icon: Briefcase, 
      color: 'text-blue-500',
      description: 'Create workforce engagements or opportunities from attendees',
      action: () => setWorkforceDialogOpen(true),
    },
    { 
      key: 'trading', 
      label: TL('trades'), 
      icon: TrendingUp, 
      color: 'text-green-500',
      description: 'Enable trading command training for event participants',
      action: () => toast.info('Trading Command integration coming soon'),
    },
    { 
      key: 'capital', 
      label: TL('capital_investments'), 
      icon: Building2, 
      color: 'text-purple-500',
      description: 'Spawn capital formation opportunities from event network',
      action: () => setCapitalDialogOpen(true),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Lifecycle Integration
        </CardTitle>
        <CardDescription>
          Transform event connections into business infrastructure across EROS, Workforce, Trading, and Capital modules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="spawn">Spawn Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Lifecycle Flow Visualization */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg overflow-x-auto">
              {lifecyclePhases.map((phase, idx) => (
                <div key={phase.key} className="flex items-center">
                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
                    <div className={`p-2 rounded-full bg-background border ${phase.color}`}>
                      <phase.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-center">{phase.label}</span>
                  </div>
                  {idx < lifecyclePhases.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Participant Summary */}
            <Card className="bg-muted/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{participants.length} Event Participants</span>
                  </div>
                  <Badge variant="outline">Ready for Integration</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spawn" className="space-y-3">
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {lifecyclePhases.map((phase) => (
                  <Card 
                    key={phase.key} 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={phase.action}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full bg-muted ${phase.color}`}>
                          <phase.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Spawn {phase.label}</h4>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* EROS Dialog */}
        <Dialog open={erosDialogOpen} onOpenChange={setErosDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Create {TL('incidents')} from Event
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input 
                  value={erosForm.title}
                  onChange={(e) => setErosForm({ ...erosForm, title: e.target.value })}
                  placeholder={`${TL('incidents')} title...`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={erosForm.type} onValueChange={(v) => setErosForm({ ...erosForm, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={erosForm.severity} onValueChange={(v) => setErosForm({ ...erosForm, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={erosForm.description}
                  onChange={(e) => setErosForm({ ...erosForm, description: e.target.value })}
                  placeholder="Details about the situation..."
                />
              </div>
              <Button onClick={handleCreateErosIncident} disabled={isCreating} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create {TL('incidents')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Workforce Dialog */}
        <Dialog open={workforceDialogOpen} onOpenChange={setWorkforceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Create {TL('engagements')} from Event
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input 
                  value={workforceForm.title}
                  onChange={(e) => setWorkforceForm({ ...workforceForm, title: e.target.value })}
                  placeholder="Engagement title..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={workforceForm.type} onValueChange={(v) => setWorkforceForm({ ...workforceForm, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="retainer">Retainer</SelectItem>
                      <SelectItem value="equity_swap">Equity Swap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rate ($)</Label>
                  <Input 
                    type="number"
                    value={workforceForm.rate}
                    onChange={(e) => setWorkforceForm({ ...workforceForm, rate: e.target.value })}
                    placeholder="Hourly/project rate"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={workforceForm.description}
                  onChange={(e) => setWorkforceForm({ ...workforceForm, description: e.target.value })}
                  placeholder="Engagement scope and details..."
                />
              </div>
              <Button onClick={handleCreateWorkforceEngagement} disabled={isCreating} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create {TL('engagements')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Capital Dialog */}
        <Dialog open={capitalDialogOpen} onOpenChange={setCapitalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-500" />
                Create Capital Opportunity from Event
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Opportunity Name</Label>
                <Input 
                  value={capitalForm.name}
                  onChange={(e) => setCapitalForm({ ...capitalForm, name: e.target.value })}
                  placeholder="Investment opportunity name..."
                />
              </div>
              <div>
                <Label>Target Amount ($)</Label>
                <Input 
                  type="number"
                  value={capitalForm.targetAmount}
                  onChange={(e) => setCapitalForm({ ...capitalForm, targetAmount: e.target.value })}
                  placeholder="Target investment amount"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={capitalForm.description}
                  onChange={(e) => setCapitalForm({ ...capitalForm, description: e.target.value })}
                  placeholder="Investment thesis and opportunity details..."
                />
              </div>
              <Button onClick={handleCreateCapitalOpportunity} disabled={isCreating} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Capital Opportunity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
