import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Trash2, FileText, Eye, Edit, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

type DataRequest = {
  id: string;
  user_id: string;
  request_type: string;
  status: string;
  reason: string | null;
  admin_notes: string | null;
  completed_at: string | null;
  created_at: string;
};

const typeIcons: Record<string, React.ElementType> = {
  export: Download,
  delete: Trash2,
  access: Eye,
  rectification: Edit,
  portability: FileText,
  objection: AlertTriangle,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  rejected: "bg-destructive/20 text-destructive",
};

const typeLabels: Record<string, string> = {
  export: "Data Export (GDPR Art. 20)",
  delete: "Right to Erasure (GDPR Art. 17)",
  access: "Right of Access (GDPR Art. 15)",
  rectification: "Right to Rectification (GDPR Art. 16)",
  portability: "Data Portability (GDPR Art. 20)",
  objection: "Right to Object (GDPR Art. 21)",
};

export default function DataRequestsManager() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["data-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DataRequest[];
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status?: string; admin_notes?: string }) => {
      const updates: Record<string, unknown> = {};
      if (status) {
        updates.status = status;
        if (status === "completed" || status === "rejected") {
          updates.completed_at = new Date().toISOString();
        }
      }
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      
      const { error } = await supabase.from("data_requests").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-requests"] });
      toast.success("Request updated");
      setSelectedRequest(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const processExportMutation = useMutation({
    mutationFn: async (request: DataRequest) => {
      // First update status to processing
      await supabase.from("data_requests").update({ status: "processing" }).eq("id", request.id);
      
      // Call edge function to generate export
      const { error } = await supabase.functions.invoke("data-export", {
        body: { userId: request.user_id, requestId: request.id },
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-requests"] });
      toast.success("Export processing started");
    },
    onError: (error) => toast.error(error.message),
  });

  const getStats = () => {
    if (!requests) return { pending: 0, processing: 0, completed: 0, total: 0 };
    return {
      pending: requests.filter((r) => r.status === "pending").length,
      processing: requests.filter((r) => r.status === "processing").length,
      completed: requests.filter((r) => r.status === "completed").length,
      total: requests.length,
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-400">{stats.processing}</div>
            <p className="text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* GDPR/CCPA Info */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Data Subject Rights Compliance</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Under GDPR and CCPA, you must respond to data requests within 30 days. Pending requests
                should be prioritized to maintain compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Data Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No data requests yet</p>
          ) : (
            <div className="space-y-3">
              {requests?.map((request) => {
                const Icon = typeIcons[request.request_type];
                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{typeLabels[request.request_type]}</span>
                        <Badge className={statusColors[request.status]}>{request.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>User: {request.user_id.slice(0, 8)}...</span>
                        <span className="mx-2">•</span>
                        <span>{format(new Date(request.created_at), "MMM d, yyyy")}</span>
                      </div>
                      {request.reason && (
                        <p className="text-sm mt-1">{request.reason}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {request.request_type === "export" && request.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => processExportMutation.mutate(request)}
                          disabled={processExportMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Process Export
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes(request.admin_notes || "");
                            }}
                          >
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{typeLabels[request.request_type]}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">User ID</label>
                              <p className="text-sm text-muted-foreground mt-1">{request.user_id}</p>
                            </div>
                            {request.reason && (
                              <div>
                                <label className="text-sm font-medium">User's Reason</label>
                                <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {["pending", "processing", "completed", "rejected"].map((status) => (
                                  <Button
                                    key={status}
                                    variant={request.status === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() =>
                                      updateRequestMutation.mutate({ id: request.id, status })
                                    }
                                  >
                                    {status}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Admin Notes</label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Internal notes about this request..."
                                className="mt-2"
                              />
                              <Button
                                className="mt-2"
                                size="sm"
                                onClick={() =>
                                  updateRequestMutation.mutate({ id: request.id, admin_notes: adminNotes })
                                }
                                disabled={updateRequestMutation.isPending}
                              >
                                Save Notes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
