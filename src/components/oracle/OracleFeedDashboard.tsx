import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useOracleDataFeeds, useOracleProviders, useCreateDataFeed, CommodityType } from "@/hooks/useOracleNetwork";
import { Loader2, Plus, Activity, Wifi, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const commodityTypeLabels: Record<CommodityType, string> = {
  oil: "Oil",
  natural_gas: "Natural Gas",
  electricity: "Electricity",
  carbon_credit: "Carbon Credit",
  rin: "RIN",
  water: "Water",
  minerals: "Minerals",
  agricultural: "Agricultural",
  other: "Other",
};

export default function OracleFeedDashboard() {
  const { data: feeds, isLoading: feedsLoading } = useOracleDataFeeds();
  const { data: providers, isLoading: providersLoading } = useOracleProviders();
  const createFeed = useCreateDataFeed();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    provider_id: "",
    feed_name: "",
    feed_type: "price",
    commodity_type: "oil" as CommodityType,
    unit_of_measure: "",
    polling_frequency_seconds: 300,
    anomaly_threshold: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFeed.mutateAsync({
      provider_id: formData.provider_id,
      feed_name: formData.feed_name,
      feed_type: formData.feed_type,
      commodity_type: formData.commodity_type,
      unit_of_measure: formData.unit_of_measure,
      polling_frequency_seconds: formData.polling_frequency_seconds,
      anomaly_threshold: formData.anomaly_threshold,
    });
    setIsDialogOpen(false);
    setFormData({
      provider_id: "",
      feed_name: "",
      feed_type: "price",
      commodity_type: "oil",
      unit_of_measure: "",
      polling_frequency_seconds: 300,
      anomaly_threshold: 10,
    });
  };

  const isLoading = feedsLoading || providersLoading;

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
              <Activity className="h-5 w-5" />
              Oracle Data Feeds
            </CardTitle>
            <CardDescription>
              Real-time data streams from certified oracle providers
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!providers?.length}>
                <Plus className="h-4 w-4 mr-2" />
                Create Feed
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Data Feed</DialogTitle>
                <DialogDescription>
                  Configure a new data stream from an oracle provider
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="provider_id">Oracle Provider</Label>
                    <Select
                      value={formData.provider_id}
                      onValueChange={(value) => setFormData({ ...formData, provider_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider..." />
                      </SelectTrigger>
                      <SelectContent>
                        {providers?.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="feed_name">Feed Name</Label>
                    <Input
                      id="feed_name"
                      value={formData.feed_name}
                      onChange={(e) => setFormData({ ...formData, feed_name: e.target.value })}
                      placeholder="e.g., WTI Crude Spot Price"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="feed_type">Feed Type</Label>
                      <Select
                        value={formData.feed_type}
                        onValueChange={(value) => setFormData({ ...formData, feed_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="volume">Volume</SelectItem>
                          <SelectItem value="temperature">Temperature</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="flow_rate">Flow Rate</SelectItem>
                          <SelectItem value="level">Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="commodity_type">Commodity</Label>
                      <Select
                        value={formData.commodity_type}
                        onValueChange={(value: CommodityType) =>
                          setFormData({ ...formData, commodity_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(commodityTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                    <Input
                      id="unit_of_measure"
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                      placeholder="e.g., USD/barrel, MMBtu, kWh"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="polling_frequency">Poll Every (seconds)</Label>
                      <Input
                        id="polling_frequency"
                        type="number"
                        min={60}
                        value={formData.polling_frequency_seconds}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            polling_frequency_seconds: parseInt(e.target.value) || 300,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="anomaly_threshold">Anomaly Threshold (%)</Label>
                      <Input
                        id="anomaly_threshold"
                        type="number"
                        min={0}
                        max={100}
                        value={formData.anomaly_threshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            anomaly_threshold: parseFloat(e.target.value) || 10,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFeed.isPending || !formData.provider_id}
                  >
                    {createFeed.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Feed
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!feeds?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No data feeds configured yet.</p>
            <p className="text-sm">
              Create a data feed to start receiving real-time oracle data.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {feeds.map((feed) => {
              const lastValue = feed.last_value as Record<string, unknown> | null;
              const displayValue =
                lastValue?.value !== undefined
                  ? lastValue.value
                  : lastValue
                  ? JSON.stringify(lastValue)
                  : "N/A";

              return (
                <div
                  key={feed.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{feed.feed_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{feed.feed_type}</Badge>
                        {feed.commodity_type && (
                          <Badge variant="secondary">
                            {commodityTypeLabels[feed.commodity_type]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={feed.is_active ? "bg-green-600" : "bg-gray-500"}>
                      {feed.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Value</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-mono font-medium">
                          {String(displayValue)}
                          {feed.unit_of_measure && (
                            <span className="text-muted-foreground ml-1">
                              {feed.unit_of_measure}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {feed.last_updated
                        ? `Updated ${formatDistanceToNow(new Date(feed.last_updated), {
                            addSuffix: true,
                          })}`
                        : "Never updated"}
                    </span>
                    <span>Every {feed.polling_frequency_seconds}s</span>
                  </div>

                  {feed.anomaly_threshold && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      Alert if change {">"} {feed.anomaly_threshold}%
                    </div>
                  )}

                  {feed.provider && (
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Provider: {feed.provider.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
