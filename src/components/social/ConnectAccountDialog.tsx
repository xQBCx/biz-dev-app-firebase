import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, ExternalLink, Key, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface Platform {
  id: string;
  platform_name: string;
  platform_slug: string;
  auth_type: string;
  logo_url: string | null;
  api_available: boolean;
  connector_config: any;
}

interface ConnectAccountDialogProps {
  platform: Platform | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ConnectAccountDialog = ({
  platform,
  open,
  onOpenChange,
  onSuccess,
}: ConnectAccountDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accountHandle, setAccountHandle] = useState("");
  const [accountName, setAccountName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [accountUrl, setAccountUrl] = useState("");

  const handleConnect = async () => {
    if (!platform || !user) return;

    if (!accountHandle.trim()) {
      toast.error("Please enter an account handle");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("social_accounts").insert({
        user_id: user.id,
        platform_id: platform.id,
        account_handle: accountHandle,
        account_name: accountName || accountHandle,
        account_url: accountUrl || null,
        status: platform.auth_type === "manual" ? "preview" : "active",
        auth_metadata: apiKey ? { api_key_set: true } : {},
      });

      if (error) throw error;

      toast.success(`${platform.platform_name} account connected successfully`);
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error connecting account:", error);
      toast.error(error.message || "Failed to connect account");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAccountHandle("");
    setAccountName("");
    setApiKey("");
    setAccountUrl("");
  };

  if (!platform) return null;

  const getAuthTypeIcon = () => {
    switch (platform.auth_type) {
      case "oauth":
        return <ExternalLink className="h-4 w-4" />;
      case "api_key":
        return <Key className="h-4 w-4" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  const getAuthTypeLabel = () => {
    switch (platform.auth_type) {
      case "oauth":
        return "OAuth 2.0";
      case "api_key":
        return "API Key";
      default:
        return "Manual";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {platform.logo_url && (
              <img
                src={platform.logo_url}
                alt={platform.platform_name}
                className="h-8 w-8 rounded"
              />
            )}
            <div className="flex-1">
              <DialogTitle>Connect {platform.platform_name}</DialogTitle>
              <DialogDescription>
                Add your {platform.platform_name} account
              </DialogDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              {getAuthTypeIcon()}
              {getAuthTypeLabel()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {platform.auth_type === "oauth" && (
            <Alert>
              <AlertDescription className="text-sm">
                OAuth integration requires app credentials. For now, you can manually add
                your account details to track it in the dashboard.
              </AlertDescription>
            </Alert>
          )}

          {platform.auth_type === "manual" && (
            <Alert>
              <AlertDescription className="text-sm">
                This platform doesn't have an official API. Your account will be tracked
                manually and you'll need to post directly on the platform.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="handle">Account Handle *</Label>
            <Input
              id="handle"
              placeholder="@username"
              value={accountHandle}
              onChange={(e) => setAccountHandle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Profile URL</Label>
            <Input
              id="url"
              placeholder={`https://${platform.platform_slug}.com/username`}
              value={accountUrl}
              onChange={(e) => setAccountUrl(e.target.value)}
            />
          </div>

          {platform.auth_type === "api_key" && platform.api_available && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API key will be securely encrypted and stored
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Account"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
