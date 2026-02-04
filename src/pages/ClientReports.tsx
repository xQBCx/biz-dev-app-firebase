import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ClientReports() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();
  const [client, setClient] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [clientId, effectiveUserId]);

  const loadData = async () => {
    if (!effectiveUserId || !clientId) return;

    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', effectiveUserId)
      .single();

    if (clientData) {
      setClient(clientData);
      loadActivities();
    }
    setIsLoading(false);
  };

  const loadActivities = async () => {
    if (!clientId) return;

    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('client_id', clientId)
      .gte('started_at', new Date(startDate).toISOString())
      .lte('started_at', new Date(endDate + 'T23:59:59').toISOString())
      .order('started_at', { ascending: false });

    if (data) setActivities(data);
  };

  const generateReport = async () => {
    if (!client || activities.length === 0) {
      toast.error("No activities to report");
      return;
    }

    const totalHours = activities.reduce((sum, act) => sum + (act.duration_minutes || 0) / 60, 0);
    
    const reportText = `
Activity Report for ${client.name}
Period: ${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}
Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}

Total Activities: ${activities.length}
Total Hours: ${totalHours.toFixed(2)}

Activities:
${activities.map((act, i) => `
${i + 1}. ${act.title}
   Type: ${act.activity_type}
   Date: ${format(new Date(act.started_at), "MMM dd, yyyy HH:mm")}
   Duration: ${act.duration_minutes ? `${act.duration_minutes} minutes` : 'Not tracked'}
   ${act.description ? `Description: ${act.description}` : ''}
`).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.name.replace(/\s+/g, '_')}_Report_${format(new Date(), "yyyyMMdd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Report downloaded");
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!client) return <div className="p-8">Client not found</div>;

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.name} - Activity Report</h1>
            <p className="text-muted-foreground">Review and export client activity</p>
          </div>
        </div>
        <Button onClick={generateReport} disabled={activities.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Start Date</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">End Date</label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={loadActivities}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities ({activities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activities logged for this period</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(activity.started_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{activity.title}</TableCell>
                    <TableCell className="capitalize">{activity.activity_type}</TableCell>
                    <TableCell>
                      {activity.duration_minutes ? `${activity.duration_minutes} min` : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{activity.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
