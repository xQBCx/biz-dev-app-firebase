import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Edit, 
  Eye, 
  BarChart3,
  FileText,
  Building2,
  Link2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface Prospect {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  slug: string;
  logo_url: string | null;
  status: string;
  notebook_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProspectManager() {
  const { user } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProspect, setNewProspect] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    slug: "",
  });

  // Use effectiveUserId for impersonation support
  const { data: prospects = [], isLoading } = useQuery({
    queryKey: ["prospects", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .eq("owner_user_id", effectiveUserId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Prospect[];
    },
    enabled: !!effectiveUserId,
  });

  const { data: actionCounts = {} } = useQuery({
    queryKey: ["prospect-action-counts", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId || !prospects.length) return {};
      
      const prospectIds = prospects.map(p => p.id);
      const { data, error } = await supabase
        .from("prospect_actions")
        .select("prospect_id, action_type")
        .in("prospect_id", prospectIds);

      if (error) throw error;

      const counts: Record<string, { views: number; clicks: number }> = {};
      data?.forEach((action) => {
        if (!counts[action.prospect_id]) {
          counts[action.prospect_id] = { views: 0, clicks: 0 };
        }
        if (action.action_type === "view") {
          counts[action.prospect_id].views++;
        } else {
          counts[action.prospect_id].clicks++;
        }
      });
      return counts;
    },
    enabled: !!effectiveUserId && prospects.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const slug = newProspect.slug || newProspect.company_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data, error } = await supabase
        .from("prospects")
        .insert({
          company_name: newProspect.company_name,
          contact_name: newProspect.contact_name || null,
          contact_email: newProspect.contact_email || null,
          slug,
          owner_user_id: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      setShowCreateDialog(false);
      setNewProspect({ company_name: "", contact_name: "", contact_email: "", slug: "" });
      toast.success("Prospect page created!");
    },
    onError: (error) => {
      toast.error("Failed to create: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("prospects")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      toast.success("Status updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("prospects")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      toast.success("Prospect deleted");
    },
  });

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Prospect Pages | Biz Dev App</title>
      </Helmet>

      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prospect Pages</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage custom landing pages for prospects
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Prospect Page
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : prospects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No prospect pages yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first prospect page to share materials with potential clients
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Prospect Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {prospects.map((prospect) => {
              const stats = actionCounts[prospect.id] || { views: 0, clicks: 0 };
              
              return (
                <Card key={prospect.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{prospect.company_name}</h3>
                            {getStatusBadge(prospect.status)}
                          </div>
                          {prospect.contact_name && (
                            <p className="text-sm text-muted-foreground">
                              {prospect.contact_name}
                              {prospect.contact_email && ` • ${prospect.contact_email}`}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {stats.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-4 w-4" />
                              {stats.clicks} actions
                            </span>
                            <span className="flex items-center gap-1">
                              <Link2 className="h-4 w-4" />
                              /p/{prospect.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLink(prospect.slug)}
                          title="Copy link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/p/${prospect.slug}`, "_blank")}
                          title="Preview"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {prospect.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: prospect.id, status: "active" })}
                          >
                            Publish
                          </Button>
                        )}
                        {prospect.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: prospect.id, status: "draft" })}
                          >
                            Unpublish
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(prospect.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Prospect Page</DialogTitle>
              <DialogDescription>
                Create a custom landing page for a prospect or client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={newProspect.company_name}
                  onChange={(e) => setNewProspect({ ...newProspect, company_name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={newProspect.contact_name}
                  onChange={(e) => setNewProspect({ ...newProspect, contact_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={newProspect.contact_email}
                  onChange={(e) => setNewProspect({ ...newProspect, contact_email: e.target.value })}
                  placeholder="john@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Custom URL Slug (optional)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/p/</span>
                  <Input
                    id="slug"
                    value={newProspect.slug}
                    onChange={(e) => setNewProspect({ ...newProspect, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    placeholder="acme-corp"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createMutation.mutate()} 
                disabled={!newProspect.company_name || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Page"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}