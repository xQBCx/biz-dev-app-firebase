import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  FileText, 
  Layers, 
  DollarSign, 
  ArrowLeft,
  Upload,
  Save,
  Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlanUploadSection } from "@/components/xbuilderx/PlanUploadSection";

export default function XBuilderxEstimating() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [worksheet, setWorksheet] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from("construction_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch or create worksheet
      let { data: worksheetData, error: worksheetError } = await supabase
        .from("estimate_worksheets")
        .select("*")
        .eq("project_id", projectId)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      if (worksheetError && worksheetError.code === "PGRST116") {
        // Create worksheet if none exists
        const { data: { user } } = await supabase.auth.getUser();
        const { data: newWorksheet } = await supabase
          .from("estimate_worksheets")
          .insert({
            project_id: projectId,
            user_id: user?.id,
            name: `${projectData.name} - Estimate v1`,
            version: 1
          })
          .select()
          .single();
        worksheetData = newWorksheet;
      }

      setWorksheet(worksheetData);

      // Fetch line items
      if (worksheetData) {
        const { data: items } = await supabase
          .from("bid_line_items")
          .select("*")
          .eq("worksheet_id", worksheetData.id)
          .order("sort_order");

        setLineItems(items || []);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExtractionComplete = async (extractedData: any) => {
    if (!worksheet) return;

    toast({
      title: "Generating estimate...",
      description: "AI is processing your plans"
    });

    try {
      const { data, error } = await supabase.functions.invoke("auto-estimate", {
        body: {
          projectId,
          worksheetId: worksheet.id,
          extractedData
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Generated ${data.lineItemsCreated} line items`
      });

      // Refresh line items
      fetchProjectData();

    } catch (error) {
      console.error("Auto-estimate error:", error);
      toast({
        title: "Error",
        description: "Failed to generate estimate",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/xbuilderx/engineering")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project?.name}</h1>
              <p className="text-muted-foreground">{project?.location}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Submit Bid
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subtotal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${worksheet?.subtotal?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">{lineItems.length} line items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estimate</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${worksheet?.total_estimate?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Including markups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge>{project?.bid_status || 'draft'}</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {project?.bid_due_date ? `Due: ${new Date(project.bid_due_date).toLocaleDateString()}` : 'No due date'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Probability</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project?.probability_percent || 0}%</div>
              <p className="text-xs text-muted-foreground">Win probability</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans & Takeoff</TabsTrigger>
            <TabsTrigger value="estimate">Estimate</TabsTrigger>
            <TabsTrigger value="proposal">Proposal</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Asset Type</Label>
                    <p className="font-medium capitalize">{project?.asset_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Phase</Label>
                    <p className="font-medium capitalize">{project?.phase}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Compliance Mode</Label>
                    <p className="font-medium capitalize">{project?.compliance_mode?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Bond Required</Label>
                    <p className="font-medium">{project?.bond_required ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            {projectId && (
              <PlanUploadSection 
                projectId={projectId} 
                onExtractionComplete={handleExtractionComplete}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Uploaded Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No plans uploaded yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estimate" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cost Breakdown</CardTitle>
                  <Button variant="outline" size="sm">
                    Add Line Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lineItems.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-4 text-sm font-medium border-b pb-2">
                      <div className="col-span-2">Description</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Unit</div>
                      <div className="text-right">Unit $</div>
                      <div className="text-right">Ext $</div>
                      <div>Type</div>
                    </div>
                    {lineItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-7 gap-4 text-sm py-2 border-b">
                        <div className="col-span-2">{item.description}</div>
                        <div className="text-right">{item.quantity}</div>
                        <div className="text-right">{item.unit}</div>
                        <div className="text-right">${item.unit_price}</div>
                        <div className="text-right font-medium">${item.extended_price}</div>
                        <div>
                          <Badge variant="outline">{item.cost_type}</Badge>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p className="text-2xl font-bold">
                          ${lineItems.reduce((sum, item) => sum + Number(item.extended_price), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Upload plans to automatically generate estimates
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Professional proposals will be generated here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
