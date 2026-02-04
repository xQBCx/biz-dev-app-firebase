import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function XBuilderxPipeline() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const pipelineStats = [
    {
      title: "Active Projects",
      value: "24",
      change: "+3 this month",
      icon: Layers,
      trend: "up",
    },
    {
      title: "Total Pipeline Value",
      value: "$127M",
      change: "+$18M this quarter",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Avg. Completion Time",
      value: "186 days",
      change: "-12 days improved",
      icon: Clock,
      trend: "down",
    },
    {
      title: "Success Rate",
      value: "94%",
      change: "+2% this year",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  const stages = [
    { id: "discovery", name: "Discovery", count: 8, color: "bg-blue-500" },
    { id: "planning", name: "Planning", count: 5, color: "bg-purple-500" },
    { id: "engineering", name: "Engineering", count: 4, color: "bg-orange-500" },
    { id: "construction", name: "Construction", count: 6, color: "bg-green-500" },
    { id: "completion", name: "Completion", count: 1, color: "bg-cyan-500" },
  ];

  const projects = [
    {
      id: "PRJ-001",
      name: "Downtown Mixed-Use Development",
      stage: "engineering",
      location: "Seattle, WA",
      budget: "$45M",
      progress: 65,
      startDate: "2024-01-15",
      targetCompletion: "2025-06-30",
      team: 12,
      status: "on-track",
      risk: "low",
    },
    {
      id: "PRJ-002",
      name: "Waterfront Retail Complex",
      stage: "construction",
      location: "Portland, OR",
      budget: "$32M",
      progress: 45,
      startDate: "2023-11-01",
      targetCompletion: "2025-03-15",
      team: 18,
      status: "at-risk",
      risk: "medium",
    },
    {
      id: "PRJ-003",
      name: "Tech Campus Phase 2",
      stage: "planning",
      location: "San Francisco, CA",
      budget: "$78M",
      progress: 25,
      startDate: "2024-02-01",
      targetCompletion: "2026-01-30",
      team: 8,
      status: "on-track",
      risk: "low",
    },
    {
      id: "PRJ-004",
      name: "Residential Tower",
      stage: "discovery",
      location: "Austin, TX",
      budget: "$56M",
      progress: 10,
      startDate: "2024-03-10",
      targetCompletion: "2026-06-30",
      team: 5,
      status: "on-track",
      risk: "low",
    },
    {
      id: "PRJ-005",
      name: "Healthcare Facility Expansion",
      stage: "engineering",
      location: "Denver, CO",
      budget: "$42M",
      progress: 55,
      startDate: "2023-12-01",
      targetCompletion: "2025-08-31",
      team: 14,
      status: "delayed",
      risk: "high",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "at-risk":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "delayed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getStageColor = (stage: string) => {
    const stageObj = stages.find(s => s.id === stage);
    return stageObj?.color || "bg-muted";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate("/xbuilderx")}>
            ← Back to xBUILDERx Home
          </Button>
          <div className="flex items-center gap-3">
            <Layers className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Project Pipeline</h1>
              <p className="text-muted-foreground">Track and manage projects from discovery to completion</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {pipelineStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === "up"
                      ? "text-green-500"
                      : stat.trend === "down"
                      ? "text-blue-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline Stages Overview */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full ${stage.color} flex items-center justify-center text-white font-bold mb-2`}>
                    {stage.count}
                  </div>
                  <h3 className="font-semibold text-sm text-center">{stage.name}</h3>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="projects">All Projects</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                Kanban View
              </Button>
            </div>
          </div>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Portfolio</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search projects..." className="pl-10" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="completion">Completion</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="on-track">On Track</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Projects List */}
                {viewMode === "list" ? (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Card key={project.id} className="border-primary/20 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Header Row */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold">{project.name}</h3>
                                  <Badge className={getStageColor(project.stage)}>
                                    {stages.find(s => s.id === project.stage)?.name}
                                  </Badge>
                                  <Badge className={getStatusColor(project.status)}>
                                    {project.status === "on-track" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                    {project.status === "at-risk" && <AlertCircle className="h-3 w-3 mr-1" />}
                                    {project.status === "delayed" && <AlertCircle className="h-3 w-3 mr-1" />}
                                    {project.status.replace("-", " ").toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{project.id}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Location</p>
                                  <p className="text-sm font-medium">{project.location}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Budget</p>
                                  <p className="text-sm font-medium">{project.budget}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Target Date</p>
                                  <p className="text-sm font-medium">{project.targetCompletion}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Team Size</p>
                                  <p className="text-sm font-medium">{project.team} members</p>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{project.progress}%</span>
                                  <div className={`w-2 h-2 rounded-full ${getRiskColor(project.risk)}`} />
                                  <span className="text-xs text-muted-foreground">{project.risk} risk</span>
                                </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Kanban View
                  <div className="grid grid-cols-5 gap-4">
                    {stages.map((stage) => (
                      <div key={stage.id} className="space-y-3">
                        <div className={`p-3 rounded-lg ${stage.color} text-white`}>
                          <h3 className="font-semibold">{stage.name}</h3>
                          <p className="text-sm opacity-90">{stage.count} projects</p>
                        </div>
                        <div className="space-y-3">
                          {projects
                            .filter((p) => p.stage === stage.id)
                            .map((project) => (
                              <Card key={project.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                                <h4 className="font-medium text-sm mb-2">{project.name}</h4>
                                <div className="space-y-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {project.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {project.budget}
                                  </div>
                                  <Badge className={getStatusColor(project.status)}>
                                    {project.status}
                                  </Badge>
                                </div>
                              </Card>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Pipeline Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Pipeline analytics visualization</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Performance metrics over time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Reports</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Generate comprehensive pipeline reports</p>
                <Button>Create Report</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
