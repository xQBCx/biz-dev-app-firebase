import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Search, Settings, MoreHorizontal, Zap, UserCog, Lock, Eye, Users, Plus, Mail, UserPlus, ClipboardList, Volume2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import UserIdDisplay from "@/components/UserIdDisplay";
import { useUserRole } from "@/hooks/useUserRole";
import { PermissionManager } from "@/components/PermissionManager";
import { AccessRequestManager } from "@/components/AccessRequestManager";
import { InvitationsTab } from "@/components/user-management/InvitationsTab";
import { VoiceFeatureManager } from "@/components/admin/VoiceFeatureManager";
import { DeleteUserDialog } from "@/components/user-management/DeleteUserDialog";
import type { PlatformModule } from "@/hooks/usePermissions";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  created_at?: string;
  permission_count?: number;
}

const ROLE_COLORS = {
  admin: "destructive",
  team_member: "default",
  client_user: "secondary",
  partner: "outline",
  aggregator: "outline",
  auditor: "outline",
  dispatcher: "outline",
  planner: "outline",
  read_only: "outline",
  regulator: "outline",
  site_owner: "outline",
  utility_ops: "outline",
} as const;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  team_member: "Team Member",
  client_user: "Client User",
  partner: "Partner",
  aggregator: "Aggregator",
  auditor: "Auditor",
  dispatcher: "Dispatcher",
  planner: "Planner",
  read_only: "Read Only",
  regulator: "Regulator",
  site_owner: "Site Owner",
  utility_ops: "Utility Ops",
};

