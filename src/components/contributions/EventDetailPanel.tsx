import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  User, 
  Zap, 
  Target, 
  TrendingUp,
  Clock,
  Hash,
  Link2,
  Shield,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContributionEvent {
  id: string;
  actor_type: string;
  actor_id: string;
  event_type: string;
  event_description: string | null;
  event_category?: string;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  value_category: string | null;
  xodiak_anchor_status: string | null;
  xodiak_tx_hash?: string | null;
  xodiak_merkle_root?: string | null;
  created_at: string;
  payload?: Record<string, unknown>;
  workspace_id?: string;
  entity_id?: string;
  entity_type?: string;
}

interface EventDetailPanelProps {
  event: ContributionEvent | null;
  open: boolean;
  onClose: () => void;
}

const anchorStatusConfig: Record<string, { color: string; label: string; description: string }> = {
  pending: { 
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', 
    label: 'Pending',
    description: 'Awaiting inclusion in next Merkle tree batch'
  },
  queued: { 
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', 
    label: 'Queued',
    description: 'Added to Merkle tree, awaiting blockchain anchor'
  },
  anchored: { 
    color: 'bg-green-500/10 text-green-500 border-green-500/20', 
    label: 'Anchored',
    description: 'Immutably recorded on XODIAK ledger'
  },
  failed: { 
    color: 'bg-red-500/10 text-red-500 border-red-500/20', 
    label: 'Failed',
    description: 'Anchoring failed, will retry automatically'
  },
};

export function EventDetailPanel({ event, open, onClose }: EventDetailPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!event) return null;

  const anchorConfig = anchorStatusConfig[event.xodiak_anchor_status || 'pending'];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalCredits = 
    Number(event.compute_credits || 0) + 
    Number(event.action_credits || 0) + 
    Number(event.outcome_credits || 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {event.actor_type === 'agent' ? (
              <Bot className="h-5 w-5 text-purple-500" />
            ) : (
              <User className="h-5 w-5 text-blue-500" />
            )}
            <span className="capitalize">{event.event_type.replace(/_/g, ' ')}</span>
          </SheetTitle>
          <SheetDescription>
            {event.event_description || 'Contribution event details'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Credits Summary */}
          <div className="rounded-lg border p-4 bg-card">
            <h4 className="text-sm font-medium mb-3">Credits Earned</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-blue-500">
                  {Number(event.compute_credits || 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Compute</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-lg font-bold text-green-500">
                  {Number(event.action_credits || 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Action</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-lg font-bold text-purple-500">
                  {Number(event.outcome_credits || 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Outcome</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Credits</span>
              <span className="text-lg font-bold">{totalCredits.toFixed(1)}</span>
            </div>
          </div>

          {/* XODIAK Anchor Status */}
          <div className="rounded-lg border p-4 bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4" />
              <h4 className="text-sm font-medium">XODIAK Ledger Status</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className={anchorConfig.color}>
                  {anchorConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{anchorConfig.description}</p>
              
              {event.xodiak_tx_hash && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Transaction Hash</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                      {event.xodiak_tx_hash}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => copyToClipboard(event.xodiak_tx_hash!, 'TX Hash')}
                    >
                      {copied === 'TX Hash' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              {event.xodiak_merkle_root && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Merkle Root</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                      {event.xodiak_merkle_root}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => copyToClipboard(event.xodiak_merkle_root!, 'Merkle Root')}
                    >
                      {copied === 'Merkle Root' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Metadata */}
          <div className="rounded-lg border p-4 bg-card">
            <h4 className="text-sm font-medium mb-3">Event Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event ID</span>
                <code className="text-xs bg-muted px-2 py-0.5 rounded">{event.id.slice(0, 8)}...</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actor Type</span>
                <span className="capitalize">{event.actor_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event Type</span>
                <span className="capitalize">{event.event_type.replace(/_/g, ' ')}</span>
              </div>
              {event.value_category && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value Category</span>
                  <span className="capitalize">{event.value_category}</span>
                </div>
              )}
              {event.entity_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entity Type</span>
                  <span className="capitalize">{event.entity_type}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(event.created_at), 'PPp')}</span>
              </div>
            </div>
          </div>

          {/* Payload (if exists) */}
          {event.payload && Object.keys(event.payload).length > 0 && (
            <div className="rounded-lg border p-4 bg-card">
              <h4 className="text-sm font-medium mb-3">Payload</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
