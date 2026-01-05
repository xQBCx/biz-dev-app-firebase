import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Link2, 
  Hash, 
  Layers,
  AlertTriangle,
  Play,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VerifyEventDialog } from './VerifyEventDialog';
import { BatchDetailsDialog } from './BatchDetailsDialog';

interface AnchorQueueItem {
  id: string;
  contribution_event_id: string;
  event_hash: string;
  combined_value: number;
  status: string;
  requires_approval: boolean;
  merkle_batch_id: string | null;
  merkle_root: string | null;
  xodiak_block_number: number | null;
  xodiak_tx_hash: string | null;
  anchored_at: string | null;
  created_at: string;
}

interface MerkleBatch {
  merkle_batch_id: string;
  merkle_root: string;
  anchored_at: string;
  xodiak_block_number: number;
  xodiak_tx_hash: string;
  event_count: number;
}

export function AnchorStatusPanel() {
  const [pendingEvents, setPendingEvents] = useState<AnchorQueueItem[]>([]);
  const [recentBatches, setRecentBatches] = useState<MerkleBatch[]>([]);
  const [stats, setStats] = useState({ pending: 0, anchored: 0, requiresApproval: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<MerkleBatch | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get pending events
      const { data: pending } = await supabase
        .from('xodiak_anchor_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      setPendingEvents(pending || []);

      // Get counts
      const { count: pendingCount } = await supabase
        .from('xodiak_anchor_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: anchoredCount } = await supabase
        .from('xodiak_anchor_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'anchored');

      const { count: approvalCount } = await supabase
        .from('xodiak_anchor_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('requires_approval', true);

      setStats({
        pending: pendingCount || 0,
        anchored: anchoredCount || 0,
        requiresApproval: approvalCount || 0,
      });

      // Get recent batches
      const { data: batchData } = await supabase
        .from('xodiak_anchor_queue')
        .select('merkle_batch_id, merkle_root, anchored_at, xodiak_block_number, xodiak_tx_hash')
        .not('merkle_batch_id', 'is', null)
        .order('anchored_at', { ascending: false })
        .limit(100);

      // Aggregate by batch
      const batchMap = new Map<string, MerkleBatch>();
      (batchData || []).forEach(row => {
        if (!row.merkle_batch_id) return;
        const existing = batchMap.get(row.merkle_batch_id);
        if (existing) {
          existing.event_count++;
        } else {
          batchMap.set(row.merkle_batch_id, {
            merkle_batch_id: row.merkle_batch_id,
            merkle_root: row.merkle_root || '',
            anchored_at: row.anchored_at || '',
            xodiak_block_number: row.xodiak_block_number || 0,
            xodiak_tx_hash: row.xodiak_tx_hash || '',
            event_count: 1,
          });
        }
      });

      setRecentBatches(Array.from(batchMap.values()).slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch anchor data:', error);
      toast.error('Failed to load anchor data');
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('xodiak-anchor-process', {
        body: { action: 'process-queue', batchSize: 100 },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Anchored ${data.eventsAnchored} events`, {
          description: `Merkle root: ${data.merkleRoot?.slice(0, 16)}...`,
        });
        fetchData();
      } else {
        toast.info(data?.message || 'No events to process');
      }
    } catch (error) {
      console.error('Failed to process queue:', error);
      toast.error('Failed to process anchor queue');
    } finally {
      setProcessing(false);
    }
  };

  const approveEvents = async (eventIds: string[]) => {
    try {
      const { error } = await supabase.functions.invoke('xodiak-anchor-process', {
        body: { action: 'approve', eventIds },
      });

      if (error) throw error;
      toast.success(`Approved ${eventIds.length} events for anchoring`);
      fetchData();
    } catch (error) {
      console.error('Failed to approve events:', error);
      toast.error('Failed to approve events');
    }
  };

  const rejectEvents = async (eventIds: string[]) => {
    try {
      const { error } = await supabase.functions.invoke('xodiak-anchor-process', {
        body: { action: 'reject', eventIds, reason: 'Manual rejection' },
      });

      if (error) throw error;
      toast.success(`Rejected ${eventIds.length} events`);
      fetchData();
    } catch (error) {
      console.error('Failed to reject events:', error);
      toast.error('Failed to reject events');
    }
  };

  const formatHash = (hash: string | null) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.anchored}</p>
                <p className="text-sm text-muted-foreground">Anchored</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.requiresApproval}</p>
                <p className="text-sm text-muted-foreground">Needs Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentBatches.length}</p>
                <p className="text-sm text-muted-foreground">Recent Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={processQueue} disabled={processing || stats.pending === 0}>
          {processing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Process Queue
        </Button>
        <VerifyEventDialog />
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Queue</TabsTrigger>
          <TabsTrigger value="batches">Merkle Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Contribution Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {pendingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending events in queue</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-mono text-sm">{formatHash(event.event_hash)}</p>
                            <p className="text-xs text-muted-foreground">
                              Value: {event.combined_value?.toFixed(2) || '0'} credits
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.requires_approval ? (
                            <>
                              <Badge variant="outline" className="text-orange-500 border-orange-500">
                                Needs Approval
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveEvents([event.contribution_event_id])}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => rejectEvents([event.contribution_event_id])}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Badge variant="secondary">Queued</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Recent Merkle Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {recentBatches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No batches anchored yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBatches.map(batch => (
                      <div
                        key={batch.merkle_batch_id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Block #{batch.xodiak_block_number}</span>
                          </div>
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            {batch.event_count} Events
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Merkle Root</p>
                            <p className="font-mono">{formatHash(batch.merkle_root)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">TX Hash</p>
                            <p className="font-mono">{formatHash(batch.xodiak_tx_hash)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Anchored: {formatDate(batch.anchored_at)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() => setSelectedBatch(batch)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Batch Details Dialog */}
      {selectedBatch && (
        <BatchDetailsDialog
          open={!!selectedBatch}
          onOpenChange={(open) => !open && setSelectedBatch(null)}
          batchId={selectedBatch.merkle_batch_id}
          merkleRoot={selectedBatch.merkle_root}
          blockNumber={selectedBatch.xodiak_block_number}
          txHash={selectedBatch.xodiak_tx_hash}
          anchoredAt={selectedBatch.anchored_at}
        />
      )}
    </div>
  );
}
