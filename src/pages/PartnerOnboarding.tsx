import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Key, Copy, Check, Eye, EyeOff, Building2, Shield, 
  FileText, Activity, CheckCircle2, AlertTriangle, Rocket,
  ExternalLink, Mail
} from "lucide-react";
import { format } from "date-fns";
import { PartnerFeedbackWidget } from "@/components/partner/PartnerFeedbackWidget";
import { PartnerApiDocs } from "@/components/admin/partner/PartnerApiDocs";

interface PartnerData {
  id: string;
  partner_name: string;
  partner_slug: string;
  contact_name: string | null;
  contact_email: string | null;
  api_key_prefix: string;
  scopes: string[];
  is_active: boolean;
  allowed_hubspot_accounts: Array<{
    account_id: string;
    account_name: string;
    deal_room_id?: string;
  }>;
  partner_brief: {
    role?: string;
    description?: string;
    deal_room_name?: string;
    agents?: string[];
  } | null;
  request_count: number;
  last_used_at: string | null;
  created_at: string;
  onboarding_completed_at: string | null;
}

interface DealRoom {
  id: string;
  name: string;
}

export default function PartnerOnboarding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [dealRooms, setDealRooms] = useState<Record<string, DealRoom>>({});
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tokenViewed, setTokenViewed] = useState(false);
  const [checklistItems, setChecklistItems] = useState({
    tokenSaved: false,
    accountsReviewed: false,
    docsRead: false,
    testMade: false,
  });

  useEffect(() => {
    if (token) {
      validateTokenAndLoadData();
    }
  }, [token]);

  const validateTokenAndLoadData = async () => {
    setIsLoading(true);
    try {
      // Fetch partner by onboarding token
      const { data: partnerData, error } = await supabase
        .from("partner_integrations")
        .select("*")
        .eq("onboarding_token", token)
        .single();

      if (error || !partnerData) {
        toast.error("Invalid or expired onboarding link");
        navigate("/");
        return;
      }

      // Check if token is expired
      if (partnerData.onboarding_token_expires_at) {
        const expiresAt = new Date(partnerData.onboarding_token_expires_at);
        if (expiresAt < new Date()) {
          toast.error("This onboarding link has expired. Please contact the admin.");
          navigate("/");
          return;
        }
      }

      // Mark onboarding as started if not already
      if (!partnerData.onboarding_completed_at) {
        await supabase
          .from("partner_integrations")
          .update({ onboarding_completed_at: new Date().toISOString() })
          .eq("id", partnerData.id);
      }

      // Fetch deal rooms for display names
      const hubspotAccounts = partnerData.allowed_hubspot_accounts as PartnerData["allowed_hubspot_accounts"] || [];
      const dealRoomIds = hubspotAccounts
        .filter(a => a.deal_room_id)
        .map(a => a.deal_room_id);

      if (dealRoomIds.length > 0) {
        const { data: rooms } = await supabase
          .from("deal_rooms")
          .select("id, name")
          .in("id", dealRoomIds);

        if (rooms) {
          const roomMap: Record<string, DealRoom> = {};
          rooms.forEach(r => { roomMap[r.id] = r; });
          setDealRooms(roomMap);
        }
      }

      setPartner({
        id: partnerData.id,
        partner_name: partnerData.partner_name,
        partner_slug: partnerData.partner_slug,
        contact_name: partnerData.contact_name,
        contact_email: partnerData.contact_email,
        api_key_prefix: partnerData.api_key_prefix,
        scopes: (partnerData.scopes as unknown as string[]) || [],
        is_active: partnerData.is_active,
        allowed_hubspot_accounts: hubspotAccounts,
        partner_brief: partnerData.partner_brief as PartnerData["partner_brief"],
        request_count: partnerData.request_count,
        last_used_at: partnerData.last_used_at,
        created_at: partnerData.created_at,
        onboarding_completed_at: partnerData.onboarding_completed_at,
      });
    } catch (error) {
      console.error("Error loading partner data:", error);
      toast.error("Failed to load partner data");
    } finally {
      setIsLoading(false);
    }
  };

  const revealToken = async () => {
    if (tokenViewed) {
      toast.error("Token can only be viewed once. Contact admin if you need a new one.");
      return;
    }

    try {
      // In a real implementation, this would call an edge function to get the actual token
      // For now, we'll show a placeholder
      const { data, error } = await supabase.functions.invoke("partner-token-generate", {
        body: { 
          action: "reveal_for_onboarding", 
          onboarding_token: token 
        },
      });

      if (error) throw error;

      if (data?.api_token) {
        setApiToken(data.api_token);
        setShowToken(true);
        setTokenViewed(true);
      } else {
        toast.error("Token has already been viewed. Contact admin for a new token.");
      }
    } catch (error: any) {
      console.error("Error revealing token:", error);
      toast.error("Could not retrieve token. It may have already been viewed.");
    }
  };

  const copyToken = () => {
    if (apiToken) {
      navigator.clipboard.writeText(apiToken);
      setCopied(true);
      setChecklistItems(prev => ({ ...prev, tokenSaved: true }));
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const progress = Object.values(checklistItems).filter(Boolean).length * 25;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your partner dashboard...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {partner.partner_name}!</h1>
              <p className="text-muted-foreground">
                Your partner dashboard for the Biz Dev App platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={partner.is_active ? "default" : "secondary"}>
                {partner.is_active ? "Active" : "Inactive"}
              </Badge>
              {partner.request_count > 0 && (
                <Badge variant="outline">{partner.request_count} API calls</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm text-muted-foreground">{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={checklistItems.tokenSaved ? "text-primary" : ""}>
                {checklistItems.tokenSaved ? "✓" : "○"} Save Token
              </span>
              <span className={checklistItems.accountsReviewed ? "text-primary" : ""}>
                {checklistItems.accountsReviewed ? "✓" : "○"} Review Accounts
              </span>
              <span className={checklistItems.docsRead ? "text-primary" : ""}>
                {checklistItems.docsRead ? "✓" : "○"} Read Docs
              </span>
              <span className={checklistItems.testMade ? "text-primary" : ""}>
                {checklistItems.testMade ? "✓" : "○"} Test API
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Partner Brief (if exists) */}
        {partner.partner_brief && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Your Partnership Scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partner.partner_brief.role && (
                  <div>
                    <span className="text-sm font-medium">Role:</span>
                    <span className="ml-2 text-muted-foreground">{partner.partner_brief.role}</span>
                  </div>
                )}
                {partner.partner_brief.description && (
                  <p className="text-sm text-muted-foreground">{partner.partner_brief.description}</p>
                )}
                {partner.partner_brief.deal_room_name && (
                  <div>
                    <span className="text-sm font-medium">Deal Room:</span>
                    <Badge variant="outline" className="ml-2">{partner.partner_brief.deal_room_name}</Badge>
                  </div>
                )}
                {partner.partner_brief.agents && partner.partner_brief.agents.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Your Agents:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {partner.partner_brief.agents.map((agent, i) => (
                        <Badge key={i} variant="secondary">{agent}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* API Token Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Your API Token
              </CardTitle>
              <CardDescription>
                Use this token to authenticate API requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tokenViewed && apiToken ? (
                <div className="space-y-4">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-2">
                      ⚠️ This is the only time you'll see this token!
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs break-all font-mono">
                        {showToken ? apiToken : "•".repeat(40)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={copyToken}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {checklistItems.tokenSaved && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Token copied - store it securely!
                    </p>
                  )}
                </div>
              ) : tokenViewed ? (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Token has already been viewed. Contact{" "}
                    <a href="mailto:bill@bdsrvs.com" className="text-primary underline">
                      bill@bdsrvs.com
                    </a>{" "}
                    if you need a new one.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your API token is ready. Click below to reveal it. 
                    <strong className="text-foreground"> You can only view it once!</strong>
                  </p>
                  <Button onClick={revealToken} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Reveal My API Token
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allowed Accounts Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Your Allowed Accounts
              </CardTitle>
              <CardDescription>
                HubSpot accounts you can interact with
              </CardDescription>
            </CardHeader>
            <CardContent>
              {partner.allowed_hubspot_accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No specific account restrictions - you have access to all configured accounts.
                </p>
              ) : (
                <div className="space-y-3">
                  {partner.allowed_hubspot_accounts.map((account, i) => (
                    <div
                      key={i}
                      className="p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{account.account_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Portal ID: {account.account_id}
                          </p>
                        </div>
                        {account.deal_room_id && dealRooms[account.deal_room_id] && (
                          <Badge variant="outline" className="text-xs">
                            {dealRooms[account.deal_room_id].name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setChecklistItems(prev => ({ ...prev, accountsReviewed: true }))}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    I've reviewed my accounts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              API Documentation
            </CardTitle>
            <CardDescription>
              Learn how to integrate with the Biz Dev App platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="quickstart" onValueChange={(v) => {
              if (v === "quickstart") {
                setChecklistItems(prev => ({ ...prev, docsRead: true }));
              }
            }}>
              <TabsList>
                <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
                <TabsTrigger value="full-docs">Full Documentation</TabsTrigger>
              </TabsList>
              <TabsContent value="quickstart" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">1. Test Your Connection</h4>
                    <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`curl -X POST \\
  https://eoskcsbytaurtqrnuraw.supabase.co/functions/v1/partner-agent-integration \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -d '{"action": "list_capabilities"}'`}
                    </pre>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">2. Create a Contact in HubSpot</h4>
                    <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`curl -X POST \\
  https://eoskcsbytaurtqrnuraw.supabase.co/functions/v1/partner-agent-integration \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -d '{
    "action": "hubspot_create_contact",
    "hubspot_account_id": "${partner.allowed_hubspot_accounts[0]?.account_id || "YOUR_PORTAL_ID"}",
    "data": {
      "email": "test@example.com",
      "firstname": "Test",
      "lastname": "Contact"
    }
  }'`}
                    </pre>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setChecklistItems(prev => ({ ...prev, testMade: true }))}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    I've tested the API
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="full-docs" className="mt-4">
                <PartnerApiDocs />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Mail className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Need Help?</p>
                  <p className="text-sm text-muted-foreground">
                    Contact us at{" "}
                    <a href="mailto:bill@bdsrvs.com" className="text-primary underline">
                      bill@bdsrvs.com
                    </a>{" "}
                    or use the feedback button
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href="mailto:bill@bdsrvs.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Feedback Widget */}
      <PartnerFeedbackWidget
        partnerEmail={partner.contact_email || undefined}
        partnerName={partner.contact_name || partner.partner_name}
        partnerIntegrationId={partner.id}
      />
    </div>
  );
}
