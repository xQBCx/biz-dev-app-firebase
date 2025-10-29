import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, CheckSquare } from "lucide-react";
import { format } from "date-fns";

export default function ClientPortal() {
  const { user } = useAuth();
  const [clientAccess, setClientAccess] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [user]);

  const loadClientData = async () => {
    if (!user) return;

    // Get client access
    const { data: accessData } = await supabase
      .from('client_users')
      .select('*, clients(*)')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (accessData) {
      setClientAccess(accessData);

      // Load activities for all accessible clients
      const clientIds = accessData
        .filter(access => access.can_view_activities)
        .map(access => access.client_id);

      if (clientIds.length > 0) {
        const { data: activityData } = await supabase
          .from('activity_logs')
          .select('*, clients(name)')
          .in('client_id', clientIds)
          .order('started_at', { ascending: false })
          .limit(50);

        if (activityData) setActivities(activityData);
      }
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="p-8">Loading your client portal...</div>;
  }

  if (clientAccess.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>No Client Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have access to any client accounts yet. Contact your account manager to request access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Portal</h1>
        <p className="text-muted-foreground">View your accessible client data and activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessible Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientAccess.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientAccess.filter(a => a.can_add_tasks || a.can_add_contacts).length}
            </div>
            <p className="text-xs text-muted-foreground">Clients with write access</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="clients">My Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No activities to display</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">
                          {activity.clients?.name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(activity.started_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{activity.title}</TableCell>
                        <TableCell className="capitalize">{activity.activity_type}</TableCell>
                        <TableCell>
                          {activity.duration_minutes ? `${activity.duration_minutes} min` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Client Access</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientAccess.map((access) => (
                    <TableRow key={access.id}>
                      <TableCell className="font-medium">{access.clients?.name}</TableCell>
                      <TableCell className="capitalize">{access.access_level}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {access.can_view_activities && <Badge variant="secondary">View</Badge>}
                          {access.can_add_tasks && <Badge variant="secondary">Tasks</Badge>}
                          {access.can_add_contacts && <Badge variant="secondary">Contacts</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={access.status === 'active' ? 'default' : 'secondary'}>
                          {access.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
