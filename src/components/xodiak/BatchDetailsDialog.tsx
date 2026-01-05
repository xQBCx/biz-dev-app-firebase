import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Hash, CheckCircle2, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BatchEvent {
  id: string;
  contribution_event_id: string;
  event_hash: string;
  combined_value: number;
  anchored_at: string;
}

interface BatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  merkleRoot: string;
  blockNumber: number;
  txHash: string;
  anchoredAt: string;
}

export function BatchDetailsDialog({
  open,
  onOpenChange,
  batchId,
  merkleRoot,
  blockNumber,
  txHash,
  anchoredAt,
}: BatchDetailsDialogProps) {
  const [events, setEvents] = useState<BatchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && batchId) {
      fetchBatchEvents();
    }
  }, [open, batchId]);

  const fetchBatchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('xodiak_anchor_queue')
        .select('id, contribution_event_id, event_hash, combined_value, anchored_at')
        .eq('merkle_batch_id', batchId)
        .order('anchored_at', { ascending: true });

      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch batch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHash = (hash: string | undefined) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const totalValue = events.reduce((sum, e) => sum + (e.combined_value || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Merkle Batch Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Batch Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Block</p>
              <p className="text-lg font-bold">#{blockNumber}</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Events</p>
              <p className="text-lg font-bold">{events.length}</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Total Credits</p>
              <p className="text-lg font-bold">{totalValue.toFixed(2)}</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Anchored</p>
              <p className="text-sm font-medium">
                {anchoredAt ? new Date(anchoredAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Hashes */}
          <div className="space-y-2 border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" /> Merkle Root
              </span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{formatHash(merkleRoot)}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Link2 className="h-3 w-3" /> TX Hash
              </span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{formatHash(txHash)}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Layers className="h-3 w-3" /> Batch ID
              </span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{formatHash(batchId)}</code>
            </div>
          </div>

          {/* Event List */}
          <div>
            <p className="text-sm font-medium mb-2">Anchored Events</p>
            <ScrollArea className="h-[250px] border rounded-lg">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : events.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No events found</div>
              ) : (
                <div className="divide-y">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <div>
                          <code className="text-xs">{formatHash(event.event_hash)}</code>
                          <p className="text-xs text-muted-foreground">
                            ID: {formatHash(event.contribution_event_id)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{event.combined_value?.toFixed(2) || '0'} cr</Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
