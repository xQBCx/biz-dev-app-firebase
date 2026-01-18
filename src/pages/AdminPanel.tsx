import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Search, UserCog, Activity, Truck, Radar } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FleetPartnersPanel } from "@/components/fleet/FleetPartnersPanel";
import { FleetDataIntakePanel } from "@/components/fleet/FleetDataIntakePanel";
import { ServiceFranchisesPanel } from "@/components/fleet/ServiceFranchisesPanel";
import { ServiceVendorsPanel } from "@/components/fleet/ServiceVendorsPanel";
import { FleetWorkOrdersPanel } from "@/components/fleet/FleetWorkOrdersPanel";
import { RevenueDistributionPanel } from "@/components/fleet/RevenueDistributionPanel";
import { VoiceFeatureManager } from "@/components/admin/VoiceFeatureManager";
import { OpportunityScannerAccessManager } from "@/components/admin/OpportunityScannerAccessManager";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  roles: { role: string }[];
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    checkAdminStatus();
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) throw error;

      if (!data) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      loadUsers();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/dashboard");
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const usersWithRoles = (profilesData || []).map((profile) => ({
        ...profile,
        roles: (rolesData || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => ({ role: r.role })),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const assignRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: role as any }]);

      if (error) throw error;

      toast.success(`Role ${role} assigned successfully`);
      loadUsers();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("User already has this role");
      } else {
        console.error("Error assigning role:", error);
        toast.error("Failed to assign role");
      }
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (error) throw error;

      toast.success(`Role ${role} removed successfully`);
      loadUsers();
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage users, roles, and Fleet Intelligence</p>
            </div>
          </div>
          <Button onClick={() => navigate("/admin/mcp")} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            MCP Admin
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Radar className="w-4 h-4" />
              Feature Access
            </TabsTrigger>
            <TabsTrigger value="fleet" className="gap-2">
              <Truck className="w-4 h-4" />
              Fleet Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Badge variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  {filteredUsers.length} Users
                </Badge>
              </div>
            </Card>

            {isLoading ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <p className="text-muted-foreground">Loading users...</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((userData) => (
                  <Card key={userData.id} className="p-6 shadow-elevated border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                          {userData.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{userData.full_name || "No name"}</h3>
                          <p className="text-sm text-muted-foreground">{userData.email}</p>
                          <div className="flex gap-2 mt-2">
                            {userData.roles.map((r) => (
                              <Badge
                                key={r.role}
                                variant={r.role === "admin" ? "default" : "secondary"}
                                className="cursor-pointer"
                                onClick={() => removeRole(userData.id, r.role)}
                              >
                                {r.role}
                              </Badge>
                            ))}
                            {userData.roles.length === 0 && (
                              <Badge variant="outline">No roles</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select onValueChange={(role) => assignRole(userData.id, role)}>
                          <SelectTrigger className="w-[180px]">
                            <UserCog className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <OpportunityScannerAccessManager />
            <VoiceFeatureManager />
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            <Tabs defaultValue="partners" className="space-y-4">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="partners">Data Partners</TabsTrigger>
                <TabsTrigger value="intake">Data Intake</TabsTrigger>
                <TabsTrigger value="franchises">Service Franchises</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="workorders">Work Orders</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>

              <TabsContent value="partners">
                <FleetPartnersPanel />
              </TabsContent>
              <TabsContent value="intake">
                <FleetDataIntakePanel />
              </TabsContent>
              <TabsContent value="franchises">
                <ServiceFranchisesPanel />
              </TabsContent>
              <TabsContent value="vendors">
                <ServiceVendorsPanel />
              </TabsContent>
              <TabsContent value="workorders">
                <FleetWorkOrdersPanel />
              </TabsContent>
              <TabsContent value="revenue">
                <RevenueDistributionPanel />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
