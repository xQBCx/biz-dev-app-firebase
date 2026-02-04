import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Plus,
  Users,
  Heart,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function Relationships() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reflections, setReflections] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Form state
  const [personName, setPersonName] = useState("");
  const [situation, setSituation] = useState("");
  const [myPart, setMyPart] = useState("");
  const [actionToTake, setActionToTake] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) loadReflections();
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

  const loadReflections = async () => {
    const { data, error } = await supabase
      .from("relationship_reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setReflections(data);
    if (error) console.error(error);
  };

  const saveReflection = async () => {
    if (!user || !personName.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from("relationship_reflections")
      .insert({
        user_id: user.id,
        person_name: personName.trim(),
        situation: situation.trim(),
        my_part: myPart.trim(),
        action_to_take: actionToTake.trim()
      });

    setSaving(false);
    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Reflection saved");
      resetForm();
      loadReflections();
    }
  };

  const resetForm = () => {
    setPersonName("");
    setSituation("");
    setMyPart("");
    setActionToTake("");
    setShowForm(false);
  };

  const toggleComplete = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("relationship_reflections")
      .update({ 
        completed: !currentValue,
        completed_at: !currentValue ? new Date().toISOString() : null
      })
      .eq("id", id);

    if (!error) {
      toast.success(currentValue ? "Marked as pending" : "Marked as complete");
      loadReflections();
    }
  };

  const deleteReflection = async (id: string) => {
    const { error } = await supabase
      .from("relationship_reflections")
      .delete()
      .eq("id", id);

    if (!error) {
      toast.success("Removed");
      loadReflections();
    }
  };

  const pendingReflections = reflections.filter(r => !r.completed);
  const completedReflections = reflections.filter(r => r.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Users className="h-8 w-8 animate-pulse text-primary" />
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
          <h1 className="text-lg font-semibold">Relationships</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Intro */}
        <Card className="bg-gradient-to-br from-rose-500/5 to-rose-500/10 border-0">
          <CardHeader className="text-center">
            <Heart className="h-8 w-8 mx-auto text-rose-500 mb-2" />
            <CardTitle>Making Things Right</CardTitle>
            <CardDescription className="text-base">
              Reflect on relationships that need attention. Consider your part, take responsibility where needed, and plan thoughtful action.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Add Button */}
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            variant="outline" 
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Relationship Reflection
          </Button>
        )}

        {/* Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Reflection</CardTitle>
              <CardDescription>
                Take time to honestly examine your relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Person</label>
                <Input
                  placeholder="Who is this about?"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Situation</label>
                <Textarea
                  placeholder="What happened? Describe the situation without blame..."
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">My Part</label>
                <Textarea
                  placeholder="What was my role? Where was I selfish, dishonest, or unkind?"
                  value={myPart}
                  onChange={(e) => setMyPart(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Action to Take</label>
                <Textarea
                  placeholder="What can I do to make things right? (Only if it won't cause more harm)"
                  value={actionToTake}
                  onChange={(e) => setActionToTake(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={saveReflection} 
                  disabled={!personName.trim() || saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Reflections */}
        {pendingReflections.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Circle className="h-4 w-4" />
              In Progress ({pendingReflections.length})
            </h2>
            {pendingReflections.map((r) => (
              <Card key={r.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => toggleComplete(r.id, false)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      >
                        <p className="font-medium">{r.person_name}</p>
                        {expandedId === r.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      {expandedId === r.id && (
                        <div className="mt-3 space-y-3 text-sm">
                          {r.situation && (
                            <div>
                              <p className="text-muted-foreground text-xs">Situation</p>
                              <p>{r.situation}</p>
                            </div>
                          )}
                          {r.my_part && (
                            <div>
                              <p className="text-muted-foreground text-xs">My Part</p>
                              <p>{r.my_part}</p>
                            </div>
                          )}
                          {r.action_to_take && (
                            <div>
                              <p className="text-muted-foreground text-xs">Action to Take</p>
                              <p>{r.action_to_take}</p>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteReflection(r.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Completed Reflections */}
        {completedReflections.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Completed ({completedReflections.length})
            </h2>
            {completedReflections.map((r) => (
              <Card key={r.id} className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => toggleComplete(r.id, true)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium line-through text-muted-foreground">
                        {r.person_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed {new Date(r.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteReflection(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {reflections.length === 0 && !showForm && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No relationship reflections yet. Take time to honestly examine your relationships and make things right where needed.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Gentle reminder */}
        <p className="text-center text-sm text-muted-foreground px-4 pb-8">
          "We will not regret the past nor wish to shut the door on it."
        </p>
      </main>
    </div>
  );
}
