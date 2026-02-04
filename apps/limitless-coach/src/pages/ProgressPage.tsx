import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, TrendingUp, Calendar, Flame, Target,
  Award, BarChart3, Activity
} from "lucide-react";

type WeeklyData = {
  week: string;
  workouts: number;
  formScore: number;
};

const mockWeeklyData: WeeklyData[] = [
  { week: "Week 1", workouts: 3, formScore: 72 },
  { week: "Week 2", workouts: 4, formScore: 76 },
  { week: "Week 3", workouts: 3, formScore: 79 },
  { week: "Week 4", workouts: 5, formScore: 82 },
];

const ProgressPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWorkouts: 15,
    currentStreak: 3,
    longestStreak: 7,
    avgFormScore: 77,
    programProgress: 65,
    weeklyGoal: { current: 3, target: 4 }
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/today')}
            className="text-primary-foreground hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold">Your Progress</h1>
            <p className="text-xs text-primary-foreground/70">
              Track your fitness journey
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-4">
              <Flame className="h-6 w-6 text-accent mb-2" />
              <p className="text-3xl font-display font-bold">{stats.currentStreak}</p>
              <p className="text-xs text-primary-foreground/70">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
            <CardContent className="p-4">
              <Award className="h-6 w-6 mb-2" />
              <p className="text-3xl font-display font-bold">{stats.totalWorkouts}</p>
              <p className="text-xs opacity-70">Total Workouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Program Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-accent" />
              Program Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Week 3 of 4</span>
              <span className="font-semibold">{stats.programProgress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${stats.programProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Keep it up! You're making great progress.
            </p>
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-accent" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex gap-1 mb-2">
                  {[...Array(stats.weeklyGoal.target)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-8 rounded ${
                        i < stats.weeklyGoal.current ? 'bg-accent' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.weeklyGoal.current} of {stats.weeklyGoal.target} workouts completed
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-display font-bold text-accent">
                  {stats.weeklyGoal.target - stats.weeklyGoal.current}
                </p>
                <p className="text-xs text-muted-foreground">to go</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Form Score */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Activity className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Form Score</p>
                      <p className="text-xl font-bold">{stats.avgFormScore}/100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-success text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>+5 pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Longest Streak */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Flame className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Longest Streak</p>
                      <p className="text-xl font-bold">{stats.longestStreak} days</p>
                    </div>
                  </div>
                  <Award className="h-6 w-6 text-warning" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWeeklyData.map((week, index) => (
                    <div key={week.week} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-muted-foreground">
                        {week.week}
                      </div>
                      <div className="flex-1">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-6 rounded ${
                                i < week.workouts ? 'bg-accent' : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <span className="font-medium">{week.formScore}</span>
                        <span className="text-muted-foreground">/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground px-4">
          Progress data is for motivational purposes. Results vary by individual.
        </p>
      </main>
    </div>
  );
};

export default ProgressPage;