import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Play, CheckCircle2, Circle, Dumbbell, 
  Brain, Clock, ChevronRight, Flame, Target, BookHeart
} from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight_type: string;
  form_cues: string[];
  order_index: number;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  week_number: number;
  day_number: number;
  estimated_duration_minutes: number;
  exercises: Exercise[];
}

interface Program {
  id: string;
  name: string;
  description: string;
  weeks: number;
  frequency_per_week: number;
  difficulty_level: string;
  equipment_required: string[];
}

const weekThemes = [
  {
    week: 1,
    name: "Foundation",
    focus: "Reconnect with your body through fundamental movement patterns",
    reflection: "What does starting over mean to you? How can you approach this week with curiosity instead of judgment?",
    color: "from-blue-500/20 to-blue-600/10"
  },
  {
    week: 2,
    name: "Rhythm",
    focus: "Build consistent training patterns and increase intensity",
    reflection: "What patterns are serving you? What patterns need to change?",
    color: "from-purple-500/20 to-purple-600/10"
  },
  {
    week: 3,
    name: "Momentum",
    focus: "Add power and complexity. You've earned this.",
    reflection: "How has your relationship with movement shifted? What will you carry forward?",
    color: "from-orange-500/20 to-orange-600/10"
  }
];

export default function MomentumReset() {
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState("1");
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchProgram();
  }, []);

  const checkAuthAndFetchProgram = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
    
    // Check if user is enrolled
    if (user) {
      const { data: enrollment } = await supabase
        .from('user_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .maybeSingle();
      
      setEnrolled(!!enrollment);
      if (enrollment) {
        setActiveWeek(String(enrollment.current_week || 1));
      }
    }

    await fetchProgram();
  };

  const fetchProgram = async () => {
    try {
      // Fetch program
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .maybeSingle();

      if (programError) throw programError;
      setProgram(programData);

      // Fetch workouts with exercises
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (*)
        `)
        .eq('program_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });

      if (workoutsError) throw workoutsError;
      
      const formattedWorkouts = workoutsData?.map(w => ({
        ...w,
        exercises: (w.exercises || []).sort((a: Exercise, b: Exercise) => a.order_index - b.order_index)
      })) || [];
      
      setWorkouts(formattedWorkouts);
    } catch (error) {
      console.error('Error fetching program:', error);
      toast.error('Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!userId) {
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_programs')
        .insert({
          user_id: userId,
          program_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          current_week: 1,
          current_day: 1,
          status: 'active'
        });

      if (error) throw error;
      setEnrolled(true);
      toast.success('Welcome to your 21-Day Momentum Reset!');
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to enroll');
    }
  };

  const getWeekWorkouts = (weekNum: number) => {
    return workouts.filter(w => w.week_number === weekNum);
  };

  const calculateProgress = () => {
    const totalWorkouts = workouts.length;
    return totalWorkouts > 0 ? (completedWorkouts.size / totalWorkouts) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading program...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Program not found</p>
          <Button onClick={() => navigate('/programs')}>Browse Programs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                {program.difficulty_level}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{program.name}</h1>
              <p className="text-muted-foreground max-w-xl">{program.description}</p>
              
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {program.weeks} weeks
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  {program.frequency_per_week}x per week
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {program.equipment_required?.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {enrolled && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          )}

          {!enrolled && (
            <Button onClick={handleEnroll} size="lg" className="mt-6">
              <Play className="h-4 w-4 mr-2" />
              Start This Program
            </Button>
          )}
        </div>
      </div>

      {/* Week Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeWeek} onValueChange={setActiveWeek}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="1" className="flex items-center gap-2">
              <span className="hidden sm:inline">Week 1:</span> Foundation
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center gap-2">
              <span className="hidden sm:inline">Week 2:</span> Rhythm
            </TabsTrigger>
            <TabsTrigger value="3" className="flex items-center gap-2">
              <span className="hidden sm:inline">Week 3:</span> Momentum
            </TabsTrigger>
          </TabsList>

          {weekThemes.map((theme) => (
            <TabsContent key={theme.week} value={String(theme.week)} className="space-y-6">
              {/* Week Overview Card */}
              <Card className={`bg-gradient-to-br ${theme.color} border-border/50`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-primary" />
                    Week {theme.week}: {theme.name}
                  </CardTitle>
                  <CardDescription className="text-foreground/80">
                    {theme.focus}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                    <Brain className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Weekly Reflection Prompt</p>
                      <p className="text-sm text-muted-foreground italic">"{theme.reflection}"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Reflection Reminder */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate('/reflection')}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <BookHeart className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Daily Inventory</p>
                      <p className="text-sm text-muted-foreground">Complete your morning, midday, or evening reflection</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Workouts */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Workouts</h3>
                {getWeekWorkouts(theme.week).map((workout) => (
                  <Card key={workout.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {completedWorkouts.has(workout.id) ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                          <div>
                            <CardTitle className="text-lg">Day {workout.day_number}: {workout.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {workout.estimated_duration_minutes} min
                              <span className="mx-1">•</span>
                              {workout.exercises.length} exercises
                            </CardDescription>
                          </div>
                        </div>
                        {enrolled && (
                          <Button 
                            size="sm" 
                            variant={completedWorkouts.has(workout.id) ? "outline" : "default"}
                          >
                            {completedWorkouts.has(workout.id) ? "Review" : "Start"}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">{workout.description}</p>
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, idx) => (
                          <div 
                            key={exercise.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium text-muted-foreground w-5">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-medium text-sm">{exercise.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {exercise.sets} sets × {exercise.reps}
                                  {exercise.rest_seconds > 0 && ` • ${exercise.rest_seconds}s rest`}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {exercise.weight_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          xCOACHx provides fitness education and motivation. Not medical advice. 
          Consult physician for health concerns.
        </p>
      </div>
    </div>
  );
}
