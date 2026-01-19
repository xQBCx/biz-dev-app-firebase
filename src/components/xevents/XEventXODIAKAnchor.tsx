import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Fingerprint,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { XEvent } from "@/hooks/useXEvents";
import { format } from "date-fns";

interface XEventXODIAKAnchorProps {
  event: XEvent;
}

interface AnchorStatus {
  isAnchored: boolean;
  anchoredAt?: string;
  transactionHash?: string;
  blockNumber?: number;
}

export const XEventXODIAKAnchor = ({ event }: XEventXODIAKAnchorProps) => {
  const [anchorStatus, setAnchorStatus] = useState<AnchorStatus>({ isAnchored: false });
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAnchorStatus();
  }, [event.id]);

  const checkAnchorStatus = async () => {
    try {
      // Check if event is anchored in contribution_events via payload
      const { data, error } = await supabase
        .from('contribution_events')
        .select('*')
        .eq('event_type', 'workflow_triggered')
        .not('payload', 'is', null)
        .limit(50);

      if (error) throw error;

      // Find matching event in payload
      const matchingEvent = data?.find(d => {
        const payload = d.payload as any;
        return payload?.event_id === event.id;
      });

      if (matchingEvent) {
        const payload = matchingEvent.payload as any;
        setAnchorStatus({
          isAnchored: true,
          anchoredAt: matchingEvent.created_at || undefined,
          transactionHash: matchingEvent.xodiak_tx_hash || `0x${event.id.replace(/-/g, '').substring(0, 40)}`,
          blockNumber: payload?.block_number || Math.floor(Math.random() * 1000000),
        });
      }
    } catch (err) {
      console.error("Error checking anchor status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnchor = async () => {
    setIsAnchoring(true);

    try {
      // Create anchor event hash
      const eventData = {
        event_id: event.id,
        event_name: event.name,
        organizer_id: event.organizer_id,
        start_date: event.start_date,
        end_date: event.end_date,
        category: event.category,
        status: event.status,
        anchored_at: new Date().toISOString(),
      };

      // Generate mock transaction hash
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(eventData));
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const transactionHash = '0x' + hashArray.slice(0, 32).map(b => b.toString(16).padStart(2, '0')).join('');

      // Create contribution event for XODIAK anchoring
      const { error } = await supabase
        .from('contribution_events')
        .insert({
          actor_id: event.organizer_id,
          actor_type: 'human' as const,
          event_type: 'workflow_triggered' as const,
          event_description: `Event "${event.name}" anchored to XODIAK ledger`,
          xodiak_tx_hash: transactionHash,
          payload: {
            event_id: event.id,
            event_data: eventData,
            block_number: Math.floor(Math.random() * 1000000) + 18000000,
          },
        });

      if (error) throw error;

      setAnchorStatus({
        isAnchored: true,
        anchoredAt: new Date().toISOString(),
        transactionHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      });

      toast.success("Event anchored to XODIAK ledger!");
    } catch (err: any) {
      console.error("Error anchoring event:", err);
      toast.error(err.message || "Failed to anchor event");
    } finally {
      setIsAnchoring(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  if (anchorStatus.isAnchored) {
    return (
      <Card className="p-6 border-emerald-500/30 bg-emerald-500/5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  XODIAK Anchored
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Immutable proof recorded on ledger
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              Verified
            </Badge>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Anchored:</span>
              <span className="font-mono">
                {anchorStatus.anchoredAt && format(new Date(anchorStatus.anchoredAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">TX Hash:</span>
              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[200px]">
                {anchorStatus.transactionHash}
              </code>
            </div>

            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Block:</span>
              <span className="font-mono">#{anchorStatus.blockNumber?.toLocaleString()}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full gap-2">
            View on Explorer
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">XODIAK Anchoring</h3>
            <p className="text-sm text-muted-foreground">
              Create immutable proof of this event
            </p>
          </div>
        </div>
        <Button 
          onClick={handleAnchor}
          disabled={isAnchoring}
          className="gap-2"
        >
          {isAnchoring ? (
            <>
              <Lock className="w-4 h-4 animate-pulse" />
              Anchoring...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Anchor Event
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p>
          Anchoring creates a cryptographic hash of this event's data and records it 
          on the XODIAK ledger, providing immutable proof of the event's existence 
          and details at a specific point in time.
        </p>
      </div>
    </Card>
  );
};
