import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Sun, 
  Moon, 
  Coffee, 
  Heart, 
  Sparkles, 
  Plus, 
  X, 
  ArrowLeft,
  CheckCircle2,
  Leaf,
  Brain,
  Users,
  BookOpen
} from "lucide-react";

type ReflectionType = "morning" | "midday" | "evening";

const getTimeOfDay = (): ReflectionType => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "midday";
  return "evening";
};

const reflectionPrompts = {
  morning: {
    intentions: "How do you want to feel today? What kind of person do you want to be?",
    gratitude: "What are you grateful for this morning?",
    notes: "Any thoughts, prayers, or reflections to start your day?",
    wins: "",
    growth_areas: ""
  },
  midday: {
    wins: "What's going well so far today?",
    growth_areas: "Anything you'd like to handle differently this afternoon?",
    notes: "How are you feeling right now? What do you need?",
    intentions: "",
    gratitude: ""
  },
  evening: {
    wins: "What went well today? What are you proud of?",
    growth_areas: "What could you have done better? No judgment, just awareness.",
    gratitude: "What are you grateful for tonight?",
    notes: "Any amends to make? Anyone to reach out to? Thoughts for tomorrow?",
    intentions: ""
  }
};

const reflectionConfig = {
  morning: {
    icon: Sun,
    title: "Morning Intention",
    subtitle: "Set your compass for the day ahead",
    greeting: "Good morning",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  midday: {
    icon: Coffee,
    title: "Midday Check-In",
    subtitle: "Pause, breathe, and recalibrate",
    greeting: "Take a moment",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  evening: {
    icon: Moon,
    title: "Evening Reflection",
    subtitle: "Close the day with honesty and grace",
    greeting: "Welcome to stillness",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10"
  }
};

const feelingsOptions = [
  "Peaceful", "Anxious", "Grateful", "Tired", "Hopeful", 
  "Frustrated", "Content", "Overwhelmed", "Energized", "Sad",
  "Calm", "Excited", "Uncertain", "Loved", "Lonely"
];

export default function Reflection() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reflectionType, setReflectionType] = useState<ReflectionType>(getTimeOfDay());
  
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [newGratitude, setNewGratitude] = useState("");
  const [wins, setWins] = useState<string[]>([]);
  const [newWin, setNewWin] = useState("");
  const [growthAreas, setGrowthAreas] = useState<string[]>([]);
  const [newGrowth, setNewGrowth] = useState("");
  const [intentions, setIntentions] = useState<string[]>([]);
  const [newIntention, setNewIntention] = useState("");
  const [feelingsCheck, setFeelingsCheck] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [todayReflection, setTodayReflection] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTodayReflection();
    }
  }, [user, reflectionType]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    setLoading(false);
  };

  const loadTodayReflection = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("reflections")
      .select("*")
      .eq("user_id", user.id)
      .eq("reflection_date", today)
      .eq("reflection_type", reflectionType)
      .maybeSingle();

    if (data) {
      setTodayReflection(data);
      setGratitudeItems(data.gratitude_items || []);
      setWins(data.wins || []);
      setGrowthAreas(data.growth_areas || []);
      setIntentions(data.intentions || []);
      setFeelingsCheck(data.feelings_check || "");
      setNotes(data.notes || "");
    } else {
      // Reset form for new reflection
      setTodayReflection(null);
      setGratitudeItems([]);
      setWins([]);
      setGrowthAreas([]);
      setIntentions([]);
      setFeelingsCheck("");
      setNotes("");
    }
  };

  const addItem = (
    list: string[], 
    setList: (items: string[]) => void, 
    newItem: string, 
    setNewItem: (val: string) => void
  ) => {
    if (newItem.trim()) {
      setList([...list, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const saveReflection = async () => {
    if (!user) return;
    setSaving(true);

    const today = new Date().toISOString().split('T')[0];
    const reflectionData = {
      user_id: user.id,
      reflection_type: reflectionType,
      reflection_date: today,
      gratitude_items: gratitudeItems,
      wins: wins,
      growth_areas: growthAreas,
      intentions: intentions,
      feelings_check: feelingsCheck,
      notes: notes
    };

    let error;
    if (todayReflection) {
      const result = await supabase
        .from("reflections")
        .update(reflectionData)
        .eq("id", todayReflection.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("reflections")
        .insert(reflectionData);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast.error("Failed to save reflection");
      console.error(error);
    } else {
      toast.success("Reflection saved");
      loadTodayReflection();
    }
  };

  const config = reflectionConfig[reflectionType];
  const Icon = config.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Leaf className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/today")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Daily Inventory</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Time of Day Selector */}
        <div className="flex gap-2 justify-center">
          {(["morning", "midday", "evening"] as ReflectionType[]).map((type) => {
            const typeConfig = reflectionConfig[type];
            const TypeIcon = typeConfig.icon;
            return (
              <Button
                key={type}
                variant={reflectionType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setReflectionType(type)}
                className="gap-2"
              >
                <TypeIcon className="h-4 w-4" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            );
          })}
        </div>

        {/* Greeting Card */}
        <Card className={`${config.bgColor} border-0`}>
          <CardHeader className="text-center pb-2">
            <div className={`mx-auto p-3 rounded-full ${config.bgColor} mb-2`}>
              <Icon className={`h-8 w-8 ${config.color}`} />
            </div>
            <CardTitle className="text-xl">{config.title}</CardTitle>
            <CardDescription className="text-base">{config.subtitle}</CardDescription>
          </CardHeader>
        </Card>

        {/* Feelings Check */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              How are you feeling?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {feelingsOptions.map((feeling) => (
                <Badge
                  key={feeling}
                  variant={feelingsCheck === feeling ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setFeelingsCheck(feeling)}
                >
                  {feeling}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intentions (Morning) */}
        {reflectionType === "morning" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Intentions
              </CardTitle>
              <CardDescription>{reflectionPrompts[reflectionType].intentions}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="I want to be present and patient..."
                  value={newIntention}
                  onChange={(e) => setNewIntention(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem(intentions, setIntentions, newIntention, setNewIntention)}
                />
                <Button size="icon" variant="outline" onClick={() => addItem(intentions, setIntentions, newIntention, setNewIntention)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {intentions.map((item, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 py-1.5">
                    {item}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(intentions, setIntentions, i)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wins */}
        {(reflectionType === "midday" || reflectionType === "evening") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Wins
              </CardTitle>
              <CardDescription>{reflectionPrompts[reflectionType].wins}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="I handled that conversation well..."
                  value={newWin}
                  onChange={(e) => setNewWin(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem(wins, setWins, newWin, setNewWin)}
                />
                <Button size="icon" variant="outline" onClick={() => addItem(wins, setWins, newWin, setNewWin)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {wins.map((item, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    {item}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(wins, setWins, i)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Growth Areas */}
        {(reflectionType === "midday" || reflectionType === "evening") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Areas for Growth
              </CardTitle>
              <CardDescription>{reflectionPrompts[reflectionType].growth_areas}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="I could have listened more..."
                  value={newGrowth}
                  onChange={(e) => setNewGrowth(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem(growthAreas, setGrowthAreas, newGrowth, setNewGrowth)}
                />
                <Button size="icon" variant="outline" onClick={() => addItem(growthAreas, setGrowthAreas, newGrowth, setNewGrowth)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {growthAreas.map((item, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-300">
                    {item}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(growthAreas, setGrowthAreas, i)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gratitude */}
        {(reflectionType === "morning" || reflectionType === "evening") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Gratitude
              </CardTitle>
              <CardDescription>{reflectionPrompts[reflectionType].gratitude}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="I'm grateful for..."
                  value={newGratitude}
                  onChange={(e) => setNewGratitude(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem(gratitudeItems, setGratitudeItems, newGratitude, setNewGratitude)}
                />
                <Button size="icon" variant="outline" onClick={() => addItem(gratitudeItems, setGratitudeItems, newGratitude, setNewGratitude)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {gratitudeItems.map((item, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 py-1.5 bg-rose-500/10 text-rose-700 dark:text-rose-300">
                    {item}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(gratitudeItems, setGratitudeItems, i)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Free-form Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Journal
            </CardTitle>
            <CardDescription>{reflectionPrompts[reflectionType].notes}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write freely here. This is your private space..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Quick Links to Related Features */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Continue Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/relationships")}>
              <Users className="h-5 w-5" />
              <span className="text-xs">Relationships</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/affirmations")}>
              <Sparkles className="h-5 w-5" />
              <span className="text-xs">Affirmations</span>
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={saveReflection}
          disabled={saving}
        >
          {saving ? "Saving..." : todayReflection ? "Update Reflection" : "Save Reflection"}
        </Button>

        {/* Gentle Reminder */}
        <p className="text-center text-sm text-muted-foreground px-4 pb-8">
          "Progress, not perfection. One day at a time."
        </p>
      </main>
    </div>
  );
}
