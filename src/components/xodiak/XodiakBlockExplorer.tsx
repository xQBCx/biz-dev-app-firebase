import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Box, 
  ArrowRightLeft, 
  Search, 
  Clock, 
  Hash, 
  Layers, 
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Block {
  id: string;
  block_number: number;
  block_hash: string;
  previous_hash: string;
  merkle_root: string;
  state_root: string;
  timestamp: string;
  transaction_count: number;
  gas_used: number;
  xodiak_validators?: { name: string; address: string } | null;
}

interface Transaction {
  id: string;
  tx_hash: string;
  from_address: string;
  to_address: string | null;
  amount: number;
  tx_type: string;
  status: string;
  gas_used: number | null;
  created_at: string;
  confirmed_at: string | null;
  block_number: number | null;
}

interface ChainStats {
  chain: {
    chain_id: string;
    chain_name: string;
    current_block_number: number;
    total_supply: number;
    circulating_supply: number;
    total_staked: number;
    total_validators: number;
    active_validators: number;
    total_transactions: number;
  } | null;
  latestBlock: Block | null;
  pendingTransactions: number;
}

export function XodiakBlockExplorer() {
  const [activeTab, setActiveTab] = useState("blocks");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chainStats, setChainStats] = useState<ChainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [blockTransactions, setBlockTransactions] = useState<Transaction[]>([]);

  const fetchChainData = async () => {
    try {
      setLoading(true);
      
      // Fetch chain stats
      const { data: statsResponse } = await supabase.functions.invoke('xodiak-chain-core', {
        method: 'POST',
        body: { action: 'status' }
      });

      // Fetch blocks directly from DB for realtime
      const { data: blocksData } = await supabase
        .from('xodiak_blocks')
        .select('*, xodiak_validators(name, address)')
        .order('block_number', { ascending: false })
        .limit(20);

      // Fetch transactions
      const { data: txData } = await supabase
        .from('xodiak_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (statsResponse) setChainStats(statsResponse);
      if (blocksData) setBlocks(blocksData as Block[]);
      if (txData) setTransactions(txData as Transaction[]);
    } catch (error) {
      console.error('Error fetching chain data:', error);
      toast.error('Failed to fetch chain data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChainData();

    // Subscribe to realtime updates
    const blocksChannel = supabase
      .channel('xdk-blocks')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'xodiak_blocks' }, (payload) => {
        setBlocks(prev => [payload.new as Block, ...prev].slice(0, 20));
        toast.success(`New block #${(payload.new as Block).block_number} created`);
      })
      .subscribe();

    const txChannel = supabase
      .channel('xdk-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'xodiak_transactions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTransactions(prev => [payload.new as Transaction, ...prev].slice(0, 50));
        } else if (payload.eventType === 'UPDATE') {
          setTransactions(prev => 
            prev.map(tx => tx.id === (payload.new as Transaction).id ? payload.new as Transaction : tx)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(blocksChannel);
      supabase.removeChannel(txChannel);
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;

    // Check if it's a block number
    if (/^\d+$/.test(searchQuery)) {
      const block = blocks.find(b => b.block_number === parseInt(searchQuery));
      if (block) {
        setSelectedBlock(block);
        setActiveTab("block-detail");
        return;
      }
    }

    // Check if it's a hash
    if (searchQuery.startsWith('0x')) {
      const block = blocks.find(b => b.block_hash === searchQuery);
      if (block) {
        setSelectedBlock(block);
        setActiveTab("block-detail");
        return;
      }

      const tx = transactions.find(t => t.tx_hash === searchQuery);
      if (tx) {
        toast.info(`Transaction found: ${tx.status}`);
        return;
      }
    }

    toast.error('No results found');
  };

  const handleBlockClick = async (block: Block) => {
    setSelectedBlock(block);
    
    // Fetch block transactions
    const { data: txs } = await supabase
      .from('xodiak_transactions')
      .select('*')
      .eq('block_id', block.id)
      .order('tx_index', { ascending: true });

    setBlockTransactions(txs as Transaction[] || []);
    setActiveTab("block-detail");
  };

  const truncateHash = (hash: string, chars = 8) => {
    if (!hash) return '';
    return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
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
      {/* Chain Stats Header */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Block</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{chainStats?.chain?.current_block_number || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chainStats?.chain?.total_transactions?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Txs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{chainStats?.pendingTransactions || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Validators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{chainStats?.chain?.active_validators || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by block number, hash, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button variant="outline" size="icon" onClick={fetchChainData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="blocks" className="gap-2">
            <Box className="h-4 w-4" />
            Blocks
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          {selectedBlock && (
            <TabsTrigger value="block-detail" className="gap-2">
              <Layers className="h-4 w-4" />
              Block #{selectedBlock.block_number}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="blocks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Latest Blocks
              </CardTitle>
              <CardDescription>Most recently produced blocks on XDK Chain</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      onClick={() => handleBlockClick(block)}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Box className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Block #{block.block_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {truncateHash(block.block_hash)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{block.transaction_count} txs</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(block.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {blocks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No blocks found. Initialize the chain to get started.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Latest transactions across the network</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="font-mono text-sm">{truncateHash(tx.tx_hash)}</div>
                          <div className="text-xs text-muted-foreground">
                            {truncateHash(tx.from_address, 6)} → {tx.to_address ? truncateHash(tx.to_address, 6) : 'Contract'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{parseFloat(tx.amount.toString()).toLocaleString()} XDK</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={tx.status === 'confirmed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>
                            {tx.status}
                          </Badge>
                          {tx.block_number && (
                            <span className="text-xs text-muted-foreground">Block #{tx.block_number}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions found.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedBlock && (
          <TabsContent value="block-detail" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Block #{selectedBlock.block_number}
                </CardTitle>
                <CardDescription>
                  Created {formatDistanceToNow(new Date(selectedBlock.timestamp), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Block Hash</div>
                    <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                      {selectedBlock.block_hash}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Previous Hash</div>
                    <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                      {selectedBlock.previous_hash}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Merkle Root</div>
                    <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                      {selectedBlock.merkle_root}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">State Root</div>
                    <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                      {selectedBlock.state_root}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Transactions</div>
                    <div className="text-2xl font-bold">{selectedBlock.transaction_count}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Gas Used</div>
                    <div className="text-2xl font-bold">{selectedBlock.gas_used?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Validator</div>
                    <div className="text-lg font-medium">
                      {selectedBlock.xodiak_validators?.name || 'Genesis'}
                    </div>
                  </div>
                </div>

                {blockTransactions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-4">Block Transactions</h4>
                      <div className="space-y-2">
                        {blockTransactions.map((tx, index) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">#{index}</span>
                              <div className="font-mono text-sm">{truncateHash(tx.tx_hash)}</div>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{parseFloat(tx.amount.toString()).toLocaleString()} XDK</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
