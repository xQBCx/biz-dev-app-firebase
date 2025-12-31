import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Globe, 
  Link2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Copy,
  ExternalLink,
  Shield,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessDomain {
  id: string;
  business_id: string;
  subdomain: string;
  subdomain_active: boolean;
  custom_domain: string | null;
  custom_domain_status: string | null;
  verification_token: string | null;
  dns_records_configured: boolean;
  last_dns_check: string | null;
  dns_check_error: string | null;
  ssl_status: string | null;
  is_primary: boolean;
  created_at: string;
}

interface DomainManagementProps {
  businessId: string;
  businessName: string;
}

const BASE_DOMAIN = "bizdev.app"; // Platform subdomain base

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: "bg-muted text-muted-foreground", icon: <Clock className="w-3 h-3" />, label: "Pending" },
  verifying: { color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: <RefreshCw className="w-3 h-3 animate-spin" />, label: "Verifying" },
  verified: { color: "bg-green-500/10 text-green-600 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" />, label: "Verified" },
  active: { color: "bg-green-500/10 text-green-600 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" />, label: "Active" },
  failed: { color: "bg-red-500/10 text-red-600 border-red-500/30", icon: <AlertCircle className="w-3 h-3" />, label: "Failed" },
  offline: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: <AlertCircle className="w-3 h-3" />, label: "Offline" },
};

const sslStatusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-muted text-muted-foreground", label: "Pending" },
  provisioning: { color: "bg-blue-500/10 text-blue-600", label: "Provisioning" },
  active: { color: "bg-green-500/10 text-green-600", label: "Active" },
  failed: { color: "bg-red-500/10 text-red-600", label: "Failed" },
  expired: { color: "bg-red-500/10 text-red-600", label: "Expired" },
};

