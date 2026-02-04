import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DomainManager from "@/components/admin/DomainManager";
import TLDManager from "@/components/admin/TLDManager";
import NarrativeManager from "@/components/admin/NarrativeManager";
import DealManager from "@/components/admin/DealManager";
import NDATemplateManager from "@/components/admin/NDATemplateManager";
import InvestorAccessManager from "@/components/admin/InvestorAccessManager";
import FileManager from "@/components/admin/FileManager";
import IPProjectManager from "@/components/admin/IPProjectManager";
import ComplianceDashboard from "@/components/admin/ComplianceDashboard";
import DataRequestsManager from "@/components/admin/DataRequestsManager";
import CanonicalGlyphRegistry from "@/components/admin/CanonicalGlyphRegistry";
import UserManagement from "@/components/admin/UserManagement";
import { Shield, AlertCircle, Users } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const Admin = () => {
  const { isAdmin, isLoading, userId } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !userId) {
      navigate("/auth");
    }
  }, [isLoading, userId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-12 w-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have admin privileges to access this area.
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage digital assets, TLD strategy, and investor narratives
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 max-w-6xl">
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="ip">IP Projects</TabsTrigger>
            <TabsTrigger value="canonical">Canonical Glyphs</TabsTrigger>
            <TabsTrigger value="data-rights">Data Rights</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="ndas">NDAs</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="tlds">TLDs</TabsTrigger>
            <TabsTrigger value="narratives">Narratives</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>

          <TabsContent value="ip">
            <IPProjectManager />
          </TabsContent>

          <TabsContent value="canonical">
            <CanonicalGlyphRegistry />
          </TabsContent>

          <TabsContent value="data-rights">
            <DataRequestsManager />
          </TabsContent>

          <TabsContent value="deals">
            <DealManager />
          </TabsContent>

          <TabsContent value="ndas">
            <NDATemplateManager />
          </TabsContent>

          <TabsContent value="access">
            <InvestorAccessManager />
          </TabsContent>

          <TabsContent value="files">
            <FileManager />
          </TabsContent>

          <TabsContent value="domains">
            <DomainManager />
          </TabsContent>

          <TabsContent value="tlds">
            <TLDManager />
          </TabsContent>

          <TabsContent value="narratives">
            <NarrativeManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
