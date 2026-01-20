import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, TrendingUp, TrendingDown, Clock, FileText, X
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  TradeJournalEntry, 
  useCreateTrade,
  useCloseTrade,
  useTradingPlaybooks
} from '@/hooks/useTradingCommand';

interface TradeJournalPanelProps {
  trades: TradeJournalEntry[];
  isSimulation: boolean;
}

export function TradeJournalPanel({ trades, isSimulation }: TradeJournalPanelProps) {
  const { data: playbooks } = useTradingPlaybooks();
  const createTrade = useCreateTrade();
  const closeTrade = useCloseTrade();

  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isCloseTradeOpen, setIsCloseTradeOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeJournalEntry | null>(null);

  const [newTrade, setNewTrade] = useState({
    symbol: '',
    trade_type: 'buy' as const,
    shares: 0,
    entry_price: 0,
    stop_loss_price: 0,
    take_profit_price: 0,
    playbook_id: '',
    pre_trade_notes: '',
  });

  const [closeTradData, setCloseTradeData] = useState({
    exit_price: 0,
    post_trade_notes: '',
    lessons_learned: '',
  });

  const handleCreateTrade = () => {
    createTrade.mutate({
      ...newTrade,
      is_simulation: isSimulation,
      playbook_id: newTrade.playbook_id || undefined,
    }, {
      onSuccess: () => {
        setIsNewTradeOpen(false);
        setNewTrade({
          symbol: '',
          trade_type: 'buy',
          shares: 0,
          entry_price: 0,
          stop_loss_price: 0,
          take_profit_price: 0,
          playbook_id: '',
          pre_trade_notes: '',
        });
      }
    });
  };

  const handleCloseTrade = () => {
    if (!selectedTrade) return;
    closeTrade.mutate({
      tradeId: selectedTrade.id,
      exitPrice: closeTradData.exit_price,
      postTradeNotes: closeTradData.post_trade_notes,
      lessonsLearned: closeTradData.lessons_learned,
    }, {
      onSuccess: () => {
        setIsCloseTradeOpen(false);
        setSelectedTrade(null);
        setCloseTradeData({ exit_price: 0, post_trade_notes: '', lessons_learned: '' });
      }
    });
  };

  const openTrades = trades.filter(t => !t.exit_time);
  const closedTrades = trades.filter(t => t.exit_time);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Trade Journal</h2>
          <p className="text-sm text-muted-foreground">
            {isSimulation ? 'Simulation Mode' : 'Live Trading'} - Document every trade
          </p>
        </div>
        <Dialog open={isNewTradeOpen} onOpenChange={setIsNewTradeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Log Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log New Trade</DialogTitle>
              <DialogDescription>
                Record your trade entry with discipline
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input 
                    id="symbol" 
                    placeholder="AAPL"
                    value={newTrade.symbol}
                    onChange={(e) => setNewTrade({ ...newTrade, symbol: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade_type">Type</Label>
                  <Select 
                    value={newTrade.trade_type}
                    onValueChange={(value: any) => setNewTrade({ ...newTrade, trade_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy (Long)</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shares">Shares</Label>
                  <Input 
                    id="shares" 
                    type="number"
                    value={newTrade.shares || ''}
                    onChange={(e) => setNewTrade({ ...newTrade, shares: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry_price">Entry Price</Label>
                  <Input 
                    id="entry_price" 
                    type="number"
                    step="0.01"
                    value={newTrade.entry_price || ''}
                    onChange={(e) => setNewTrade({ ...newTrade, entry_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stop_loss">Stop Loss</Label>
                  <Input 
                    id="stop_loss" 
                    type="number"
                    step="0.01"
                    value={newTrade.stop_loss_price || ''}
                    onChange={(e) => setNewTrade({ ...newTrade, stop_loss_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="take_profit">Take Profit</Label>
                  <Input 
                    id="take_profit" 
                    type="number"
                    step="0.01"
                    value={newTrade.take_profit_price || ''}
                    onChange={(e) => setNewTrade({ ...newTrade, take_profit_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="playbook">Playbook</Label>
                <Select 
                  value={newTrade.playbook_id}
                  onValueChange={(value) => setNewTrade({ ...newTrade, playbook_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select playbook..." />
                  </SelectTrigger>
                  <SelectContent>
                    {playbooks?.map((pb) => (
                      <SelectItem key={pb.id} value={pb.id}>{pb.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pre_notes">Pre-Trade Notes</Label>
                <Textarea 
                  id="pre_notes"
                  placeholder="Why are you taking this trade? What's your thesis?"
                  value={newTrade.pre_trade_notes}
                  onChange={(e) => setNewTrade({ ...newTrade, pre_trade_notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTradeOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTrade} disabled={!newTrade.symbol || !newTrade.shares}>
                Log Trade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Open Positions */}
      {openTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Open Positions</CardTitle>
            <CardDescription>Active trades requiring management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}>
                      {trade.trade_type.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{trade.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {trade.shares} shares @ ${trade.entry_price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">SL: ${trade.stop_loss_price}</p>
                      <p className="text-muted-foreground">TP: ${trade.take_profit_price}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTrade(trade);
                        setIsCloseTradeOpen(true);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trade History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trade History</CardTitle>
          <CardDescription>Completed trades and after-action reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {closedTrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No completed trades yet</p>
              <p className="text-sm">Your trade history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {closedTrades.slice(0, 10).map((trade) => {
                const pnl = trade.realized_pnl || 0;
                const isWin = pnl > 0;
                return (
                  <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isWin ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isWin ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{trade.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {trade.shares} shares | {trade.trade_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isWin ? 'text-green-600' : 'text-red-600'}`}>
                        {isWin ? '+' : ''}{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {trade.exit_time ? format(new Date(trade.exit_time), 'MMM d, h:mm a') : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Close Trade Dialog */}
      <Dialog open={isCloseTradeOpen} onOpenChange={setIsCloseTradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Trade - {selectedTrade?.symbol}</DialogTitle>
            <DialogDescription>
              Document your exit and lessons learned
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exit_price">Exit Price</Label>
              <Input 
                id="exit_price" 
                type="number"
                step="0.01"
                value={closeTradData.exit_price || ''}
                onChange={(e) => setCloseTradeData({ ...closeTradData, exit_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post_notes">Post-Trade Notes</Label>
              <Textarea 
                id="post_notes"
                placeholder="What happened? Did you follow the plan?"
                value={closeTradData.post_trade_notes}
                onChange={(e) => setCloseTradeData({ ...closeTradData, post_trade_notes: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessons">Lessons Learned</Label>
              <Textarea 
                id="lessons"
                placeholder="What will you do differently next time?"
                value={closeTradData.lessons_learned}
                onChange={(e) => setCloseTradeData({ ...closeTradData, lessons_learned: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseTradeOpen(false)}>Cancel</Button>
            <Button onClick={handleCloseTrade} disabled={!closeTradData.exit_price}>
              Close Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
