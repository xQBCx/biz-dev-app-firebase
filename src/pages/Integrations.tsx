import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useInstincts } from "@/hooks/useInstincts";
import { supabase } from "@/integrations/supabase/client";
// AIAssistant removed - using GlobalFloatingChat from App.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Database, 
  Cloud, 
  Upload, 
  Download,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from "lucide-react";

type Connector = {
  id: string;
  connector_type: string;
  name: string;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
  sync_error: string | null;
};

type EmailIdentity = {
  id: string;
  email: string;
  display_name: string | null;
  connector_type: string;
  is_primary: boolean;
  is_active: boolean;
  last_sync_at: string | null;
};

const Integrations = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackIntegration } = useInstincts();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [emailIdentities, setEmailIdentities] = useState<EmailIdentity[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Load connectors
      const { data: connectorsData, error: connectorsError } = await supabase
        .from("connectors")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (connectorsError) throw connectorsError;
      setConnectors(connectorsData || []);

      // Load email identities
      const { data: identitiesData, error: identitiesError } = await supabase
        .from("email_identities")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_primary", { ascending: false });

      if (identitiesError) throw identitiesError;
      setEmailIdentities(identitiesData || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const connectorTypeDisplay: Record<string, { name: string; icon: any }> = {
    gmail: { name: "Gmail", icon: Mail },
    outlook: { name: "Outlook", icon: Mail },
    imap_smtp: { name: "IMAP/SMTP", icon: Mail },
    hubspot: { name: "HubSpot", icon: Database },
    salesforce: { name: "Salesforce", icon: Database },
    zoho: { name: "Zoho", icon: Database },
    pipedrive: { name: "Pipedrive", icon: Database },
    wordpress: { name: "WordPress", icon: Cloud },
    notion: { name: "Notion", icon: Cloud },
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Integrations Hub</h1>
            <p className="text-muted-foreground">
              Connect your email, CRM, ERP, and other systems
            </p>
          </div>
          <Button onClick={() => navigate("/integrations/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </div>

        <Tabs defaultValue="email" className="space-y-6">
          <TabsList>
            <TabsTrigger value="email">Email Accounts</TabsTrigger>
            <TabsTrigger value="crm">CRM & Sales</TabsTrigger>
            <TabsTrigger value="erp">ERP & Finance</TabsTrigger>
            <TabsTrigger value="cms">CMS & Content</TabsTrigger>
            <TabsTrigger value="migration">Migration</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
          </TabsList>

          {/* Email Accounts */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Email Accounts</CardTitle>
                <CardDescription>
                  Manage your email identities for the unified inbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailIdentities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No email accounts connected yet</p>
                    <Button className="mt-4" onClick={() => navigate("/integrations/add-email")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Connect Email Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emailIdentities.map((identity) => (
                      <div
                        key={identity.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Mail className="h-8 w-8 text-primary" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{identity.email}</span>
                              {identity.is_primary && (
                                <Badge variant="default">Primary</Badge>
                              )}
                              {!identity.is_active && (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {connectorTypeDisplay[identity.connector_type]?.name || identity.connector_type}
                            </p>
                            {identity.last_sync_at && (
                              <p className="text-xs text-muted-foreground">
                                Last synced: {new Date(identity.last_sync_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRM & Sales */}
          <TabsContent value="crm" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["hubspot", "salesforce", "zoho", "pipedrive"].map((type) => {
                const connector = connectors.find((c) => c.connector_type === type);
                const display = connectorTypeDisplay[type];
                
                return (
                  <Card key={type}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{display.name}</CardTitle>
                        {connector && getStatusIcon(connector.sync_status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {connector ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Connected as: {connector.name}
                          </p>
                          {connector.last_sync_at && (
                            <p className="text-xs text-muted-foreground">
                              Last sync: {new Date(connector.last_sync_at).toLocaleString()}
                            </p>
                          )}
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            Manage
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => navigate(`/integrations/add?type=${type}`)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ERP & Finance */}
          <TabsContent value="erp" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["quickbooks", "netsuite", "odoo", "sap"].map((type) => {
                const display = connectorTypeDisplay[type] || { name: type.charAt(0).toUpperCase() + type.slice(1), icon: Database };
                
                return (
                  <Card key={type}>
                    <CardHeader>
                      <CardTitle className="text-lg">{display.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/integrations/add?type=${type}`)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* CMS & Content */}
          <TabsContent value="cms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["wordpress", "notion", "contentful", "webflow"].map((type) => {
                const display = connectorTypeDisplay[type] || { name: type.charAt(0).toUpperCase() + type.slice(1), icon: Cloud };
                
                return (
                  <Card key={type}>
                    <CardHeader>
                      <CardTitle className="text-lg">{display.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/integrations/add?type=${type}`)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Migration */}
          <TabsContent value="migration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Your Data
                </CardTitle>
                <CardDescription>
                  Migrate your messages, contacts, and data from other systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                    <Mail className="h-8 w-8" />
                    <span className="font-semibold">Import Email Archive</span>
                    <span className="text-xs text-muted-foreground">MBOX, EML, PST formats</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                    <Database className="h-8 w-8" />
                    <span className="font-semibold">Import from CRM</span>
                    <span className="text-xs text-muted-foreground">Contacts, deals, activities</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                    <Cloud className="h-8 w-8" />
                    <span className="font-semibold">Google Takeout</span>
                    <span className="text-xs text-muted-foreground">Gmail, Contacts, Calendar</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                    <Upload className="h-8 w-8" />
                    <span className="font-semibold">CSV/JSON Import</span>
                    <span className="text-xs text-muted-foreground">Custom data formats</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export/Import */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Your Data
                  </CardTitle>
                  <CardDescription>
                    Download your data for backup or migration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Full Export (All Data)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    Messages Only (MBOX)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="mr-2 h-4 w-4" />
                    Contacts & CRM (vCard/CSV)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Zero Lock-In Promise
                  </CardTitle>
                  <CardDescription>
                    Your data, your way, anytime
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>One-click full data export in open formats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Self-hosting ready (Docker/Kubernetes)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Decentralized storage compatible (IPFS)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>End-to-end encryption option</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AIAssistant removed - using GlobalFloatingChat from App.tsx */}
    </div>
  );
};

export default Integrations;