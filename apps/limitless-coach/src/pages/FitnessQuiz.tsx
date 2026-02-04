import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Target, Zap, Trophy, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type QuizStep = 'goal' | 'frequency' | 'experience' | 'challenge' | 'email' | 'results';

const goals = [
  { id: 'fat_loss', label: 'Lose Fat', icon: Zap, description: 'Burn fat and get lean' },
  { id: 'build_muscle', label: 'Build Muscle', icon: Target, description: 'Gain strength and size' },
  { id: 'get_fit', label: 'Get Fit', icon: Heart, description: 'Improve overall fitness' },
  { id: 'rebuild', label: 'Rebuild Momentum', icon: Trophy, description: 'Get back on track' },
];

const frequencies = [
  { id: '2-3', label: '2-3 days/week', description: 'Perfect for beginners' },
  { id: '3-4', label: '3-4 days/week', description: 'Balanced approach' },
  { id: '5+', label: '5+ days/week', description: 'Serious commitment' },
];

const experiences = [
  { id: 'beginner', label: 'Beginner', description: 'New to fitness or returning' },
  { id: 'intermediate', label: 'Intermediate', description: '6+ months consistent training' },
  { id: 'advanced', label: 'Advanced', description: '2+ years of training' },
];

const challenges = [
  { id: 'motivation', label: 'Staying Motivated' },
  { id: 'time', label: 'Finding Time' },
  { id: 'knowledge', label: 'Knowing What to Do' },
  { id: 'consistency', label: 'Being Consistent' },
  { id: 'injury', label: 'Injury/Pain' },
];

const FitnessQuiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<QuizStep>('goal');
  const [answers, setAnswers] = useState({
    goal: '',
    frequency: '',
    experience: '',
    challenges: [] as string[],
  });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: QuizStep[] = ['goal', 'frequency', 'experience', 'challenge', 'email', 'results'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  const getReadinessScore = () => {
    let score = 50;
    if (answers.frequency === '5+') score += 15;
    else if (answers.frequency === '3-4') score += 10;
    else score += 5;
    
    if (answers.experience === 'advanced') score += 15;
    else if (answers.experience === 'intermediate') score += 10;
    else score += 5;
    
    if (answers.challenges.length <= 1) score += 10;
    else if (answers.challenges.length <= 2) score += 5;
    
    return Math.min(score, 95);
  };

  const getPersonalizedMessage = () => {
    const score = getReadinessScore();
    if (score >= 80) return "You're ready to crush it! Your commitment level is excellent.";
    if (score >= 65) return "Great foundation! With the right program, you'll see results fast.";
    return "Perfect timing to rebuild momentum. Let's start with a focused plan.";
  };

  const handleSubmit = async () => {
    if (!email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert({
        email,
        name: name || null,
        source: 'quiz',
        lead_magnet: 'fitness_assessment',
        quiz_results: {
          ...answers,
          score: getReadinessScore(),
        },
        subscribed_newsletter: true,
      });

      if (error) {
        if (error.code === '23505') {
          // Duplicate - that's fine, show results anyway
          setStep('results');
        } else {
          throw error;
        }
      } else {
        setStep('results');
        toast({ title: "Results unlocked!", description: "Check your email for your free 7-day program." });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChallenge = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      challenges: prev.challenges.includes(id)
        ? prev.challenges.filter(c => c !== id)
        : [...prev.challenges, id]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 'goal': return !!answers.goal;
      case 'frequency': return !!answers.frequency;
      case 'experience': return !!answers.experience;
      case 'challenge': return answers.challenges.length > 0;
      case 'email': return !!email;
      default: return true;
    }
  };

  const nextStep = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      if (step === 'email') {
        handleSubmit();
      } else {
        setStep(steps[idx + 1]);
      }
    }
  };

  const prevStep = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step === 'goal' ? navigate(-1) : prevStep()}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg">Fitness Assessment</h1>
            <Progress value={progress} className="h-1 mt-1" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-24">
        {/* Goal Step */}
        {step === 'goal' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-4">
              <h2 className="font-display text-2xl font-bold mb-2">What's your #1 goal?</h2>
              <p className="text-muted-foreground">Choose what matters most right now</p>
            </div>
            <div className="grid gap-3">
              {goals.map((goal) => (
                <Card 
                  key={goal.id}
                  className={`cursor-pointer transition-all ${
                    answers.goal === goal.id 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setAnswers(prev => ({ ...prev, goal: goal.id }))}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      answers.goal === goal.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <goal.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{goal.label}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    {answers.goal === goal.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Frequency Step */}
        {step === 'frequency' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-4">
              <h2 className="font-display text-2xl font-bold mb-2">How often can you train?</h2>
              <p className="text-muted-foreground">Be realistic - consistency beats intensity</p>
            </div>
            <div className="grid gap-3">
              {frequencies.map((freq) => (
                <Card 
                  key={freq.id}
                  className={`cursor-pointer transition-all ${
                    answers.frequency === freq.id 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setAnswers(prev => ({ ...prev, frequency: freq.id }))}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{freq.label}</h3>
                      <p className="text-sm text-muted-foreground">{freq.description}</p>
                    </div>
                    {answers.frequency === freq.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Experience Step */}
        {step === 'experience' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-4">
              <h2 className="font-display text-2xl font-bold mb-2">What's your experience level?</h2>
              <p className="text-muted-foreground">This helps us personalize your program</p>
            </div>
            <div className="grid gap-3">
              {experiences.map((exp) => (
                <Card 
                  key={exp.id}
                  className={`cursor-pointer transition-all ${
                    answers.experience === exp.id 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setAnswers(prev => ({ ...prev, experience: exp.id }))}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{exp.label}</h3>
                      <p className="text-sm text-muted-foreground">{exp.description}</p>
                    </div>
                    {answers.experience === exp.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Challenges Step */}
        {step === 'challenge' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-4">
              <h2 className="font-display text-2xl font-bold mb-2">What's holding you back?</h2>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid gap-3">
              {challenges.map((challenge) => (
                <Card 
                  key={challenge.id}
                  className={`cursor-pointer transition-all ${
                    answers.challenges.includes(challenge.id)
                      ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleChallenge(challenge.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <h3 className="font-semibold">{challenge.label}</h3>
                    {answers.challenges.includes(challenge.id) && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-4">
              <h2 className="font-display text-2xl font-bold mb-2">Almost there!</h2>
              <p className="text-muted-foreground">
                Enter your email to unlock your personalized results and free 7-day starter program
              </p>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name (optional)</label>
                  <Input 
                    placeholder="Your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email *</label>
                  <Input 
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll also receive weekly tips from Coach Bill. Unsubscribe anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-display font-bold text-primary">{getReadinessScore()}</span>
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Your Readiness Score</h2>
              <p className="text-muted-foreground">{getPersonalizedMessage()}</p>
            </div>

            <Card className="bg-accent/10 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Your Personalized Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium">Goal: {goals.find(g => g.id === answers.goal)?.label}</p>
                    <p className="text-sm text-muted-foreground">We'll focus your program on this</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium">{frequencies.find(f => f.id === answers.frequency)?.label}</p>
                    <p className="text-sm text-muted-foreground">Your workout schedule</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium">{experiences.find(e => e.id === answers.experience)?.label} level</p>
                    <p className="text-sm text-muted-foreground">Exercises matched to your experience</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <h3 className="font-display text-xl font-bold mb-2">Your Free 7-Day Program</h3>
                <p className="text-primary-foreground/80 mb-4">
                  Check your email for instant access to your personalized starter program!
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Create Free Account
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/coaches')}
              >
                Meet Coach Bill
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate('/programs')}
              >
                Browse Programs
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step !== 'results' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            <div className="max-w-2xl mx-auto">
              <Button 
                className="w-full" 
                size="lg"
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : step === 'email' ? 'Get My Results' : 'Continue'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FitnessQuiz;
