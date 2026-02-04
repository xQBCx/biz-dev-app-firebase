import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Settings, 
  MessageSquare, 
  Zap, 
  Star, 
  Keyboard, 
  Bot, 
  Brain,
  Sparkles,
  Save,
  RefreshCw,
  Check,
  X,
  Clock,
  Shield,
  Volume2
} from "lucide-react";

interface UserPreferences {
  id: string;
  user_id: string;
  communication_style: string;
  auto_execute_tools: boolean;
  favorite_modules: string[];
  learned_shortcuts: Record<string, string>;
  preferred_agent: string;
  interaction_count: number;
}

const AVAILABLE_MODULES = [
  { id: "crm", name: "CRM", description: "Contact and deal management" },
  { id: "tasks", name: "Tasks", description: "Task tracking and automation" },
  { id: "calendar", name: "Calendar", description: "Scheduling and events" },
  { id: "finance", name: "Finance", description: "Financial tracking" },
  { id: "analytics", name: "Analytics", description: "Reports and insights" },
  { id: "agents", name: "Agents", description: "AI agent marketplace" },
  { id: "workflows", name: "Workflows", description: "Automation workflows" },
  { id: "credits", name: "Credits", description: "Credit system and payouts" },
];

const COMMUNICATION_STYLES = [
  { id: "concise", name: "Concise", description: "Brief, to-the-point responses", icon: Zap },
  { id: "detailed", name: "Detailed", description: "Comprehensive explanations", icon: MessageSquare },
  { id: "technical", name: "Technical", description: "Developer-focused language", icon: Brain },
  { id: "friendly", name: "Friendly", description: "Conversational and warm", icon: Sparkles },
];

const AVAILABLE_AGENTS = [
  { id: "general", name: "General Assistant", description: "All-purpose AI helper" },
  { id: "sales", name: "Sales Agent", description: "Optimized for sales workflows" },
  { id: "finance", name: "Finance Agent", description: "Financial analysis focus" },
  { id: "operations", name: "Operations Agent", description: "Process optimization" },
];

