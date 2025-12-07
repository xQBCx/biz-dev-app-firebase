import { useInstincts } from "@/hooks/useInstincts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Users, 
  Zap,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  MapPin,
  Target,
  BarChart3
} from "lucide-react";

export default function XBuilderxDashboard() {
  const { trackClick } = useInstincts();
  const globalMetrics = [
    {
      label: "Active Opportunities",
      value: "847",
      change: "+23%",
      trend: "up",
      icon: Search,
      color: "text-green-500"
    },
    {
      label: "Pipeline Value",
      value: "$2.4T",
      change: "+15%",
      trend: "up",
      icon: DollarSign,
      color: "text-blue-500"
    },
    {
      label: "Countries Monitored",
      value: "127",
      change: "+3",
      trend: "up",
      icon: Globe,
      color: "text-purple-500"
    },
    {
      label: "Projects in Design",
      value: "324",
      change: "+18%",
      trend: "up",
      icon: Building2,
      color: "text-orange-500"
    }
  ];

  const recentOpportunities = [
    {
      id: 1,
      title: "Dubai Metro Expansion Phase 4",
      country: "United Arab Emirates",
      value: "$4.2B",
      type: "Transportation",
      stage: "RFP Released",
      deadline: "45 days",
      matchScore: 94
    },
    {
      id: 2,
      title: "Singapore Green Housing Initiative",
      country: "Singapore",
      value: "$1.8B",
      type: "Affordable Housing",
      stage: "Early Discovery",
      deadline: "120 days",
      matchScore: 89
    },
    {
      id: 3,
      title: "Kenya Renewable Energy Grid",
      country: "Kenya",
      value: "$3.5B",
      type: "Energy Infrastructure",
      stage: "Technical Review",
      deadline: "30 days",
      matchScore: 92
    },
    {
      id: 4,
      title: "Brazil Smart City Development",
      country: "Brazil",
      value: "$2.1B",
      type: "Mixed-Use Development",
      stage: "RFP Released",
      deadline: "60 days",
      matchScore: 87
    },
    {
      id: 5,
      title: "Australia Water Infrastructure",
      country: "Australia",
      value: "$1.4B",
      type: "Water & Utilities",
      stage: "Early Discovery",
      deadline: "90 days",
      matchScore: 91
    }
  ];

  const regionalData = [
    { region: "Middle East", projects: 234, value: "$567B", growth: "+28%" },
    { region: "Asia Pacific", projects: 189, value: "$423B", growth: "+22%" },
    { region: "Africa", projects: 156, value: "$289B", growth: "+35%" },
    { region: "South America", projects: 124, value: "$178B", growth: "+19%" },
    { region: "Europe", projects: 98, value: "$312B", growth: "+14%" },
    { region: "North America", projects: 46, value: "$156B", growth: "+11%" }
  ];

  const topSectors = [
    { name: "Affordable Housing", count: 287, value: "$487B", share: "27%" },
    { name: "Transportation", count: 198, value: "$356B", share: "20%" },
    { name: "Energy Infrastructure", count: 165, value: "$423B", share: "24%" },
    { name: "Water & Utilities", count: 134, value: "$245B", share: "14%" },
    { name: "Mixed-Use Development", count: 63, value: "$264B", share: "15%" }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "RFP Released":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Technical Review":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Early Discovery":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">xBUILDERx Intelligence Center</h1>
          <p className="text-muted-foreground mt-2">
            Real-time global infrastructure opportunity monitoring
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          <Zap className="mr-2 h-4 w-4" />
          Live Data • Updated 2 min ago
        </Badge>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {globalMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-500 border-green-500/20">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {metric.change}
                    </Badge>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-muted ${metric.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">
            <Target className="mr-2 h-4 w-4" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="regions">
            <MapPin className="mr-2 h-4 w-4" />
            Regions
          </TabsTrigger>
          <TabsTrigger value="sectors">
            <BarChart3 className="mr-2 h-4 w-4" />
            Sectors
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">High-Value Opportunities</h2>
                <p className="text-muted-foreground">
                  AI-discovered projects matching your investment criteria
                </p>
              </div>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Advanced Search
              </Button>
            </div>

            <div className="space-y-4">
              {recentOpportunities.map((opp) => (
                <Card key={opp.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{opp.title}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline">
                              <MapPin className="mr-1 h-3 w-3" />
                              {opp.country}
                            </Badge>
                            <Badge variant="outline">{opp.type}</Badge>
                            <Badge className={getStageColor(opp.stage)}>
                              {opp.stage}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{opp.value}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Project Value
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {opp.deadline} remaining
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-500">
                              {opp.matchScore}% Match Score
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Regional Overview</h2>
            <div className="space-y-4">
              {regionalData.map((region) => (
                <Card key={region.region} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{region.region}</h3>
                        <Badge variant="outline" className="text-green-500 border-green-500/20">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          {region.growth}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-muted-foreground">
                        <span>{region.projects} Active Projects</span>
                        <span className="text-2xl font-bold text-foreground">
                          {region.value}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline">
                      View Projects
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Sectors Tab */}
        <TabsContent value="sectors" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Top Infrastructure Sectors</h2>
            <div className="space-y-4">
              {topSectors.map((sector) => (
                <Card key={sector.name} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold">{sector.name}</h3>
                      <div className="flex items-center gap-6 text-muted-foreground">
                        <span>{sector.count} Projects</span>
                        <span className="text-2xl font-bold text-foreground">
                          {sector.value}
                        </span>
                        <Badge variant="outline">{sector.share} of market</Badge>
                      </div>
                    </div>
                    <Button variant="outline">
                      Explore Sector
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">AI Discovery Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Detection Speed</span>
                  <span className="font-semibold">15 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accuracy Rate</span>
                  <span className="font-semibold text-green-500">94.0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data Sources</span>
                  <span className="font-semibold">50,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Daily Scans</span>
                  <span className="font-semibold">2.4M</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Platform Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Projects Analyzed</span>
                  <span className="font-semibold">8,932</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Investment</span>
                  <span className="font-semibold">$34.8B</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold text-green-500">87.3%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">ESG Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Carbon Reduction</span>
                  <span className="font-semibold text-green-500">73%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Renewable Energy</span>
                  <span className="font-semibold text-green-500">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">People Impacted</span>
                  <span className="font-semibold">2.4M+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Communities Served</span>
                  <span className="font-semibold">847</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Financial Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. Cost Reduction</span>
                  <span className="font-semibold text-green-500">47%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Design Acceleration</span>
                  <span className="font-semibold text-green-500">89%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Revenue Optimization</span>
                  <span className="font-semibold text-green-500">+18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Occupancy Rate</span>
                  <span className="font-semibold text-green-500">94.3%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
