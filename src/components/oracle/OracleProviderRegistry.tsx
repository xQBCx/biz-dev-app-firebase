import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useOracleProviders, useRegisterOracleProvider, OracleProviderType, OracleTrustLevel } from "@/hooks/useOracleNetwork";
import { Loader2, Plus, Radio, Wifi, User, Shield, DollarSign, Cpu, CheckCircle, XCircle } from "lucide-react";

const providerTypeIcons: Record<OracleProviderType, React.ReactNode> = {
  sensor: <Radio className="h-4 w-4" />,
  api: <Wifi className="h-4 w-4" />,
  manual: <User className="h-4 w-4" />,
  attestation: <Shield className="h-4 w-4" />,
  price_feed: <DollarSign className="h-4 w-4" />,
  iot_device: <Cpu className="h-4 w-4" />,
};

const trustLevelColors: Record<OracleTrustLevel, string> = {
  bronze: "bg-amber-700 text-white",
  silver: "bg-gray-400 text-black",
  gold: "bg-yellow-500 text-black",
  platinum: "bg-gray-200 text-black",
};

export default function OracleProviderRegistry() {
  const { data: providers, isLoading } = useOracleProviders();
  const registerProvider = useRegisterOracleProvider();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    provider_type: "api" as OracleProviderType,
    endpoint_url: "",
    trust_level: "bronze" as OracleTrustLevel,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerProvider.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({
      name: "",
      description: "",
      provider_type: "api",
      endpoint_url: "",
      trust_level: "bronze",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Oracle Provider Registry
            </CardTitle>
            <CardDescription>
              Manage trusted data sources that feed real-world information to smart contracts
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Register Oracle Provider</DialogTitle>
                <DialogDescription>
                  Add a new data source to the Oracle Network
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Provider Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Platts WTI Price Feed"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what data this provider supplies..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="provider_type">Provider Type</Label>
                      <Select
                        value={formData.provider_type}
                        onValueChange={(value: OracleProviderType) => 
                          setFormData({ ...formData, provider_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api">API Endpoint</SelectItem>
                          <SelectItem value="sensor">Physical Sensor</SelectItem>
                          <SelectItem value="iot_device">IoT Device</SelectItem>
                          <SelectItem value="price_feed">Price Feed</SelectItem>
                          <SelectItem value="manual">Manual Entry</SelectItem>
                          <SelectItem value="attestation">Human Attestation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="trust_level">Trust Level</Label>
                      <Select
                        value={formData.trust_level}
                        onValueChange={(value: OracleTrustLevel) => 
                          setFormData({ ...formData, trust_level: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {["api", "price_feed", "iot_device"].includes(formData.provider_type) && (
                    <div className="grid gap-2">
                      <Label htmlFor="endpoint_url">Endpoint URL</Label>
                      <Input
                        id="endpoint_url"
                        type="url"
                        value={formData.endpoint_url}
                        onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                        placeholder="https://api.example.com/data"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={registerProvider.isPending}>
                    {registerProvider.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Register
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!providers?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No oracle providers registered yet.</p>
            <p className="text-sm">Register your first data source to enable smart contract triggers.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {providerTypeIcons[provider.provider_type]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{provider.name}</h4>
                      <Badge className={trustLevelColors[provider.trust_level]}>
                        {provider.trust_level}
                      </Badge>
                      {provider.is_certified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {provider.description || `${provider.provider_type} provider`}
                    </p>
                    {provider.endpoint_url && (
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {provider.endpoint_url}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center gap-2 justify-end">
                    {provider.polling_enabled ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {provider.usage_stats?.total_calls ?? 0} calls
                    {(provider.usage_stats?.failed_calls ?? 0) > 0 && (
                      <span className="text-destructive ml-1">
                        ({provider.usage_stats?.failed_calls ?? 0} failed)
                      </span>
                    )}
                  </p>
                  {provider.last_polled_at && (
                    <p className="text-xs text-muted-foreground">
                      Last polled: {new Date(provider.last_polled_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
