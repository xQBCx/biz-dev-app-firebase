import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Link2, Users, Share2, LayoutGrid, Scan, Fingerprint, MapPin, CreditCard, Vibrate, Clipboard, FileText, Printer, Monitor, Shield, Camera, Mic, Bluetooth, Nfc, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NativeFeature {
  key: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  hasWizard?: boolean;
}

const NATIVE_FEATURES: NativeFeature[] = [
  { key: "push_notifications", name: "Push Notifications", description: "Send push notifications to users", icon: Bell, category: "Communication", hasWizard: true },
  { key: "deep_linking", name: "Deep Linking", description: "Handle custom URL schemes and universal links", icon: Link2, category: "Navigation", hasWizard: true },
  { key: "contacts", name: "Contacts Access", description: "Read device contacts with permission prompts", icon: Users, category: "Data Access" },
  { key: "share_sheet", name: "Share Sheet", description: "Native social sharing integration", icon: Share2, category: "Social" },
  { key: "home_widgets", name: "Home Screen Widgets", description: "Dynamic widgets with refresh strategy", icon: LayoutGrid, category: "UI", hasWizard: true },
  { key: "app_clips", name: "App Clips (iOS)", description: "Lightweight app experiences", icon: Scan, category: "iOS Specific", hasWizard: true },
  { key: "biometrics", name: "Biometrics", description: "Face ID, Touch ID, fingerprint authentication", icon: Fingerprint, category: "Security" },
  { key: "location", name: "Location", description: "GPS and background location access", icon: MapPin, category: "Sensors" },
  { key: "background_location", name: "Background Location", description: "Location tracking when app is in background", icon: MapPin, category: "Sensors" },
  { key: "in_app_purchases", name: "In-App Purchases", description: "Subscriptions and one-time purchases", icon: CreditCard, category: "Monetization", hasWizard: true },
  { key: "haptics", name: "Haptic Feedback", description: "Vibration and haptic patterns", icon: Vibrate, category: "Utility" },
  { key: "clipboard", name: "Clipboard", description: "Read and write to clipboard", icon: Clipboard, category: "Utility" },
  { key: "file_system", name: "File System", description: "Read and write local files", icon: FileText, category: "Utility" },
  { key: "printing", name: "Printing", description: "Print documents and images", icon: Printer, category: "Utility" },
  { key: "status_bar", name: "Status Bar Control", description: "Customize status bar appearance", icon: Monitor, category: "UI" },
  { key: "safe_area", name: "Safe Area CSS", description: "CSS variables for safe areas", icon: Shield, category: "UI" },
  { key: "camera", name: "Camera", description: "Access device camera", icon: Camera, category: "Media" },
  { key: "microphone", name: "Microphone", description: "Audio recording access", icon: Mic, category: "Media" },
  { key: "bluetooth", name: "Bluetooth", description: "Bluetooth device connectivity", icon: Bluetooth, category: "Hardware" },
  { key: "nfc", name: "NFC", description: "Near-field communication", icon: Nfc, category: "Hardware" },
  { key: "network_info", name: "Network Info", description: "WiFi and network status", icon: Wifi, category: "Utility" },
];

const StoreLaunchFeatures = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ["store-launch-project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_projects")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: enabledFeatures } = useQuery({
    queryKey: ["store-launch-features", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_native_features")
        .select("*")
        .eq("project_id", id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const toggleFeature = useMutation({
    mutationFn: async ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) => {
      const existingFeature = enabledFeatures?.find((f) => f.feature_key === featureKey);
      
      if (existingFeature) {
        const { error } = await supabase
          .from("store_launch_native_features")
          .update({ is_enabled: enabled })
          .eq("id", existingFeature.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("store_launch_native_features")
          .insert({
            project_id: id,
            feature_key: featureKey,
            is_enabled: enabled,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-launch-features", id] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const isFeatureEnabled = (featureKey: string) => {
    return enabledFeatures?.find((f) => f.feature_key === featureKey)?.is_enabled || false;
  };

  const isFeatureSetupComplete = (featureKey: string) => {
    return enabledFeatures?.find((f) => f.feature_key === featureKey)?.setup_completed || false;
  };

  const categories = [...new Set(NATIVE_FEATURES.map((f) => f.category))];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(`/store-launch/project/${id}`)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Project
      </Button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Native Features</h1>
        <p className="text-muted-foreground">
          Configure native device APIs for {project?.name}
        </p>
      </div>

      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm">
          <span className="font-medium">{enabledFeatures?.filter((f) => f.is_enabled).length || 0}</span>
          <span className="text-muted-foreground"> of {NATIVE_FEATURES.length} features enabled</span>
        </div>
        <Badge variant="outline">
          {enabledFeatures?.filter((f) => f.is_enabled && f.setup_completed).length || 0} configured
        </Badge>
      </div>

      {categories.map((category) => (
        <Card key={category} className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {NATIVE_FEATURES.filter((f) => f.category === category).map((feature) => {
              const enabled = isFeatureEnabled(feature.key);
              const setupComplete = isFeatureSetupComplete(feature.key);
              
              return (
                <div
                  key={feature.key}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{feature.name}</h4>
                        {enabled && !setupComplete && feature.hasWizard && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Setup Required
                          </Badge>
                        )}
                        {enabled && setupComplete && (
                          <Badge className="bg-green-500/20 text-green-600">Configured</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {enabled && feature.hasWizard && (
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    )}
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        toggleFeature.mutate({ featureKey: feature.key, enabled: checked })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card className="border-border bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Over-the-Air Updates</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Web content updates don't require store review. Changes to native features or the
            app shell require a new build and store submission.
          </p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-green-600">✓ OTA Updates:</span>
              <span className="text-muted-foreground ml-2">HTML, CSS, JS, images</span>
            </div>
            <div>
              <span className="text-yellow-600">⚠ Rebuild Required:</span>
              <span className="text-muted-foreground ml-2">Native features, permissions, icons</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreLaunchFeatures;
