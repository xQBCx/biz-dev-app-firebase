import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { ConnectAccountDialog } from "./ConnectAccountDialog";

interface Platform {
  id: string;
  platform_name: string;
  platform_slug: string;
  category: string;
  api_available: boolean;
  requires_app_review: boolean;
  auth_type: string;
  connector_config: any;
  logo_url: string | null;
}

interface PlatformGridProps {
  platforms: Platform[];
  onRefresh: () => void;
}

export const PlatformGrid = ({ platforms, onRefresh }: PlatformGridProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [platformToConnect, setPlatformToConnect] = useState<Platform | null>(null);

  const handleConnectClick = (platform: Platform) => {
    setPlatformToConnect(platform);
    setConnectDialogOpen(true);
    setSelectedPlatform(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      social_media: "bg-blue-500",
      messaging: "bg-green-500",
      video: "bg-purple-500",
      professional: "bg-indigo-500",
      local_business: "bg-orange-500",
      creative: "bg-pink-500",
      audio: "bg-cyan-500",
      emerging: "bg-yellow-500",
      regional: "bg-red-500",
      niche: "bg-gray-500"
    };
    return colors[category] || "bg-gray-500";
  };

  const getAuthTypeBadge = (authType: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      oauth2: { label: "OAuth 2.0", variant: "default" },
      oauth1: { label: "OAuth 1.0", variant: "secondary" },
      api_key: { label: "API Key", variant: "outline" },
      manual: { label: "Manual", variant: "destructive" },
      webhook: { label: "Webhook", variant: "default" }
    };
    const config = variants[authType] || { label: authType, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {platforms.map((platform) => (
          <Card 
            key={platform.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedPlatform(platform)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{platform.platform_name}</h3>
                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(platform.category)} inline-block mr-2`}></div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {platform.category.replace('_', ' ')}
                  </span>
                </div>
                {platform.api_available ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {getAuthTypeBadge(platform.auth_type)}
                {platform.requires_app_review && (
                  <Badge variant="outline" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Review Required
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Details Dialog */}
      <Dialog open={!!selectedPlatform} onOpenChange={() => setSelectedPlatform(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlatform?.platform_name}</DialogTitle>
            <DialogDescription>
              Platform connection and configuration details
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlatform && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedPlatform.category.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Authentication Type</p>
                  <div className="mt-1">{getAuthTypeBadge(selectedPlatform.auth_type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium">API Available</p>
                  <p className="text-sm">
                    {selectedPlatform.api_available ? "Yes" : "No (Manual Setup)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">App Review Required</p>
                  <p className="text-sm">
                    {selectedPlatform.requires_app_review ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {selectedPlatform.connector_config && (
                <div>
                  <p className="text-sm font-medium mb-2">Configuration</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedPlatform.connector_config, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleConnectClick(selectedPlatform)}
                >
                  Connect Account
                </Button>
                {selectedPlatform.api_available && (
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    API Docs
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Connect Account Dialog */}
      <ConnectAccountDialog
        platform={platformToConnect}
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  );
};