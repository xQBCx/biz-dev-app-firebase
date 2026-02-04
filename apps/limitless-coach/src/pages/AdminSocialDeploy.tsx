import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Youtube,
  Instagram,
  Facebook,
  Link2,
  Check,
  X,
  RefreshCw,
  Settings,
  Send,
  Clock
} from "lucide-react";

// X icon for Twitter/X
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// TikTok icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface SocialConnection {
  id: string;
  platform: string;
  account_name: string | null;
  is_connected: boolean;
  token_expires_at: string | null;
}

const platformConfig = {
  youtube: { 
    name: "YouTube", 
    icon: Youtube, 
    color: "text-red-500",
    description: "Upload videos directly to your channel"
  },
  instagram: { 
    name: "Instagram", 
    icon: Instagram, 
    color: "text-pink-500",
    description: "Share photos, reels, and stories"
  },
  tiktok: { 
    name: "TikTok", 
    icon: TikTokIcon, 
    color: "text-black dark:text-white",
    description: "Post short-form videos"
  },
  facebook: { 
    name: "Facebook", 
    icon: Facebook, 
    color: "text-blue-600",
    description: "Share to your page or profile"
  },
  twitter: { 
    name: "X (Twitter)", 
    icon: XIcon, 
    color: "text-black dark:text-white",
    description: "Post tweets and threads"
  },
};

export default function AdminSocialDeploy() {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from("social_platform_connections")
        .select("*")
        .order("platform");

      if (error) throw error;

      // Merge with all platforms
      const allPlatforms = Object.keys(platformConfig);
      const mergedConnections = allPlatforms.map(platform => {
        const existing = data?.find(c => c.platform === platform);
        return existing || {
          id: platform,
          platform,
          account_name: null,
          is_connected: false,
          token_expires_at: null,
        };
      });

      setConnections(mergedConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    
    // In a real implementation, this would initiate OAuth flow
    // For now, we'll show a message about setting up API keys
    toast({
      title: "API Integration Required",
      description: `To connect ${platformConfig[platform as keyof typeof platformConfig].name}, you'll need to configure your API credentials. Contact support for setup assistance.`,
    });
    
    setConnecting(null);
  };

  const handleDisconnect = async (platform: string) => {
    try {
      const { error } = await supabase
        .from("social_platform_connections")
        .update({ 
          is_connected: false, 
          access_token_encrypted: null,
          refresh_token_encrypted: null,
          token_expires_at: null 
        })
        .eq("platform", platform);

      if (error) throw error;
      
      toast({
        title: "Disconnected",
        description: `${platformConfig[platform as keyof typeof platformConfig].name} has been disconnected`,
      });
      fetchConnections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Social Media Deployment</h1>
        <p className="text-muted-foreground">
          Connect your social accounts to deploy content directly from the platform
        </p>
      </div>

      <Tabs defaultValue="connections">
        <TabsList>
          <TabsTrigger value="connections">
            <Link2 className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Clock className="h-4 w-4 mr-2" />
            Scheduled Posts
          </TabsTrigger>
          <TabsTrigger value="history">
            <Send className="h-4 w-4 mr-2" />
            Post History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection) => {
                const config = platformConfig[connection.platform as keyof typeof platformConfig];
                if (!config) return null;
                
                const IconComponent = config.icon;
                
                return (
                  <Card key={connection.platform}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <div className={`${config.color}`}>
                            <IconComponent />
                          </div>
                          <div>
                            <CardTitle className="text-base">{config.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {config.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={connection.is_connected ? "default" : "secondary"}>
                          {connection.is_connected ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Connected
                            </>
                          ) : (
                            "Not Connected"
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {connection.is_connected ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Account:</span>
                            <span className="font-medium">{connection.account_name || "Unknown"}</span>
                          </div>
                          {connection.token_expires_at && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Token Expires:</span>
                              <span>{new Date(connection.token_expires_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleConnect(connection.platform)}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Refresh Token
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDisconnect(connection.platform)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => handleConnect(connection.platform)}
                          disabled={connecting === connection.platform}
                        >
                          {connecting === connection.platform ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Link2 className="h-4 w-4 mr-2" />
                              Connect {config.name}
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure API credentials for each platform to enable direct posting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                To enable full API integration for automatic posting, you'll need to:
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Create developer accounts on each platform</li>
                <li>Register your application and obtain API credentials</li>
                <li>Configure the credentials in your backend secrets</li>
                <li>Complete OAuth authorization for your accounts</li>
              </ol>
              <Button variant="outline" className="mt-4">
                View Setup Guide
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Scheduled Posts</h3>
              <p className="text-muted-foreground">
                Schedule content from your Content Library to post later
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Posts Yet</h3>
              <p className="text-muted-foreground">
                Posts you deploy to social platforms will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}