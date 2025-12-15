import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Apple, Play, Upload, AlertCircle, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Database } from "@/integrations/supabase/types";

type ChecklistRow = Database['public']['Tables']['store_launch_listing_checklist']['Row'];

export default function StoreLaunchChecklist() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [iosChecklist, setIosChecklist] = useState<ChecklistRow | null>(null);
  const [androidChecklist, setAndroidChecklist] = useState<ChecklistRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChecklists();
  }, [projectId]);

  const loadChecklists = async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('store_launch_listing_checklist')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      const ios = data?.find(c => c.platform === 'ios') || null;
      const android = data?.find(c => c.platform === 'android') || null;
      
      setIosChecklist(ios);
      setAndroidChecklist(android);
    } catch (error: any) {
      toast.error("Failed to load checklist");
    } finally {
      setLoading(false);
    }
  };

  const createChecklist = async (platform: 'ios' | 'android') => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('store_launch_listing_checklist')
        .insert({ project_id: projectId, platform })
        .select()
        .single();

      if (error) throw error;
      
      if (platform === 'ios') {
        setIosChecklist(data);
      } else {
        setAndroidChecklist(data);
      }
      toast.success(`${platform.toUpperCase()} checklist created`);
    } catch (error: any) {
      toast.error("Failed to create checklist");
    }
  };

  const updateChecklist = async (id: string, updates: Partial<ChecklistRow>, platform: 'ios' | 'android') => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('store_launch_listing_checklist')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      if (platform === 'ios' && iosChecklist) {
        setIosChecklist({ ...iosChecklist, ...updates });
      } else if (androidChecklist) {
        setAndroidChecklist({ ...androidChecklist, ...updates });
      }
    } catch (error: any) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = (checklist: ChecklistRow | null) => {
    if (!checklist) return 0;
    
    const items = [
      !!checklist.privacy_policy_url,
      checklist.description_completed,
      checklist.age_rating_completed,
      checklist.screenshots_uploaded,
      checklist.data_disclosures_completed,
    ];
    
    return Math.round((items.filter(Boolean).length / items.length) * 100);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const renderPlatformChecklist = (checklist: ChecklistRow | null, platform: 'ios' | 'android') => {
    const Icon = platform === 'ios' ? Apple : Play;
    const progress = calculateProgress(checklist);

    if (!checklist) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <Icon className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No {platform.toUpperCase()} checklist yet</p>
            <Button onClick={() => createChecklist(platform)}>
              Create {platform.toUpperCase()} Checklist
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <CardTitle className="text-base">{platform.toUpperCase()} Store Checklist</CardTitle>
              </div>
              <Badge variant={progress === 100 ? "default" : "secondary"}>
                {progress}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Required Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Privacy Policy URL *</Label>
              <Input
                placeholder="https://example.com/privacy"
                value={checklist.privacy_policy_url || ''}
                onChange={(e) => updateChecklist(checklist.id, { privacy_policy_url: e.target.value }, platform)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${platform}-desc`}
                  checked={checklist.description_completed}
                  onCheckedChange={(checked) => updateChecklist(checklist.id, { description_completed: !!checked }, platform)}
                />
                <label htmlFor={`${platform}-desc`} className="text-sm">App description completed</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${platform}-age`}
                  checked={checklist.age_rating_completed}
                  onCheckedChange={(checked) => updateChecklist(checklist.id, { age_rating_completed: !!checked }, platform)}
                />
                <label htmlFor={`${platform}-age`} className="text-sm">Age rating questionnaire completed</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${platform}-screenshots`}
                  checked={checklist.screenshots_uploaded}
                  onCheckedChange={(checked) => updateChecklist(checklist.id, { screenshots_uploaded: !!checked }, platform)}
                />
                <label htmlFor={`${platform}-screenshots`} className="text-sm">Screenshots uploaded</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${platform}-data`}
                  checked={checklist.data_disclosures_completed}
                  onCheckedChange={(checked) => updateChecklist(checklist.id, { data_disclosures_completed: !!checked }, platform)}
                />
                <label htmlFor={`${platform}-data`} className="text-sm">Data collection disclosures completed</label>
              </div>

              {platform === 'ios' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="testflight"
                    checked={checklist.testflight_group_created || false}
                    onCheckedChange={(checked) => updateChecklist(checklist.id, { testflight_group_created: !!checked }, platform)}
                  />
                  <label htmlFor="testflight" className="text-sm">TestFlight internal testing group created</label>
                </div>
              )}

              {platform === 'android' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internal-track"
                    checked={checklist.internal_testing_track_created || false}
                    onCheckedChange={(checked) => updateChecklist(checklist.id, { internal_testing_track_created: !!checked }, platform)}
                  />
                  <label htmlFor="internal-track" className="text-sm">Internal testing track created</label>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Review Notes (for app review team)</Label>
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-md bg-background text-sm"
                placeholder="Notes for reviewers (demo account credentials, special instructions...)"
                value={checklist.review_notes || ''}
                onChange={(e) => updateChecklist(checklist.id, { review_notes: e.target.value }, platform)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/store-launch/project/${projectId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
            </div>

            <div>
              <h1 className="text-2xl font-bold">Store Listing Checklist</h1>
              <p className="text-muted-foreground">Complete all requirements before submitting to app stores</p>
            </div>

            <Tabs defaultValue="ios" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ios" className="flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  App Store
                </TabsTrigger>
                <TabsTrigger value="android" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Google Play
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ios">
                {renderPlatformChecklist(iosChecklist, 'ios')}
              </TabsContent>

              <TabsContent value="android">
                {renderPlatformChecklist(androidChecklist, 'android')}
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Common Rejection Reasons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Missing or broken privacy policy link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>App crashes or has major bugs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Incomplete or placeholder content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>In-app purchases not using native billing APIs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Login required but no demo account provided</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {saving && (
              <p className="text-sm text-muted-foreground text-center">Saving...</p>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