export function DomainManagement({ businessId, businessName }: DomainManagementProps) {
  const [domain, setDomain] = useState<BusinessDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchDomain();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`domain-${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'business_domains',
        filter: `business_id=eq.${businessId}`
      }, (payload) => {
        if (payload.new) {
          setDomain(payload.new as BusinessDomain);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  const fetchDomain = async () => {
    try {
      const { data, error } = await supabase
        .from("business_domains")
        .select("*")
        .eq("business_id", businessId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setDomain(data);
      if (data?.custom_domain) {
        setCustomDomainInput(data.custom_domain);
      }
    } catch (error) {
      console.error("Error fetching domain:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomDomain = async () => {
    if (!customDomainInput.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    // Basic domain validation
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainPattern.test(customDomainInput.trim())) {
      toast.error("Please enter a valid domain name (e.g., example.com)");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("business_domains")
        .update({
          custom_domain: customDomainInput.trim().toLowerCase(),
          custom_domain_status: 'pending',
          dns_records_configured: false,
        })
        .eq("id", domain?.id);

      if (error) throw error;
      toast.success("Custom domain added! Configure your DNS records to verify.");
      fetchDomain();
    } catch (error: any) {
      console.error("Error adding custom domain:", error);
      if (error.code === '23505') {
        toast.error("This domain is already in use");
      } else {
        toast.error("Failed to add custom domain");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domain?.custom_domain) return;

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: { domainId: domain.id }
      });

      if (error) throw error;

      if (data?.verified) {
        toast.success("Domain verified successfully!");
      } else {
        toast.error(data?.error || "DNS records not found. Please check your configuration.");
      }
      fetchDomain();
    } catch (error) {
      console.error("Error verifying domain:", error);
      toast.error("Failed to verify domain");
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveCustomDomain = async () => {
    if (!domain) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("business_domains")
        .update({
          custom_domain: null,
          custom_domain_status: 'pending',
          dns_records_configured: false,
          ssl_status: 'pending',
        })
        .eq("id", domain.id);

      if (error) throw error;
      setCustomDomainInput("");
      toast.success("Custom domain removed");
      fetchDomain();
    } catch (error) {
      console.error("Error removing custom domain:", error);
      toast.error("Failed to remove custom domain");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const subdomainUrl = domain ? `${domain.subdomain}.${BASE_DOMAIN}` : null;
  const customDomainStatus = domain?.custom_domain_status ? statusConfig[domain.custom_domain_status] : null;
  const sslStatus = domain?.ssl_status ? sslStatusConfig[domain.ssl_status] : null;

  return (
    <div className="space-y-6">
      {/* Subdomain Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Platform Subdomain</h3>
              <p className="text-sm text-muted-foreground">Auto-assigned subdomain for your business</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        {subdomainUrl && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <code className="text-sm font-mono flex-1">{subdomainUrl}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(`https://${subdomainUrl}`, "URL")}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://${subdomainUrl}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3">
          This subdomain is automatically assigned and always active. End users can access your business at this URL.
        </p>
      </Card>

      {/* Custom Domain Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Custom Domain</h3>
              <p className="text-sm text-muted-foreground">Connect your own domain to this business</p>
            </div>
          </div>
          {domain?.custom_domain && customDomainStatus && (
            <Badge variant="outline" className={cn("border", customDomainStatus.color)}>
              {customDomainStatus.icon}
              <span className="ml-1">{customDomainStatus.label}</span>
            </Badge>
          )}
        </div>

        {!domain?.custom_domain ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customDomain">Domain Name</Label>
              <div className="flex gap-2">
                <Input
                  id="customDomain"
                  placeholder="yourdomain.com"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                />
                <Button onClick={handleAddCustomDomain} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Domain"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Domain Display */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <code className="text-sm font-mono flex-1">{domain.custom_domain}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`https://${domain.custom_domain}`, "URL")}
              >
                <Copy className="w-4 h-4" />
              </Button>
              {domain.custom_domain_status === 'active' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://${domain.custom_domain}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* DNS Configuration Instructions */}
            {domain.custom_domain_status !== 'active' && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-medium text-sm">DNS Configuration Required</h4>
                <p className="text-xs text-muted-foreground">
                  Add these DNS records at your domain registrar to verify ownership and connect your domain:
                </p>
                
                <div className="space-y-2">
                  {/* A Record */}
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="font-mono">A</Badge>
                    <span className="text-muted-foreground">Name:</span>
                    <code className="bg-background px-2 py-0.5 rounded">@</code>
                    <span className="text-muted-foreground">Value:</span>
                    <code className="bg-background px-2 py-0.5 rounded">185.158.133.1</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard("185.158.133.1", "IP Address")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* A Record for www */}
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="font-mono">A</Badge>
                    <span className="text-muted-foreground">Name:</span>
                    <code className="bg-background px-2 py-0.5 rounded">www</code>
                    <span className="text-muted-foreground">Value:</span>
                    <code className="bg-background px-2 py-0.5 rounded">185.158.133.1</code>
                  </div>

                  {/* TXT Record for verification */}
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <Badge variant="outline" className="font-mono">TXT</Badge>
                    <span className="text-muted-foreground">Name:</span>
                    <code className="bg-background px-2 py-0.5 rounded">_bizdev</code>
                    <span className="text-muted-foreground">Value:</span>
                    <code className="bg-background px-2 py-0.5 rounded text-[10px] max-w-[200px] truncate">
                      bizdev_verify={domain.verification_token?.substring(0, 20)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(`bizdev_verify=${domain.verification_token}`, "TXT Record")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {domain.dns_check_error && (
                  <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{domain.dns_check_error}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleVerifyDomain}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Verify DNS
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveCustomDomain}
                    disabled={saving}
                  >
                    Remove Domain
                  </Button>
                </div>
              </div>
            )}

            {/* SSL Status */}
            {domain.custom_domain_status === 'active' && sslStatus && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">SSL Certificate</span>
                </div>
                <Badge variant="outline" className={cn("border", sslStatus.color)}>
                  {sslStatus.label}
                </Badge>
              </div>
            )}

            {/* Last Check Info */}
            {domain.last_dns_check && (
              <p className="text-xs text-muted-foreground">
                Last checked: {new Date(domain.last_dns_check).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Access Control Info */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1">Access Control</p>
            <p className="text-muted-foreground text-xs">
              Only Master Admins can access this command center. Regular users will experience 
              the website or app directly via the custom domain or their downloaded app.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
