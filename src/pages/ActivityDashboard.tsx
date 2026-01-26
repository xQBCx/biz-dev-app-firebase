import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { LoaderFullScreen } from "@/components/ui/loader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ActivityLogger } from "@/components/ActivityLogger";
import { Loader2, Sparkles, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ActivityDashboard() {
  const { user } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();
  const [activities, setActivities] = useState<any[]>([]);
  const [sops, setSops] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!effectiveUserId) return;

    try {
      const [activitiesRes, sopsRes] = await Promise.all([
        supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', effectiveUserId)
          .order('started_at', { ascending: false })
          .limit(50),
        supabase
          .from('sops')
          .select('*')
          .eq('user_id', effectiveUserId)
          .order('created_at', { ascending: false }),
      ]);

      if (activitiesRes.error) throw activitiesRes.error;
      if (sopsRes.error) throw sopsRes.error;

      setActivities(activitiesRes.data || []);
      setSops(sopsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [effectiveUserId]);

  const analyzeActivities = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-activities');

      if (error) throw error;

      toast.success(`Generated ${data.generated} new SOPs!`);
      fetchData();
    } catch (error) {
      console.error('Error analyzing activities:', error);
      toast.error("Failed to analyze activities");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approveSOP = async (sopId: string) => {
    try {
      const { error } = await supabase
        .from('sops')
        .update({ is_approved: true })
        .eq('id', sopId);

      if (error) throw error;

      toast.success("SOP approved!");
      fetchData();
    } catch (error) {
      console.error('Error approving SOP:', error);
      toast.error("Failed to approve SOP");
    }
  };

  const deleteSOP = async (sopId: string) => {
    try {
      const { error } = await supabase.from('sops').delete().eq('id', sopId);

      if (error) throw error;

      toast.success("SOP deleted");
      fetchData();
    } catch (error) {
      console.error('Error deleting SOP:', error);
      toast.error("Failed to delete SOP");
    }
  };

  if (isLoading) {
    return <LoaderFullScreen />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Dashboard</h1>
          <p className="text-muted-foreground">
            Track your work and let AI generate SOPs automatically
          </p>
        </div>
        <Button onClick={analyzeActivities} disabled={isAnalyzing || activities.length < 3} className="gap-2">
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate SOPs
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated SOPs</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sops.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved SOPs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sops.filter((s) => s.is_approved).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList>
          <TabsTrigger value="log">Log Activity</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
          <TabsTrigger value="sops">SOPs ({sops.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <ActivityLogger onActivityLogged={fetchData} />
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No activities logged yet. Start tracking your work!
              </CardContent>
            </Card>
          ) : (
            activities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <CardDescription>
                        {activity.description || 'No description'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{activity.activity_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(activity.started_at), { addSuffix: true })}
                    </div>
                    {activity.duration_minutes && (
                      <div>Duration: {activity.duration_minutes} min</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sops" className="space-y-4">
          {sops.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No SOPs generated yet. Log at least 3 activities and click "Generate SOPs"
              </CardContent>
            </Card>
          ) : (
            sops.map((sop) => (
              <Card key={sop.id} className={sop.is_approved ? "border-green-500/50" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{sop.title}</CardTitle>
                        {sop.is_approved && (
                          <Badge variant="default" className="bg-green-500">
                            Approved
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{sop.description}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {sop.category && <Badge variant="outline">{sop.category}</Badge>}
                      <Badge variant="secondary">
                        {Math.round(sop.confidence_score)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {sop.steps.map((step: string, idx: number) => (
                        <li key={idx} className="text-sm">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex gap-2">
                    {!sop.is_approved && (
                      <Button
                        size="sm"
                        onClick={() => approveSOP(sop.id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSOP(sop.id)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on {sop.frequency} • Created{' '}
                    {formatDistanceToNow(new Date(sop.created_at), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}