export function UserAIPreferencesPanel() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Local state for editing
  const [communicationStyle, setCommunicationStyle] = useState("concise");
  const [autoExecute, setAutoExecute] = useState(false);
  const [favoriteModules, setFavoriteModules] = useState<string[]>([]);
  const [preferredAgent, setPreferredAgent] = useState("general");
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});
  const [responseVerbosity, setResponseVerbosity] = useState([50]);
  const [confirmationLevel, setConfirmationLevel] = useState("medium");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ai_user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const prefs: UserPreferences = {
          ...data,
          learned_shortcuts: (data.learned_shortcuts as Record<string, string>) || {}
        };
        setPreferences(prefs);
        setCommunicationStyle(data.communication_style || "concise");
        setAutoExecute(data.auto_execute_tools || false);
        setFavoriteModules(data.favorite_modules || []);
        setPreferredAgent(data.preferred_agent || "general");
        setShortcuts((data.learned_shortcuts as Record<string, string>) || {});
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const updates = {
        user_id: user.id,
        communication_style: communicationStyle,
        auto_execute_tools: autoExecute,
        favorite_modules: favoriteModules,
        preferred_agent: preferredAgent,
        learned_shortcuts: shortcuts,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("ai_user_preferences")
        .upsert(updates, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("Preferences saved successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFavoriteModule = (moduleId: string) => {
    setFavoriteModules(prev => {
      const newFavorites = prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId];
      setHasChanges(true);
      return newFavorites;
    });
  };

  const handleStyleChange = (style: string) => {
    setCommunicationStyle(style);
    setHasChanges(true);
  };

  const handleAgentChange = (agent: string) => {
    setPreferredAgent(agent);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            AI Preferences
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize how AI agents interact with you
          </p>
        </div>
        <Button 
          onClick={savePreferences} 
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {preferences && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Learning Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {preferences.interaction_count || 0} interactions analyzed
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Personalization Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="communication" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="communication" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Style
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <Star className="h-4 w-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="gap-2">
            <Keyboard className="h-4 w-4" />
            Shortcuts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Style</CardTitle>
              <CardDescription>
                Choose how AI agents should communicate with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={communicationStyle} 
                onValueChange={handleStyleChange}
                className="grid grid-cols-2 gap-4"
              >
                {COMMUNICATION_STYLES.map((style) => {
                  const Icon = style.icon;
                  return (
                    <Label
                      key={style.id}
                      htmlFor={style.id}
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        communicationStyle === style.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={style.id} id={style.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="font-medium">{style.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {style.description}
                        </p>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>

              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Response Verbosity
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    How detailed should responses be?
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Brief</span>
                    <Slider
                      value={responseVerbosity}
                      onValueChange={(v) => {
                        setResponseVerbosity(v);
                        setHasChanges(true);
                      }}
                      max={100}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">Detailed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferred Agent</CardTitle>
              <CardDescription>
                Select your default AI agent for conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={preferredAgent} 
                onValueChange={handleAgentChange}
                className="space-y-3"
              >
                {AVAILABLE_AGENTS.map((agent) => (
                  <Label
                    key={agent.id}
                    htmlFor={`agent-${agent.id}`}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      preferredAgent === agent.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={agent.id} id={`agent-${agent.id}`} />
                    <Bot className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <span className="font-medium">{agent.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {agent.description}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Execution Settings</CardTitle>
              <CardDescription>
                Control when AI agents can take actions automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="auto-execute" className="font-medium">
                      Auto-Execute Tools
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow agents to execute safe actions without confirmation
                    </p>
                  </div>
                </div>
                <Switch
                  id="auto-execute"
                  checked={autoExecute}
                  onCheckedChange={(checked) => {
                    setAutoExecute(checked);
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Confirmation Level
                </Label>
                <RadioGroup 
                  value={confirmationLevel}
                  onValueChange={(v) => {
                    setConfirmationLevel(v);
                    setHasChanges(true);
                  }}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="confirm-low"
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                      confirmationLevel === "low" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem value="low" id="confirm-low" />
                    <div>
                      <span className="font-medium">Minimal</span>
                      <p className="text-sm text-muted-foreground">
                        Only confirm destructive or high-risk actions
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="confirm-medium"
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                      confirmationLevel === "medium" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem value="medium" id="confirm-medium" />
                    <div>
                      <span className="font-medium">Balanced</span>
                      <p className="text-sm text-muted-foreground">
                        Confirm actions that modify data
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="confirm-high"
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                      confirmationLevel === "high" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem value="high" id="confirm-high" />
                    <div>
                      <span className="font-medium">Maximum</span>
                      <p className="text-sm text-muted-foreground">
                        Confirm all agent actions before execution
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Scheduled Actions</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow agents to schedule future actions
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Modules</CardTitle>
              <CardDescription>
                Select modules that agents should prioritize in recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {AVAILABLE_MODULES.map((module) => {
                  const isFavorite = favoriteModules.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      onClick={() => toggleFavoriteModule(module.id)}
                      className={`flex items-center gap-4 p-4 border rounded-lg text-left transition-colors ${
                        isFavorite 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isFavorite ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {isFavorite ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Star className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{module.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learned Shortcuts</CardTitle>
              <CardDescription>
                Commands and phrases the AI has learned from your usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(shortcuts).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Keyboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No shortcuts learned yet</p>
                  <p className="text-sm mt-1">
                    Use natural commands and the AI will learn your preferences
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {Object.entries(shortcuts).map(([trigger, action]) => (
                      <div 
                        key={trigger}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{trigger}</Badge>
                          <span className="text-muted-foreground">→</span>
                          <span>{action}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newShortcuts = { ...shortcuts };
                            delete newShortcuts[trigger];
                            setShortcuts(newShortcuts);
                            setHasChanges(true);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Preset shortcuts you can enable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { trigger: "daily summary", action: "Generate daily task and meeting summary" },
                  { trigger: "check inbox", action: "Show unread notifications and messages" },
                  { trigger: "quick task", action: "Create a new task with minimal input" },
                ].map((preset) => (
                  <div 
                    key={preset.trigger}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge>{preset.trigger}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-sm">{preset.action}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShortcuts(prev => ({
                          ...prev,
                          [preset.trigger]: preset.action
                        }));
                        setHasChanges(true);
                        toast.success(`Added "${preset.trigger}" shortcut`);
                      }}
                      disabled={shortcuts[preset.trigger] !== undefined}
                    >
                      {shortcuts[preset.trigger] !== undefined ? "Added" : "Add"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
