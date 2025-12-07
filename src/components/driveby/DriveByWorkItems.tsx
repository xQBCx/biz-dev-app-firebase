import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, MapPin, FileText, RefreshCw, Filter, Loader2, CheckCircle, Clock, Bot, User } from "lucide-react";
import { format } from "date-fns";

const kindIcons: Record<string, React.ReactNode> = { email: <Mail className="h-4 w-4" />, call: <Phone className="h-4 w-4" />, visit: <MapPin className="h-4 w-4" />, proposal: <FileText className="h-4 w-4" />, follow_up: <RefreshCw className="h-4 w-4" /> };
const kindLabels: Record<string, string> = { email: "Email", call: "Call", visit: "Site Visit", proposal: "Proposal", follow_up: "Follow Up" };
const statusColors: Record<string, string> = { open: "bg-blue-500/10 text-blue-500", in_progress: "bg-yellow-500/10 text-yellow-500", completed: "bg-green-500/10 text-green-500", cancelled: "bg-red-500/10 text-red-500" };

export const DriveByWorkItems = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [kindFilter, setKindFilter] = useState<string>("all");

  const { data: workItems, isLoading } = useQuery({
    queryKey: ["driveby-work-items", user?.id, statusFilter, kindFilter],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from("driveby_work_item").select(`*, driveby_lead (place_name)`).order("due_at", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (kindFilter !== "all") query = query.eq("kind", kindFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "completed") updates.completed_at = new Date().toISOString();
      const { error } = await supabase.from("driveby_work_item").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["driveby-work-items"] }),
  });

  const toggleComplete = (item: any) => updateStatusMutation.mutate({ id: item.id, status: item.status === "completed" ? "open" : "completed" });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
        <Select value={kindFilter} onValueChange={setKindFilter}><SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="call">Call</SelectItem><SelectItem value="visit">Visit</SelectItem><SelectItem value="proposal">Proposal</SelectItem><SelectItem value="follow_up">Follow Up</SelectItem></SelectContent></Select>
      </div>

      {!workItems?.length ? <Card><CardContent className="py-12 text-center"><CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No work items</h3><p className="text-muted-foreground mt-1">{statusFilter === "open" ? "All caught up! Generate outreach from leads to create tasks." : "No items match the current filters"}</p></CardContent></Card> : (
        <div className="space-y-2">
          {workItems.map((item: any) => (
            <Card key={item.id} className={item.status === "completed" ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox checked={item.status === "completed"} onCheckedChange={() => toggleComplete(item)} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">{kindIcons[item.kind]}</span><span className="font-medium">{kindLabels[item.kind] || item.kind}</span>{item.driveby_lead?.place_name && <span className="text-muted-foreground">for {item.driveby_lead.place_name}</span>}</div>
                    {item.payload && <div className="text-sm text-muted-foreground">{item.kind === "email" && item.payload.subject && <p>Subject: {String(item.payload.subject)}</p>}{item.kind === "call" && item.payload.script && <p className="line-clamp-2">{String(item.payload.script)}</p>}</div>}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge className={statusColors[item.status] || ""}>{item.status.replace("_", " ")}</Badge>
                      <span className="flex items-center gap-1">{item.assignee_type === "agent" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}{item.assignee_type === "agent" ? "AI Agent" : "You"}</span>
                      {item.due_at && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Due {format(new Date(item.due_at), "MMM d")}</span>}
                    </div>
                  </div>
                  <Select value={item.status} onValueChange={(status) => updateStatusMutation.mutate({ id: item.id, status })}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
