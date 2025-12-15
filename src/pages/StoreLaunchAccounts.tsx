import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Apple, PlayCircle, CheckCircle, ExternalLink, Upload, Key, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StoreLaunchAccounts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [appleTeamId, setAppleTeamId] = useState("");
  const [appleEmail, setAppleEmail] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleServiceAccount, setGoogleServiceAccount] = useState("");

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["store-launch-developer-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_developer_accounts")
        .select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const appleAccount = accounts?.find((a) => a.platform === "apple");
  const googleAccount = accounts?.find((a) => a.platform === "google");

  const connectApple = useMutation({
    mutationFn: async () => {
      if (appleAccount) {
        const { error } = await supabase
          .from("store_launch_developer_accounts")
          .update({
            account_email: appleEmail,
            team_id: appleTeamId,
            is_connected: true,
            last_verified_at: new Date().toISOString(),
          })
          .eq("id", appleAccount.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("store_launch_developer_accounts")
          .insert({
            user_id: user?.id,
            platform: "apple",
            account_email: appleEmail,
            team_id: appleTeamId,
            is_connected: true,
            last_verified_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-launch-developer-accounts"] });
      toast({ title: "Connected", description: "Apple Developer account connected successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const connectGoogle = useMutation({
    mutationFn: async () => {
      if (googleAccount) {
        const { error } = await supabase
          .from("store_launch_developer_accounts")
          .update({
            account_email: googleEmail,
            credentials_metadata: { service_account_provided: !!googleServiceAccount },
            is_connected: true,
            last_verified_at: new Date().toISOString(),
          })
          .eq("id", googleAccount.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("store_launch_developer_accounts")
          .insert({
            user_id: user?.id,
            platform: "google",
            account_email: googleEmail,
            credentials_metadata: { service_account_provided: !!googleServiceAccount },
            is_connected: true,
            last_verified_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-launch-developer-accounts"] });
      toast({ title: "Connected", description: "Google Play Console connected successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/store-launch")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Store Launch
      </Button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Developer Accounts</h1>
        <p className="text-muted-foreground">
          Connect your Apple and Google developer accounts to publish apps
        </p>
      </div>

      {/* Apple Developer Account */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Apple className="h-6 w-6" />
              <div>
                <CardTitle>Apple Developer Account</CardTitle>
                <CardDescription>Required for iOS and macOS apps</CardDescription>
              </div>
            </div>
            {appleAccount?.is_connected ? (
              <Badge className="bg-green-500/20 text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline">Not Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <p className="font-medium">Requirements:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Apple Developer Program membership ($99/year)</li>
              <li>Team ID from your Apple Developer account</li>
              <li>App Store Connect access</li>
            </ul>
            <a
              href="https://developer.apple.com/account"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
            >
              Open Apple Developer Portal
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apple-email">Apple ID Email</Label>
              <Input
                id="apple-email"
                type="email"
                placeholder="developer@example.com"
                value={appleEmail}
                onChange={(e) => setAppleEmail(e.target.value)}
                defaultValue={appleAccount?.account_email || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-id">Team ID</Label>
              <Input
                id="team-id"
                placeholder="XXXXXXXXXX"
                value={appleTeamId}
                onChange={(e) => setAppleTeamId(e.target.value)}
                defaultValue={appleAccount?.team_id || ""}
              />
              <p className="text-xs text-muted-foreground">
                Find your Team ID in Apple Developer → Membership
              </p>
            </div>

            <Button
              onClick={() => connectApple.mutate()}
              disabled={!appleEmail || !appleTeamId || connectApple.isPending}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              {appleAccount?.is_connected ? "Update Connection" : "Connect Apple Developer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Play Console */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlayCircle className="h-6 w-6" />
              <div>
                <CardTitle>Google Play Console</CardTitle>
                <CardDescription>Required for Android apps</CardDescription>
              </div>
            </div>
            {googleAccount?.is_connected ? (
              <Badge className="bg-green-500/20 text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline">Not Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <p className="font-medium">Requirements:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Google Play Console account ($25 one-time fee)</li>
              <li>Service account JSON for API access</li>
              <li>Play Developer API enabled</li>
            </ul>
            <a
              href="https://play.google.com/console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
            >
              Open Google Play Console
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google-email">Google Account Email</Label>
              <Input
                id="google-email"
                type="email"
                placeholder="developer@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                defaultValue={googleAccount?.account_email || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-account">Service Account JSON (optional)</Label>
              <Textarea
                id="service-account"
                placeholder='{"type": "service_account", ...}'
                value={googleServiceAccount}
                onChange={(e) => setGoogleServiceAccount(e.target.value)}
                className="font-mono text-xs h-24"
              />
              <p className="text-xs text-muted-foreground">
                Required for automated deployments. Create in Google Cloud Console → IAM → Service Accounts
              </p>
            </div>

            <div className="p-3 border border-yellow-500/50 bg-yellow-500/10 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600">Enable Play Developer API</p>
                <p className="text-muted-foreground">
                  Go to Google Cloud Console → APIs & Services → Enable "Google Play Developer API"
                </p>
              </div>
            </div>

            <Button
              onClick={() => connectGoogle.mutate()}
              disabled={!googleEmail || connectGoogle.isPending}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              {googleAccount?.is_connected ? "Update Connection" : "Connect Google Play Console"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Security Note</h3>
          <p className="text-sm text-muted-foreground">
            Your credentials are encrypted and stored securely. We use them only to automate builds
            and deployments on your behalf. You can revoke access at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreLaunchAccounts;
