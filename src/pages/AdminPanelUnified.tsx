import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Search, MoreHorizontal, Users, Bot, Truck, Settings, Key } from "lucide-react";
import { ViewAsUserButton } from "@/components/impersonation/ViewAsUserButton";
import { toast } from "sonner";
import { PermissionManager } from "@/components/PermissionManager";
import { OpportunityScannerAccessManager } from "@/components/admin/OpportunityScannerAccessManager";
import { VoiceFeatureManager } from "@/components/admin/VoiceFeatureManager";
import { PartnerIntegrationsPanel } from "@/components/admin/PartnerIntegrationsPanel";
import { DeleteUserDialog } from "@/components/user-management/DeleteUserDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
}

const ROLE_COLORS = {
  admin: "destructive",
  team_member: "default",
  client_user: "secondary",
  partner: "outline",
} as const;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  team_member: "Team Member",
  client_user: "Client User",
  partner: "Partner",
};

export default function AdminPanelUnified() {
  // Note: Auth gating is now handled by RequireRole wrapper in App.tsx
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRoles | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles
          ?.filter(ur => ur.user_id === profile.id)
          .map(ur => ur.role) || [],
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const existingRoles = users.find(u => u.id === userId)?.roles || [];
      
      if (existingRoles.includes(newRole)) {
        toast.error("User already has this role");
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as any }]);

      if (error) throw error;

      toast.success("Role added successfully");
      loadUsers();
    } catch (error: any) {
      toast.error("Failed to add role");
      console.error(error);
    }
  };

  const handleRemoveRole = async (userId: string, roleToRemove: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', roleToRemove as any);

      if (error) throw error;

      toast.success("Role removed successfully");
      loadUsers();
    } catch (error: any) {
      toast.error("Failed to remove role");
      console.error(error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Note: Loading/auth state is now handled by RequireRole wrapper

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Admin Panel</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Platform administration and feature management
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile: Dropdown, Desktop: Tabs */}
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="users">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Users & Roles
                </span>
              </SelectItem>
              <SelectItem value="features">
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Feature Toggles
                </span>
              </SelectItem>
              <SelectItem value="partners">
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4" /> Partner API
                </span>
              </SelectItem>
              <SelectItem value="agents">
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4" /> MCP & Agents
                </span>
              </SelectItem>
              <SelectItem value="fleet">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Fleet Intelligence
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsList className="hidden sm:grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Partner API
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            MCP & Agents
          </TabsTrigger>
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Fleet Intel
          </TabsTrigger>
        </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader size="md" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.full_name || "—"}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roles.length === 0 ? (
                                  <span className="text-muted-foreground text-sm">No roles</span>
                                ) : (
                                  user.roles.map((role) => (
                                    <Badge
                                      key={role}
                                      variant={ROLE_COLORS[role as keyof typeof ROLE_COLORS] || "outline"}
                                      className="cursor-pointer text-xs"
                                      onClick={() => handleRemoveRole(user.id, role)}
                                      title="Click to remove"
                                    >
                                      {ROLE_LABELS[role] || role} ×
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                    Add Admin Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'team_member')}>
                                    Add Team Member Role
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUser(user);
                                    setPermissionDialogOpen(true);
                                  }}>
                                    Manage Permissions
                                  </DropdownMenuItem>
                                  <ViewAsUserButton userId={user.id} />
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Toggles Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6">
              <OpportunityScannerAccessManager />
              <VoiceFeatureManager />
            </div>
          </TabsContent>

          {/* Partner API Tab */}
          <TabsContent value="partners" className="space-y-6">
            <PartnerIntegrationsPanel />
          </TabsContent>

          {/* MCP & Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  MCP & Agent Management
                </CardTitle>
                <CardDescription>
                  Configure Model Context Protocol servers and manage AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/admin/mcp')} variant="outline">
                  Open MCP Admin →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fleet Intelligence Tab */}
          <TabsContent value="fleet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Fleet Intelligence
                </CardTitle>
                <CardDescription>
                  Manage fleet data, partners, vendors, and work orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/fleet')} variant="outline">
                  Open Fleet Intelligence →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Permission Dialog */}
        <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Permissions</DialogTitle>
              <DialogDescription>
                Configure module access for {selectedUser?.full_name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <PermissionManager 
                userId={selectedUser.id} 
                userEmail={selectedUser.email}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={userToDelete}
          onDeleted={loadUsers}
        />
      </div>
    </div>
  );
}
