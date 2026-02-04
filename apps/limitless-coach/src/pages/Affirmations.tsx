import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Plus,
  Heart,
  Sparkles,
  Shield,
  Brain,
  Leaf,
  Star,
  Trash2
} from "lucide-react";

const categories = [
  { id: "serenity", label: "Peace & Acceptance", icon: Leaf, color: "text-emerald-500" },
  { id: "courage", label: "Courage & Action", icon: Shield, color: "text-blue-500" },
  { id: "wisdom", label: "Wisdom & Clarity", icon: Brain, color: "text-purple-500" },
  { id: "gratitude", label: "Gratitude", icon: Heart, color: "text-rose-500" },
  { id: "progress", label: "Growth & Progress", icon: Sparkles, color: "text-amber-500" },
];

const suggestedAffirmations = [
  { content: "I accept the things I cannot change and have the courage to change the things I can.", category: "serenity" },
  { content: "Today, I choose peace over being right.", category: "serenity" },
  { content: "I am worthy of love and belonging, exactly as I am.", category: "serenity" },
  { content: "I have the courage to take the next right action.", category: "courage" },
  { content: "I am brave enough to be imperfect.", category: "courage" },
  { content: "I trust the process, even when I can't see the path.", category: "wisdom" },
  { content: "My past does not define my future.", category: "wisdom" },
  { content: "I am grateful for this moment and the lessons it brings.", category: "gratitude" },
  { content: "Every day, in every way, I am getting better.", category: "progress" },
  { content: "I celebrate my small wins because they lead to big changes.", category: "progress" },
];

export default function Affirmations() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [affirmations, setAffirmations] = useState<any[]>([]);
  const [newContent, setNewContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("serenity");
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) loadAffirmations();
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    setLoading(false);
  };

  const loadAffirmations = async () => {
    const { data, error } = await supabase
      .from("affirmations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setAffirmations(data);
    if (error) console.error(error);
  };

  const addAffirmation = async (content: string, category: string) => {
    if (!content.trim() || !user) return;
    setSaving(true);

    const { error } = await supabase
      .from("affirmations")
      .insert({
        user_id: user.id,
        content: content.trim(),
        category
      });

    setSaving(false);
    if (error) {
      toast.error("Failed to save affirmation");
    } else {
      toast.success("Affirmation added");
      setNewContent("");
      loadAffirmations();
    }
  };

  const toggleFavorite = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("affirmations")
      .update({ is_favorite: !currentValue })
      .eq("id", id);

    if (!error) loadAffirmations();
  };

  const deleteAffirmation = async (id: string) => {
    const { error } = await supabase
      .from("affirmations")
      .delete()
      .eq("id", id);

    if (!error) {
      toast.success("Affirmation removed");
      loadAffirmations();
    }
  };

  const filteredAffirmations = activeFilter 
    ? affirmations.filter(a => a.category === activeFilter)
    : affirmations;

  const getCategoryConfig = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/reflection")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Affirmations</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Intro */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0">
          <CardHeader className="text-center">
            <Sparkles className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle>Words That Heal</CardTitle>
            <CardDescription className="text-base">
              Gentle reminders to guide your thoughts and actions throughout the day.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Add New */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Your Own</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write an affirmation that resonates with you..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
            <Button 
              onClick={() => addAffirmation(newContent, selectedCategory)}
              disabled={!newContent.trim() || saving}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Affirmation
            </Button>
          </CardContent>
        </Card>

        {/* Suggested Affirmations */}
        {affirmations.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Get Started</CardTitle>
              <CardDescription>Tap any affirmation to add it to your collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedAffirmations.map((aff, i) => {
                const cat = getCategoryConfig(aff.category);
                const Icon = cat.icon;
                return (
                  <Button
                    key={i}
                    variant="ghost"
                    className="w-full h-auto py-3 justify-start text-left whitespace-normal"
                    onClick={() => addAffirmation(aff.content, aff.category)}
                  >
                    <Icon className={`h-4 w-4 mr-2 flex-shrink-0 ${cat.color}`} />
                    <span className="text-sm">{aff.content}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        {affirmations.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge
              variant={activeFilter === null ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setActiveFilter(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={activeFilter === cat.id ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setActiveFilter(cat.id)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        )}

        {/* My Affirmations */}
        {filteredAffirmations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Your Affirmations</h2>
            {filteredAffirmations.map((aff) => {
              const cat = getCategoryConfig(aff.category);
              const Icon = cat.icon;
              return (
                <Card key={aff.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-muted ${cat.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{aff.content}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {cat.label}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleFavorite(aff.id, aff.is_favorite)}
                        >
                          <Star className={`h-4 w-4 ${aff.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteAffirmation(aff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Gentle reminder */}
        <p className="text-center text-sm text-muted-foreground px-4 pb-8">
          "Grant me the serenity to accept what I cannot change, the courage to change what I can, and the wisdom to know the difference."
        </p>
      </main>
    </div>
  );
}
