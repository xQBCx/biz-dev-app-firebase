import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Activity, Clock, TrendingUp, Target, 
  AlertTriangle, CheckCircle, Calendar, Zap
} from 'lucide-react';
import { useTradingProfile, useTradeJournal } from '@/hooks/useTradingCommand';
import { useEROSResponderProfile, useEROSDeployments } from '@/hooks/useEROS';
import { useArchetypeTranslation } from '@/contexts/ArchetypeContext';
import { Link } from 'react-router-dom';

export function EROSTradingIntegration() {
  const { archetype } = useArchetypeTranslation();
  const isMilitary = archetype?.slug === 'service_professional';
  
  const { data: tradingProfile } = useTradingProfile();
  const { data: trades } = useTradeJournal();
  const { data: responderProfile } = useEROSResponderProfile();
  const { data: deployments } = useEROSDeployments();

  // Calculate trading activity during EROS downtime
  const recentDeployments = deployments?.filter(d => {
    const endDate = d.ended_at ? new Date(d.ended_at) : new Date();
    return endDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  }) || [];

  const activeDeployment = deployments?.find(d => d.status === 'active' || d.status === 'en_route');

  // Trades during downtime periods
  const downtimeTrades = trades?.filter(trade => {
    if (!recentDeployments.length) return false;
    const tradeDate = new Date(trade.created_at);
    
    return recentDeployments.some(deployment => {
      const startDate = new Date(deployment.deployed_at);
      const endDate = deployment.ended_at ? new Date(deployment.ended_at) : new Date();
      // Trade happened AFTER deployment ended (downtime)
      return tradeDate > endDate;
    });
  }) || [];

  const downtimePnL = downtimeTrades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
  const downtimeWinRate = downtimeTrades.length > 0 
    ? (downtimeTrades.filter(t => (t.realized_pnl || 0) > 0).length / downtimeTrades.length) * 100 
    : 0;

  // Integration status
  const isIntegrated = !!responderProfile && !!tradingProfile;
  const hasRecentActivity = (trades?.length || 0) > 0 || (deployments?.length || 0) > 0;

  if (!tradingProfile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Trading Profile Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set up your Trading Command profile to enable EROS integration.
          </p>
          <Button asChild>
            <Link to="/trading-command">Set Up Trading Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card className={activeDeployment ? 'border-red-500/50 bg-red-500/5' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {isMilitary ? 'Operations & Capital Bridge' : 'EROS-Trading Integration'}
              </CardTitle>
              <CardDescription>
                {isMilitary 
                  ? 'Capital command during mission downtime' 
                  : 'Bridge between emergency response and trading activity'}
              </CardDescription>
            </div>
            {activeDeployment && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Active Deployment
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeDeployment ? (
            <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/10">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-600">Trading Paused - Active Deployment</p>
                  <p className="text-sm text-muted-foreground">
                    {isMilitary 
                      ? 'Focus on mission. Trading resumes upon return to base.' 
                      : 'Trading is paused during active emergency response.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Deployment Role</p>
                  <p className="font-medium">{activeDeployment.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deployed Since</p>
                  <p className="font-medium">
                    {new Date(activeDeployment.deployed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {isMilitary ? 'Ready for Operations' : 'Trading Active'}
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {tradingProfile.session_status === 'simulation' ? 'Simulation' : 'Live'}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {isMilitary ? 'Downtime Trades' : 'Between-Deployment Trades'}
                  </span>
                </div>
                <p className="text-2xl font-bold">{downtimeTrades.length}</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {isMilitary ? 'Downtime P&L' : 'Between-Deployment P&L'}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${downtimePnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {downtimePnL >= 0 ? '+' : ''}{downtimePnL.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment History & Trading Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isMilitary ? 'Deployment Cycle' : 'Recent Deployments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!responderProfile ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  {isMilitary 
                    ? 'Set up your responder profile to track deployment cycles.' 
                    : 'Create an EROS responder profile to see deployment history.'}
                </p>
                <Button asChild variant="outline">
                  <Link to="/eros/profile">Set Up Responder Profile</Link>
                </Button>
              </div>
            ) : recentDeployments.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                No recent deployments in the last 30 days.
              </p>
            ) : (
              <div className="space-y-3">
                {recentDeployments.slice(0, 5).map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{deployment.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deployment.deployed_at).toLocaleDateString()}
                        {deployment.ended_at && ` - ${new Date(deployment.ended_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Badge variant={deployment.status === 'completed' ? 'default' : 'secondary'}>
                      {deployment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-4 w-4" />
              {isMilitary ? 'Capital Performance Metrics' : 'Trading Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{isMilitary ? 'Mission Downtime Win Rate' : 'Between-Deployment Win Rate'}</span>
                  <span className="font-medium">{downtimeWinRate.toFixed(1)}%</span>
                </div>
                <Progress value={downtimeWinRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{isMilitary ? 'Rule Adherence' : 'Strategy Compliance'}</span>
                  <span className="font-medium">
                    {trades?.length ? 
                      (trades.filter(t => (t.rule_adherence_score || 0) >= 80).length / trades.length * 100).toFixed(0) 
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={trades?.length ? 
                    (trades.filter(t => (t.rule_adherence_score || 0) >= 80).length / trades.length * 100) 
                    : 0} 
                  className="h-2" 
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">
                  {isMilitary ? 'Operational Insights' : 'Key Insights'}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {isMilitary 
                      ? 'Best trading performance occurs 48-72hrs post-deployment' 
                      : 'Trading performance peaks 2-3 days after returning from deployments'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    {isMilitary
                      ? 'Discipline from operations translates to higher rule adherence'
                      : 'Emergency response experience correlates with better risk management'}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/eros">
                <Shield className="h-4 w-4 mr-2" />
                {isMilitary ? 'Operations Dashboard' : 'EROS Dashboard'}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/trading-command">
                <TrendingUp className="h-4 w-4 mr-2" />
                {isMilitary ? 'Capital Command' : 'Trading Dashboard'}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/eros/profile">
                <Activity className="h-4 w-4 mr-2" />
                {isMilitary ? 'Operator Profile' : 'Responder Profile'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
