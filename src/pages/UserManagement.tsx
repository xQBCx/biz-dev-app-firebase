import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, UserPlus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

type UserRole = 'admin' | 'team_member' | 'client_user' | 'partner';

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  team_member: 'Team Member',
  client_user: 'Client User',
  partner: 'Partner',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'destructive',
  team_member: 'default',
  client_user: 'secondary',
  partner: 'outline',
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/dashboard");
    }
  }, [roleLoading, isAdmin, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = (profilesData || []).map(profile => ({
        ...profile,
        roles: (rolesData || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as UserRole),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const addRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role, created_by: user?.id });

      if (error) throw error;

      toast.success(`Role ${ROLE_LABELS[role]} added successfully`);
      loadUsers();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('User already has this role');
      } else {
        console.error('Error adding role:', error);
        toast.error('Failed to add role');
      }
    }
  };

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast.success(`Role ${ROLE_LABELS[role]} removed successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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

        <Card className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Roles</TableHead>
                <TableHead>Add Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{userData.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {userData.roles.length === 0 ? (
                        <Badge variant="outline">No roles</Badge>
                      ) : (
                        userData.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={ROLE_COLORS[role] as any}
                            className="flex items-center gap-2"
                          >
                            {ROLE_LABELS[role]}
                            <button
                              onClick={() => removeRole(userData.id, role)}
                              className="ml-1 hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select onValueChange={(role) => addRole(userData.id, role as UserRole)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Add role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <SelectItem
                            key={value}
                            value={value}
                            disabled={userData.roles.includes(value as UserRole)}
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No users found matching your search.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
