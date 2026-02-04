import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, CheckCircle2, AlertCircle, Clock, XCircle, Loader2 } from "lucide-react";

type ComplianceCheck = {
  id: string;
  framework: string;
  control_id: string;
  control_name: string;
  status: string;
  evidence_url: string | null;
  notes: string | null;
  last_checked_at: string | null;
  next_review_date: string | null;
};

const statusIcons: Record<string, React.ElementType> = {
  compliant: CheckCircle2,
  partial: AlertCircle,
  in_progress: Clock,
  non_compliant: XCircle,
  not_started: Clock,
  not_applicable: Shield,
};

const statusColors: Record<string, string> = {
  compliant: "bg-green-500/20 text-green-400",
  partial: "bg-yellow-500/20 text-yellow-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  non_compliant: "bg-destructive/20 text-destructive",
  not_started: "bg-muted text-muted-foreground",
  not_applicable: "bg-muted text-muted-foreground",
};

const frameworkDescriptions: Record<string, string> = {
  "ISO 27001": "Information Security Management System",
  "SOC 2": "Service Organization Control Type II",
  "NIST PQC": "Post-Quantum Cryptography Standards",
  "GDPR": "General Data Protection Regulation",
  "OWASP API": "API Security Top 10",
  "OWASP BLA": "Business Logic Abuse Top 10",
  "FIPS 140-3": "Cryptographic Module Validation",
  "AGENTIC AI": "AI Agent Governance Framework",
};

export default function ComplianceDashboard() {
  const queryClient = useQueryClient();
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const { data: checks, isLoading } = useQuery({
    queryKey: ["compliance-checks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_checks")
        .select("*")
        .order("framework")
        .order("control_id");
      if (error) throw error;
      return data as ComplianceCheck[];
    },
  });

  const updateCheckMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status?: string; notes?: string }) => {
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      updates.last_checked_at = new Date().toISOString();
      
      const { error } = await supabase.from("compliance_checks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-checks"] });
      toast.success("Compliance check updated");
      setSelectedCheck(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const frameworks = [...new Set(checks?.map((c) => c.framework) || [])];
  const filteredChecks = checks?.filter(
    (c) => selectedFramework === "all" || c.framework === selectedFramework
  );

  const getFrameworkStats = (framework: string) => {
    const frameworkChecks = checks?.filter((c) => c.framework === framework) || [];
    const total = frameworkChecks.length;
    const compliant = frameworkChecks.filter((c) => c.status === "compliant").length;
    const partial = frameworkChecks.filter((c) => c.status === "partial").length;
    const inProgress = frameworkChecks.filter((c) => c.status === "in_progress").length;
    const score = total > 0 ? Math.round(((compliant + partial * 0.5) / total) * 100) : 0;
    return { total, compliant, partial, inProgress, score };
  };

  const getOverallScore = () => {
    if (!checks?.length) return 0;
    const compliant = checks.filter((c) => c.status === "compliant").length;
    const partial = checks.filter((c) => c.status === "partial").length;
    return Math.round(((compliant + partial * 0.5) / checks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Overall Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{getOverallScore()}%</div>
            <Progress value={getOverallScore()} className="flex-1" />
          </div>
        </CardContent>
      </Card>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map((framework) => {
          const stats = getFrameworkStats(framework);
          return (
            <Card
              key={framework}
              className={`cursor-pointer transition-colors hover:border-primary/50 ${
                selectedFramework === framework ? "border-primary" : ""
              }`}
              onClick={() => setSelectedFramework(framework === selectedFramework ? "all" : framework)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{framework}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {frameworkDescriptions[framework]}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span className="font-medium">{stats.score}%</span>
                  </div>
                  <Progress value={stats.score} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span className="text-green-400">{stats.compliant} compliant</span>
                    <span className="text-yellow-400">{stats.partial} partial</span>
                    <span className="text-blue-400">{stats.inProgress} in progress</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Controls Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Compliance Controls</CardTitle>
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                {frameworks.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredChecks?.map((check) => {
              const Icon = statusIcons[check.status];
              return (
                <div
                  key={check.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Icon className={`h-5 w-5 ${statusColors[check.status].split(" ")[1]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{check.control_id}</Badge>
                      <span className="font-medium truncate">{check.control_name}</span>
                    </div>
                    {check.notes && (
                      <p className="text-sm text-muted-foreground truncate">{check.notes}</p>
                    )}
                  </div>
                  <Badge className={statusColors[check.status]}>{check.status.replace("_", " ")}</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCheck(check);
                          setEditNotes(check.notes || "");
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {check.control_id}: {check.control_name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["not_started", "in_progress", "partial", "compliant", "non_compliant", "not_applicable"].map(
                              (status) => (
                                <Button
                                  key={status}
                                  variant={check.status === status ? "default" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    updateCheckMutation.mutate({ id: check.id, status })
                                  }
                                >
                                  {status.replace("_", " ")}
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add notes about this control..."
                            className="mt-2"
                          />
                          <Button
                            className="mt-2"
                            size="sm"
                            onClick={() =>
                              updateCheckMutation.mutate({ id: check.id, notes: editNotes })
                            }
                            disabled={updateCheckMutation.isPending}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
