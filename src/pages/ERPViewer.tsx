import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, FolderTree, Upload, Network, History, 
  RefreshCw, Loader, FileText, Folder, ChevronRight, ChevronDown
} from "lucide-react";
import ERPMindMap from "@/components/erp/ERPMindMap";
import SmartDocumentRouter from "@/components/erp/SmartDocumentRouter";
import ERPEvolutionLog from "@/components/erp/ERPEvolutionLog";

interface ERPConfig {
  id: string;
  company_id: string | null;
  industry: string;
  strategy: string;
  folder_structure: Record<string, any>;
  integrations: Record<string, any>;
  workflows: Record<string, any>;
  ai_assessment: Record<string, any>;
  status: string;
  last_evolved_at: string | null;
  created_at: string;
}

interface FolderNodeProps {
  name: string;
  children: Record<string, any>;
  path: string;
  level: number;
}

const FolderNode = ({ name, children, path, level }: FolderNodeProps) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = Object.keys(children).length > 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1 px-2 hover:bg-muted rounded cursor-pointer`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        ) : (
          <span className="w-4" />
        )}
        <Folder className={`h-4 w-4 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-sm">{name}</span>
      </div>
      {isOpen && hasChildren && (
        <div>
          {Object.entries(children).map(([childName, childChildren]) => (
            <FolderNode
              key={`${path}/${childName}`}
              name={childName}
              children={childChildren as Record<string, any>}
              path={`${path}/${childName}`}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ERPViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("structure");

  const { data: config, isLoading } = useQuery({
    queryKey: ["erp-config", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_erp_configs")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as ERPConfig;
    },
    enabled: !!id,
  });

  const evolveMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("erp-evolve", {
        body: { configId: id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("ERP structure analyzed and updated!");
      queryClient.invalidateQueries({ queryKey: ["erp-config", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">ERP configuration not found</p>
          <Button variant="outline" onClick={() => navigate("/erp")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to ERP
          </Button>
        </div>
      </div>
    );
  }

  const folderStructure = config.folder_structure as Record<string, any>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/erp")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold capitalize">
                {config.industry.replace("_", " ")} ERP Structure
              </h1>
              <p className="text-muted-foreground">
                Strategy: {config.strategy?.replace("-", " ") || "Custom"} • 
                Status: <span className="capitalize">{config.status}</span>
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => evolveMutation.mutate()}
            disabled={evolveMutation.isPending}
          >
            {evolveMutation.isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Evolve Structure
          </Button>
        </div>

        {/* AI Assessment */}
        {config.ai_assessment && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {(config.ai_assessment as any)?.summary || "No assessment available"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="structure" className="gap-2">
              <FolderTree className="h-4 w-4" /> Structure
            </TabsTrigger>
            <TabsTrigger value="mindmap" className="gap-2">
              <Network className="h-4 w-4" /> Mind Map
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" /> Smart Upload
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" /> Evolution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Folder Tree */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Folder Structure</CardTitle>
                  <CardDescription>
                    Navigate your ERP folder hierarchy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 max-h-[500px] overflow-auto">
                    {folderStructure.root ? (
                      Object.entries(folderStructure.root).map(([name, children]) => (
                        <FolderNode
                          key={name}
                          name={name}
                          children={children as Record<string, any>}
                          path={`/root/${name}`}
                          level={0}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No folder structure defined
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Integrations & Workflows */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(config.integrations as any)?.recommended?.map((int: string) => (
                        <span key={int} className="text-xs bg-muted px-2 py-1 rounded">
                          {int}
                        </span>
                      )) || <p className="text-sm text-muted-foreground">None configured</p>}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(config.workflows as any)?.recommended?.map((wf: string) => (
                        <span key={wf} className="text-xs bg-muted px-2 py-1 rounded">
                          {wf.replace("_", " ")}
                        </span>
                      )) || <p className="text-sm text-muted-foreground">None configured</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mindmap" className="mt-4">
            <ERPMindMap folderStructure={folderStructure} />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <SmartDocumentRouter erpConfigId={id!} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ERPEvolutionLog erpConfigId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ERPViewer;
