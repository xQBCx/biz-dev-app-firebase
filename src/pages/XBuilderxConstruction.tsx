import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Ruler, 
  Calculator, 
  Workflow, 
  Camera, 
  TrendingUp,
  Upload,
  Search,
  Download,
  Users,
  Globe,
  Shield,
  Layers,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  HardHat
} from "lucide-react";

const XBuilderxConstruction = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);

  const projects = [
    { 
      id: "1", 
      name: "Downtown Mixed-Use Development", 
      type: "Commercial", 
      phase: "Estimating",
      budget: "$45M",
      progress: 35,
      location: "Los Angeles, CA"
    },
    { 
      id: "2", 
      name: "Residential Tower Complex", 
      type: "Multifamily", 
      phase: "Construction",
      budget: "$28M",
      progress: 62,
      location: "Miami, FL"
    },
    { 
      id: "3", 
      name: "Highway Infrastructure Upgrade", 
      type: "Infrastructure", 
      phase: "Design",
      budget: "$120M",
      progress: 18,
      location: "Texas"
    },
  ];

  const assetTypes = [
    { name: "Residential", icon: Building, count: 12, color: "bg-blue-500" },
    { name: "Commercial", icon: Building, count: 8, color: "bg-green-500" },
    { name: "Industrial", icon: HardHat, count: 5, color: "bg-orange-500" },
    { name: "Multifamily", icon: Layers, count: 15, color: "bg-purple-500" },
    { name: "Infrastructure", icon: Globe, count: 4, color: "bg-red-500" },
  ];

  const features = [
    {
      title: "Document Management",
      icon: FileText,
      description: "PDF/DWG upload, version control, OCR search, overlay revisions",
      status: "active",
    },
    {
      title: "AI Takeoff Engine",
      icon: Ruler,
      description: "Measurement tools, AI-assisted detection, templates, pattern recognition",
      status: "active",
    },
    {
      title: "Estimating Engine",
      icon: Calculator,
      description: "Regional cost database, assemblies, markups, proposal generation",
      status: "active",
    },
    {
      title: "Workflow Management",
      icon: Workflow,
      description: "RFIs, submittals, change orders, daily reports, punch lists",
      status: "active",
    },
    {
      title: "Field Module",
      icon: Camera,
      description: "Mobile access, photo annotations, progress tracking, offline sync",
      status: "active",
    },
    {
      title: "Analytics & BI",
      icon: TrendingUp,
      description: "Estimate vs actual, bid win-rate, productivity metrics, variance reports",
      status: "active",
    },
  ];

  const workflowStats = [
    { label: "Open RFIs", value: 23, icon: AlertCircle, color: "text-orange-500" },
    { label: "Pending Submittals", value: 15, icon: Clock, color: "text-blue-500" },
    { label: "Change Orders", value: 8, icon: DollarSign, color: "text-green-500" },
    { label: "Completed Tasks", value: 142, icon: CheckCircle2, color: "text-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Estimating & Construction Lifecycle
              </h1>
              <p className="text-muted-foreground mt-2">
                Enterprise-grade construction management for residential, commercial, industrial, multifamily & infrastructure projects
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Plans
              </Button>
              <Button>
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture Overview */}
      <div className="container mx-auto px-6 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Architecture & Capabilities
            </CardTitle>
            <CardDescription>
              Best-in-class platform for construction estimating, project management & field operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="border border-border rounded-lg p-4 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{feature.title}</h3>
                          <Badge variant="outline" className="text-xs">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Multi-Asset Support */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-semibold mb-4">Multi-Asset Class Support</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {assetTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.name} className="text-center">
                      <div className={`${type.color} rounded-lg p-4 mb-2 inline-flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-medium text-sm">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.count} projects</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="takeoff">Takeoff</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Projects</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-border rounded-lg p-4 transition-all cursor-pointer"
                        onClick={() => setActiveProject(project.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">{project.location}</p>
                          </div>
                          <Badge>{project.phase}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Asset Type</p>
                            <p className="font-medium">{project.type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Budget</p>
                            <p className="font-medium">{project.budget}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Progress</p>
                            <p className="font-medium">{project.progress}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document & Plan Management</CardTitle>
                <CardDescription>
                  Upload drawings (PDF, DWG), manage versions, OCR search, overlay revisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Upload Construction Documents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop PDF, DWG, or other plan files here
                  </p>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <FileText className="h-8 w-8 mb-3 text-primary" />
                    <h4 className="font-semibold mb-1">Version Control</h4>
                    <p className="text-sm text-muted-foreground">Track all document revisions with full history</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <Search className="h-8 w-8 mb-3 text-primary" />
                    <h4 className="font-semibold mb-1">OCR Search</h4>
                    <p className="text-sm text-muted-foreground">Search text within scanned documents</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <Layers className="h-8 w-8 mb-3 text-primary" />
                    <h4 className="font-semibold mb-1">Overlay Revisions</h4>
                    <p className="text-sm text-muted-foreground">Compare versions side-by-side</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Takeoff Tab */}
          <TabsContent value="takeoff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Takeoff Engine</CardTitle>
                <CardDescription>
                  Measurement tools with AI-assisted detection of walls, doors, repetition patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Ruler className="h-5 w-5" />
                      Measurement Tools
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-accent/50 rounded">
                        <span className="text-sm">Area (sqft, sf)</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-accent/50 rounded">
                        <span className="text-sm">Linear (lf)</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-accent/50 rounded">
                        <span className="text-sm">Volume (cy)</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-accent/50 rounded">
                        <span className="text-sm">Count (ea)</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      AI Detection
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded border border-primary/20">
                        <span className="text-sm font-medium">Walls & Partitions</span>
                        <Badge className="bg-primary">AI</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded border border-primary/20">
                        <span className="text-sm font-medium">Doors & Windows</span>
                        <Badge className="bg-primary">AI</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded border border-primary/20">
                        <span className="text-sm font-medium">Repetition Patterns</span>
                        <Badge className="bg-primary">AI</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded border border-primary/20">
                        <span className="text-sm font-medium">Standard Elements</span>
                        <Badge className="bg-primary">AI</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estimates Tab */}
          <TabsContent value="estimates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estimating Engine</CardTitle>
                <CardDescription>
                  Regional cost database, assemblies, markups, overhead, contingency logic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Cost Item Database</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-accent/50 rounded">
                        <p className="text-2xl font-bold text-primary">15,420</p>
                        <p className="text-xs text-muted-foreground">Cost Items</p>
                      </div>
                      <div className="text-center p-3 bg-accent/50 rounded">
                        <p className="text-2xl font-bold text-primary">48</p>
                        <p className="text-xs text-muted-foreground">Regions</p>
                      </div>
                      <div className="text-center p-3 bg-accent/50 rounded">
                        <p className="text-2xl font-bold text-primary">5</p>
                        <p className="text-xs text-muted-foreground">Asset Classes</p>
                      </div>
                      <div className="text-center p-3 bg-accent/50 rounded">
                        <p className="text-2xl font-bold text-primary">12</p>
                        <p className="text-xs text-muted-foreground">Currencies</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Estimate Worksheet</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm">Subtotal (Materials + Labor + Equipment)</span>
                        <span className="font-medium">$2,450,000</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm">Markup (15%)</span>
                        <span className="font-medium">$367,500</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm">Overhead (8%)</span>
                        <span className="font-medium">$196,000</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm">Contingency (5%)</span>
                        <span className="font-medium">$122,500</span>
                      </div>
                      <div className="flex justify-between py-3 bg-primary/10 px-3 rounded">
                        <span className="font-semibold">Total Estimate</span>
                        <span className="font-bold text-lg text-primary">$3,136,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Workflows & Field Module</CardTitle>
                <CardDescription>
                  RFIs, submittals, change orders, daily reports, punch lists, mobile access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {workflowStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="border border-border rounded-lg p-4">
                        <Icon className={`h-6 w-6 mb-2 ${stat.color}`} />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Workflow className="h-5 w-5" />
                      Workflow Items
                    </h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Create RFI
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Submit Submittal
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Change Order
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Punch List Item
                      </Button>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Field Access
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-accent/50 rounded">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Mobile Crew Access</p>
                          <p className="text-xs text-muted-foreground">Real-time field updates</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-accent/50 rounded">
                        <Camera className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Photo Annotations</p>
                          <p className="text-xs text-muted-foreground">Markup and notes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-accent/50 rounded">
                        <Globe className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Offline Sync</p>
                          <p className="text-xs text-muted-foreground">Works without connection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Dashboards</CardTitle>
                <CardDescription>
                  Estimate vs actual, bid win-rate, productivity metrics, variance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border border-border rounded-lg p-4">
                    <TrendingUp className="h-6 w-6 mb-2 text-green-500" />
                    <p className="text-2xl font-bold">68%</p>
                    <p className="text-sm text-muted-foreground">Bid Win Rate</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <DollarSign className="h-6 w-6 mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">-2.3%</p>
                    <p className="text-sm text-muted-foreground">Avg Cost Variance</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <CheckCircle2 className="h-6 w-6 mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">94%</p>
                    <p className="text-sm text-muted-foreground">On-Time Completion</p>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Estimate vs Actual Performance</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Labor Costs</span>
                        <span className="text-sm font-medium text-green-500">-3.2% under</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "96.8%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Materials</span>
                        <span className="text-sm font-medium text-red-500">+4.1% over</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "104.1%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Equipment</span>
                        <span className="text-sm font-medium text-green-500">-1.5% under</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "98.5%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-accent/50 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Enterprise Features
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Multi-currency, multi-jurisdiction cost models</li>
                    <li>• Cloud-native microservices architecture</li>
                    <li>• SSO, encryption, audit logs</li>
                    <li>• API/SDK integration with ERP/accounting systems</li>
                    <li>• Role-based access control & permissions</li>
                    <li>• Institutional-grade security & compliance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Competitive Differentiation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Competitive Advantage vs STACK, PlanSwift, Procore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">Unified Platform</h4>
                <p className="text-sm text-muted-foreground">
                  Seamlessly integrated with xBUILDERx design, finance, and asset management modules
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">AI-First Approach</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced AI takeoff detection and pattern recognition surpassing competitors
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">Multi-Asset Expertise</h4>
                <p className="text-sm text-muted-foreground">
                  Specialized for residential, commercial, industrial, multifamily & infrastructure
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">Global Scale</h4>
                <p className="text-sm text-muted-foreground">
                  Multi-currency, multi-region cost databases for sovereign/institutional clients
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">Enterprise Security</h4>
                <p className="text-sm text-muted-foreground">
                  Built for government, sovereign wealth funds, large developers with SOC2/ISO compliance
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">End-to-End Workflow</h4>
                <p className="text-sm text-muted-foreground">
                  From discovery to closeout, single source of truth for entire construction lifecycle
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default XBuilderxConstruction;
