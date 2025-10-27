import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, BarChart3, Settings, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface License {
  id: string;
  license_type: string;
  status: string;
  purchased_at: string;
  app_registry: {
    id: string;
    app_name: string;
    app_slug: string;
    description: string;
    category: string;
    base_price: number;
  };
}

interface CreatedApp {
  id: string;
  app_name: string;
  app_slug: string;
  description: string;
  category: string;
  is_published: boolean;
  base_price: number;
  created_at: string;
}

export default function MyApps() {
  const { session } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [createdApps, setCreatedApps] = useState<CreatedApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyApps();
    }
  }, [session]);

  const fetchMyApps = async () => {
    try {
      // Fetch purchased licenses
      const { data: licensesData, error: licensesError } = await supabase
        .from("app_licenses")
        .select(`
          id,
          license_type,
          status,
          purchased_at,
          app_registry (
            id,
            app_name,
            app_slug,
            description,
            category,
            base_price
          )
        `)
        .eq("user_id", session?.user?.id);

      if (licensesError) throw licensesError;
      setLicenses(licensesData || []);

      // Fetch created apps
      const { data: appsData, error: appsError } = await supabase
        .from("app_registry")
        .select("*")
        .eq("created_by", session?.user?.id)
        .order("created_at", { ascending: false });

      if (appsError) throw appsError;
      setCreatedApps(appsData || []);
    } catch (error: any) {
      toast.error("Failed to load your apps");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (appId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("app_registry")
        .update({ is_published: !currentStatus })
        .eq("id", appId);

      if (error) throw error;
      toast.success(currentStatus ? "App unpublished" : "App published!");
      fetchMyApps();
    } catch (error: any) {
      toast.error("Failed to update app status");
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this app?")) return;

    try {
      const { error } = await supabase
        .from("app_registry")
        .delete()
        .eq("id", appId);

      if (error) throw error;
      toast.success("App deleted successfully");
      fetchMyApps();
    } catch (error: any) {
      toast.error("Failed to delete app");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          My Apps
        </h1>
        <p className="text-muted-foreground">
          Manage your purchased licenses and created apps
        </p>
      </div>

      <Tabs defaultValue="purchased" className="space-y-6">
        <TabsList>
          <TabsTrigger value="purchased">Purchased Apps</TabsTrigger>
          <TabsTrigger value="created">Created Apps</TabsTrigger>
        </TabsList>

        <TabsContent value="purchased" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading your apps...</p>
              </CardContent>
            </Card>
          ) : licenses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">You haven't purchased any apps yet</p>
                <Button onClick={() => window.location.href = "/ecosystem/app-store"}>
                  Browse App Store
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {licenses.map((license) => (
                <Card key={license.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {license.app_registry.app_name}
                      <Badge variant={license.status === "active" ? "default" : "secondary"}>
                        {license.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="outline">{license.app_registry.category}</Badge>
                      <Badge variant="outline" className="ml-2">{license.license_type}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {license.app_registry.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Purchased:</span>
                      <span>{new Date(license.purchased_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="created" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading your apps...</p>
              </CardContent>
            </Card>
          ) : createdApps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">You haven't created any apps yet</p>
                <Button onClick={() => window.location.href = "/ecosystem/launchpad"}>
                  Create Your First App
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {createdApps.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {app.app_name}
                          {app.is_published ? (
                            <Badge variant="default">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          <Badge variant="outline">{app.category}</Badge>
                          <span className="ml-2 text-sm">${app.base_price}/mo</span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(app.id, app.is_published)}
                        >
                          {app.is_published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{app.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(app.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Slug: {app.app_slug}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
