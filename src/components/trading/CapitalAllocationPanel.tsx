import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  PiggyBank, Building2, Users, Landmark, ArrowRightLeft, 
  TrendingUp, Plus, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { 
  useCapitalAllocations, 
  useCreateCapitalAllocation,
  CapitalAllocation,
  CapitalAllocationType,
  TradingProfile
} from '@/hooks/useTradingCommand';
import { useArchetypeTranslation } from '@/contexts/ArchetypeContext';

interface CapitalAllocationPanelProps {
  profile: TradingProfile;
  availableCapital: number;
}

const allocationTypeConfig: Record<CapitalAllocationType, {
  label: string;
  militaryLabel: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}> = {
  reinvest: {
    label: 'Reinvest in Trading',
    militaryLabel: 'Reinforce Capital Position',
    icon: <ArrowRightLeft className="h-4 w-4" />,
    description: 'Increase your trading capital for larger positions',
    color: 'bg-blue-500',
  },
  long_term_hold: {
    label: 'Long-Term Investment',
    militaryLabel: 'Strategic Reserve',
    icon: <PiggyBank className="h-4 w-4" />,
    description: 'Move profits into long-term holdings',
    color: 'bg-green-500',
  },
  ecosystem_company: {
    label: 'Ecosystem Company',
    militaryLabel: 'Allied Asset Acquisition',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Invest in companies within the platform',
    color: 'bg-purple-500',
  },
  co_investment: {
    label: 'Co-Investment Pool',
    militaryLabel: 'Joint Operations Fund',
    icon: <Users className="h-4 w-4" />,
    description: 'Pool capital with other operators',
    color: 'bg-orange-500',
  },
  company_formation: {
    label: 'Company Formation',
    militaryLabel: 'Forward Operating Base',
    icon: <Landmark className="h-4 w-4" />,
    description: 'Fund the creation of new ventures',
    color: 'bg-cyan-500',
  },
  withdrawal: {
    label: 'Withdrawal',
    militaryLabel: 'Extract to Personal',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Transfer to personal accounts',
    color: 'bg-slate-500',
  },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending Review', icon: <Clock className="h-3 w-3" />, color: 'bg-yellow-500' },
  approved: { label: 'Approved', icon: <CheckCircle className="h-3 w-3" />, color: 'bg-green-500' },
  executed: { label: 'Executed', icon: <CheckCircle className="h-3 w-3" />, color: 'bg-blue-500' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="h-3 w-3" />, color: 'bg-red-500' },
};

export function CapitalAllocationPanel({ profile, availableCapital }: CapitalAllocationPanelProps) {
  const { archetype } = useArchetypeTranslation();
  const isMilitary = archetype?.slug === 'service_professional';
  
  const { data: allocations, isLoading } = useCapitalAllocations();
  const createAllocation = useCreateCapitalAllocation();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allocationType, setAllocationType] = useState<CapitalAllocationType>('reinvest');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const totalAllocated = allocations
    ?.filter(a => a.status === 'pending' || a.status === 'approved')
    .reduce((sum, a) => sum + a.amount, 0) || 0;

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (numAmount > availableCapital) return;

    await createAllocation.mutateAsync({
      allocation_type: allocationType,
      amount: numAmount,
      notes: notes || undefined,
    });

    setIsDialogOpen(false);
    setAmount('');
    setNotes('');
    setAllocationType('reinvest');
  };

  const getLabel = (type: CapitalAllocationType) => {
    const config = allocationTypeConfig[type];
    return isMilitary ? config.militaryLabel : config.label;
  };

  return (
    <div className="space-y-6">
      {/* Capital Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                {isMilitary ? 'Capital Operations Command' : 'Capital Allocation'}
              </CardTitle>
              <CardDescription>
                {isMilitary 
                  ? 'Route profits to strategic objectives' 
                  : 'Manage where your trading profits flow'}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isMilitary ? 'New Allocation Order' : 'Allocate Capital'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {isMilitary ? 'Capital Allocation Order' : 'Allocate Capital'}
                  </DialogTitle>
                  <DialogDescription>
                    {isMilitary 
                      ? 'Direct capital to strategic positions. All allocations require command approval.' 
                      : 'Choose where to direct your trading profits.'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{isMilitary ? 'Allocation Type' : 'Destination'}</Label>
                    <Select value={allocationType} onValueChange={(v) => setAllocationType(v as CapitalAllocationType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(allocationTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {config.icon}
                              <span>{isMilitary ? config.militaryLabel : config.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {allocationTypeConfig[allocationType].description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{isMilitary ? 'Capital Amount' : 'Amount'}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                        max={availableCapital}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available: ${availableCapital.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{isMilitary ? 'Mission Notes' : 'Notes'} (Optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isMilitary ? 'Strategic rationale...' : 'Add notes about this allocation...'}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableCapital || createAllocation.isPending}
                  >
                    {createAllocation.isPending 
                      ? 'Processing...' 
                      : isMilitary ? 'Submit Order' : 'Submit Allocation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isMilitary ? 'Available for Deployment' : 'Available Capital'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${availableCapital.toLocaleString()}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isMilitary ? 'Pending Orders' : 'Pending Allocations'}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                ${totalAllocated.toLocaleString()}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isMilitary ? 'Total Deployed' : 'Total Allocated'}
              </p>
              <p className="text-2xl font-bold">
                ${(allocations?.filter(a => a.status === 'executed').reduce((sum, a) => sum + a.amount, 0) || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(allocationTypeConfig).map(([key, config]) => {
          const typeAllocations = allocations?.filter(a => a.allocation_type === key) || [];
          const totalForType = typeAllocations.reduce((sum, a) => sum + a.amount, 0);
          
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    {config.icon}
                  </div>
                  <Badge variant="outline">
                    {typeAllocations.length} {isMilitary ? 'orders' : 'allocations'}
                  </Badge>
                </div>
                <h4 className="font-medium mb-1">
                  {isMilitary ? config.militaryLabel : config.label}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {config.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ${totalForType.toLocaleString()}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setAllocationType(key as CapitalAllocationType);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Allocations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isMilitary ? 'Recent Orders' : 'Recent Allocations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !allocations || allocations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {isMilitary 
                ? 'No capital orders issued yet. Begin directing profits to strategic objectives.' 
                : 'No allocations yet. Start directing your trading profits.'}
            </p>
          ) : (
            <div className="space-y-3">
              {allocations.slice(0, 10).map((allocation) => {
                const typeConfig = allocationTypeConfig[allocation.allocation_type as CapitalAllocationType];
                const status = statusConfig[allocation.status];
                
                return (
                  <div key={allocation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeConfig.color} text-white`}>
                        {typeConfig.icon}
                      </div>
                      <div>
                        <p className="font-medium">
                          {isMilitary ? typeConfig.militaryLabel : typeConfig.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(allocation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${allocation.amount.toLocaleString()}</p>
                      <Badge variant="secondary" className={`${status.color} text-white`}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
