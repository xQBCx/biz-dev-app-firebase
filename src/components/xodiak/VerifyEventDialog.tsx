import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Search, Shield, Hash, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VerificationResult {
  verified: boolean;
  eventHash?: string;
  merkleRoot?: string;
  proof?: string[];
  blockNumber?: number;
  txHash?: string;
  anchoredAt?: string;
  error?: string;
}

export function VerifyEventDialog() {
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verifyEvent = async () => {
    if (!eventId.trim()) {
      toast.error('Please enter an event ID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('xodiak-anchor-process', {
        body: {},
        method: 'GET',
      });

      // Use direct query for verification
      const { data: queueEntry } = await supabase
        .from('xodiak_anchor_queue')
        .select('*')
        .eq('contribution_event_id', eventId.trim())
        .single();

      if (!queueEntry) {
        setResult({ verified: false, error: 'Event not found in anchor queue' });
        return;
      }

      if (queueEntry.status !== 'anchored') {
        setResult({ verified: false, error: `Event status: ${queueEntry.status}` });
        return;
      }

      setResult({
        verified: true,
        eventHash: queueEntry.event_hash,
        merkleRoot: queueEntry.merkle_root,
        proof: Array.isArray(queueEntry.merkle_proof) ? queueEntry.merkle_proof as string[] : undefined,
        blockNumber: queueEntry.xodiak_block_number,
        txHash: queueEntry.xodiak_tx_hash,
        anchoredAt: queueEntry.anchored_at,
      });
    } catch (error) {
      console.error('Verification failed:', error);
      setResult({ verified: false, error: 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const formatHash = (hash: string | undefined) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 12)}...${hash.slice(-10)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="h-4 w-4 mr-2" />
          Verify Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verify Contribution Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter contribution event ID..."
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyEvent()}
            />
            <Button onClick={verifyEvent} disabled={loading}>
              {loading ? (
                <Search className="h-4 w-4 animate-pulse" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {result && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                {result.verified ? (
                  <>
                    <div className="p-2 rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-green-600">Verified on XODIAK</p>
                      <p className="text-sm text-muted-foreground">
                        This event is cryptographically anchored
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-full bg-destructive/10">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-destructive">Not Verified</p>
                      <p className="text-sm text-muted-foreground">{result.error}</p>
                    </div>
                  </>
                )}
              </div>

              {result.verified && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Block Number</p>
                      <Badge variant="outline">#{result.blockNumber}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Anchored</p>
                      <p className="text-sm">
                        {result.anchoredAt
                          ? new Date(result.anchoredAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Hash className="h-3 w-3" /> Event Hash
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                      {formatHash(result.eventHash)}
                    </code>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Link2 className="h-3 w-3" /> Merkle Root
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                      {formatHash(result.merkleRoot)}
                    </code>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Link2 className="h-3 w-3" /> TX Hash
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                      {formatHash(result.txHash)}
                    </code>
                  </div>

                  {result.proof && result.proof.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Merkle Proof ({result.proof.length} nodes)
                      </p>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {result.proof.map((node, i) => (
                          <code
                            key={i}
                            className="text-xs bg-muted/50 px-2 py-0.5 rounded block"
                          >
                            {formatHash(node)}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
