import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Building2, FileText, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewBidWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (projectId: string) => void;
}

export function NewBidWizard({ open, onOpenChange, onSuccess }: NewBidWizardProps) {
  const [sourceType, setSourceType] = useState<"email" | "buildingconnected" | "manual" | "ai_discovery">("manual");
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  console.log("NewBidWizard render - open:", open);

  const handleCreate = async () => {
    if (!projectName) {
      toast({
        title: "Name required",
        description: "Please enter a project name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create construction project
      const { data: project, error: projectError } = await supabase
        .from("construction_projects")
        .insert({
          user_id: user.id,
          name: projectName,
          location,
          asset_type: "commercial",
          phase: "estimating",
          bid_status: "draft",
          bid_due_date: dueDate || null
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create bid source record
      await supabase.from("bid_sources").insert({
        project_id: project.id,
        source_type: sourceType,
        source_reference: `Manual entry - ${new Date().toISOString()}`
      });

      // Create initial estimate worksheet
      await supabase.from("estimate_worksheets").insert({
        project_id: project.id,
        user_id: user.id,
        name: `${projectName} - Estimate v1`,
        version: 1
      });

      toast({
        title: "Project created",
        description: "Your new project is ready for estimating"
      });

      onSuccess(project.id);
      onOpenChange(false);

    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manual">
              <FileText className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="buildingconnected">
              <Building2 className="h-4 w-4 mr-2" />
              BuildingConnected
            </TabsTrigger>
            <TabsTrigger value="ai_discovery">
              <Zap className="h-4 w-4 mr-2" />
              AI Discovery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Downtown Office Building - Roof Replacement"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Denver, CO"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Bid Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Bid Search</CardTitle>
                <CardDescription>Coming soon - Search your inbox for bid invitations</CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder='Search: "roof bid" OR "RFP"' disabled />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buildingconnected" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>BuildingConnected Import</CardTitle>
                <CardDescription>Coming soon - Import projects from BuildingConnected</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Paste BuildingConnected JSON..." disabled />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai_discovery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Project Discovery</CardTitle>
                <CardDescription>AI-discovered opportunities matching your criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No new opportunities at this time.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
