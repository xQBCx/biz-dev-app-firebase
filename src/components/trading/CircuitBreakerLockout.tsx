import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertOctagon, Clock, Heart, Coffee, Book, Dumbbell } from 'lucide-react';
import { 
  formatLockoutRemaining, 
  getLockoutProgress, 
  getRandomRecoveryMessage,
  TRADING_RULES 
} from '@/lib/trading/circuitBreaker';

interface CircuitBreakerLockoutProps {
  lockedUntil: Date;
  lossCount: number;
}

export function CircuitBreakerLockout({ lockedUntil, lossCount }: CircuitBreakerLockoutProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatLockoutRemaining(lockedUntil));
  const [progress, setProgress] = useState(getLockoutProgress(lockedUntil));
  const [recoveryMessage] = useState(getRandomRecoveryMessage());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatLockoutRemaining(lockedUntil));
      setProgress(getLockoutProgress(lockedUntil));
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  const recoveryActivities = [
    { icon: Coffee, label: 'Take a break', description: 'Step away from the screen' },
    { icon: Book, label: 'Review your journal', description: 'Learn from today\'s trades' },
    { icon: Dumbbell, label: 'Physical activity', description: 'Reset your mental state' },
    { icon: Heart, label: 'Practice patience', description: 'Tomorrow is a new day' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Lockout Card */}
        <Card className="border-2 border-destructive/50 shadow-2xl bg-gradient-to-br from-background to-destructive/5">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
              <AlertOctagon className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-destructive">
                Circuit Breaker Triggered
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-foreground/80">
                2 Loss Limit Hit. Walk away. Discipline over Dopamine.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Countdown Timer */}
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Trading Resumes In
                </span>
              </div>
              <div className="text-5xl font-mono font-bold tracking-wider text-foreground">
                {timeRemaining}
              </div>
              <Progress value={progress} className="mt-4 h-2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-destructive/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-destructive">{lossCount}</div>
                <div className="text-sm text-muted-foreground">Losses Today</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">24h</div>
                <div className="text-sm text-muted-foreground">Lockout Duration</div>
              </div>
            </div>

            {/* Recovery Message */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-lg font-medium text-primary">{recoveryMessage}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Recovery Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recoveryActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <activity.icon className="h-8 w-8 text-primary mb-2" />
                  <span className="font-medium text-sm">{activity.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{activity.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trading Rules Reminder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Remember Your Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {TRADING_RULES.map((rule, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm">{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
