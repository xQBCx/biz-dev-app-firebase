import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const InvestorAccessManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: accessRecords } = useQuery({
    queryKey: ["investor-access-admin"],
    queryFn: async () => {
      const { data: accessData, error: accessError } = await supabase
        .from("investor_access")
        .select("*")
        .order("created_at", { ascending: false });

      if (accessError) throw accessError;

      // Fetch related data
      const dealIds = [...new Set(accessData.map(a => a.deal_id))];
      const userIds = [...new Set(accessData.map(a => a.user_id))];

      const [dealsResult, profilesResult] = await Promise.all([
        supabase.from("deals").select("id, title, slug").in("id", dealIds),
        supabase.from("profiles").select("id, full_name").in("id", userIds),
      ]);

      const dealsMap = new Map(dealsResult.data?.map(d => [d.id, d]));
      const profilesMap = new Map(profilesResult.data?.map(p => [p.id, p]));

      return accessData.map(access => ({
        ...access,
        deals: dealsMap.get(access.deal_id),
        profiles: profilesMap.get(access.user_id),
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (accessId: string) => {
      const { error } = await supabase
        .from("investor_access")
        .delete()
        .eq("id", accessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investor-access-admin"] });
      toast.success("Access removed");
    },
    onError: () => {
      toast.error("Failed to remove access");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Investor Access</h2>
          <p className="text-sm text-muted-foreground">
            Manage which users can access specific data rooms
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Grant Access
        </Button>
      </div>

      <div className="grid gap-4">
        {accessRecords?.map((record) => (
          <Card key={record.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {record.profiles?.full_name || "Unknown User"}
                  </h3>
                  <Badge variant="secondary">{record.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access to: {record.deals?.title || "Unknown Deal"}
                </p>
                <p className="text-xs text-muted-foreground">
                  User ID: <code className="bg-muted px-2 py-1 rounded text-xs">{record.user_id}</code>
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(record.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {(!accessRecords || accessRecords.length === 0) && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No investor access records yet. Grant access to users.</p>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Investor Access</DialogTitle>
          </DialogHeader>
          <InvestorAccessForm
            onSuccess={() => {
              setDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["investor-access-admin"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InvestorAccessForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    deal_id: "",
    role: "viewer",
  });

  const { data: deals } = useQuery({
    queryKey: ["deals-for-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("id, title, slug")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("investor_access").insert(formData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Access granted");
      onSuccess();
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("This user already has access to this deal");
      } else {
        toast.error("Failed to grant access");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user_id">User *</Label>
        <Select
          value={formData.user_id}
          onValueChange={(value) => setFormData({ ...formData, user_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {profiles?.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Users must be registered in the system first
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal_id">Deal *</Label>
        <Select
          value={formData.deal_id}
          onValueChange={(value) => setFormData({ ...formData, deal_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a deal" />
          </SelectTrigger>
          <SelectContent>
            {deals?.map((deal) => (
              <SelectItem key={deal.id} value={deal.id}>
                {deal.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="investor">Investor</SelectItem>
            <SelectItem value="lead">Lead Investor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? "Granting Access..." : "Grant Access"}
      </Button>
    </form>
  );
};

export default InvestorAccessManager;
