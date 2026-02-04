import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, Calendar, Dumbbell, Activity, Heart, 
  ArrowRight, ArrowLeft, CheckCircle2, Flame,
  Home, Building2, Timer
} from "lucide-react";

type OnboardingData = {
  fitness_goals: string[];
  available_days: string[];
  workout_duration_minutes: number;
  equipment_access: string[];
  experience_level: string;
  injuries: string[];
};

const goalOptions = [
  { id: "fat_loss", label: "Fat Loss", icon: Flame, description: "Lose weight and get lean" },
  { id: "strength", label: "Build Strength", icon: Dumbbell, description: "Get stronger and build muscle" },
  { id: "momentum", label: "Rebuild Momentum", icon: Target, description: "Get back into a routine" },
  { id: "confidence", label: "Build Confidence", icon: Heart, description: "Feel better in your body" },
];

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const durationOptions = [
  { value: 30, label: "30 min", description: "Quick & focused" },
  { value: 45, label: "45 min", description: "Balanced session" },
  { value: 60, label: "60 min", description: "Full workout" },
];

const equipmentOptions = [
  { id: "gym", label: "Full Gym", icon: Building2, description: "Access to machines & free weights" },
  { id: "home_basic", label: "Home Basic", icon: Home, description: "Dumbbells, bands, mat" },
  { id: "bodyweight", label: "Bodyweight Only", icon: Activity, description: "No equipment needed" },
];

const experienceOptions = [
  { id: "beginner", label: "Beginner", description: "New to fitness or returning after 6+ months" },
  { id: "intermediate", label: "Intermediate", description: "Consistent training for 6-24 months" },
  { id: "advanced", label: "Advanced", description: "2+ years of consistent training" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fitness_goals: [],
    available_days: [],
    workout_duration_minutes: 45,
    equipment_access: [],
    experience_level: "beginner",
    injuries: [],
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const toggleArrayItem = (field: keyof OnboardingData, item: string) => {
    setData(prev => {
      const current = prev[field] as string[];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) };
      }
      return { ...prev, [field]: [...current, item] };
    });
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        // Store data temporarily and redirect to auth
        localStorage.setItem('onboarding_data', JSON.stringify(data));
        navigate('/auth?redirect=complete-onboarding');
        return;
      }

      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          fitness_goals: data.fitness_goals,
          available_days: data.available_days,
          workout_duration_minutes: data.workout_duration_minutes,
          equipment_access: data.equipment_access,
          experience_level: data.experience_level,
          injuries: data.injuries,
          onboarding_completed: true,
        })
        .eq('id', session.session.user.id);

      if (error) throw error;

      toast({
        title: "Welcome to Limitless Coach!",
        description: "Your personalized program is ready.",
      });

      navigate('/today');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.fitness_goals.length > 0;
      case 2: return data.available_days.length >= 2;
      case 3: return data.workout_duration_minutes > 0;
      case 4: return data.equipment_access.length > 0;
      case 5: return data.experience_level !== "";
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-white hover:text-accent transition-colors"
          >
            <Dumbbell className="h-6 w-6 text-accent" />
            <span className="font-display font-bold text-lg">Limitless Coach</span>
          </button>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Skip for now
            </Button>
            <span className="text-white/60 text-sm">Step {step} of {totalSteps}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-white/20" />
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Step 1: Goals */}
          {step === 1 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <Target className="h-12 w-12 text-accent mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  What's your main goal?
                </h1>
                <p className="text-white/70">Select all that apply</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goalOptions.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      data.fitness_goals.includes(goal.id)
                        ? "border-accent bg-accent/10"
                        : "bg-white/10 border-white/20 hover:border-white/40"
                    }`}
                    onClick={() => toggleArrayItem("fitness_goals", goal.id)}
                  >
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        data.fitness_goals.includes(goal.id) ? "bg-accent" : "bg-white/20"
                      }`}>
                        <goal.icon className={`h-6 w-6 ${
                          data.fitness_goals.includes(goal.id) ? "text-accent-foreground" : "text-white"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{goal.label}</h3>
                        <p className="text-sm text-white/60">{goal.description}</p>
                      </div>
                      {data.fitness_goals.includes(goal.id) && (
                        <CheckCircle2 className="h-6 w-6 text-accent" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <Calendar className="h-12 w-12 text-accent mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  When can you train?
                </h1>
                <p className="text-white/70">Select at least 2 days</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {dayOptions.map((day) => (
                  <Button
                    key={day}
                    variant={data.available_days.includes(day) ? "default" : "outline"}
                    className={`px-6 py-6 ${
                      data.available_days.includes(day)
                        ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                        : "bg-white/10 border-white/30 text-white hover:bg-white/20"
                    }`}
                    onClick={() => toggleArrayItem("available_days", day)}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Duration */}
          {step === 3 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <Timer className="h-12 w-12 text-accent mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  How long per workout?
                </h1>
                <p className="text-white/70">We'll design sessions to fit your schedule</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {durationOptions.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      data.workout_duration_minutes === option.value
                        ? "border-accent bg-accent/10"
                        : "bg-white/10 border-white/20 hover:border-white/40"
                    }`}
                    onClick={() => setData({ ...data, workout_duration_minutes: option.value })}
                  >
                    <CardContent className="p-6 text-center">
                      <p className="text-3xl font-display font-bold text-white mb-1">{option.label}</p>
                      <p className="text-sm text-white/60">{option.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Equipment */}
          {step === 4 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <Dumbbell className="h-12 w-12 text-accent mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  What equipment do you have?
                </h1>
                <p className="text-white/70">Select all that apply</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {equipmentOptions.map((eq) => (
                  <Card
                    key={eq.id}
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      data.equipment_access.includes(eq.id)
                        ? "border-accent bg-accent/10"
                        : "bg-white/10 border-white/20 hover:border-white/40"
                    }`}
                    onClick={() => toggleArrayItem("equipment_access", eq.id)}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        data.equipment_access.includes(eq.id) ? "bg-accent" : "bg-white/20"
                      }`}>
                        <eq.icon className={`h-6 w-6 ${
                          data.equipment_access.includes(eq.id) ? "text-accent-foreground" : "text-white"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{eq.label}</h3>
                        <p className="text-sm text-white/60">{eq.description}</p>
                      </div>
                      {data.equipment_access.includes(eq.id) && (
                        <CheckCircle2 className="h-6 w-6 text-accent" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Experience */}
          {step === 5 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <Activity className="h-12 w-12 text-accent mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  What's your experience level?
                </h1>
                <p className="text-white/70">Be honest—we'll meet you where you are</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {experienceOptions.map((exp) => (
                  <Card
                    key={exp.id}
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      data.experience_level === exp.id
                        ? "border-accent bg-accent/10"
                        : "bg-white/10 border-white/20 hover:border-white/40"
                    }`}
                    onClick={() => setData({ ...data, experience_level: exp.id })}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg">{exp.label}</h3>
                        <p className="text-sm text-white/60">{exp.description}</p>
                      </div>
                      {data.experience_level === exp.id && (
                        <CheckCircle2 className="h-6 w-6 text-accent" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
          >
            {step === totalSteps ? (
              isSubmitting ? "Creating Program..." : "Get My Program"
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;