import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Scale,
  Coins,
  FileText,
  Settings,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Beaker,
  Lock,
  Unlock,
  History,
  UserPlus,
  Percent,
  DollarSign,
  Activity,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  Landmark,
} from 'lucide-react';
import { FinancialRailsTab } from './FinancialRailsTab';

interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'contributor' | 'advisor' | 'investor';
  avatar?: string;
  attribution_percent: number;
  credits_earned: number;
  joined_at: string;
  status: 'active' | 'pending' | 'inactive';
}

interface AttributionRule {
  id: string;
  name: string;
  description: string;
  credit_type: 'compute' | 'action' | 'outcome';
  weight: number;
  multiplier: number;
  conditions: string[];
}

interface CreditDistribution {
  participant_id: string;
  participant_name: string;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  total_credits: number;
  usd_value: number;
  percentage: number;
}

interface DealRoomDetailPageProps {
  dealRoomId?: string;
  onBack?: () => void;
}

export const DealRoomDetailPage: React.FC<DealRoomDetailPageProps> = ({
  dealRoomId = 'demo-deal-room',
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [selectedFormulation, setSelectedFormulation] = useState('v2');

  // Mock deal room data
  const dealRoom = {
    id: dealRoomId,
    name: 'AI SaaS Partnership Deal',
    description: 'Strategic partnership for AI-powered SaaS development with revenue sharing',
    status: 'active' as const,
    created_at: '2025-01-01',
    total_value: 250000,
    credits_distributed: 15420,
    formulation_locked: false,
    current_version: 'v2',
  };

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Alex Chen',
      email: 'alex@company.com',
      role: 'owner',
      attribution_percent: 40,
      credits_earned: 6168,
      joined_at: '2025-01-01',
      status: 'active',
    },
    {
      id: '2',
      name: 'Sarah Miller',
      email: 'sarah@partner.io',
      role: 'contributor',
      attribution_percent: 35,
      credits_earned: 5397,
      joined_at: '2025-01-03',
      status: 'active',
    },
    {
      id: '3',
      name: 'James Wilson',
      email: 'james@advisor.co',
      role: 'advisor',
      attribution_percent: 15,
      credits_earned: 2313,
      joined_at: '2025-01-05',
      status: 'active',
    },
    {
      id: '4',
      name: 'Lisa Park',
      email: 'lisa@investor.vc',
      role: 'investor',
      attribution_percent: 10,
      credits_earned: 1542,
      joined_at: '2025-01-10',
      status: 'pending',
    },
  ]);

  const attributionRules: AttributionRule[] = [
    {
      id: '1',
      name: 'Development Contribution',
      description: 'Credits for code commits and feature development',
      credit_type: 'action',
      weight: 1.5,
      multiplier: 1.2,
      conditions: ['commit_merged', 'feature_shipped'],
    },
    {
      id: '2',
      name: 'Sales Conversion',
      description: 'Credits for closed deals and revenue generation',
      credit_type: 'outcome',
      weight: 2.0,
      multiplier: 1.5,
      conditions: ['deal_closed', 'payment_received'],
    },
    {
      id: '3',
      name: 'AI Processing',
      description: 'Credits for AI model usage and compute resources',
      credit_type: 'compute',
      weight: 1.0,
      multiplier: 1.0,
      conditions: ['tokens_consumed', 'api_calls'],
    },
  ];

  const creditDistributions: CreditDistribution[] = participants.map((p) => ({
    participant_id: p.id,
    participant_name: p.name,
    compute_credits: Math.round(p.credits_earned * 0.3),
    action_credits: Math.round(p.credits_earned * 0.45),
    outcome_credits: Math.round(p.credits_earned * 0.25),
    total_credits: p.credits_earned,
    usd_value: p.credits_earned * 0.15,
    percentage: p.attribution_percent,
  }));

  const formulations = [
    { version: 'v1', status: 'archived', locked_at: '2025-01-05', changes: 3 },
    { version: 'v2', status: 'active', locked_at: null, changes: 2 },
    { version: 'v3', status: 'draft', locked_at: null, changes: 0 },
  ];

  const getRoleBadgeVariant = (role: Participant['role']) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'contributor':
        return 'secondary';
      case 'advisor':
        return 'outline';
      case 'investor':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: Participant['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCreditTypeColor = (type: AttributionRule['credit_type']) => {
    switch (type) {
      case 'compute':
        return 'text-blue-500 bg-blue-500/10';
      case 'action':
        return 'text-green-500 bg-green-500/10';
      case 'outcome':
        return 'text-amber-500 bg-amber-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{dealRoom.name}</h1>
                <Badge variant={dealRoom.status === 'active' ? 'default' : 'secondary'}>
                  {dealRoom.status}
                </Badge>
                {dealRoom.formulation_locked ? (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Unlock className="h-3 w-3" /> Unlocked
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{dealRoom.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${dealRoom.total_value.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Distributed</p>
                  <p className="text-2xl font-bold">{dealRoom.credits_distributed.toLocaleString()}</p>
                </div>
                <Coins className="h-8 w-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold">{participants.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attribution Rules</p>
                  <p className="text-2xl font-bold">{attributionRules.length}</p>
                </div>
                <Scale className="h-8 w-8 text-green-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="participants" className="gap-2">
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="attribution" className="gap-2">
              <Scale className="h-4 w-4" />
              Attribution
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-2">
              <Coins className="h-4 w-4" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <Landmark className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="formulations" className="gap-2">
              <Beaker className="h-4 w-4" />
              Formulations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attribution Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Attribution Summary
                  </CardTitle>
                  <CardDescription>Current credit distribution by participant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {participants.map((p) => (
                    <div key={p.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <span className="text-muted-foreground">{p.attribution_percent}%</span>
                      </div>
                      <Progress value={p.attribution_percent} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Credit Types Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Credit Types Breakdown
                  </CardTitle>
                  <CardDescription>Distribution across credit categories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Compute Credits</span>
                      </div>
                      <span className="font-medium">4,626</span>
                    </div>
                    <Progress value={30} className="h-2 [&>div]:bg-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Action Credits</span>
                      </div>
                      <span className="font-medium">6,939</span>
                    </div>
                    <Progress value={45} className="h-2 [&>div]:bg-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span>Outcome Credits</span>
                      </div>
                      <span className="font-medium">3,855</span>
                    </div>
                    <Progress value={25} className="h-2 [&>div]:bg-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest events in this deal room</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {[
                      { action: 'Sarah Miller earned 150 action credits', time: '2 hours ago', type: 'credit' },
                      { action: 'Attribution rule "Sales Conversion" triggered', time: '3 hours ago', type: 'rule' },
                      { action: 'Lisa Park invited to deal room', time: '1 day ago', type: 'participant' },
                      { action: 'Formulation v2 created', time: '2 days ago', type: 'formulation' },
                      { action: 'Alex Chen updated attribution weights', time: '3 days ago', type: 'settings' },
                    ].map((event, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm">{event.action}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Manage Participants</h2>
                <p className="text-sm text-muted-foreground">
                  Add, remove, or modify participant roles and attribution
                </p>
              </div>
              <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Participant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Participant</DialogTitle>
                    <DialogDescription>
                      Invite a new participant to this deal room
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input placeholder="participant@company.com" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contributor">Contributor</SelectItem>
                          <SelectItem value="advisor">Advisor</SelectItem>
                          <SelectItem value="investor">Investor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Initial Attribution %</Label>
                      <Slider defaultValue={[10]} max={100} step={1} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddParticipantOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddParticipantOpen(false)}>
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {participants.map((participant) => (
                <Card key={participant.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{participant.name}</h3>
                            {getStatusIcon(participant.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getRoleBadgeVariant(participant.role)}>
                              {participant.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Joined {new Date(participant.joined_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{participant.attribution_percent}%</p>
                          <p className="text-sm text-muted-foreground">Attribution</p>
                        </div>
                        <Separator orientation="vertical" className="h-12" />
                        <div className="text-right">
                          <p className="text-2xl font-bold">{participant.credits_earned.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Credits Earned</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Attribution Tab */}
          <TabsContent value="attribution" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Attribution Rules</h2>
                <p className="text-sm text-muted-foreground">
                  Define how contributions are measured and credited
                </p>
              </div>
              <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Attribution Rule</DialogTitle>
                    <DialogDescription>
                      Create a new rule for measuring contributions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Rule Name</Label>
                      <Input placeholder="e.g., Content Creation" />
                    </div>
                    <div className="space-y-2">
                      <Label>Credit Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compute">Compute</SelectItem>
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="outcome">Outcome</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (1.0 - 3.0)</Label>
                      <Slider defaultValue={[1.5]} min={1} max={3} step={0.1} />
                    </div>
                    <div className="space-y-2">
                      <Label>Multiplier</Label>
                      <Slider defaultValue={[1.0]} min={0.5} max={2} step={0.1} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddRuleOpen(false)}>
                      Create Rule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {attributionRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${getCreditTypeColor(rule.credit_type)}`}>
                          <Scale className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{rule.name}</h3>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{rule.credit_type}</Badge>
                            {rule.conditions.map((c, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xl font-bold">{rule.weight}x</p>
                          <p className="text-xs text-muted-foreground">Weight</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">{rule.multiplier}x</p>
                          <p className="text-xs text-muted-foreground">Multiplier</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Distribution</CardTitle>
                <CardDescription>
                  How credits are distributed across participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Participant</th>
                        <th className="text-right py-3 px-4">Compute</th>
                        <th className="text-right py-3 px-4">Action</th>
                        <th className="text-right py-3 px-4">Outcome</th>
                        <th className="text-right py-3 px-4">Total</th>
                        <th className="text-right py-3 px-4">USD Value</th>
                        <th className="text-right py-3 px-4">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditDistributions.map((dist) => (
                        <tr key={dist.participant_id} className="border-b">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{dist.participant_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{dist.participant_name}</span>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4 text-blue-500">
                            {dist.compute_credits.toLocaleString()}
                          </td>
                          <td className="text-right py-4 px-4 text-green-500">
                            {dist.action_credits.toLocaleString()}
                          </td>
                          <td className="text-right py-4 px-4 text-amber-500">
                            {dist.outcome_credits.toLocaleString()}
                          </td>
                          <td className="text-right py-4 px-4 font-semibold">
                            {dist.total_credits.toLocaleString()}
                          </td>
                          <td className="text-right py-4 px-4 font-medium">
                            ${dist.usd_value.toFixed(2)}
                          </td>
                          <td className="text-right py-4 px-4">
                            <Badge variant="outline">{dist.percentage}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50">
                        <td className="py-4 px-4 font-semibold">Total</td>
                        <td className="text-right py-4 px-4 font-semibold text-blue-500">4,626</td>
                        <td className="text-right py-4 px-4 font-semibold text-green-500">6,939</td>
                        <td className="text-right py-4 px-4 font-semibold text-amber-500">3,855</td>
                        <td className="text-right py-4 px-4 font-bold">15,420</td>
                        <td className="text-right py-4 px-4 font-bold">$2,313.00</td>
                        <td className="text-right py-4 px-4 font-semibold">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Rails Tab */}
          <TabsContent value="financial" className="space-y-6">
            <FinancialRailsTab 
              dealRoomId={dealRoomId} 
              dealRoomName={dealRoom.name} 
              isAdmin={true} 
            />
          </TabsContent>

          {/* Formulations Tab */}
          <TabsContent value="formulations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Formulation Versions</h2>
                <p className="text-sm text-muted-foreground">
                  Track and manage attribution rule versions
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Version
              </Button>
            </div>

            <div className="grid gap-4">
              {formulations.map((formulation) => (
                <Card
                  key={formulation.version}
                  className={formulation.version === selectedFormulation ? 'ring-2 ring-primary' : ''}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-muted">
                          <Beaker className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Formulation {formulation.version}</h3>
                            <Badge
                              variant={
                                formulation.status === 'active'
                                  ? 'default'
                                  : formulation.status === 'draft'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {formulation.status}
                            </Badge>
                            {formulation.locked_at && (
                              <Badge variant="outline" className="gap-1">
                                <Lock className="h-3 w-3" />
                                Locked {new Date(formulation.locked_at).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formulation.changes} pending changes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {formulation.status === 'draft' && (
                          <Button size="sm">
                            <Lock className="h-4 w-4 mr-2" />
                            Lock & Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DealRoomDetailPage;
