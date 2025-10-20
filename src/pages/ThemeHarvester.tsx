import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, CheckCircle, XCircle, Library, Palette } from "lucide-react";

export default function ThemeHarvester() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");

  // Fetch seed libraries
  const { data: seedLibraries } = useQuery({
    queryKey: ["seed-libraries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seed_libraries")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch harvested libraries
  const { data: libraries } = useQuery({
    queryKey: ["libraries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("libraries")
        .select("*, library_versions(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's themes
  const { data: themes } = useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("themes")
        .select("*, theme_validations(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Harvest library mutation
  const harvestMutation = useMutation({
    mutationFn: async (seedLibraryId: string) => {
      const seedLib = seedLibraries?.find(lib => lib.id === seedLibraryId);
      if (!seedLib) throw new Error("Library not found");

      const { data, error } = await supabase.functions.invoke("harvest-library", {
        body: {
          library_slug: seedLib.name.toLowerCase().replace(/\s+/g, '-'),
          npm_package: seedLib.npm_package,
          version: "latest"
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Library harvested",
        description: "The library has been successfully imported",
      });
      queryClient.invalidateQueries({ queryKey: ["libraries"] });
    },
    onError: (error) => {
      toast({
        title: "Harvest failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate theme mutation
  const generateThemeMutation = useMutation({
    mutationFn: async (params: { name: string; source_type: string; library_version_id?: string }) => {
      const { data, error } = await supabase.functions.invoke("generate-theme", {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Theme generated",
        description: "Your theme has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Validate theme mutation
  const validateThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const { data, error } = await supabase.functions.invoke("validate-theme", {
        body: { theme_id: themeId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Validation complete",
        description: "Theme validation results are available",
      });
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Theme Source Harvester</h1>
        <p className="text-muted-foreground">
          Import UI libraries and generate themes for your application
        </p>
      </div>

      <Tabs defaultValue="harvest" className="space-y-4">
        <TabsList>
          <TabsTrigger value="harvest">
            <Library className="mr-2 h-4 w-4" />
            Harvest Libraries
          </TabsTrigger>
          <TabsTrigger value="themes">
            <Palette className="mr-2 h-4 w-4" />
            My Themes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="harvest" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Available Libraries</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {seedLibraries?.map((lib) => (
                <Card key={lib.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{lib.name}</h3>
                        <Badge variant="outline" className="mt-1">{lib.type}</Badge>
                      </div>
                      <Badge>{lib.license}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Priority: {lib.priority}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => harvestMutation.mutate(lib.id)}
                      disabled={harvestMutation.isPending}
                    >
                      {harvestMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                      ) : (
                        <><Download className="mr-2 h-4 w-4" /> Import Library</>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Imported Libraries</h2>
            <div className="space-y-2">
              {libraries?.map((lib) => (
                <div key={lib.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{lib.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lib.framework} • {lib.library_versions?.[0]?.count || 0} versions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={lib.is_approved ? "default" : "secondary"}>
                      {lib.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
              {libraries?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No libraries imported yet. Start by importing from the available libraries above.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Generate New Theme</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme-name">Theme Name</Label>
                <Input
                  id="theme-name"
                  placeholder="My Awesome Theme"
                />
              </div>
              <Button
                onClick={() => generateThemeMutation.mutate({
                  name: "New Theme",
                  source_type: "manual"
                })}
                disabled={generateThemeMutation.isPending}
              >
                {generateThemeMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <>Generate Theme</>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Themes</h2>
            <div className="space-y-2">
              {themes?.map((theme) => {
                const latestValidation = theme.theme_validations?.[0];
                return (
                  <div key={theme.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {theme.source_type} • Created {new Date(theme.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {latestValidation ? (
                        <>
                          {latestValidation.passes_accessibility && latestValidation.passes_layout ? (
                            <Badge className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> Invalid
                            </Badge>
                          )}
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => validateThemeMutation.mutate(theme.id)}
                          disabled={validateThemeMutation.isPending}
                        >
                          Validate
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {themes?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No themes created yet. Generate your first theme above.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
