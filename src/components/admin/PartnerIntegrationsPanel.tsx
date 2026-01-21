import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Key, RefreshCw, Trash2, Copy, Check, Eye, EyeOff, Shield, Activity } from "lucide-react";
import { format } from "date-fns";

interface PartnerIntegration {
  id: string;
  partner_name: string;
  partner_slug: string;
  contact_name: string | null;
  contact_email: string | null;
  api_key_prefix: string;
  scopes: string[];
  is_active: boolean;
  rate_limit_per_minute: number;
  allowed_deal_room_ids: string[];
  allowed_hubspot_accounts: any[];
  request_count: number;
  last_used_at: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

interface ApiLog {
  id: string;
  partner_id: string;
  action: string;
  request_payload: any;
  response_status: number | null;
  response_summary: string | null;
  created_at: string;
}

export function PartnerIntegrationsPanel() {
  const [partners, setPartners] = useState<PartnerIntegration[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerIntegration | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    partner_name: "",
    partner_slug: "",
    contact_name: "",
    contact_email: "",
    scopes: "hubspot:write,deal_rooms:read",
    rate_limit_per_minute: 100,
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await supabase.functions.invoke("partner-token-generate", {
        body: { action: "list" },
      });

      if (response.error) throw response.error;
      setPartners(response.data.partners || []);
    } catch (error: any) {
      console.error("Error loading partners:", error);
      toast.error("Failed to load partner integrations");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async (partnerId?: string) => {
    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: { action: "logs", partner_id: partnerId, limit: 50 },
      });

      if (response.error) throw response.error;
      setLogs(response.data.logs || []);
    } catch (error: any) {
      console.error("Error loading logs:", error);
      toast.error("Failed to load API logs");
    }
  };

  const handleCreatePartner = async () => {
    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: {
          action: "generate",
          partner_name: formData.partner_name,
          partner_slug: formData.partner_slug.toLowerCase().replace(/\s+/g, "-"),
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          scopes: formData.scopes.split(",").map((s) => s.trim()),
          rate_limit_per_minute: formData.rate_limit_per_minute,
        },
      });

      if (response.error) throw response.error;

      setNewToken(response.data.api_token);
      toast.success("Partner integration created!");
      loadPartners();
      
      // Reset form
      setFormData({
        partner_name: "",
        partner_slug: "",
        contact_name: "",
        contact_email: "",
        scopes: "hubspot:write,deal_rooms:read",
        rate_limit_per_minute: 100,
      });
    } catch (error: any) {
      console.error("Error creating partner:", error);
      toast.error(error.message || "Failed to create partner integration");
    }
  };

  const handleRegenerateToken = async (partnerId: string) => {
    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: { action: "regenerate", partner_id: partnerId },
      });

      if (response.error) throw response.error;

      setNewToken(response.data.api_token);
      setShowToken(true);
      toast.success("Token regenerated - old token is now invalid!");
      loadPartners();
    } catch (error: any) {
      console.error("Error regenerating token:", error);
      toast.error("Failed to regenerate token");
    }
  };

  const handleToggleActive = async (partner: PartnerIntegration) => {
    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: {
          action: "update",
          partner_id: partner.id,
          is_active: !partner.is_active,
        },
      });

      if (response.error) throw response.error;

      toast.success(`Partner ${partner.is_active ? "deactivated" : "activated"}`);
      loadPartners();
    } catch (error: any) {
      console.error("Error toggling partner:", error);
      toast.error("Failed to update partner status");
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm("Are you sure you want to delete this partner integration? This cannot be undone.")) {
      return;
    }

    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: { action: "delete", partner_id: partnerId },
      });

      if (response.error) throw response.error;

      toast.success("Partner integration deleted");
      loadPartners();
    } catch (error: any) {
      console.error("Error deleting partner:", error);
      toast.error("Failed to delete partner integration");
    }
  };

  const copyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      setCopied(true);
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openLogsForPartner = (partner: PartnerIntegration) => {
    setSelectedPartner(partner);
    loadLogs(partner.id);
    setIsLogsOpen(true);
  };

  return (
    <Card className="shadow-elevated border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Partner Integrations
            </CardTitle>
            <CardDescription>
              Manage API tokens for external partners like Optimo IT to integrate with the platform
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Partner Integration</DialogTitle>
                <DialogDescription>
                  Generate a secure API token for a new partner
                </DialogDescription>
              </DialogHeader>

              {newToken ? (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-2">
                      ⚠️ Save this token now - it won't be shown again!
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                        {showToken ? newToken : "•".repeat(40)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={copyToken}>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setNewToken(null);
                      setIsCreateOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Partner Name *</Label>
                        <Input
                          placeholder="Optimo IT"
                          value={formData.partner_name}
                          onChange={(e) =>
                            setFormData({ ...formData, partner_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug *</Label>
                        <Input
                          placeholder="optimo-it"
                          value={formData.partner_slug}
                          onChange={(e) =>
                            setFormData({ ...formData, partner_slug: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contact Name</Label>
                        <Input
                          placeholder="Peter"
                          value={formData.contact_name}
                          onChange={(e) =>
                            setFormData({ ...formData, contact_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input
                          type="email"
                          placeholder="peter@optimoit.com"
                          value={formData.contact_email}
                          onChange={(e) =>
                            setFormData({ ...formData, contact_email: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>API Scopes</Label>
                      <Textarea
                        placeholder="hubspot:write, deal_rooms:read, settlements:trigger"
                        value={formData.scopes}
                        onChange={(e) => setFormData({ ...formData, scopes: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated list of scopes
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Rate Limit (requests/minute)</Label>
                      <Input
                        type="number"
                        value={formData.rate_limit_per_minute}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rate_limit_per_minute: parseInt(e.target.value) || 100,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePartner}
                      disabled={!formData.partner_name || !formData.partner_slug}
                    >
                      Generate Token
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading partner integrations...
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No partner integrations yet. Click "Add Partner" to create one.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Token Prefix</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{partner.partner_name}</p>
                      <p className="text-xs text-muted-foreground">{partner.contact_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {partner.api_key_prefix}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {partner.scopes.slice(0, 2).map((scope) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                      {partner.scopes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{partner.scopes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={partner.is_active}
                        onCheckedChange={() => handleToggleActive(partner)}
                      />
                      <Badge variant={partner.is_active ? "default" : "secondary"}>
                        {partner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{partner.request_count} requests</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {partner.last_used_at
                        ? format(new Date(partner.last_used_at), "MMM d, HH:mm")
                        : "Never"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openLogsForPartner(partner)}
                        title="View Logs"
                      >
                        <Activity className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerateToken(partner.id)}
                        title="Regenerate Token"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePartner(partner.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Token Display Dialog after regeneration */}
        <Dialog open={!!newToken && !isCreateOpen} onOpenChange={() => setNewToken(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New API Token Generated</DialogTitle>
              <DialogDescription>
                The old token has been invalidated
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">
                ⚠️ Save this token now - it won't be shown again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                  {showToken ? newToken : "•".repeat(40)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={copyToken}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewToken(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logs Dialog */}
        <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>API Logs: {selectedPartner?.partner_name}</DialogTitle>
              <DialogDescription>
                Recent API activity for this partner
              </DialogDescription>
            </DialogHeader>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API logs yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{log.action}</code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.response_status && log.response_status < 400
                              ? "default"
                              : "destructive"
                          }
                        >
                          {log.response_status || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.response_summary || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
