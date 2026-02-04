import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader, RefreshCw, Settings, Trash2, ExternalLink, Users } from "lucide-react";
import { toast } from "sonner";

interface ConnectedAccount {
  id: string;
  platform_name: string;
  account_handle: string;
  account_name: string;
  account_url: string | null;
  profile_image_url: string | null;
  follower_count: number;
  status: string;
  is_verified: boolean;
  last_synced_at: string | null;
}

interface ConnectedAccountsProps {
  onUpdate: () => void;
}

export const ConnectedAccounts = ({ onUpdate }: ConnectedAccountsProps) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("social_accounts")
        .select(`
          id,
          account_handle,
          account_name,
          account_url,
          profile_image_url,
          follower_count,
          status,
          is_verified,
          last_synced_at,
          social_platforms (platform_name)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedAccounts = (data || []).map(acc => ({
        ...acc,
        platform_name: (acc.social_platforms as any)?.platform_name || "Unknown"
      }));
      
      setAccounts(formattedAccounts as any);
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error("Failed to load connected accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (accountId: string) => {
    toast.info("Syncing account data...");
    // TODO: Implement sync logic
    onUpdate();
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    
    try {
      const { error } = await supabase
        .from("social_accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;
      
      toast.success("Account disconnected successfully");
      loadAccounts();
      onUpdate();
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast.error("Failed to disconnect account");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      discovered: "bg-blue-500",
      preview: "bg-yellow-500",
      claimed: "bg-purple-500",
      suspended: "bg-red-500",
      transferred: "bg-gray-500"
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Connected Accounts</h3>
          <p className="text-muted-foreground text-center mb-4">
            Connect your first social media account to get started
          </p>
          <Button>Connect Account</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={account.profile_image_url || undefined} />
                  <AvatarFallback>{account.account_name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{account.account_name || account.account_handle}</CardTitle>
                  <CardDescription>@{account.account_handle}</CardDescription>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(account.status)}`}></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform</span>
              <Badge variant="secondary">{account.platform_name}</Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Followers</span>
              <span className="font-medium">{account.follower_count.toLocaleString()}</span>
            </div>
            
            {account.is_verified && (
              <Badge variant="outline" className="text-xs">
                Verified Account
              </Badge>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync(account.id)}
                className="flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect(account.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              {account.account_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(account.account_url!, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {account.last_synced_at && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(account.last_synced_at).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};