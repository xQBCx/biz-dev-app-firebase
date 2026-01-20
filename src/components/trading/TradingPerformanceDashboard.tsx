import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Target, Shield, BarChart3, 
  Activity, AlertTriangle, CheckCircle
} from 'lucide-react';
import { 
  TradingProfile, 
  TradeJournalEntry,
  skillLevelConfig,
  TradingSkillLevel
} from '@/hooks/useTradingCommand';

interface TradingPerformanceDashboardProps {
  profile: TradingProfile;
  trades: TradeJournalEntry[];
}

export function TradingPerformanceDashboard({ profile, trades }: TradingPerformanceDashboardProps) {
  // Calculate performance metrics
  const closedTrades = trades.filter(t => t.exit_time);
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(t => (t.realized_pnl || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.realized_pnl || 0) < 0);
  
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
  
  const avgWinner = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0) / winningTrades.length 
    : 0;
  const avgLoser = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0) / losingTrades.length)
    : 0;
  
  const profitFactor = avgLoser > 0 ? avgWinner / avgLoser : avgWinner > 0 ? Infinity : 0;
  
  // Rule adherence (trades with stop losses)
  const tradesWithStopLoss = closedTrades.filter(t => t.stop_loss_price && t.stop_loss_price > 0);
  const ruleAdherence = totalTrades > 0 ? (tradesWithStopLoss.length / totalTrades) * 100 : 0;
  
  // Max drawdown simulation
  let maxDrawdown = 0;
  let peak = profile.simulation_capital || 10000;
  let runningCapital = peak;
  
  closedTrades.forEach(trade => {
    runningCapital += (trade.realized_pnl || 0);
    if (runningCapital > peak) {
      peak = runningCapital;
    }
    const drawdown = ((peak - runningCapital) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  const skillConfig = skillLevelConfig[profile.skill_level as TradingSkillLevel];

  // Graduation criteria check
  const graduationCriteria = {
    minTrades: 50,
    minWinRate: 50,
    maxDrawdown: 10,
    minRuleAdherence: 90,
    minProfitFactor: 1.5,
  };

  const meetsTradeCount = totalTrades >= graduationCriteria.minTrades;
  const meetsWinRate = winRate >= graduationCriteria.minWinRate;
  const meetsDrawdown = maxDrawdown <= graduationCriteria.maxDrawdown;
  const meetsRuleAdherence = ruleAdherence >= graduationCriteria.minRuleAdherence;
  const meetsProfitFactor = profitFactor >= graduationCriteria.minProfitFactor;

  const criteriaMetCount = [meetsTradeCount, meetsWinRate, meetsDrawdown, meetsRuleAdherence, meetsProfitFactor].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{winningTrades.length}W / {losingTrades.length}L</p>
              </div>
              <Target className={`h-8 w-8 ${winRate >= 50 ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Factor</p>
                <p className="text-2xl font-bold">
                  {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Target: 1.5+</p>
              </div>
              <BarChart3 className={`h-8 w-8 ${profitFactor >= 1.5 ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Max Drawdown</p>
                <p className="text-2xl font-bold">{maxDrawdown.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Limit: {profile.max_weekly_loss_percent}%</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${maxDrawdown <= 10 ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rule Adherence</p>
                <p className="text-2xl font-bold">{ruleAdherence.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Stop losses used</p>
              </div>
              <Shield className={`h-8 w-8 ${ruleAdherence >= 90 ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              P&L Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Total P&L</span>
              <span className={`font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Average Winner</span>
              <span className="font-medium text-green-600">
                +{avgWinner.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Average Loser</span>
              <span className="font-medium text-red-600">
                -{avgLoser.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Largest Winner</span>
              <span className="font-medium text-green-600">
                +{Math.max(...winningTrades.map(t => t.realized_pnl || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Largest Loser</span>
              <span className="font-medium text-red-600">
                {Math.min(...losingTrades.map(t => t.realized_pnl || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Graduation Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Graduation Criteria
            </CardTitle>
            <CardDescription>
              Meet all criteria to advance from simulation to live trading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Progress</span>
              <Badge variant={criteriaMetCount === 5 ? 'default' : 'secondary'}>
                {criteriaMetCount}/5 Complete
              </Badge>
            </div>
            <Progress value={(criteriaMetCount / 5) * 100} className="h-2" />
            
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3">
                {meetsTradeCount ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className={meetsTradeCount ? '' : 'text-muted-foreground'}>
                  Complete {graduationCriteria.minTrades} trades ({totalTrades}/{graduationCriteria.minTrades})
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {meetsWinRate ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className={meetsWinRate ? '' : 'text-muted-foreground'}>
                  Maintain {graduationCriteria.minWinRate}%+ win rate ({winRate.toFixed(1)}%)
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {meetsDrawdown ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className={meetsDrawdown ? '' : 'text-muted-foreground'}>
                  Max drawdown under {graduationCriteria.maxDrawdown}% ({maxDrawdown.toFixed(1)}%)
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {meetsRuleAdherence ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className={meetsRuleAdherence ? '' : 'text-muted-foreground'}>
                  {graduationCriteria.minRuleAdherence}%+ rule adherence ({ruleAdherence.toFixed(0)}%)
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {meetsProfitFactor ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className={meetsProfitFactor ? '' : 'text-muted-foreground'}>
                  Profit factor of {graduationCriteria.minProfitFactor}+ ({profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Standing */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${skillConfig.color}`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Current Rank: {skillConfig.label}</h3>
                <p className="text-sm text-muted-foreground">{skillConfig.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Trading Mode</p>
              <Badge variant={profile.session_status === 'simulation' ? 'outline' : 'default'}>
                {profile.session_status === 'simulation' ? 'Simulation' : 'Live'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
