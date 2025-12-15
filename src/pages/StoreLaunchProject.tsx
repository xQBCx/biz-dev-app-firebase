import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Settings, Rocket, Apple, Smartphone, CheckCircle, Clock, AlertCircle, FileText, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StoreLaunchProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: project, isLoading } = useQuery({
    queryKey: ["store-launch-project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_projects")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: builds } = useQuery({
    queryKey: ["store-launch-builds", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_builds")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: features } = useQuery({
    queryKey: ["store-launch-features", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_native_features")
        .select("*")
        .eq("project_id", id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const startBuild = useMutation({
    mutationFn: async (buildType: string) => {
      const { data, error } = await supabase
        .from("store_launch_builds")
        .insert({
          project_id: id,
          platform: "ios",
          build_type: buildType,
          status: "queued",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-launch-builds", id] });
      toast({ title: "Build started", description: "Your build has been queued." });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "building":
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Loading...</div>;
  }

  if (!project) {
    return <div className="container mx-auto p-6 text-center">Project not found</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/store-launch")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Store Launch
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-muted rounded-xl flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{project.connected_source_type}</span>
              {project.source_url && (
                <>
                  <span>•</span>
                  <a href={project.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                    {project.source_url} <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/store-launch/project/${id}/features`)}>
            <Settings className="h-4 w-4 mr-2" />
            Features
          </Button>
          <Button onClick={() => startBuild.mutate("dev")} disabled={startBuild.isPending}>
            <Play className="h-4 w-4 mr-2" />
            Build Dev
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="builds">Builds</TabsTrigger>
          <TabsTrigger value="ios">iOS Publishing</TabsTrigger>
          <TabsTrigger value="android">Android Publishing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="capitalize">{project.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platforms</span>
                  <div className="flex gap-2">
                    {project.platforms?.includes("ios") && <Apple className="h-5 w-5" />}
                    {project.platforms?.includes("android") && <Smartphone className="h-5 w-5" />}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Native Features</span>
                  <span>{features?.filter((f) => f.is_enabled).length || 0} enabled</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Latest Build</CardTitle>
              </CardHeader>
              <CardContent>
                {builds?.[0] ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(builds[0].status)}
                        <span className="capitalize">{builds[0].status}</span>
                      </div>
                      <Badge variant="outline">{builds[0].build_type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Version {builds[0].version_name} ({builds[0].version_code})
                    </div>
                    {builds[0].artifact_url && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Artifact
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No builds yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Build Actions</CardTitle>
              <CardDescription>Create different build types for your app</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => startBuild.mutate("dev")} disabled={startBuild.isPending}>
                  <Play className="h-4 w-4 mr-2" />
                  Build Dev Version
                </Button>
                <Button variant="outline" onClick={() => startBuild.mutate("release")} disabled={startBuild.isPending}>
                  <FileText className="h-4 w-4 mr-2" />
                  Build Release Candidate
                </Button>
                <Button variant="outline" onClick={() => navigate(`/store-launch/project/${id}/testing`)}>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Deploy to Internal Testing
                </Button>
                <Button onClick={() => navigate(`/store-launch/project/${id}/publish`)}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy Draft to Stores
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builds" className="space-y-6 mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Build History</CardTitle>
              <CardDescription>All builds for this project</CardDescription>
            </CardHeader>
            <CardContent>
              {!builds?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No builds yet. Start your first build above.
                </div>
              ) : (
                <div className="space-y-4">
                  {builds.map((build) => (
                    <div key={build.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(build.status)}
                        <div>
                          <div className="font-medium">
                            {build.platform.toUpperCase()} - {build.build_type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            v{build.version_name} ({build.version_code}) • {new Date(build.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="capitalize">{build.status}</Badge>
                        {build.artifact_url && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ios" className="space-y-6 mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                iOS Publishing Workflow
              </CardTitle>
              <CardDescription>Guide to publishing your app on the App Store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">1</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Connect Apple Developer Account</h4>
                    <p className="text-sm text-muted-foreground">Link your Apple Developer account ($99/year required)</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/store-launch/accounts")}>
                      Connect Account
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">2</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Configure Bundle ID & Capabilities</h4>
                    <p className="text-sm text-muted-foreground">Set up your app's unique identifier and required capabilities</p>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Bundle ID: </span>
                      <code className="bg-muted px-2 py-1 rounded">{project.bundle_id_ios || "Not set"}</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">3</div>
                  <div className="flex-1">
                    <h4 className="font-medium">TestFlight Internal Testing</h4>
                    <p className="text-sm text-muted-foreground">Create an internal testing group and distribute your first build</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Set Up TestFlight
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">4</div>
                  <div className="flex-1">
                    <h4 className="font-medium">App Store Connect Listing</h4>
                    <p className="text-sm text-muted-foreground">Complete screenshots, privacy policy, data disclosures, and age rating</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/store-launch/project/${id}/checklist/ios`)}>
                      Complete Checklist
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">5</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Submit for Review</h4>
                    <p className="text-sm text-muted-foreground">Submit your app to Apple for review (typically 24-48 hours)</p>
                    <Button size="sm" className="mt-2" disabled>
                      Submit to App Store
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="android" className="space-y-6 mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Android Publishing Workflow
              </CardTitle>
              <CardDescription>Guide to publishing your app on Google Play</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">1</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Connect Google Play Console</h4>
                    <p className="text-sm text-muted-foreground">Upload service account JSON and enable Play Developer API</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/store-launch/accounts")}>
                      Connect Account
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">2</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Configure Package Name & Keystore</h4>
                    <p className="text-sm text-muted-foreground">Set up your app's package name and signing keystore</p>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Package: </span>
                      <code className="bg-muted px-2 py-1 rounded">{project.package_name_android || "Not set"}</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">3</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Internal Testing Track</h4>
                    <p className="text-sm text-muted-foreground">Set up internal testing and distribute your first build</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Set Up Internal Testing
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">4</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Google Play Console Listing</h4>
                    <p className="text-sm text-muted-foreground">Complete store listing, content rating, and data safety</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/store-launch/project/${id}/checklist/android`)}>
                      Complete Checklist
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">5</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Create Draft Release</h4>
                    <p className="text-sm text-muted-foreground">Auto-create draft releases on rebuilds (manual approval still required)</p>
                    <Button size="sm" className="mt-2" disabled>
                      Deploy to Google Play
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreLaunchProject;
