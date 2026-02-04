import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Folder, FileText, LogOut, Download, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DigitalAssetsVDR from "./DigitalAssetsVDR";
import RiskGovernanceVDR from "./RiskGovernanceVDR";
import FinancialProjectionsVDR from "./FinancialProjectionsVDR";
import LegalDocumentsVDR from "./LegalDocumentsVDR";

interface DataRoomProps {
  deal: any;
  userId: string;
}

const DataRoom = ({ deal, userId }: DataRoomProps) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Fetch folders
  const { data: folders } = useQuery({
    queryKey: ["folders", deal.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("deal_id", deal.id)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Fetch files
  const { data: files } = useQuery({
    queryKey: ["files", deal.id, selectedFolder],
    queryFn: async () => {
      let query = supabase
        .from("files")
        .select("*")
        .eq("deal_id", deal.id);

      if (selectedFolder) {
        query = query.eq("folder_id", selectedFolder);
      } else {
        query = query.is("folder_id", null);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const downloadFile = async (file: any) => {
    const { data, error } = await supabase.storage
      .from("data-room")
      .download(file.storage_path);

    if (error) {
      console.error("Download error:", error);
      return;
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentFolder = selectedFolder
    ? folders?.find((f) => f.id === selectedFolder)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div 
        className="border-b border-border bg-card py-6"
        style={{
          backgroundColor: deal.brand_primary_color ? `${deal.brand_primary_color}15` : undefined,
        }}
      >
        <div className="container px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {deal.brand_logo_url && (
                <img
                  src={deal.brand_logo_url}
                  alt={deal.title}
                  className="h-12 w-auto"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{deal.title}</h1>
                <p className="text-sm text-muted-foreground">{deal.short_description}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-6 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full max-w-5xl grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="digital-assets">Digital Assets</TabsTrigger>
            <TabsTrigger value="risk-governance">Risk & Governance</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-foreground">Deal Overview</h2>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {deal.detailed_description || "No detailed description available."}
              </div>
            </div>

            {deal.includes_digital_asset_acquisitions && (
              <Card className="p-6 border-accent/30 bg-accent/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-accent" />
                    <h3 className="text-xl font-bold text-foreground">
                      Digital Asset Allocation of Capital
                    </h3>
                  </div>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      This deal structure includes strategic allocation of capital toward digital asset acquisitions 
                      that strengthen the overall IP portfolio and increase collateral value within the IP Trust.
                    </p>
                    <p>
                      <strong className="text-foreground">Allocation Strategy:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong className="text-foreground">.nano TLD Acquisition:</strong> Capital may be deployed 
                        to acquire the .nano Top-Level Domain, creating digital infrastructure for the NANO ecosystem 
                        with subdomain licensing potential and enhanced trademark defensibility.
                      </li>
                      <li>
                        <strong className="text-foreground">Domain Portfolio Expansion:</strong> Funds may be used 
                        to expand the strategic domain portfolio with high-value NANO-related domains across brand, 
                        product, scientific, wellness, and technology categories.
                      </li>
                      <li>
                        <strong className="text-foreground">Competitive Defense:</strong> Digital asset acquisitions 
                        provide defensive positioning against domain squatting and trademark dilution while increasing 
                        the replacement cost analysis for valuation purposes.
                      </li>
                    </ul>
                    <p className="pt-2">
                      All digital assets acquired through this deal structure become part of the IP Trust's asset base 
                      and contribute to the overall collateral value supporting IP-backed financing terms. Detailed 
                      domain portfolio information and TLD strategy are available in the{" "}
                      <strong className="text-foreground">Digital Assets</strong> tab.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Document Library</h2>
                {currentFolder && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedFolder(null)}>
                    ← Back to Root
                  </Button>
                )}
              </div>

              {currentFolder && (
                <div className="text-sm text-muted-foreground mb-4">
                  Current: {currentFolder.name}
                </div>
              )}

              {/* Folders */}
              {!selectedFolder && folders && folders.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Folders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folders.map((folder) => (
                      <Card
                        key={folder.id}
                        className="p-4 hover:border-accent transition-colors cursor-pointer bg-card"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="h-8 w-8 text-accent" />
                          <div>
                            <p className="font-semibold text-foreground">{folder.name}</p>
                            <p className="text-xs text-muted-foreground">Folder</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedFolder ? "Files in this folder" : "Root Files"}
                </h3>
                {files && files.length > 0 ? (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <Card key={file.id} className="p-4 bg-card">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="h-6 w-6 text-accent" />
                            <div>
                              <p className="font-semibold text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.file_type || "Unknown type"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-border rounded-lg bg-card">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No files in this location</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="digital-assets" className="mt-6">
            <DigitalAssetsVDR />
          </TabsContent>

          <TabsContent value="risk-governance" className="mt-6">
            <RiskGovernanceVDR />
          </TabsContent>

          <TabsContent value="financials" className="mt-6">
            <FinancialProjectionsVDR />
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <LegalDocumentsVDR />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataRoom;
