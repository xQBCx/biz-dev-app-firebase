import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Cpu, 
  TrendingUp, 
  Activity,
  Loader2,
  Play,
  Pause,
  Settings,
  Award,
  Users,
  Blocks
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Validator {
  id: string;
  address: string;
  name: string | null;
  stake_amount: number;
  status: string;
  uptime_percentage: number;
  blocks_produced: number;
  rewards_earned: number;
  commission_rate: number;
  user_id: string | null;
  registered_at: string;
  last_active_at: string;
}

interface ChainState {
  total_validators: number;
  active_validators: number;
  total_staked: number;
  current_block_number: number;
  min_stake_amount: number;
}

export function XodiakValidatorConsole() {
  const { user } = useAuth();
  const [validators, setValidators] = useState<Validator[]>([]);
  const [myValidator, setMyValidator] = useState<Validator | null>(null);
  const [chainState, setChainState] = useState<ChainState | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  // Registration form
  const [validatorName, setValidatorName] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [userAccounts, setUserAccounts] = useState<{ address: string; balance: number }[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch chain state
      const { data: statsData } = await supabase.functions.invoke('xodiak-chain-core', {
        body: { action: 'status' }
      });

      if (statsData?.chain) {
        setChainState(statsData.chain);
      }

      // Fetch all validators
      const { data: validatorsData } = await supabase
        .from('xodiak_validators')
        .select('*')
        .order('stake_amount', { ascending: false });

      setValidators(validatorsData as Validator[] || []);

      // Find user's validator
      if (user) {
        const userValidator = (validatorsData as Validator[] || []).find(v => v.user_id === user.id);
        setMyValidator(userValidator || null);

        // Fetch user's accounts for registration
        const { data: accounts } = await supabase
          .from('xodiak_accounts')
          .select('address, balance')
          .eq('user_id', user.id);

        setUserAccounts(accounts as { address: string; balance: number }[] || []);
        if (accounts && accounts.length > 0 && !selectedAddress) {
          setSelectedAddress(accounts[0].address);
        }
      }
    } catch (error) {
      console.error('Error fetching validator data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const registerValidator = async () => {
    if (!selectedAddress || !stakeAmount) {
      toast.error('Please select an account and enter stake amount');
      return;
    }

    const stake = parseFloat(stakeAmount);
    if (isNaN(stake) || stake < (chainState?.min_stake_amount || 10000)) {
      toast.error(`Minimum stake is ${chainState?.min_stake_amount?.toLocaleString() || 10000} XDK`);
      return;
    }

    try {
      setRegistering(true);

      const { data, error } = await supabase.functions.invoke('xodiak-chain-core', {
        body: {
          action: 'register-validator',
          address: selectedAddress,
          name: validatorName || `Validator ${selectedAddress.slice(0, 8)}`,
          stakeAmount: stake,
          userId: user?.id
        }
      });

      if (error) throw error;

      toast.success('Successfully registered as validator!');
      setValidatorName("");
      setStakeAmount("");
      fetchData();
    } catch (error: any) {
      console.error('Error registering validator:', error);
      toast.error(error.message || 'Failed to register validator');
    } finally {
      setRegistering(false);
    }
  };

  const createBlock = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('xodiak-chain-core', {
        body: { action: 'create-block' }
      });

      if (error) throw error;

      if (data.transactionsProcessed > 0) {
        toast.success(`Block created with ${data.transactionsProcessed} transactions!`);
      } else {
        toast.info('No pending transactions to process');
      }
      fetchData();
    } catch (error: any) {
      console.error('Error creating block:', error);
      toast.error(error.message || 'Failed to create block');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'jailed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Validators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chainState?.total_validators || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Validators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{chainState?.active_validators || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(chainState?.total_staked?.toString() || '0').toLocaleString()} XDK
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Min Stake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(chainState?.min_stake_amount?.toString() || '10000').toLocaleString()} XDK
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Validator Status */}
      {myValidator ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{myValidator.name || 'My Validator'}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(myValidator.status)}>
                      {myValidator.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Uptime: {myValidator.uptime_percentage}%
                    </span>
                  </div>
                </div>
              </div>
              <Button onClick={createBlock} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Produce Block
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <div className="text-sm text-muted-foreground">Staked Amount</div>
                <div className="text-2xl font-bold">
                  {parseFloat(myValidator.stake_amount.toString()).toLocaleString()} XDK
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Blocks Produced</div>
                <div className="text-2xl font-bold">{myValidator.blocks_produced}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rewards Earned</div>
                <div className="text-2xl font-bold text-green-500">
                  {parseFloat(myValidator.rewards_earned.toString()).toLocaleString()} XDK
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Commission Rate</div>
                <div className="text-2xl font-bold">{myValidator.commission_rate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Become a Validator
            </CardTitle>
            <CardDescription>
              Stake XDK tokens to become a validator and earn block rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userAccounts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  You need an XDK account with sufficient balance to become a validator.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/xodiak/wallet'}>
                  Go to Wallet
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Select Account</Label>
                  <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {userAccounts.map((account) => (
                      <option key={account.address} value={account.address}>
                        {account.address.slice(0, 12)}... ({parseFloat(account.balance.toString()).toLocaleString()} XDK)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Validator Name (optional)</Label>
                  <Input
                    placeholder="My Validator"
                    value={validatorName}
                    onChange={(e) => setValidatorName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stake Amount (XDK)</Label>
                  <Input
                    type="number"
                    placeholder={`Min: ${chainState?.min_stake_amount?.toLocaleString() || 10000}`}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={registerValidator} 
                  disabled={registering}
                >
                  {registering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Register as Validator
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Validators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Validator Set
          </CardTitle>
          <CardDescription>All registered validators on XDK Chain</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {validators.map((validator, index) => (
                <div key={validator.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{validator.name || 'Anonymous Validator'}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {validator.address.slice(0, 16)}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-medium">
                        {parseFloat(validator.stake_amount.toString()).toLocaleString()} XDK
                      </div>
                      <div className="text-xs text-muted-foreground">Staked</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{validator.blocks_produced}</div>
                      <div className="text-xs text-muted-foreground">Blocks</div>
                    </div>
                    <div className="text-right">
                      <Progress value={validator.uptime_percentage} className="w-16 h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {validator.uptime_percentage}% uptime
                      </div>
                    </div>
                    <Badge className={getStatusColor(validator.status)}>
                      {validator.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {validators.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No validators registered yet. Be the first!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
