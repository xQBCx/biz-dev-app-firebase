import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import {
  Rocket,
  Plus,
  Sparkles,
  Target,
  CheckCircle,
  Clock,
  Users,
  Building,
  Briefcase,
  Search,
  ArrowRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Initiative {
  id: string;
  name: string;
  description: string | null;
  initiative_type: string;
  status: string;
  created_at: string;
}

const InitiativeArchitect = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("create");
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newInitiative, setNewInitiative] = useState({
    goal_statement: "",
    initiative_type: "partnership"
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadInitiatives();
    }
  }, [user]);

  const loadInitiatives = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInitiatives(data || []);
    } catch (error) {
      console.error("Error loading initiatives:", error);
      toast.error("Failed to load initiatives");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchitect = async () => {
    if (!user || !newInitiative.goal_statement.trim()) {
      toast.error("Please describe your initiative goal");
      return;
    }

    setIsArchitecting(true);
    try {
      // Create the initiative record
      const { data: initiative, error } = await supabase.from("initiatives").insert({
        user_id: user.id,
        name: newInitiative.goal_statement.substring(0, 100),
        description: newInitiative.goal_statement,
        initiative_type: newInitiative.initiative_type,
        status: "scaffolding"
      }).select().single();

      if (error) throw error;

      const { error: archError } = await supabase.functions.invoke("initiative-architect", {
        body: {
          initiative_id: initiative.id,
          goal_statement: newInitiative.goal_statement,
          initiative_type: newInitiative.initiative_type
        }
      });

      if (archError) {
        console.warn("Architect function not yet deployed:", archError);
        toast.info("Initiative created - AI scaffolding coming soon");
      } else {
        toast.success("Initiative architected successfully!");
      }

      setNewInitiative({ goal_statement: "", initiative_type: "partnership" });
      loadInitiatives();
      setActiveTab("initiatives");
    } catch (error) {
      console.error("Error architecting initiative:", error);
      toast.error("Failed to architect initiative");
    } finally {
      setIsArchitecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scaffolding: "bg-yellow-500/10 text-yellow-500",
      ready: "bg-blue-500/10 text-blue-500",
      active: "bg-green-500/10 text-green-500",
      completed: "bg-purple-500/10 text-purple-500",
      archived: "bg-muted text-muted-foreground"
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      partnership: Briefcase,
      event: Target,
      workshop: Users,
      project: Building
    };
    return icons[type] || Rocket;
  };

  const stats = {
    total: initiatives.length,
    active: initiatives.filter(i => i.status === "active").length,
    completed: initiatives.filter(i => i.status === "completed").length,
    scaffolding: initiatives.filter(i => i.status === "scaffolding").length
  };

  const filteredInitiatives = initiatives.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Rocket className="w-10 h-10 text-primary" />
                Initiative Architect AGI
              </h1>
              <p className="text-muted-foreground">
                Transform natural language goals into fully scaffolded projects
              </p>
            </div>
            <WhitePaperIcon moduleKey="initiative-architect" moduleName="Initiative Architect" variant="button" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Initiatives", value: stats.total, icon: Rocket, color: "text-blue-500" },
            { label: "Active", value: stats.active, icon: Target, color: "text-green-500" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-purple-500" },
            { label: "Scaffolding", value: stats.scaffolding, icon: Clock, color: "text-yellow-500" }
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 shadow-elevated border border-border">
              <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="create">
              <Sparkles className="w-4 h-4 mr-2" />
              New Initiative
            </TabsTrigger>
            <TabsTrigger value="initiatives">
              <Rocket className="w-4 h-4 mr-2" />
              All Initiatives
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card className="p-8 max-w-3xl mx-auto shadow-elevated border border-border">
              <div className="text-center mb-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Describe Your Initiative</h2>
                <p className="text-muted-foreground">
                  Tell me what you want to accomplish in natural language, and I'll scaffold the entire project
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Example: I want to run Biz Dev workshops at St. Constantine School, teaching parents about modern business development and students about entrepreneurship. We need to partner with Majida Baba, create curriculum, handle registrations, and track outcomes..."
                    value={newInitiative.goal_statement}
                    onChange={(e) => setNewInitiative({ ...newInitiative, goal_statement: e.target.value })}
                    rows={6}
                    className="text-lg"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    {["partnership", "event", "workshop", "project"].map((type) => {
                      const Icon = getTypeIcon(type);
                      return (
                        <Button
                          key={type}
                          variant={newInitiative.initiative_type === type ? "default" : "outline"}
                          onClick={() => setNewInitiative({ ...newInitiative, initiative_type: type })}
                          className="flex flex-col h-auto py-3"
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs capitalize">{type}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={handleArchitect}
                  className="w-full h-14 text-lg"
                  disabled={isArchitecting || !newInitiative.goal_statement.trim()}
                >
                  {isArchitecting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Architecting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Architect Initiative
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>The AI will analyze your goal and automatically create:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {["CRM Contacts", "Deal Room", "ERP Folders", "Tasks", "Workflows", "Calendar Events"].map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="initiatives" className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search initiatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setActiveTab("create")}>
                <Plus className="w-4 h-4 mr-2" />
                New Initiative
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading initiatives...</div>
            ) : filteredInitiatives.length === 0 ? (
              <Card className="p-8 text-center">
                <Rocket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No initiatives yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Describe your first goal and let the AI architect it
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Initiative
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredInitiatives.map((initiative) => {
                  const TypeIcon = getTypeIcon(initiative.initiative_type);
                  return (
                    <Card
                      key={initiative.id}
                      className="p-6 shadow-elevated border border-border cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <TypeIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold truncate">{initiative.name}</h3>
                            <Badge className={getStatusBadge(initiative.status)}>
                              {initiative.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {initiative.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="capitalize">{initiative.initiative_type}</span>
                            <span>•</span>
                            <span>{new Date(initiative.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InitiativeArchitect;
