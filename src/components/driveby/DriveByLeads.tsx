import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Phone, Globe, Building2, Star, Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useInstincts } from "@/hooks/useInstincts";

const statusColors: Record<string, string> = { new: "bg-blue-500/10 text-blue-500", contacted: "bg-yellow-500/10 text-yellow-500", qualified: "bg-green-500/10 text-green-500", converted: "bg-purple-500/10 text-purple-500", lost: "bg-red-500/10 text-red-500" };

export const DriveByLeads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { trackEntityUpdated, trackEntityCreated, trackSearch } = useInstincts();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["driveby-leads", user?.id, statusFilter],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from("driveby_lead").select(`*, lead_assignment (id, company_id, bundle_id, rationale, biz_company (name))`).eq("user_id", user.id).order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const { error } = await supabase.from("driveby_lead").update({ status }).eq("id", leadId);
      if (error) throw error;
      return { leadId, status };
    },
    onSuccess: (data) => { trackEntityUpdated("driveby", "driveby_lead", data.leadId, "Status: " + data.status); queryClient.invalidateQueries({ queryKey: ["driveby-leads"] }); },
  });

  const generateOutreachMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase.functions.invoke("driveby-outreach", { body: { leadId } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, leadId) => { trackEntityCreated("driveby", "driveby_work_item", leadId, `${data.tasksCreated} tasks`); toast({ title: "Outreach tasks created!", description: `${data.tasksCreated} work items generated` }); queryClient.invalidateQueries({ queryKey: ["driveby-work-items"] }); },
    onError: () => toast({ title: "Failed to generate outreach", variant: "destructive" }),
  });

  const handleSearch = (value: string) => { setSearch(value); if (value.length >= 3) trackSearch("driveby", value); };
  const filteredLeads = leads?.filter((lead: any) => !search || lead.place_name?.toLowerCase().includes(search.toLowerCase()) || lead.category?.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search leads..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent></Select>
      </div>

      {!filteredLeads?.length ? <Card><CardContent className="py-12 text-center"><Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No leads found</h3><p className="text-muted-foreground mt-1">Convert captures to create leads</p></CardContent></Card> : (
        <div className="grid gap-4">
          {filteredLeads.map((lead: any) => (
            <Card key={lead.id}><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><h3 className="font-semibold">{lead.place_name || "Unknown Business"}</h3><Badge className={statusColors[lead.status] || ""}>{lead.status}</Badge>{lead.quality_score > 0.7 && <Badge variant="outline" className="text-yellow-500"><Star className="h-3 w-3 mr-1" />High Quality</Badge>}</div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {lead.category && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.category}</span>}
                    {lead.place_phone && <a href={`tel:${lead.place_phone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="h-3 w-3" />{lead.place_phone}</a>}
                    {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground"><Globe className="h-3 w-3" />Website</a>}
                  </div>
                  {lead.lead_assignment?.length > 0 && <div className="flex flex-wrap gap-1">{lead.lead_assignment.map((a: any) => <Badge key={a.id} variant="secondary">{a.biz_company?.name || "Company"}</Badge>)}</div>}
                  <p className="text-xs text-muted-foreground">Captured {format(new Date(lead.created_at), "MMM d, yyyy")}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Select value={lead.status} onValueChange={(status) => updateStatusMutation.mutate({ leadId: lead.id, status })}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent></Select>
                  <Button size="sm" variant="outline" onClick={() => generateOutreachMutation.mutate(lead.id)} disabled={generateOutreachMutation.isPending}>{generateOutreachMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4 mr-1" />Generate Outreach</>}</Button>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
};
