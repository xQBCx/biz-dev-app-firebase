import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Utensils, Plus, Droplets, Apple,
  Beef, Wheat, Flame, Target
} from "lucide-react";

type MacroTarget = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type MacroProgress = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

const Nutrition = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [targets, setTargets] = useState<MacroTarget>({
    calories: 2200,
    protein: 150,
    carbs: 220,
    fats: 73
  });
  const [progress, setProgress] = useState<MacroProgress>({
    calories: 1450,
    protein: 95,
    carbs: 140,
    fats: 48
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

  const getPercentage = (current: number, target: number) => 
    Math.min(Math.round((current / target) * 100), 100);

  const getMacroColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return "text-success";
    if (percentage >= 75) return "text-warning";
    return "text-muted-foreground";
  };

  const quickAddOptions = [
    { name: "Protein Shake", calories: 200, protein: 30, carbs: 10, fats: 3 },
    { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { name: "Rice (1 cup)", calories: 206, protein: 4, carbs: 45, fats: 0.4 },
    { name: "Eggs (2)", calories: 156, protein: 12, carbs: 1, fats: 11 },
  ];

  const handleQuickAdd = (food: typeof quickAddOptions[0]) => {
    setProgress(prev => ({
      calories: prev.calories + food.calories,
      protein: prev.protein + food.protein,
      carbs: prev.carbs + food.carbs,
      fats: prev.fats + food.fats
    }));
    toast({
      title: `Added ${food.name}`,
      description: `+${food.calories} cal, +${food.protein}g protein`
    });
  };

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
            <h1 className="text-xl font-display font-bold">Nutrition</h1>
            <p className="text-xs text-primary-foreground/70">
              Track your macros
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Calories Summary */}
        <Card className="border-2 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Flame className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="text-2xl font-display font-bold">
                    {progress.calories} <span className="text-lg font-normal text-muted-foreground">/ {targets.calories}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-bold text-accent">
                  {targets.calories - progress.calories}
                </p>
                <p className="text-xs text-muted-foreground">remaining</p>
              </div>
            </div>
            <Progress 
              value={getPercentage(progress.calories, targets.calories)} 
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <Card>
            <CardContent className="p-4 text-center">
              <Beef className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Protein</p>
              <p className={`text-xl font-bold ${getMacroColor(getPercentage(progress.protein, targets.protein))}`}>
                {progress.protein}g
              </p>
              <p className="text-xs text-muted-foreground">/ {targets.protein}g</p>
              <Progress 
                value={getPercentage(progress.protein, targets.protein)} 
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>

          {/* Carbs */}
          <Card>
            <CardContent className="p-4 text-center">
              <Wheat className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Carbs</p>
              <p className={`text-xl font-bold ${getMacroColor(getPercentage(progress.carbs, targets.carbs))}`}>
                {progress.carbs}g
              </p>
              <p className="text-xs text-muted-foreground">/ {targets.carbs}g</p>
              <Progress 
                value={getPercentage(progress.carbs, targets.carbs)} 
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>

          {/* Fats */}
          <Card>
            <CardContent className="p-4 text-center">
              <Droplets className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Fats</p>
              <p className={`text-xl font-bold ${getMacroColor(getPercentage(progress.fats, targets.fats))}`}>
                {progress.fats}g
              </p>
              <p className="text-xs text-muted-foreground">/ {targets.fats}g</p>
              <Progress 
                value={getPercentage(progress.fats, targets.fats)} 
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Add */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-accent" />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickAddOptions.map(food => (
                <Button
                  key={food.name}
                  variant="outline"
                  className="justify-start h-auto py-3 px-3"
                  onClick={() => handleQuickAdd(food)}
                >
                  <div className="text-left">
                    <p className="font-medium text-sm">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.calories} cal • {food.protein}g protein
                    </p>
                  </div>
                </Button>
              ))}
            </div>

            <Button className="w-full mt-4" variant="outline">
              <Utensils className="h-4 w-4 mr-2" />
              Log Custom Meal
            </Button>
          </CardContent>
        </Card>

        {/* Plate Guide */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Simple Plate Guide</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Each meal, aim for this balance:
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full" />
                    <span>½ plate vegetables</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-accent rounded-full" />
                    <span>¼ plate lean protein</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-warning rounded-full" />
                    <span>¼ plate complex carbs</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground px-4">
          Nutrition tracking is for educational purposes. Consult a registered dietitian for personalized nutrition advice.
        </p>
      </main>
    </div>
  );
};

export default Nutrition;