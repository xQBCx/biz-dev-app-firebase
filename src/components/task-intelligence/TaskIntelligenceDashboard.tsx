import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  Zap, 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  Bot, 
  Battery, 
  BatteryLow, 
  BatteryMedium, 
  BatteryFull,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Filter
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  partner: string;
  partnerAvatar: string;
  priority: "high" | "medium" | "low";
  energyLevel: "high" | "medium" | "low";
  estimatedMinutes: number;
  automatable: boolean;
  automationConfidence: number;
  category: string;
  dueDate: string;
  status: "pending" | "in_progress" | "blocked" | "completed";
  aiSuggestion?: string;
}

interface EnergySlot {
  time: string;
  level: "high" | "medium" | "low";
  recommendedTasks: string[];
}

const mockTasks: TaskItem[] = [
  {
    id: "1",
    title: "Review partnership proposal from TechCorp",
    partner: "Alex Chen",
    partnerAvatar: "AC",
    priority: "high",
    energyLevel: "high",
    estimatedMinutes: 45,
    automatable: false,
    automationConfidence: 0,
    category: "Review",
    dueDate: "Today",
    status: "pending",
    aiSuggestion: "Schedule for morning when energy is highest"
  },
  {
    id: "2",
    title: "Send follow-up emails to Q4 leads",
    partner: "Sarah Kim",
    partnerAvatar: "SK",
    priority: "medium",
    energyLevel: "low",
    estimatedMinutes: 20,
    automatable: true,
    automationConfidence: 92,
    category: "Outreach",
    dueDate: "Tomorrow",
    status: "pending",
    aiSuggestion: "Can be fully automated with email templates"
  },
  {
    id: "3",
    title: "Prepare quarterly financial summary",
    partner: "Mike Johnson",
    partnerAvatar: "MJ",
    priority: "high",
    energyLevel: "high",
    estimatedMinutes: 90,
    automatable: false,
    automationConfidence: 15,
    category: "Finance",
    dueDate: "This week",
    status: "in_progress"
  },
  {
    id: "4",
    title: "Update CRM with new contact info",
    partner: "Emma Wilson",
    partnerAvatar: "EW",
    priority: "low",
    energyLevel: "low",
    estimatedMinutes: 15,
    automatable: true,
    automationConfidence: 88,
    category: "Data Entry",
    dueDate: "This week",
    status: "pending",
    aiSuggestion: "Delegate to CRM sync agent"
  },
  {
    id: "5",
    title: "Analyze competitor pricing strategy",
    partner: "James Lee",
    partnerAvatar: "JL",
    priority: "medium",
    energyLevel: "medium",
    estimatedMinutes: 60,
    automatable: true,
    automationConfidence: 75,
    category: "Research",
    dueDate: "Next week",
    status: "pending",
    aiSuggestion: "AI can gather data, you review insights"
  }
];

const energySchedule: EnergySlot[] = [
  { time: "6:00 AM - 9:00 AM", level: "high", recommendedTasks: ["Deep work", "Strategic thinking", "Complex analysis"] },
  { time: "9:00 AM - 12:00 PM", level: "high", recommendedTasks: ["Meetings", "Collaboration", "Decision making"] },
  { time: "12:00 PM - 2:00 PM", level: "low", recommendedTasks: ["Light tasks", "Email", "Admin work"] },
  { time: "2:00 PM - 5:00 PM", level: "medium", recommendedTasks: ["Creative work", "Planning", "Reviews"] },
  { time: "5:00 PM - 8:00 PM", level: "low", recommendedTasks: ["Wrap-up", "Tomorrow prep", "Light reading"] }
];

