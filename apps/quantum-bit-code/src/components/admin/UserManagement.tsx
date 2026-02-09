import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "packages/supabase-client/src";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, ShieldOff, UserCheck, UserX, Search, Users } from "lucide-react";
import { format } from "date-fns";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  full_name: string;
  is_admin: boolean;
  is_approved: boolean;
  approved_at: string | null;
}

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_users_for_admin");
      if (error) throw error;
      return data as UserData[];
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: (_, { makeAdmin }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(makeAdmin ? "Admin privileges granted" : "Admin privileges revoked");
    },
    onError: (error) => {
      toast.error("Failed to update admin status: " + error.message);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: approve,
          approved_at: approve ? new Date().toISOString() : null,
          approved_by: approve ? session?.session?.user?.id : null,
        })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(approve ? "User approved" : "User approval revoked");
    },
    onError: (error) => {
      toast.error("Failed to update approval status: " + error.message);
    },
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = users?.filter((u) => !u.is_approved).length || 0;
  const adminCount = users?.filter((u) => u.is_admin).length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{adminCount}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>User Management</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {user.is_approved ? (
                        <Badge variant="default" className="bg-green-600">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-500">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge variant="default" className="bg-accent">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Approval Toggle */}
                        <Button
                          variant={user.is_approved ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            approveMutation.mutate({
                              userId: user.id,
                              approve: !user.is_approved,
                            })
                          }
                          disabled={approveMutation.isPending}
                        >
                          {user.is_approved ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Revoke
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>

                        {/* Admin Toggle */}
                        <Button
                          variant={user.is_admin ? "destructive" : "outline"}
                          size="sm"
                          onClick={() =>
                            toggleAdminMutation.mutate({
                              userId: user.id,
                              makeAdmin: !user.is_admin,
                            })
                          }
                          disabled={toggleAdminMutation.isPending}
                        >
                          {user.is_admin ? (
                            <>
                              <ShieldOff className="h-4 w-4 mr-1" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-1" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
