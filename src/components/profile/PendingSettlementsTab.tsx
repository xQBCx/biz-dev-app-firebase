import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, DollarSign, FileText, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface PendingSettlement {
  id: string;
  name: string;
  trigger_type: string;
  distribution_logic: unknown;
  deal_room: {
    id: string;
    name: string;
  } | null;
  treasury_balance: number;
}

interface PendingSettlementsTabProps {
  userId: string;
}

export function PendingSettlementsTab({ userId }: PendingSettlementsTabProps) {
  const [settlements, setSettlements] = useState<PendingSettlement[]>([]);
  const [pendingEscrow, setPendingEscrow] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingData();
  }, [userId]);

  const fetchPendingData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch active settlement contracts where user is a participant
      const { data: participantDeals } = await supabase
        .from('deal_room_participants')
        .select('deal_room_id')
        .eq('user_id', userId)
        .not('invitation_accepted_at', 'is', null);

      const dealRoomIds = participantDeals?.map(p => p.deal_room_id) || [];

      if (dealRoomIds.length > 0) {
        // Fetch settlement contracts for those deal rooms
        const { data: contracts } = await supabase
          .from('settlement_contracts')
          .select(`
            id, 
            name, 
            trigger_type,
            distribution_logic,
            deal_room_id
          `)
          .in('deal_room_id', dealRoomIds)
          .eq('is_active', true);

        if (contracts && contracts.length > 0) {
          // Fetch deal room details and treasury balances
          const enrichedSettlements: PendingSettlement[] = [];
          
          for (const contract of contracts) {
            const [{ data: dealRoom }, { data: treasury }] = await Promise.all([
              supabase
                .from('deal_rooms')
                .select('id, name')
                .eq('id', contract.deal_room_id)
                .single(),
              supabase
                .from('deal_room_xdk_treasury')
                .select('balance')
                .eq('deal_room_id', contract.deal_room_id)
                .maybeSingle()
            ]);

            enrichedSettlements.push({
              id: contract.id,
              name: contract.name,
              trigger_type: contract.trigger_type,
              distribution_logic: contract.distribution_logic,
              deal_room: dealRoom,
              treasury_balance: parseFloat(treasury?.balance?.toString() || '0')
            });
          }

          setSettlements(enrichedSettlements);
        }
      }

      // Fetch pending escrow funding requests
      const { data: escrowRequests } = await supabase
        .from('escrow_funding_requests')
        .select('amount')
        .eq('status', 'pending');

      const totalPendingEscrow = escrowRequests?.reduce((sum, req) => 
        sum + parseFloat(req.amount?.toString() || '0'), 0) || 0;
      setPendingEscrow(totalPendingEscrow);

    } catch (error) {
      console.error('Error fetching pending settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      'milestone': 'Milestone-based',
      'manual': 'Manual trigger',
      'date': 'Date-based',
      'deal_close': 'On deal close'
    };
    return labels[trigger] || trigger;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const totalPending = settlements.reduce((sum, s) => sum + s.treasury_balance, 0) + pendingEscrow;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Pending</div>
              <div className="text-3xl font-bold">
                ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground">
                1 XDK = $1.00 USD (fixed rate)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Settlement Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Active Settlement Contracts
          </CardTitle>
          <CardDescription>
            Contracts that will pay out XDK when triggered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active settlements</p>
              <p className="text-sm">Join Deal Rooms to receive XDK payouts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement) => (
                <div 
                  key={settlement.id} 
                  className="p-4 rounded-lg border bg-muted/30 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{settlement.name}</div>
                      {settlement.deal_room && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {settlement.deal_room.name}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">
                      {getTriggerLabel(settlement.trigger_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Treasury Balance</span>
                    <span className="font-semibold text-emerald-500">
                      ${settlement.treasury_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                      <span className="text-xs text-muted-foreground ml-1">
                        ({settlement.treasury_balance.toLocaleString()} XDK)
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Escrow */}
      {pendingEscrow > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pending Escrow Conversions
            </CardTitle>
            <CardDescription>
              USD funds awaiting conversion to XDK
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
              <span>Awaiting Processing</span>
              <span className="font-bold text-lg">
                ${pendingEscrow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <div className="text-xs text-muted-foreground text-center p-4 rounded-lg bg-muted/30">
        <strong>1 XDK = 1 USD</strong> — XDK is only minted when real USD enters escrow. 
        Your balance is always backed 1:1.
      </div>
    </div>
  );
}
