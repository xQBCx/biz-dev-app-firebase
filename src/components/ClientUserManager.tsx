import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ClientUserManagerProps {
  clientId: string;
}

export const ClientUserManager = ({ clientId }: ClientUserManagerProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [canViewActivities, setCanViewActivities] = useState(true);
  const [canAddTasks, setCanAddTasks] = useState(false);
  const [canAddContacts, setCanAddContacts] = useState(false);
  const [canViewReports, setCanViewReports] = useState(true);
  const [clientUsers, setClientUsers] = useState<any[]>([]);

  useEffect(() => {
    loadClientUsers();
  }, [clientId]);

  const loadClientUsers = async () => {
    const { data } = await supabase
      .from('client_users')
      .select('*')
      .eq('client_id', clientId);

    if (data) setClientUsers(data);
  };

  const inviteUser = async () => {
    if (!email || !user) return;

    // Check if user exists
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!profiles) {
      toast.error("User not found. They need to create an account first.");
      return;
    }

    const { error } = await supabase.from('client_users').insert({
      client_id: clientId,
      user_id: profiles.id,
      invited_by: user.id,
      can_view_activities: canViewActivities,
      can_add_tasks: canAddTasks,
      can_add_contacts: canAddContacts,
      can_view_reports: canViewReports,
      status: 'active'
    });

    if (error) {
      toast.error("Failed to invite user");
      return;
    }

    toast.success("User invited successfully");
    setEmail("");
    setIsOpen(false);
    loadClientUsers();
  };

  const removeUser = async (userId: string) => {
    const { error } = await supabase
      .from('client_users')
      .delete()
      .eq('client_id', clientId)
      .eq('user_id', userId);

    if (error) {
      toast.error("Failed to remove user");
      return;
    }

    toast.success("User removed");
    loadClientUsers();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Users</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Client User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              
              <div className="space-y-3">
                <Label>Permissions</Label>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="view-activities" className="font-normal">
                    View Activities
                  </Label>
                  <Switch
                    id="view-activities"
                    checked={canViewActivities}
                    onCheckedChange={setCanViewActivities}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="add-tasks" className="font-normal">
                    Add Tasks
                  </Label>
                  <Switch
                    id="add-tasks"
                    checked={canAddTasks}
                    onCheckedChange={setCanAddTasks}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="add-contacts" className="font-normal">
                    Add Contacts
                  </Label>
                  <Switch
                    id="add-contacts"
                    checked={canAddContacts}
                    onCheckedChange={setCanAddContacts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="view-reports" className="font-normal">
                    View Reports
                  </Label>
                  <Switch
                    id="view-reports"
                    checked={canViewReports}
                    onCheckedChange={setCanViewReports}
                  />
                </div>
              </div>

              <Button onClick={inviteUser} className="w-full">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {clientUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No users invited yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientUsers.map((clientUser) => (
                <TableRow key={clientUser.id}>
                  <TableCell className="font-mono text-sm">
                    {clientUser.user_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {clientUser.can_view_activities && <Badge variant="secondary">View</Badge>}
                      {clientUser.can_add_tasks && <Badge variant="secondary">Tasks</Badge>}
                      {clientUser.can_add_contacts && <Badge variant="secondary">Contacts</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={clientUser.status === 'active' ? 'default' : 'secondary'}>
                      {clientUser.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUser(clientUser.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