// Role presets for quick permission assignment
const ROLE_PRESETS: Record<string, { name: string; description: string; modules: PlatformModule[] }> = {
  basic: {
    name: "Basic User",
    description: "Dashboard, Tasks, Calendar only",
    modules: ['dashboard', 'tasks', 'calendar', 'messages'] as PlatformModule[],
  },
  sales: {
    name: "Sales User",
    description: "CRM, Clients, Tasks, Calendar, Activity",
    modules: ['dashboard', 'crm', 'clients', 'tasks', 'calendar', 'activity', 'messages'] as PlatformModule[],
  },
  business: {
    name: "Business User",
    description: "CRM, Portfolio, Clients, Business Cards, Tasks",
    modules: ['dashboard', 'crm', 'portfolio', 'clients', 'business_cards', 'tasks', 'calendar', 'messages', 'activity'] as PlatformModule[],
  },
  marketing: {
    name: "Marketing User",
    description: "Social, Website Builder, Content Tools",
    modules: ['dashboard', 'social', 'website_builder', 'tasks', 'calendar', 'messages', 'theme_harvester'] as PlatformModule[],
  },
  operations: {
    name: "Operations User",
    description: "ERP, Workflows, Tasks, Calendar",
    modules: ['dashboard', 'erp', 'workflows', 'tasks', 'calendar', 'activity', 'messages'] as PlatformModule[],
  },
  full: {
    name: "Full Access",
    description: "Access to all modules (except admin)",
    modules: [
      'dashboard', 'erp', 'workflows', 'directory', 'crm', 'portfolio', 'clients', 'client_portal',
      'business_cards', 'franchises', 'franchise_applications', 'team', 'tasks', 'calendar',
      'activity', 'tools', 'messages', 'ai_gift_cards', 'iplaunch', 'network', 'integrations',
      'funding', 'theme_harvester', 'launchpad', 'app_store', 'my_apps', 'white_label_portal',
      'earnings', 'true_odds', 'true_odds_explore', 'true_odds_picks', 'true_odds_signals',
      'social', 'website_builder', 'marketplace', 'ecosystem'
    ] as PlatformModule[],
  },
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRoles | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const { hasRole } = useUserRole();

  useEffect(() => {
    loadUsers();
    loadPendingRequestsCount();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get permission counts per user
      const { data: permissionCounts, error: permError } = await supabase
        .from('user_permissions')
        .select('user_id, can_view')
        .eq('can_view', true);

      const permCountMap: Record<string, number> = {};
      permissionCounts?.forEach(p => {
        permCountMap[p.user_id] = (permCountMap[p.user_id] || 0) + 1;
      });

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles
          ?.filter(ur => ur.user_id === profile.id)
          .map(ur => ur.role) || [],
        permission_count: permCountMap[profile.id] || 0,
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingRequestsCount = async () => {
    const { count } = await supabase
      .from('access_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    setPendingRequestsCount(count || 0);
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
        .insert([{
          user_id: userId,
          role: newRole as any
        }]);

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

  const applyPreset = async (userId: string, presetKey: string) => {
    const preset = ROLE_PRESETS[presetKey];
    if (!preset) return;

    try {
      // First clear all existing permissions for this user
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      // Then insert the preset permissions
      const permissions = preset.modules.map(module => ({
        user_id: userId,
        module,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: presetKey === 'full', // Only full access gets delete permission
      }));

      const { error } = await supabase
        .from('user_permissions')
        .insert(permissions as any);

      if (error) throw error;

      toast.success(`Applied "${preset.name}" preset`);
      loadUsers();
    } catch (error: any) {
      toast.error("Failed to apply preset");
      console.error(error);
    }
  };

  const openDeleteDialog = (user: UserWithRoles) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const openPermissions = (user: UserWithRoles) => {
    setSelectedUser(user);
    setPermissionDialogOpen(true);
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.roles.includes('admin')).length,
    withPermissions: users.filter(u => (u.permission_count || 0) > 0).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-10 h-10" />
          <div>
            <h1 className="text-4xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users, roles, permissions, invitations, and access requests</p>
          </div>
        </div>

        {!hasRole('admin') && (
          <div className="mb-6">
            <UserIdDisplay />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invitations
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2 relative">
              <ClipboardList className="w-4 h-4" />
              Requests
              {pendingRequestsCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingRequestsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Voice
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Admins</p>
                      <p className="text-3xl font-bold">{stats.admins}</p>
                    </div>
                    <Shield className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">With Custom Permissions</p>
                      <p className="text-3xl font-bold">{stats.withPermissions}</p>
                    </div>
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Permission Presets
                </CardTitle>
                <CardDescription>
                  Select a user from the table below, then use these presets to quickly assign common permission bundles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">{preset.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Click on a user row to manage their module permissions</CardDescription>
                  </div>
                  <div className="relative w-64">
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Modules</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveRole(user.id, role);
                                    }}
                                    title="Click to remove"
                                  >
                                    {ROLE_LABELS[role] || role} ×
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {user.roles.includes('admin') ? 'All (Admin)' : `${user.permission_count || 0} modules`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openPermissions(user)}>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Manage Permissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Add Role</DropdownMenuLabel>
                                {Object.entries(ROLE_LABELS).slice(0, 4).map(([key, label]) => (
                                  <DropdownMenuItem
                                    key={key}
                                    onClick={() => handleRoleChange(user.id, key)}
                                    disabled={user.roles.includes(key)}
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    {label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Apply Preset</DropdownMenuLabel>
                                {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                                  <DropdownMenuItem key={key} onClick={() => applyPreset(user.id, key)}>
                                    <Zap className="w-4 h-4 mr-2" />
                                    {preset.name}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(user)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            <InvitationsTab />
          </TabsContent>

          {/* Access Requests Tab */}
          <TabsContent value="requests">
            <AccessRequestManager />
          </TabsContent>

          {/* Voice Permissions Tab */}
          <TabsContent value="voice">
            <VoiceFeatureManager />
          </TabsContent>
        </Tabs>

        {/* Permission Management Dialog */}
        <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                Manage Permissions: {selectedUser?.full_name || selectedUser?.email}
              </DialogTitle>
              <DialogDescription>
                Configure which modules this user can access and what actions they can perform
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
