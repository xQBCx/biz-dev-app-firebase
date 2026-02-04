import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Key, Save, Trash2, Video, Box } from "lucide-react";

interface ApiKey {
  provider: string;
  hasKey: boolean;
}

const API_PROVIDERS = [
  {
    id: "luma_ai",
    name: "Luma AI",
    description: "Video generation (Ray-2) and 3D Gaussian splat generation",
    icon: Video,
    link: "https://lumalabs.ai/dream-machine/api/keys",
  },
];

export function ApiKeySettings() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [existingKeys, setExistingKeys] = useState<ApiKey[]>([]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadExistingKeys();
  }, []);

  const loadExistingKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_api_keys")
        .select("provider")
        .eq("user_id", user.id);

      if (error) throw error;

      setExistingKeys(
        API_PROVIDERS.map((p) => ({
          provider: p.id,
          hasKey: data?.some((k) => k.provider === p.id) || false,
        }))
      );
    } catch (error) {
      console.error("Error loading API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (provider: string) => {
    const apiKey = keys[provider];
    if (!apiKey?.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    setSaving(provider);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_api_keys")
        .upsert({
          user_id: user.id,
          provider,
          api_key: apiKey.trim(),
        }, {
          onConflict: "user_id,provider",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key saved successfully",
      });

      setKeys((prev) => ({ ...prev, [provider]: "" }));
      loadExistingKeys();
    } catch (error: any) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteKey = async (provider: string) => {
    setSaving(provider);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_api_keys")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", provider);

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });

      loadExistingKeys();
    } catch (error: any) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Add your own API keys to enable video generation and 3D model creation.
          Your keys are stored securely and only used for your requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {API_PROVIDERS.map((provider) => {
          const existingKey = existingKeys.find((k) => k.provider === provider.id);
          const Icon = provider.icon;

          return (
            <div key={provider.id} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{provider.name}</h4>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                {existingKey?.hasKey && (
                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                    Configured
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type={showKeys[provider.id] ? "text" : "password"}
                    placeholder={existingKey?.hasKey ? "••••••••••••••••" : "Enter your API key"}
                    value={keys[provider.id] || ""}
                    onChange={(e) => setKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowKeys((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                  >
                    {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  onClick={() => handleSaveKey(provider.id)}
                  disabled={saving === provider.id || !keys[provider.id]?.trim()}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                {existingKey?.hasKey && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteKey(provider.id)}
                    disabled={saving === provider.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href={provider.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {provider.name}
                </a>
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