export function TaskIntelligenceDashboard() {
  const [selectedPartner, setSelectedPartner] = useState<string>("all");
  const [showAutomatableOnly, setShowAutomatableOnly] = useState(false);
  const [selectedEnergyLevel, setSelectedEnergyLevel] = useState<string>("all");

  const filteredTasks = mockTasks.filter(task => {
    if (selectedPartner !== "all" && task.partner !== selectedPartner) return false;
    if (showAutomatableOnly && !task.automatable) return false;
    if (selectedEnergyLevel !== "all" && task.energyLevel !== selectedEnergyLevel) return false;
    return true;
  });

  const automatableTasks = mockTasks.filter(t => t.automatable);
  const totalAutomationSavings = automatableTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const avgAutomationConfidence = automatableTasks.length > 0 
    ? automatableTasks.reduce((acc, t) => acc + t.automationConfidence, 0) / automatableTasks.length 
    : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-warning/10 text-warning border-warning/20";
      case "low": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getEnergyIcon = (level: string) => {
    switch (level) {
      case "high": return <BatteryFull className="h-4 w-4 text-green-500" />;
      case "medium": return <BatteryMedium className="h-4 w-4 text-yellow-500" />;
      case "low": return <BatteryLow className="h-4 w-4 text-orange-500" />;
      default: return <Battery className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "blocked": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Task Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered task scheduling, automation detection, and energy optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
          <Button size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Optimize Schedule
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cross-Partner Tasks</p>
                <p className="text-2xl font-bold">{mockTasks.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From {new Set(mockTasks.map(t => t.partner)).size} partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Automatable Tasks</p>
                <p className="text-2xl font-bold">{automatableTasks.length}</p>
              </div>
              <Bot className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(avgAutomationConfidence)}% avg confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Saveable</p>
                <p className="text-2xl font-bold">{totalAutomationSavings}m</p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Via automation this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Match Score</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <Zap className="h-8 w-8 text-primary opacity-80" />
            </div>
            <Progress value={87} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Smart Task List
          </TabsTrigger>
          <TabsTrigger value="energy" className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Energy Mapping
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automation Candidates
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            AI Schedule
          </TabsTrigger>
        </TabsList>

        {/* Smart Task List */}
        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Partners</SelectItem>
                    {Array.from(new Set(mockTasks.map(t => t.partner))).map(partner => (
                      <SelectItem key={partner} value={partner}>{partner}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedEnergyLevel} onValueChange={setSelectedEnergyLevel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Energy Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Energy Levels</SelectItem>
                    <SelectItem value="high">High Energy</SelectItem>
                    <SelectItem value="medium">Medium Energy</SelectItem>
                    <SelectItem value="low">Low Energy</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="automatable" 
                    checked={showAutomatableOnly}
                    onCheckedChange={setShowAutomatableOnly}
                  />
                  <Label htmlFor="automatable" className="text-sm">Automatable only</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <Card key={task.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {task.partnerAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {task.partner}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedMinutes}m
                          </span>
                          <span className="flex items-center gap-1">
                            {getEnergyIcon(task.energyLevel)}
                            {task.energyLevel} energy
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.dueDate}
                          </span>
                        </div>
                        {task.aiSuggestion && (
                          <div className="mt-2 p-2 bg-primary/5 rounded-md flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                            <p className="text-sm text-primary">{task.aiSuggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {task.automatable && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{task.automationConfidence}%</span>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            <Bot className="h-3 w-3 mr-1" />
                            Automatable
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Energy Mapping */}
        <TabsContent value="energy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="h-5 w-5" />
                Your Energy Profile
              </CardTitle>
              <CardDescription>
                AI-detected energy patterns based on your work habits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {energySchedule.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-32 text-sm font-medium">{slot.time}</div>
                  <div className="flex items-center gap-2 w-24">
                    {getEnergyIcon(slot.level)}
                    <span className="text-sm capitalize">{slot.level}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1">
                      {slot.recommendedTasks.map((task, tidx) => (
                        <Badge key={tidx} variant="outline" className="text-xs">
                          {task}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Progress 
                    value={slot.level === "high" ? 100 : slot.level === "medium" ? 60 : 30} 
                    className="w-24 h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Energy-Task Alignment</CardTitle>
              <CardDescription>
                How well your current tasks match your energy patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Well Aligned</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">3 tasks</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scheduled during optimal energy
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Could Improve</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">1 task</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consider rescheduling
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-destructive" />
                    <span className="font-medium">Misaligned</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">1 task</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    High-energy task at low-energy time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Candidates */}
        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Automation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Total automatable tasks</span>
                  <span className="font-bold">{automatableTasks.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Potential time saved</span>
                  <span className="font-bold">{totalAutomationSavings} minutes</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Average confidence</span>
                  <span className="font-bold">{Math.round(avgAutomationConfidence)}%</span>
                </div>
                <Button className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Automate All High-Confidence Tasks
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Outreach", "Data Entry", "Research"].map(category => {
                  const categoryTasks = automatableTasks.filter(t => t.category === category);
                  const avgConf = categoryTasks.length > 0 
                    ? categoryTasks.reduce((a, t) => a + t.automationConfidence, 0) / categoryTasks.length 
                    : 0;
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-xs text-muted-foreground">{Math.round(avgConf)}%</span>
                        </div>
                        <Progress value={avgConf} className="h-2" />
                      </div>
                      <Badge variant="outline">{categoryTasks.length}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Automation Candidates</CardTitle>
              <CardDescription>Tasks that can be delegated to AI agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {automatableTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.category} • {task.estimatedMinutes}m saved</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{task.automationConfidence}%</p>
                      <p className="text-xs text-muted-foreground">confidence</p>
                    </div>
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Automate
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Schedule */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                AI-Optimized Schedule for Today
              </CardTitle>
              <CardDescription>
                Tasks arranged based on your energy patterns and priorities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-2 border-primary/20 pl-4 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-500">8:00 AM - High Energy</span>
                      <Badge className="bg-green-500/20 text-green-500">Optimal</Badge>
                    </div>
                    <p className="font-medium">Review partnership proposal from TechCorp</p>
                    <p className="text-sm text-muted-foreground mt-1">Complex analysis • 45 minutes</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-500">9:00 AM - High Energy</span>
                      <Badge className="bg-green-500/20 text-green-500">Optimal</Badge>
                    </div>
                    <p className="font-medium">Prepare quarterly financial summary</p>
                    <p className="text-sm text-muted-foreground mt-1">Deep work • 90 minutes</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-yellow-500 border-2 border-background" />
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-500">2:00 PM - Medium Energy</span>
                      <Badge className="bg-yellow-500/20 text-yellow-500">Good</Badge>
                    </div>
                    <p className="font-medium">Analyze competitor pricing strategy</p>
                    <p className="text-sm text-muted-foreground mt-1">Research • 60 minutes</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary">Automated</span>
                      <Badge className="bg-primary/20 text-primary">
                        <Bot className="h-3 w-3 mr-1" />
                        Agent
                      </Badge>
                    </div>
                    <p className="font-medium">Send follow-up emails to Q4 leads</p>
                    <p className="text-sm text-muted-foreground mt-1">Running in background • 20 minutes saved</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary">Automated</span>
                      <Badge className="bg-primary/20 text-primary">
                        <Bot className="h-3 w-3 mr-1" />
                        Agent
                      </Badge>
                    </div>
                    <p className="font-medium">Update CRM with new contact info</p>
                    <p className="text-sm text-muted-foreground mt-1">Running in background • 15 minutes saved</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg mt-6">
                <div>
                  <p className="font-medium">Today's Efficiency Gain</p>
                  <p className="text-sm text-muted-foreground">Time saved through automation and optimization</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">35 min</p>
                  <p className="text-xs text-muted-foreground">saved today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
