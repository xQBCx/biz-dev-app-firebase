import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Rocket, 
  Zap, 
  Database,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Settings,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

interface ChainState {
  id: string;
  chain_id: string;
  chain_name: string;
  current_block_number: number;
  total_supply: number;
  circulating_supply: number;
  total_staked: number;
  total_validators: number;
  active_validators: number;
  total_transactions: number;
  genesis_timestamp: string | null;
}

export function XodiakChainAdmin() {
  const { hasRole } = useUserRole();
  const [chainState, setChainState] = useState<ChainState | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  const isAdmin = hasRole('admin');

  const fetchChainState = async () => {
    try {
      setLoading(true);
      
      const { data: state } = await supabase
        .from('xodiak_chain_state')
        .select('*')
        .single();

      setChainState(state as ChainState | null);
    } catch (error) {
      console.log('Chain not initialized yet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChainState();
  }, []);

  const initializeChain = async () => {
    try {
      setInitializing(true);

      const { data, error } = await supabase.functions.invoke('xodiak-chain-core', {
        body: { action: 'initialize-chain' }
      });

      if (error) throw error;

      toast.success('XDK Chain initialized successfully!');
      fetchChainState();
    } catch (error: any) {
      console.error('Error initializing chain:', error);
      toast.error(error.message || 'Failed to initialize chain');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chainState) {
    return (
      <div className="space-y-6">
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Chain Not Initialized</AlertTitle>
          <AlertDescription>
            The XDK Chain has not been initialized yet. Initialize it to create the genesis block and treasury.
          </AlertDescription>
        </Alert>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Rocket className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-2">Launch XDK Chain</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Initialize the blockchain with the genesis block, treasury account, and chain parameters.
              This action can only be performed once.
            </p>
            {isAdmin ? (
              <Button size="lg" onClick={initializeChain} disabled={initializing}>
                {initializing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Initializing Chain...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Initialize XDK Chain
                  </>
                )}
              </Button>
            ) : (
              <Badge variant="secondary">Admin access required</Badge>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle>Chain Active</AlertTitle>
        <AlertDescription>
          XDK Chain is running. Genesis block created at {chainState.genesis_timestamp ? new Date(chainState.genesis_timestamp).toLocaleString() : 'Unknown'}.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chain ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-mono">{chainState.chain_id}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Block</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{chainState.current_block_number}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {parseFloat(chainState.total_supply.toString()).toLocaleString()} XDK
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Circulating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-500">
              {parseFloat(chainState.circulating_supply.toString()).toLocaleString()} XDK
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Chain Configuration
              </CardTitle>
              <CardDescription>Current chain parameters and settings</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchChainState}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain Name</span>
                <span className="font-medium">{chainState.chain_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Transactions</span>
                <span className="font-medium">{chainState.total_transactions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Staked</span>
                <span className="font-medium">{parseFloat(chainState.total_staked.toString()).toLocaleString()} XDK</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Validators</span>
                <span className="font-medium">{chainState.total_validators}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Validators</span>
                <span className="font-medium text-green-500">{chainState.active_validators}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Genesis Time</span>
                <span className="font-medium">
                  {chainState.genesis_timestamp ? new Date(chainState.genesis_timestamp).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
