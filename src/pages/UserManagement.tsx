import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Shield, Search } from "lucide-react";
import { toast } from "sonner";
import UserIdDisplay from "@/components/UserIdDisplay";
import { useUserRole } from "@/hooks/useUserRole";

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

const ROLE_LABELS = {
  admin: "Admin",
  team_member: "Team Member",
  client_user: "Client User",
  partner: "Partner",
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { hasRole } = useUserRole();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles
          ?.filter(ur => ur.user_id === profile.id)
          .map(ur => ur.role) || []
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

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
        </div>

        {!hasRole('admin') && (
          <div className="mb-6">
            <UserIdDisplay />
          </div>
        )}

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="md" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Roles</TableHead>
                  <TableHead>Add Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {user.roles.length === 0 ? (
                          <span className="text-muted-foreground text-sm">No roles</span>
                        ) : (
                          user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant={ROLE_COLORS[role as keyof typeof ROLE_COLORS]}
                              className="cursor-pointer"
                              onClick={() => handleRemoveRole(user.id, role)}
                            >
                              {ROLE_LABELS[role as keyof typeof ROLE_LABELS]} ×
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => handleRoleChange(user.id, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Add role..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="team_member">Team Member</SelectItem>
                          <SelectItem value="client_user">Client User</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
