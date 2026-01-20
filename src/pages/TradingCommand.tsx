import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Target, Shield, TrendingUp, BookOpen, Activity, DollarSign, 
  Play, Pause, GraduationCap, AlertTriangle, CheckCircle, Clock, Landmark, Zap
} from 'lucide-react';
import { 
  useTradingProfile, 
  useCreateTradingProfile,
  useTradingPlaybooks,
  useTradingCurriculum,
  useCurriculumProgress,
  useTradeJournal,
  TradingSkillLevel
} from '@/hooks/useTradingCommand';
import { TradingOnboarding } from '@/components/trading/TradingOnboarding';
import { TradingCurriculumView } from '@/components/trading/TradingCurriculumView';
import { TradingPlaybookCard } from '@/components/trading/TradingPlaybookCard';
import { TradeJournalPanel } from '@/components/trading/TradeJournalPanel';
import { TradingPerformanceDashboard } from '@/components/trading/TradingPerformanceDashboard';
import { CapitalAllocationPanel } from '@/components/trading/CapitalAllocationPanel';
import { EROSTradingIntegration } from '@/components/trading/EROSTradingIntegration';
import { useTradingTerminology, useSkillLevelDisplay } from '@/components/trading/TradingArchetypeAdapter';

export default function TradingCommand() {
  const navigate = useNavigate();
  const { t, T, archetypeSlug } = useTradingTerminology();
  const skillLevelDisplay = useSkillLevelDisplay();
  
  const { data: profile, isLoading: profileLoading } = useTradingProfile();
  const { data: playbooks, isLoading: playbooksLoading } = useTradingPlaybooks();
  const { data: curriculum, isLoading: curriculumLoading } = useTradingCurriculum();
  const { data: progress } = useCurriculumProgress();
  const { data: trades } = useTradeJournal();
  const createProfile = useCreateTradingProfile();

  const [activeTab, setActiveTab] = useState('overview');

  // If no profile, show onboarding
  if (profileLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <TradingOnboarding onComplete={() => createProfile.mutate({})} />;
  }

  const skillConfig = skillLevelDisplay[profile.skill_level as TradingSkillLevel];
  const completedModules = progress?.filter(p => p.status === 'completed' || p.status === 'mastered').length || 0;
  const totalModules = curriculum?.length || 0;
  const curriculumProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  const totalTrades = trades?.length || 0;
  const winningTrades = trades?.filter(t => (t.realized_pnl || 0) > 0).length || 0;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = trades?.reduce((sum, t) => sum + (t.realized_pnl || 0), 0) || 0;
  
  const availableCapital = profile.session_status === 'simulation' 
    ? (profile.simulation_capital || 0) 
    : (profile.live_capital || 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{T('module_title')}</h1>
          <p className="text-muted-foreground">
            {t('module_subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={skillConfig.color} variant="secondary">
            <GraduationCap className="h-3 w-3 mr-1" />
            {skillConfig.label}
          </Badge>
          <Badge variant={profile.session_status === 'simulation' ? 'outline' : 'default'}>
            {profile.session_status === 'simulation' ? (
              <>
                <Play className="h-3 w-3 mr-1" />
                {T('simulation')}
              </>
            ) : profile.session_status === 'live' ? (
              <>
                <Activity className="h-3 w-3 mr-1" />
                {T('live')}
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Paused
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{T('capital')}</p>
                <p className="text-2xl font-bold">
                  ${availableCapital.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{T('pnl')}</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{T('win_rate')}</p>
                <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{winningTrades}/{totalTrades} {t('trades')}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{T('curriculum')}</p>
                <p className="text-2xl font-bold">{completedModules}/{totalModules}</p>
                <Progress value={curriculumProgress} className="mt-2 h-2" />
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Guardrails Alert */}
      {profile.session_status === 'live' && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium">{archetypeSlug === 'service_professional' ? 'Risk Parameters Active' : 'Risk Parameters Active'}</p>
                <p className="text-sm text-muted-foreground">
                  {T('max_position')}: {profile.max_position_size_percent}% | 
                  {T('daily_loss_limit')}: {profile.max_daily_loss_percent}% | 
                  {T('weekly_loss_limit')}: {profile.max_weekly_loss_percent}%
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/trading-command/settings')}>
                Adjust Limits
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">{T('dashboard')}</TabsTrigger>
          <TabsTrigger value="curriculum">{T('curriculum')}</TabsTrigger>
          <TabsTrigger value="playbooks">{T('playbooks')}</TabsTrigger>
          <TabsTrigger value="journal">{T('journal')}</TabsTrigger>
          <TabsTrigger value="performance">{T('performance')}</TabsTrigger>
          <TabsTrigger value="capital">
            <Landmark className="h-3 w-3 mr-1" />
            {T('allocation')}
          </TabsTrigger>
          <TabsTrigger value="eros">
            <Zap className="h-3 w-3 mr-1" />
            EROS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Today's Focus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Mission Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Pre-Market Prep</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Review overnight news
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Check economic calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      Set watchlist alerts
                    </li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Active Rules</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Max 2 positions at once</li>
                    <li>• Stop loss on every trade</li>
                    <li>• No trading after 3:30 PM</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Next Training</h4>
                  {curriculum && curriculum.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">{curriculum[completedModules]?.title || 'All Complete!'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {curriculum[completedModules]?.estimated_hours || 0} hours estimated
                      </p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => setActiveTab('curriculum')}>
                        Continue Training
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Playbooks Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Approved Playbooks
              </CardTitle>
              <CardDescription>
                Rules-based strategies matched to your skill level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {playbooksLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {playbooks?.slice(0, 3).map((playbook) => (
                    <TradingPlaybookCard key={playbook.id} playbook={playbook} userSkillLevel={profile.skill_level} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="mt-6">
          <TradingCurriculumView 
            curriculum={curriculum || []} 
            progress={progress || []} 
            userSkillLevel={profile.skill_level}
            isLoading={curriculumLoading}
          />
        </TabsContent>

        <TabsContent value="playbooks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks?.map((playbook) => (
              <TradingPlaybookCard 
                key={playbook.id} 
                playbook={playbook} 
                userSkillLevel={profile.skill_level}
                expanded
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="journal" className="mt-6">
          <TradeJournalPanel 
            trades={trades || []} 
            isSimulation={profile.session_status === 'simulation'}
          />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <TradingPerformanceDashboard profile={profile} trades={trades || []} />
        </TabsContent>

        <TabsContent value="capital" className="mt-6">
          <CapitalAllocationPanel profile={profile} availableCapital={availableCapital} />
        </TabsContent>

        <TabsContent value="eros" className="mt-6">
          <EROSTradingIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
