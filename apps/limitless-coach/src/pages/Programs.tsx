import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Dumbbell, Clock, Calendar, Filter,
  Star, ChevronRight, Lock, CheckCircle
} from "lucide-react";

type Program = {
  id: string;
  name: string;
  description: string;
  weeks: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  workoutsPerWeek: number;
  durationMinutes: number;
  rating: number;
  enrolled: number;
  isPro: boolean;
};

const mockPrograms: Program[] = [
  {
    id: "1",
    name: "Rebuild Momentum",
    description: "Perfect for getting back into fitness after a break. Progressive, sustainable, and built for consistency.",
    weeks: 4,
    difficulty: "beginner",
    category: "re-entry",
    workoutsPerWeek: 3,
    durationMinutes: 30,
    rating: 4.9,
    enrolled: 847,
    isPro: false,
  },
  {
    id: "2",
    name: "Strength Foundations",
    description: "Build a solid base of strength with compound movements and progressive overload.",
    weeks: 8,
    difficulty: "beginner",
    category: "strength",
    workoutsPerWeek: 4,
    durationMinutes: 45,
    rating: 4.8,
    enrolled: 1203,
    isPro: false,
  },
  {
    id: "3",
    name: "Fat Loss Accelerator",
    description: "High-intensity circuits combined with strength training to maximize calorie burn.",
    weeks: 6,
    difficulty: "intermediate",
    category: "fat-loss",
    workoutsPerWeek: 5,
    durationMinutes: 40,
    rating: 4.7,
    enrolled: 956,
    isPro: true,
  },
  {
    id: "4",
    name: "Advanced Strength",
    description: "Take your strength to the next level with periodized programming and advanced techniques.",
    weeks: 12,
    difficulty: "advanced",
    category: "strength",
    workoutsPerWeek: 5,
    durationMinutes: 60,
    rating: 4.9,
    enrolled: 412,
    isPro: true,
  },
];

const categories = [
  { id: "all", label: "All Programs" },
  { id: "re-entry", label: "Re-Entry" },
  { id: "strength", label: "Strength" },
  { id: "fat-loss", label: "Fat Loss" },
];

const Programs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("type") || "all"
  );
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    // Check if user is pro (mock)
    setIsPro(false);
  }, []);

  const filteredPrograms = mockPrograms.filter(
    program => selectedCategory === "all" || program.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-success/10 text-success";
      case "intermediate": return "bg-warning/10 text-warning";
      case "advanced": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleStartProgram = (program: Program) => {
    if (program.isPro && !isPro) {
      toast({
        title: "Pro Program",
        description: "Upgrade to Pro to access this program",
      });
      return;
    }
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Programs</h1>
              <p className="text-primary-foreground/70 text-sm">
                Choose your path to results
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Featured Program - 21-Day Momentum Reset */}
        <Card 
          className="mb-6 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30"
          onClick={() => navigate('/momentum-reset')}
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-40 h-28 sm:h-auto flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 relative">
                <Dumbbell className="h-12 w-12 text-white" />
                <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">
                  FEATURED
                </Badge>
              </div>
              <div className="flex-1 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-xl">21-Day Momentum Reset</h3>
                  <Badge variant="secondary" className="text-xs">FREE</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  The flagship 3-week program for people rebuilding their training momentum. 
                  Foundation → Rhythm → Momentum.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>3 weeks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    <span>3x/week</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>15-35 min</span>
                  </div>
                </div>
                <Button size="sm">
                  View Program
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="flex-shrink-0"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid gap-4">
          {filteredPrograms.map(program => (
            <Card 
              key={program.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow ${
                program.isPro && !isPro ? 'opacity-90' : ''
              }`}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Left Side - Icon/Visual */}
                  <div className={`sm:w-32 h-24 sm:h-auto flex items-center justify-center ${
                    program.isPro ? 'bg-gradient-to-br from-accent to-accent/80' : 'bg-gradient-to-br from-primary to-primary/80'
                  }`}>
                    <Dumbbell className="h-10 w-10 text-white" />
                  </div>

                  {/* Right Side - Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{program.name}</h3>
                          {program.isPro && (
                            <Badge className="bg-accent text-accent-foreground text-xs">
                              PRO
                            </Badge>
                          )}
                        </div>
                        <Badge className={`text-xs ${getDifficultyColor(program.difficulty)}`}>
                          {program.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-medium">{program.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {program.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{program.weeks} weeks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="h-4 w-4" />
                        <span>{program.workoutsPerWeek}x/week</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{program.durationMinutes} min</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {program.enrolled.toLocaleString()} enrolled
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleStartProgram(program)}
                        className={program.isPro && !isPro ? 'bg-muted text-muted-foreground' : ''}
                      >
                        {program.isPro && !isPro ? (
                          <>
                            <Lock className="h-4 w-4 mr-1" />
                            Unlock
                          </>
                        ) : (
                          <>
                            Start Program
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pro CTA */}
        {!isPro && (
          <Card className="mt-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6 text-center">
              <Badge className="bg-accent text-accent-foreground mb-3">PRO</Badge>
              <h3 className="font-semibold text-lg mb-2">Unlock All Programs</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                Get access to our full program library, unlimited AI coaching, and advanced form analysis.
              </p>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Upgrade to Pro - $19/mo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground mt-6 px-4">
          Programs are designed for general fitness. Consult a physician before starting any exercise program.
        </p>
      </main>
    </div>
  );
};

export default Programs;