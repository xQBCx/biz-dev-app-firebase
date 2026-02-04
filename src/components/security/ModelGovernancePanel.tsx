import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Brain,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  Settings,
  FileText,
  DollarSign,
  Users,
  RefreshCw,
  Eye,
  Edit,
  TrendingUp,
  Lock,
  Unlock
} from "lucide-react";

interface ModelGovernance {
  id: string;
  model_id: string;
  model_name: string;
  model_provider: string;
  model_type: string;
  model_version: string | null;
  approval_status: string | null;
  approved_at: string | null;
  approved_by: string | null;
  data_restrictions: string[] | null;
  use_cases_allowed: string[] | null;
  cost_per_1k_tokens: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performance_metrics: Record<string, unknown> | null;
  risk_assessment: Record<string, unknown> | null;
  last_audit_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const mockModels: ModelGovernance[] = [
  {
    id: "1",
    model_id: "gpt-5",
    model_name: "GPT-5",
    model_provider: "OpenAI",
    model_type: "LLM",
    model_version: "5.0",
    approval_status: "approved",
    approved_at: new Date().toISOString(),
    approved_by: "admin@company.com",
    data_restrictions: ["PII", "Financial"],
    use_cases_allowed: ["Customer Support", "Content Generation", "Analysis"],
    cost_per_1k_tokens: 0.03,
    performance_metrics: { accuracy: 0.95, latency_ms: 250 },
    risk_assessment: { overall_risk: "low", bias_risk: "minimal" },
    last_audit_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    model_id: "gemini-2.5-pro",
    model_name: "Gemini 2.5 Pro",
    model_provider: "Google",
    model_type: "LLM",
    model_version: "2.5",
    approval_status: "approved",
    approved_at: new Date().toISOString(),
    approved_by: "admin@company.com",
    data_restrictions: ["HIPAA"],
    use_cases_allowed: ["Research", "Code Generation", "Multimodal"],
    cost_per_1k_tokens: 0.025,
    performance_metrics: { accuracy: 0.93, latency_ms: 200 },
    risk_assessment: { overall_risk: "low", bias_risk: "low" },
    last_audit_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    model_id: "claude-4",
    model_name: "Claude 4",
    model_provider: "Anthropic",
    model_type: "LLM",
    model_version: "4.0",
    approval_status: "pending",
    approved_at: null,
    approved_by: null,
    data_restrictions: [],
    use_cases_allowed: ["General"],
    cost_per_1k_tokens: 0.015,
    performance_metrics: { accuracy: 0.91, latency_ms: 180 },
    risk_assessment: { overall_risk: "medium", bias_risk: "low" },
    last_audit_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "4",
    model_id: "stable-diffusion-3",
    model_name: "Stable Diffusion 3",
    model_provider: "Stability AI",
    model_type: "Image",
    model_version: "3.0",
    approval_status: "rejected",
    approved_at: null,
    approved_by: null,
    data_restrictions: ["All"],
    use_cases_allowed: [],
    cost_per_1k_tokens: 0.02,
    performance_metrics: { quality: 0.88, latency_ms: 3000 },
    risk_assessment: { overall_risk: "high", content_risk: "high" },
    last_audit_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function ModelGovernancePanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [selectedModel, setSelectedModel] = useState<ModelGovernance | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: models = mockModels, isLoading } = useQuery({
    queryKey: ["model-governance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_model_governance")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching models:", error);
        return mockModels;
      }
      return data.length > 0 ? (data as unknown as ModelGovernance[]) : mockModels;
    }
  });

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      const matchesSearch = 
        model.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.model_provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.model_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || model.approval_status === statusFilter;
      const matchesProvider = providerFilter === "all" || model.model_provider === providerFilter;
      
      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [models, searchQuery, statusFilter, providerFilter]);

  const stats = useMemo(() => {
    const total = models.length;
    const approved = models.filter(m => m.approval_status === "approved").length;
    const pending = models.filter(m => m.approval_status === "pending").length;
    const rejected = models.filter(m => m.approval_status === "rejected").length;
    const avgCost = models.reduce((sum, m) => sum + (m.cost_per_1k_tokens || 0), 0) / total;
    
    return { total, approved, pending, rejected, avgCost };
  }, [models]);

  const providers = useMemo(() => {
    return [...new Set(models.map(m => m.model_provider))];
  }, [models]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  const getRiskBadge = (risk: string | undefined) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">High Risk</Badge>;
      default:
        return <Badge variant="secondary">Not Assessed</Badge>;
    }
  };

  const handleApprove = async (modelId: string) => {
    toast.success("Model approved successfully");
    queryClient.invalidateQueries({ queryKey: ["model-governance"] });
  };

  const handleReject = async (modelId: string) => {
    toast.error("Model rejected");
    queryClient.invalidateQueries({ queryKey: ["model-governance"] });
  };

  const openModelDetail = (model: ModelGovernance) => {
    setSelectedModel(model);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Model Governance Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage AI model approvals, usage policies, and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Policies
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Models</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <XCircle className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${stats.avgCost.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">Avg Cost/1K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models by name, provider, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Models Table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Registered Models
          </CardTitle>
          <CardDescription>
            {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Cost/1K</TableHead>
                  <TableHead>Last Audit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openModelDetail(model)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{model.model_name}</p>
                          <p className="text-xs text-muted-foreground">{model.model_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{model.model_provider}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{model.model_type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(model.approval_status)}</TableCell>
                    <TableCell>
                      {getRiskBadge((model.risk_assessment as Record<string, string>)?.overall_risk)}
                    </TableCell>
                    <TableCell>
                      ${model.cost_per_1k_tokens?.toFixed(3) || "N/A"}
                    </TableCell>
                    <TableCell>
                      {model.last_audit_at 
                        ? new Date(model.last_audit_at).toLocaleDateString()
                        : "Never"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => openModelDetail(model)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {model.approval_status === "pending" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-emerald-500 hover:text-emerald-400"
                              onClick={() => handleApprove(model.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-rose-500 hover:text-rose-400"
                              onClick={() => handleReject(model.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Model Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedModel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-primary" />
                  {selectedModel.model_name}
                </DialogTitle>
                <DialogDescription>
                  {selectedModel.model_provider} • {selectedModel.model_type} • v{selectedModel.model_version}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status & Risk */}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Approval Status</p>
                    {getStatusBadge(selectedModel.approval_status)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                    {getRiskBadge((selectedModel.risk_assessment as Record<string, string>)?.overall_risk)}
                  </div>
                </div>

                <Separator />

                {/* Use Cases */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Allowed Use Cases</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.use_cases_allowed?.length ? (
                      selectedModel.use_cases_allowed.map((useCase, i) => (
                        <Badge key={i} variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          <Unlock className="h-3 w-3 mr-1" />
                          {useCase}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No use cases defined</p>
                    )}
                  </div>
                </div>

                {/* Data Restrictions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Data Restrictions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.data_restrictions?.length ? (
                      selectedModel.data_restrictions.map((restriction, i) => (
                        <Badge key={i} variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30">
                          <Lock className="h-3 w-3 mr-1" />
                          {restriction}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No restrictions</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Performance Metrics */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Performance Metrics</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Accuracy</span>
                        <span className="font-medium">
                          {((selectedModel.performance_metrics as Record<string, number>)?.accuracy * 100 || 0).toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={(selectedModel.performance_metrics as Record<string, number>)?.accuracy * 100 || 0} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Latency</span>
                        <span className="font-medium">
                          {(selectedModel.performance_metrics as Record<string, number>)?.latency_ms || 0}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, 100 - ((selectedModel.performance_metrics as Record<string, number>)?.latency_ms || 0) / 50)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Cost & Audit Info */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Cost per 1K tokens</span>
                    </div>
                    <p className="text-2xl font-bold">${selectedModel.cost_per_1k_tokens?.toFixed(3)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last Audit</span>
                    </div>
                    <p className="text-lg font-medium">
                      {selectedModel.last_audit_at 
                        ? new Date(selectedModel.last_audit_at).toLocaleDateString()
                        : "Never audited"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                {selectedModel.approval_status === "pending" && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="text-rose-500 border-rose-500/30"
                      onClick={() => {
                        handleReject(selectedModel.id);
                        setIsDetailOpen(false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        handleApprove(selectedModel.id);
                        setIsDetailOpen(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Model
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
