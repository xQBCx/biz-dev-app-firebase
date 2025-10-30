import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Users, Plus, Loader } from "lucide-react";
import { toast } from "sonner";

interface Delegation {
  id: string;
  delegation_type: string;
  platform_name: string;
  delegated_user_email?: string;
  ai_agent_config: any;
  is_active: boolean;
  notes: string | null;
}

interface DelegationManagerProps {
  onUpdate: () => void;
}

export const DelegationManager = ({ onUpdate }: DelegationManagerProps) => {
  const { user } = useAuth();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDelegations();
    }
  }, [user]);

  const loadDelegations = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_delegations")
        .select(`
          id,
          delegation_type,
          ai_agent_config,
          is_active,
          notes,
          social_platforms (platform_name),
          profiles:delegated_to_user (email)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedDelegations = (data || []).map(del => ({
        ...del,
        platform_name: (del.social_platforms as any)?.platform_name || "All Platforms",
        delegated_user_email: (del.profiles as any)?.email
      }));
      
      setDelegations(formattedDelegations as any);
    } catch (error) {
      console.error("Error loading delegations:", error);
      toast.error("Failed to load delegations");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (delegationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("platform_delegations")
        .update({ is_active: !currentStatus })
        .eq("id", delegationId);

      if (error) throw error;
      
      toast.success(`Delegation ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadDelegations();
      onUpdate();
    } catch (error) {
      console.error("Error toggling delegation:", error);
      toast.error("Failed to update delegation");
    }
  };

  const aiDelegations = delegations.filter(d => d.delegation_type === "ai" || d.delegation_type === "hybrid");
  const humanDelegations = delegations.filter(d => d.delegation_type === "human" || d.delegation_type === "hybrid");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Delegation Management</CardTitle>
            <CardDescription>
              Delegate platform management to AI agents or team members
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Delegation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">
              <Bot className="h-4 w-4 mr-2" />
              AI Agents ({aiDelegations.length})
            </TabsTrigger>
            <TabsTrigger value="human">
              <Users className="h-4 w-4 mr-2" />
              Team Members ({humanDelegations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            {aiDelegations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No AI Delegations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Set up AI agents to automatically manage your social media
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create AI Delegation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {aiDelegations.map((delegation) => (
                  <Card key={delegation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{delegation.platform_name}</h4>
                            <Badge variant={delegation.is_active ? "default" : "secondary"}>
                              {delegation.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{delegation.delegation_type}</Badge>
                          </div>
                          {delegation.notes && (
                            <p className="text-sm text-muted-foreground">{delegation.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggle(delegation.id, delegation.is_active)}
                        >
                          {delegation.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="human" className="space-y-4">
            {humanDelegations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Team Delegations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Invite team members to help manage your social media
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Team Member
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {humanDelegations.map((delegation) => (
                  <Card key={delegation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{delegation.platform_name}</h4>
                            <Badge variant={delegation.is_active ? "default" : "secondary"}>
                              {delegation.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {delegation.delegated_user_email && (
                            <p className="text-sm text-muted-foreground">
                              Managed by: {delegation.delegated_user_email}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggle(delegation.id, delegation.is_active)}
                        >
                          {delegation.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};