import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dumbbell, MessageCircle, Camera, Utensils, Flame,
  ChevronRight, CheckCircle2, Circle, LogOut, User,
  Calendar, TrendingUp, BookHeart, Target
} from "lucide-react";

type TodayWorkout = {
  id: string;
  name: string;
  exercises: { name: string; sets: number; reps: string }[];
};

const Today = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }

        setUser(session.user);

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          
          // Check if onboarding is complete
          if (!profileData.onboarding_completed) {
            navigate('/onboarding');
            return;
          }
        }

        // Fetch user's current program and today's workout
        const { data: userProgram } = await supabase
          .from('user_programs')
          .select(`
            *,
            programs (
              id,
              name,
              workouts (
                id,
                name,
                day_number,
                week_number,
                exercises (
                  id,
                  name,
                  sets,
                  reps,
                  order_index
                )
              )
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (userProgram?.programs?.workouts) {
          const currentDay = userProgram.current_day || 1;
          const currentWeek = userProgram.current_week || 1;
          
          const todaysWorkout = userProgram.programs.workouts.find(
            (w: any) => w.week_number === currentWeek && w.day_number === currentDay
          );

          if (todaysWorkout) {
            setTodayWorkout({
              id: todaysWorkout.id,
              name: todaysWorkout.name,
              exercises: (todaysWorkout.exercises || [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((e: any) => ({
                  name: e.name,
                  sets: e.sets,
                  reps: e.reps
                }))
            });
          }
        }

        // Calculate actual streak from workout logs
        const { data: logs } = await supabase
          .from('workout_logs')
          .select('logged_at')
          .eq('user_id', session.user.id)
          .order('logged_at', { ascending: false })
          .limit(30);

        if (logs && logs.length > 0) {
          let calculatedStreak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const uniqueDates = [...new Set(logs.map(l => 
            new Date(l.logged_at).toDateString()
          ))];
          
          for (let i = 0; i < uniqueDates.length; i++) {
            const logDate = new Date(uniqueDates[i]);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            
            if (logDate.toDateString() === expectedDate.toDateString()) {
              calculatedStreak++;
            } else {
              break;
            }
          }
          setStreak(calculatedStreak);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const toggleExercise = (exerciseName: string) => {
    setCompletedExercises(prev => {
      if (prev.includes(exerciseName)) {
        return prev.filter(e => e !== exerciseName);
      }
      return [...prev, exerciseName];
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const completionPercent = todayWorkout 
    ? (completedExercises.length / todayWorkout.exercises.length) * 100 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Dumbbell className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-accent" />
              <span className="font-display font-bold text-lg">Limitless Coach</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="text-primary-foreground hover:bg-white/10"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-white/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/70 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-display font-bold">
                {profile?.full_name || user?.email?.split('@')[0] || 'Champion'}
              </h1>
            </div>
            <div className="text-center bg-accent/20 rounded-lg px-4 py-2">
              <Flame className="h-6 w-6 text-accent mx-auto" />
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-primary-foreground/70">Day Streak</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Today's Workout Card */}
        <Card className="border-2 border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">Today's Workout</CardTitle>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedExercises.length}/{todayWorkout?.exercises.length || 0} done
              </span>
            </div>
            <Progress value={completionPercent} className="h-2 mt-2" />
          </CardHeader>
          <CardContent>
            {todayWorkout ? (
              <>
                <h3 className="font-semibold mb-4">{todayWorkout.name}</h3>
                <div className="space-y-3">
                  {todayWorkout.exercises.map((exercise) => (
                    <div
                      key={exercise.name}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        completedExercises.includes(exercise.name)
                          ? 'bg-accent/10 border border-accent/30'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => toggleExercise(exercise.name)}
                    >
                      {completedExercises.includes(exercise.name) ? (
                        <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          completedExercises.includes(exercise.name) ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {exercise.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>

                {completionPercent === 100 && (
                  <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30 text-center">
                    <p className="font-semibold text-accent">Workout Complete! 🎉</p>
                    <p className="text-sm text-muted-foreground">Great work. Keep the momentum going.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No workout scheduled for today.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/programs')}
                >
                  Browse Programs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/coach-chat')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Ask Bill Coach</p>
                <p className="text-xs text-muted-foreground">Get advice & motivation</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/reflection')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BookHeart className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Daily Inventory</p>
                <p className="text-xs text-muted-foreground">Reflect & grow</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors bg-gradient-to-r from-primary/5 to-transparent border-primary/30"
            onClick={() => navigate('/momentum-reset')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">21-Day Momentum Reset</p>
                <p className="text-xs text-muted-foreground">Featured program</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/form-check')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Camera className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Form Check</p>
                <p className="text-xs text-muted-foreground">AI form analysis</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/nutrition')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Utensils className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Nutrition</p>
                <p className="text-xs text-muted-foreground">Track your macros</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/progress')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-medium">Progress</p>
                <p className="text-xs text-muted-foreground">View your stats</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/affirmations')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Flame className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="font-medium">Affirmations</p>
                <p className="text-xs text-muted-foreground">Positive reminders</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors bg-gradient-to-r from-green-500/5 to-transparent border-green-500/30"
            onClick={() => navigate('/health-goals')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Health Goals</p>
                <p className="text-xs text-muted-foreground">Fix pain & injuries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground px-4">
          Limitless Coach provides fitness education and motivation. Not medical advice. 
          Consult physician for health concerns.
        </p>
      </main>
    </div>
  );
};

export default Today;