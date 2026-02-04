import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Ruler, 
  FileText, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  Hammer,
  Building2,
  Zap,
  TrendingUp,
  Calculator,
  Upload
} from "lucide-react";
import { NewBidWizard } from "@/components/xbuilderx/NewBidWizard";
import { PlanUploadSection } from "@/components/xbuilderx/PlanUploadSection";

export default function XBuilderxEngineering() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewBidWizard, setShowNewBidWizard] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const handleNewBidSuccess = (projectId: string) => {
    setCurrentProjectId(projectId);
    setShowNewBidWizard(false);
    navigate(`/xbuilderx/estimating/${projectId}`);
  };

  const handleExtractionComplete = (data: any) => {
    console.log("Extraction complete:", data);
  };

  const projects = [
    {
      id: "1",
      name: "Riverside Commons",
      location: "Portland, OR",
      phase: "Design Development",
      progress: 65,
      budget: "$2.4M",
      timeline: "Q3 2025",
      status: "on-track",
      team: 8,
    },
    {
      id: "2",
      name: "Green Valley Apartments",
      location: "Austin, TX",
      phase: "Permitting",
      progress: 45,
      budget: "$1.8M",
      timeline: "Q4 2025",
      status: "delayed",
      team: 6,
    },
    {
      id: "3",
      name: "Downtown Mixed-Use",
      location: "Seattle, WA",
      phase: "Construction Documents",
      progress: 80,
      budget: "$3.2M",
      timeline: "Q2 2025",
      status: "ahead",
      team: 12,
    },
  ];

  const designTools = [
    { name: "Cost Estimator", icon: DollarSign, count: 15 },
    { name: "Timeline Planner", icon: Calendar, count: 8 },
    { name: "Spec Builder", icon: FileText, count: 23 },
    { name: "Team Collaboration", icon: Users, count: 45 },
  ];

  const milestones = [
    { phase: "Schematic Design", status: "completed", date: "Jan 2025" },
    { phase: "Design Development", status: "in-progress", date: "Mar 2025" },
    { phase: "Construction Documents", status: "pending", date: "May 2025" },
    { phase: "Permit Submission", status: "pending", date: "Jun 2025" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
              <Hammer className="h-10 w-10 text-primary" />
              Engineering & Design
            </h1>
            <p className="text-muted-foreground">
              Comprehensive project planning and design management
            </p>
          </div>
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => {
              console.log("New Project button clicked");
              setShowNewBidWizard(true);
            }}
          >
            <Building2 className="h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* Quick Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {designTools.map((tool) => (
            <Card key={tool.name} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">{tool.count} active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Active Projects</TabsTrigger>
            <TabsTrigger value="estimating">
              <Calculator className="h-4 w-4 mr-2" />
              Estimating & Bidding
            </TabsTrigger>
            <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
            <TabsTrigger value="timeline">Timeline Management</TabsTrigger>
            <TabsTrigger value="permits">Permit Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{project.location}</p>
                    </div>
                    <Badge 
                      variant={
                        project.status === "on-track" ? "default" :
                        project.status === "ahead" ? "default" : "destructive"
                      }
                    >
                      {project.status === "on-track" ? <CheckCircle className="h-3 w-3 mr-1" /> :
                       project.status === "ahead" ? <TrendingUp className="h-3 w-3 mr-1" /> :
                       <AlertCircle className="h-3 w-3 mr-1" />}
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Phase:</span>
                    <span className="font-semibold">{project.phase}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-semibold text-sm">{project.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Timeline</p>
                        <p className="font-semibold text-sm">{project.timeline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Team</p>
                        <p className="font-semibold text-sm">{project.team} members</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate(`/xbuilderx/estimating/${project.id}`)}
                  >
                    View Project Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="estimating" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Create your first project</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground">Combined bid value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Extractions</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Plans processed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground">No bids submitted yet</p>
                </CardContent>
              </Card>
            </div>

            {currentProjectId ? (
              <div className="space-y-6">
                <PlanUploadSection 
                  projectId={currentProjectId} 
                  onExtractionComplete={handleExtractionComplete}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Estimate Worksheet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Upload plans to automatically generate estimates with AI
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Proposal Builder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Generate professional proposals with scope, pricing, and schedules
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Your First Estimate</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Create a new project to begin estimating with AI-powered plan extraction, 
                    automated takeoffs, and intelligent pricing.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={() => setShowNewBidWizard(true)}
                    className="gap-2"
                  >
                    <Building2 className="h-5 w-5" />
                    Create New Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cost" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Estimation & Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-3xl font-bold text-primary">$7.4M</p>
                      <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Spent to Date</p>
                      <p className="text-3xl font-bold">$4.2M</p>
                      <p className="text-xs text-muted-foreground mt-1">56.8% of budget</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Projected Savings</p>
                      <p className="text-3xl font-bold text-green-600">$380K</p>
                      <p className="text-xs text-muted-foreground mt-1">Through optimization</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Cost Breakdown by Category</h4>
                  {[
                    { category: "Materials", amount: "$2.8M", percent: 38 },
                    { category: "Labor", amount: "$2.4M", percent: 32 },
                    { category: "Equipment", amount: "$1.2M", percent: 16 },
                    { category: "Permits & Fees", amount: "$600K", percent: 8 },
                    { category: "Contingency", amount: "$400K", percent: 6 },
                  ].map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-semibold">{item.amount}</span>
                      </div>
                      <Progress value={item.percent} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline & Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        milestone.status === "completed" ? "bg-green-100 text-green-600" :
                        milestone.status === "in-progress" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {milestone.status === "completed" ? <CheckCircle className="h-6 w-6" /> :
                         milestone.status === "in-progress" ? <Clock className="h-6 w-6" /> :
                         <AlertCircle className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{milestone.phase}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                      <Badge variant={
                        milestone.status === "completed" ? "default" :
                        milestone.status === "in-progress" ? "secondary" : "outline"
                      }>
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t">
                  <h4 className="font-semibold mb-4">Critical Path Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Project Duration</span>
                      <span className="font-semibold">24 weeks</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Critical Tasks</span>
                      <span className="font-semibold">12 tasks</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Float Available</span>
                      <span className="font-semibold">3.5 weeks</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permit Tracking & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Building Permit", status: "approved", date: "Feb 15, 2025", agency: "City Planning" },
                  { name: "Environmental Review", status: "in-review", date: "Mar 1, 2025", agency: "EPA" },
                  { name: "Fire Safety", status: "pending", date: "Mar 20, 2025", agency: "Fire Dept" },
                  { name: "Electrical Permit", status: "approved", date: "Feb 28, 2025", agency: "Building Dept" },
                ].map((permit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{permit.name}</h4>
                        <p className="text-sm text-muted-foreground">{permit.agency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        permit.status === "approved" ? "default" :
                        permit.status === "in-review" ? "secondary" : "outline"
                      }>
                        {permit.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{permit.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <NewBidWizard
          open={showNewBidWizard}
          onOpenChange={setShowNewBidWizard}
          onSuccess={handleNewBidSuccess}
        />
      </div>
    </div>
  );
}
