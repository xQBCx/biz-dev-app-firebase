import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePortfolioSummary, useCreateEquityStake, useCreateCapitalInvestment, useCreateOwnershipEvent } from "@/hooks/useCapitalFormation";
import { useAuth } from "@/hooks/useAuth";
import { Building2, TrendingUp, DollarSign, PieChart, Plus, ArrowUpRight, ArrowDownRight, Calendar, Wallet } from "lucide-react";
import { format } from "date-fns";

export default function CapitalFormation() {
  const { user } = useAuth();
  const portfolio = usePortfolioSummary();
  const createStake = useCreateEquityStake();
  const createInvestment = useCreateCapitalInvestment();
  const createEvent = useCreateOwnershipEvent();

  const [showNewStakeDialog, setShowNewStakeDialog] = useState(false);
  const [newStake, setNewStake] = useState({
    entity_type: "spawned_business",
    entity_id: "",
    entity_name: "",
    stake_type: "equity",
    ownership_percentage: "",
    acquisition_cost: "",
    current_valuation: "",
  });

  const handleCreateStake = async () => {
    await createStake.mutateAsync({
      entity_type: newStake.entity_type,
      entity_id: newStake.entity_id || crypto.randomUUID(),
      entity_name: newStake.entity_name,
      stake_type: newStake.stake_type,
      ownership_percentage: newStake.ownership_percentage ? parseFloat(newStake.ownership_percentage) : undefined,
      acquisition_cost: newStake.acquisition_cost ? parseFloat(newStake.acquisition_cost) : undefined,
      current_valuation: newStake.current_valuation ? parseFloat(newStake.current_valuation) : undefined,
      acquisition_date: new Date().toISOString().split('T')[0],
    });
    setShowNewStakeDialog(false);
    setNewStake({
      entity_type: "spawned_business",
      entity_id: "",
      entity_name: "",
      stake_type: "equity",
      ownership_percentage: "",
      acquisition_cost: "",
      current_valuation: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "vesting": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "fully_vested": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "exited": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please sign in to view your capital formation dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Capital Formation & Ownership</h1>
          <p className="text-muted-foreground">
            Track your equity stakes, investments, and ownership events
          </p>
        </div>
        <Dialog open={showNewStakeDialog} onOpenChange={setShowNewStakeDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Equity Stake
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Equity Stake</DialogTitle>
              <DialogDescription>
                Record a new equity position in your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Entity Name</Label>
                <Input 
                  placeholder="Company or entity name"
                  value={newStake.entity_name}
                  onChange={(e) => setNewStake({ ...newStake, entity_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Entity Type</Label>
                  <Select 
                    value={newStake.entity_type}
                    onValueChange={(v) => setNewStake({ ...newStake, entity_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spawned_business">Spawned Business</SelectItem>
                      <SelectItem value="external_company">External Company</SelectItem>
                      <SelectItem value="deal_room">Deal Room</SelectItem>
                      <SelectItem value="fund">Fund</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Stake Type</Label>
                  <Select 
                    value={newStake.stake_type}
                    onValueChange={(v) => setNewStake({ ...newStake, stake_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="options">Options</SelectItem>
                      <SelectItem value="warrants">Warrants</SelectItem>
                      <SelectItem value="convertible">Convertible Note</SelectItem>
                      <SelectItem value="profit_share">Profit Share</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ownership %</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 10"
                    value={newStake.ownership_percentage}
                    onChange={(e) => setNewStake({ ...newStake, ownership_percentage: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Acquisition Cost ($)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 50000"
                    value={newStake.acquisition_cost}
                    onChange={(e) => setNewStake({ ...newStake, acquisition_cost: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Current Valuation ($)</Label>
                <Input 
                  type="number"
                  placeholder="e.g., 75000"
                  value={newStake.current_valuation}
                  onChange={(e) => setNewStake({ ...newStake, current_valuation: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewStakeDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateStake}
                disabled={!newStake.entity_name || createStake.isPending}
              >
                {createStake.isPending ? "Adding..." : "Add Stake"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.totalPositions}</div>
            <p className="text-xs text-muted-foreground">
              {portfolio.activePositions} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              Across all positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalCurrentValue)}</div>
            <div className="flex items-center text-xs">
              {portfolio.unrealizedGain >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={portfolio.unrealizedGain >= 0 ? "text-green-600" : "text-red-600"}>
                {formatCurrency(Math.abs(portfolio.unrealizedGain))} ({portfolio.returnPercentage.toFixed(1)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dividends Received</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalDividends)}</div>
            <p className="text-xs text-muted-foreground">
              Total distributions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="stakes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stakes">Equity Stakes</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="events">Ownership Events</TabsTrigger>
        </TabsList>

        <TabsContent value="stakes" className="space-y-4">
          {!portfolio.stakes || portfolio.stakes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Equity Stakes Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your portfolio by adding your first equity stake
                </p>
                <Button onClick={() => setShowNewStakeDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Stake
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {portfolio.stakes.map((stake) => (
                <Card key={stake.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{stake.entity_name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span className="capitalize">{stake.entity_type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className="capitalize">{stake.stake_type}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(stake.status)}>
                        {stake.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Ownership</p>
                        <p className="text-lg font-semibold">
                          {stake.ownership_percentage ? `${stake.ownership_percentage}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost Basis</p>
                        <p className="text-lg font-semibold">
                          {stake.acquisition_cost ? formatCurrency(stake.acquisition_cost) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className="text-lg font-semibold">
                          {stake.current_valuation ? formatCurrency(stake.current_valuation) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unrealized Gain</p>
                        {stake.acquisition_cost && stake.current_valuation ? (
                          <p className={`text-lg font-semibold flex items-center ${
                            stake.current_valuation >= stake.acquisition_cost ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stake.current_valuation >= stake.acquisition_cost ? (
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                            )}
                            {formatCurrency(Math.abs(stake.current_valuation - stake.acquisition_cost))}
                          </p>
                        ) : (
                          <p className="text-lg font-semibold text-muted-foreground">N/A</p>
                        )}
                      </div>
                    </div>
                    {stake.vesting_schedule && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Vesting Progress</span>
                          <span className="text-sm font-medium">
                            {stake.vesting_schedule.vested_percentage || 0}%
                          </span>
                        </div>
                        <Progress value={stake.vesting_schedule.vested_percentage || 0} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          {!portfolio.investments || portfolio.investments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Investments Recorded</h3>
                <p className="text-muted-foreground">
                  Investment transactions will appear here as you fund your positions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {portfolio.investments.map((investment) => (
                <Card key={investment.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{investment.investment_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(investment.transaction_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(investment.amount)}</p>
                        {investment.shares_acquired && (
                          <p className="text-sm text-muted-foreground">
                            {investment.shares_acquired} shares @ {formatCurrency(investment.share_price || 0)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {!portfolio.events || portfolio.events.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Ownership Events</h3>
                <p className="text-muted-foreground">
                  Dividends, distributions, and other events will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {portfolio.events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          event.event_type === 'dividend' ? 'bg-green-500/10' :
                          event.event_type === 'exit' ? 'bg-blue-500/10' : 'bg-muted'
                        }`}>
                          <DollarSign className={`h-4 w-4 ${
                            event.event_type === 'dividend' ? 'text-green-600' :
                            event.event_type === 'exit' ? 'text-blue-600' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{event.event_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.event_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {event.amount && (
                          <p className="font-semibold text-green-600">+{formatCurrency(event.amount)}</p>
                        )}
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
