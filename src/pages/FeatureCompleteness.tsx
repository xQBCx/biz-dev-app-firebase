import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Clock, CircleDashed, 
  Search, Filter, ChevronDown, ChevronRight, ExternalLink,
  Play, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface FeatureItem {
  id: string;
  module_name: string;
  feature_name: string;
  page_path: string | null;
  component_path: string | null;
  edge_function: string | null;
  status: string;
  issues: string[] | null;
  notes: string | null;
  priority: number;
  estimated_hours: number | null;
  last_audited_at: string;
}

// Parse JSON issues field
const parseIssues = (issues: unknown): string[] => {
  if (Array.isArray(issues)) return issues as string[];
  if (typeof issues === 'string') {
    try {
      const parsed = JSON.parse(issues);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

interface ModuleStats {
  module: string;
  total: number;
  complete: number;
  partial: number;
  mock_only: number;
  not_started: number;
  percentage: number;
}

const STATUS_CONFIG = {
  complete: { label: "Complete", color: "bg-green-500", icon: CheckCircle2, badgeVariant: "default" as const },
  partial: { label: "Partial", color: "bg-yellow-500", icon: Clock, badgeVariant: "secondary" as const },
  mock_only: { label: "Mock Only", color: "bg-orange-500", icon: AlertCircle, badgeVariant: "destructive" as const },
  not_started: { label: "Not Started", color: "bg-gray-400", icon: CircleDashed, badgeVariant: "outline" as const },
  needs_review: { label: "Needs Review", color: "bg-blue-500", icon: Search, badgeVariant: "secondary" as const },
};

export default function FeatureCompleteness() {
  const navigate = useNavigate();
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("feature_completeness")
      .select("*")
      .order("priority", { ascending: true })
      .order("module_name")
      .order("feature_name");

    if (error) {
      toast.error("Failed to load features");
      console.error(error);
    } else {
      // Transform data to parse JSON issues
      const transformed = (data || []).map(item => ({
        ...item,
        issues: parseIssues(item.issues),
      }));
      setFeatures(transformed);
    }
    setLoading(false);
  };

  const updateFeatureStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("feature_completeness")
      .update({ 
        status: newStatus, 
        completed_at: newStatus === "complete" ? new Date().toISOString() : null 
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchFeatures();
    }
  };

  // Calculate module statistics
  const moduleStats: ModuleStats[] = (() => {
    const modules = [...new Set(features.map(f => f.module_name))];
    return modules.map(mod => {
      const modFeatures = features.filter(f => f.module_name === mod);
      const complete = modFeatures.filter(f => f.status === "complete").length;
      return {
        module: mod,
        total: modFeatures.length,
        complete,
        partial: modFeatures.filter(f => f.status === "partial").length,
        mock_only: modFeatures.filter(f => f.status === "mock_only").length,
        not_started: modFeatures.filter(f => f.status === "not_started").length,
        percentage: Math.round((complete / modFeatures.length) * 100) || 0,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  })();

  // Overall stats
  const overallStats = {
    total: features.length,
    complete: features.filter(f => f.status === "complete").length,
    partial: features.filter(f => f.status === "partial").length,
    mock_only: features.filter(f => f.status === "mock_only").length,
    not_started: features.filter(f => f.status === "not_started").length,
  };
  const overallPercentage = Math.round((overallStats.complete / overallStats.total) * 100) || 0;

  // Filtered features
  const filteredFeatures = features.filter(f => {
    const matchesSearch = searchQuery === "" || 
      f.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.module_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || f.priority.toString() === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group by module
  const groupedFeatures = filteredFeatures.reduce((acc, f) => {
    if (!acc[f.module_name]) acc[f.module_name] = [];
    acc[f.module_name].push(f);
    return acc;
  }, {} as Record<string, FeatureItem[]>);

  const toggleModule = (mod: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  };

  const expandAll = () => setExpandedModules(new Set(Object.keys(groupedFeatures)));
  const collapseAll = () => setExpandedModules(new Set());

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Feature Completeness Tracker | Biz Dev</title>
        <meta name="description" content="Track and complete all platform features" />
      </Helmet>

      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Feature Completeness Tracker</h1>
            <p className="text-muted-foreground">
              Track progress on completing all platform functionality
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={fetchFeatures}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Progress value={overallPercentage} className="flex-1 h-4" />
              <span className="text-2xl font-bold">{overallPercentage}%</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{overallStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Features</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{overallStats.complete}</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{overallStats.partial}</div>
                <div className="text-sm text-muted-foreground">Partial</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{overallStats.mock_only}</div>
                <div className="text-sm text-muted-foreground">Mock Only</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">{overallStats.not_started}</div>
                <div className="text-sm text-muted-foreground">Not Started</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="modules">By Module</TabsTrigger>
            <TabsTrigger value="priority">By Priority</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete Only</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="mock_only">Mock Only</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="1">P1 - Critical</SelectItem>
                  <SelectItem value="2">P2 - High</SelectItem>
                  <SelectItem value="3">P3 - Medium</SelectItem>
                  <SelectItem value="4">P4 - Low</SelectItem>
                  <SelectItem value="5">P5 - Nice to Have</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
            </div>

            {/* Module Cards */}
            <div className="space-y-4">
              {Object.entries(groupedFeatures).map(([module, modFeatures]) => {
                const stats = moduleStats.find(m => m.module === module);
                const isExpanded = expandedModules.has(module);
                
                return (
                  <Card key={module}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleModule(module)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                          <CardTitle className="text-lg capitalize">
                            {module.replace(/_/g, " ")}
                          </CardTitle>
                          <Badge variant="outline">{modFeatures.length} features</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                            <Badge className="bg-green-500">{stats?.complete || 0}</Badge>
                            <Badge className="bg-yellow-500">{stats?.partial || 0}</Badge>
                            <Badge className="bg-orange-500">{stats?.mock_only || 0}</Badge>
                          </div>
                          <div className="w-32">
                            <Progress value={stats?.percentage || 0} className="h-2" />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {stats?.percentage || 0}%
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {modFeatures.map((feature) => {
                            const statusConfig = STATUS_CONFIG[feature.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_started;
                            const StatusIcon = statusConfig.icon;
                            
                            return (
                              <div 
                                key={feature.id}
                                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                              >
                                <StatusIcon className={`h-5 w-5 mt-0.5 ${
                                  feature.status === "complete" ? "text-green-500" :
                                  feature.status === "partial" ? "text-yellow-500" :
                                  feature.status === "mock_only" ? "text-orange-500" :
                                  "text-gray-400"
                                }`} />
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">{feature.feature_name}</span>
                                    <Badge variant={statusConfig.badgeVariant} className="text-xs">
                                      {statusConfig.label}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      P{feature.priority}
                                    </Badge>
                                  </div>
                                  
                                  {feature.page_path && (
                                    <a 
                                      href={feature.page_path}
                                      className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        navigate(feature.page_path!);
                                      }}
                                    >
                                      {feature.page_path}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                  
                                  {feature.issues && feature.issues.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {feature.issues.map((issue, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                          <AlertCircle className="h-3 w-3 mt-1 text-orange-500 shrink-0" />
                                          {issue}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  
                                  {feature.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">{feature.notes}</p>
                                  )}
                                </div>
                                
                                <div className="flex gap-1">
                                  {feature.status !== "complete" && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => updateFeatureStatus(feature.id, "complete")}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Select
                                    value={feature.status}
                                    onValueChange={(val) => updateFeatureStatus(feature.id, val)}
                                  >
                                    <SelectTrigger className="w-[120px] h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_started">Not Started</SelectItem>
                                      <SelectItem value="mock_only">Mock Only</SelectItem>
                                      <SelectItem value="partial">Partial</SelectItem>
                                      <SelectItem value="complete">Complete</SelectItem>
                                      <SelectItem value="needs_review">Needs Review</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="priority" className="space-y-4">
            {[1, 2, 3, 4, 5].map(priority => {
              const priorityFeatures = features.filter(f => f.priority === priority);
              if (priorityFeatures.length === 0) return null;
              
              const priorityLabels: Record<number, string> = {
                1: "P1 - Critical",
                2: "P2 - High",
                3: "P3 - Medium",
                4: "P4 - Low",
                5: "P5 - Nice to Have",
              };
              
              const complete = priorityFeatures.filter(f => f.status === "complete").length;
              const percentage = Math.round((complete / priorityFeatures.length) * 100);
              
              return (
                <Card key={priority}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{priorityLabels[priority]}</CardTitle>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {complete}/{priorityFeatures.length} complete
                        </span>
                        <div className="w-24">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {priorityFeatures.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {f.module_name.replace(/_/g, " ")}
                            </Badge>
                            <span>{f.feature_name}</span>
                          </div>
                          <Badge variant={
                            f.status === "complete" ? "default" :
                            f.status === "partial" ? "secondary" :
                            "destructive"
                          }>
                            {f.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="incomplete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Work Queue</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Features that need work, sorted by priority
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {features
                    .filter(f => f.status !== "complete")
                    .map(f => {
                      const statusConfig = STATUS_CONFIG[f.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_started;
                      return (
                        <div key={f.id} className="flex items-center gap-3 p-3 rounded border">
                          <Badge variant="outline">P{f.priority}</Badge>
                          <Badge variant="outline" className="capitalize">
                            {f.module_name.replace(/_/g, " ")}
                          </Badge>
                          <span className="flex-1 font-medium">{f.feature_name}</span>
                          <Badge variant={statusConfig.badgeVariant}>
                            {statusConfig.label}
                          </Badge>
                          {f.page_path && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(f.page_path!)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Open
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
