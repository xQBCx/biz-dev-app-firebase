import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Smartphone, Apple, PlayCircle, Rocket, Settings, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const StoreLaunch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["store-launch-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: developerAccounts } = useQuery({
    queryKey: ["store-launch-developer-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_developer_accounts")
        .select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      configuring: "bg-yellow-500/20 text-yellow-600",
      building: "bg-blue-500/20 text-blue-600",
      testing: "bg-purple-500/20 text-purple-600",
      published: "bg-green-500/20 text-green-600",
    };
    return <Badge className={styles[status] || styles.draft}>{status}</Badge>;
  };

  const appleAccount = developerAccounts?.find((a) => a.platform === "apple");
  const googleAccount = developerAccounts?.find((a) => a.platform === "google");

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Store Launch</h1>
          <p className="text-muted-foreground">
            Convert your web app into native iOS & Android apps
          </p>
        </div>
        <Button onClick={() => navigate("/store-launch/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New App Project
        </Button>
      </div>

      {/* Developer Accounts Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Apple Developer Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appleAccount?.is_connected ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{appleAccount.account_email}</span>
                <Badge className="bg-green-500/20 text-green-600">Connected</Badge>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/store-launch/accounts")}>
                Connect Account
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Google Play Console
            </CardTitle>
          </CardHeader>
          <CardContent>
            {googleAccount?.is_connected ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{googleAccount.account_email}</span>
                <Badge className="bg-green-500/20 text-green-600">Connected</Badge>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/store-launch/accounts")}>
                Connect Account
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-border cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/store-launch/new")}>
          <CardContent className="pt-6 text-center">
            <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">Connect Web App</p>
            <p className="text-xs text-muted-foreground">Start a new project</p>
          </CardContent>
        </Card>
        <Card className="border-border cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/store-launch/features")}>
          <CardContent className="pt-6 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">Native Features</p>
            <p className="text-xs text-muted-foreground">Configure APIs</p>
          </CardContent>
        </Card>
        <Card className="border-border cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/store-launch/publish")}>
          <CardContent className="pt-6 text-center">
            <Rocket className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">Publish</p>
            <p className="text-xs text-muted-foreground">App Store & Play Store</p>
          </CardContent>
        </Card>
        <Card className="border-border cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/store-launch/revenue")}>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">Revenue Share</p>
            <p className="text-xs text-muted-foreground">Track earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Your App Projects</CardTitle>
          <CardDescription>Manage your native app conversions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
          ) : !projects?.length ? (
            <div className="text-center py-12">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Convert your first web app to a native mobile app
              </p>
              <Button onClick={() => navigate("/store-launch/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/store-launch/project/${project.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{project.connected_source_type}</span>
                        <span>•</span>
                        <span>{project.platforms?.join(", ") || "No platforms"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(project.status)}
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Free Tier Info */}
      <Card className="border-border bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Free Tier</h3>
              <p className="text-sm text-muted-foreground">
                $0 to start. 5% of gross revenue for the life of your app.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/store-launch/revenue")}>
              View Revenue Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreLaunch;
