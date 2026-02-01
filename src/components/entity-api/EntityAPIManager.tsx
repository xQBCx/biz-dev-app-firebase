import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEntityApiEndpoints, useRegisterEntityApiEndpoint, useEntityApiCallLogs, EntityApiType, EntityAuthType } from "@/hooks/useEntityAPIs";
import { Loader2, Plus, Plug, Activity, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";

const endpointTypeLabels: Record<EntityApiType, string> = {
  publish_work_order: "Publish Work Order",
  submit_bid: "Submit Bid",
  accept_bid: "Accept Bid",
  reject_bid: "Reject Bid",
  approve_completion: "Approve Completion",
  reject_completion: "Reject Completion",
  submit_invoice: "Submit Invoice",
  approve_invoice: "Approve Invoice",
  issue_payment: "Issue Payment",
  issue_change_order: "Issue Change Order",
  approve_change_order: "Approve Change Order",
  confirm_delivery: "Confirm Delivery",
  report_issue: "Report Issue",
  custom: "Custom",
};

interface EntityAPIManagerProps {
  entityId: string;
}

export default function EntityAPIManager({ entityId }: EntityAPIManagerProps) {
  const { data: endpoints, isLoading } = useEntityApiEndpoints(entityId);
  const { data: callLogs } = useEntityApiCallLogs(undefined, undefined);
  const registerEndpoint = useRegisterEntityApiEndpoint();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    endpoint_name: "",
    endpoint_type: "custom" as EntityApiType,
    http_method: "POST",
    endpoint_path: "",
    base_url: "",
    auth_type: "api_key" as EntityAuthType,
    webhook_url: "",
    timeout_seconds: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerEndpoint.mutateAsync({
      entity_id: entityId,
      ...formData,
    });
    setIsDialogOpen(false);
    setFormData({
      endpoint_name: "",
      endpoint_type: "custom",
      http_method: "POST",
      endpoint_path: "",
      base_url: "",
      auth_type: "api_key",
      webhook_url: "",
      timeout_seconds: 30,
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
              <Plug className="h-5 w-5" />
              Entity API Manager
            </CardTitle>
            <CardDescription>
              Register and manage API endpoints that wrap your internal business processes
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Register Entity API Endpoint</DialogTitle>
                <DialogDescription>
                  Create a digital wrapper around your internal business action
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="endpoint_name">Endpoint Name</Label>
                    <Input
                      id="endpoint_name"
                      value={formData.endpoint_name}
                      onChange={(e) => setFormData({ ...formData, endpoint_name: e.target.value })}
                      placeholder="e.g., Approve Work Completion"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="endpoint_type">Action Type</Label>
                      <Select
                        value={formData.endpoint_type}
                        onValueChange={(value: EntityApiType) => 
                          setFormData({ ...formData, endpoint_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(endpointTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="http_method">HTTP Method</Label>
                      <Select
                        value={formData.http_method}
                        onValueChange={(value) => 
                          setFormData({ ...formData, http_method: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="base_url">Base URL</Label>
                    <Input
                      id="base_url"
                      type="url"
                      value={formData.base_url}
                      onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                      placeholder="https://api.yourcompany.com"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endpoint_path">Endpoint Path</Label>
                    <Input
                      id="endpoint_path"
                      value={formData.endpoint_path}
                      onChange={(e) => setFormData({ ...formData, endpoint_path: e.target.value })}
                      placeholder="/v1/work-orders/approve"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="auth_type">Authentication</Label>
                      <Select
                        value={formData.auth_type}
                        onValueChange={(value: EntityAuthType) => 
                          setFormData({ ...formData, auth_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                          <SelectItem value="jwt">JWT</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="timeout">Timeout (seconds)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        min="1"
                        max="300"
                        value={formData.timeout_seconds}
                        onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="webhook_url">Webhook URL (Optional)</Label>
                    <Input
                      id="webhook_url"
                      type="url"
                      value={formData.webhook_url}
                      onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                      placeholder="https://your-webhook-receiver.com/callback"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={registerEndpoint.isPending}>
                    {registerEndpoint.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Register
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="endpoints">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="logs">Call Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="mt-4">
            {!endpoints?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No API endpoints registered yet.</p>
                <p className="text-sm">Register endpoints to wrap your internal business processes.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Plug className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{endpoint.endpoint_name}</h4>
                          <Badge variant="outline">
                            {endpointTypeLabels[endpoint.endpoint_type]}
                          </Badge>
                          <Badge variant="secondary">
                            {endpoint.http_method}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mt-1">
                          {endpoint.base_url}{endpoint.endpoint_path}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-2 justify-end">
                        {endpoint.is_active ? (
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
                        {endpoint.invocation_count} calls
                        {endpoint.failure_count > 0 && (
                          <span className="text-destructive ml-1">
                            ({endpoint.failure_count} failed)
                          </span>
                        )}
                      </p>
                      {endpoint.last_invoked_at && (
                        <p className="text-xs text-muted-foreground">
                          Last called: {new Date(endpoint.last_invoked_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            {!callLogs?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No API calls logged yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {callLogs.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {log.response_status_code || "N/A"}
                          </span>
                          {log.triggered_bindings?.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              {log.triggered_bindings.length} binding(s) triggered
                            </Badge>
                          )}
                        </div>
                        {log.error_message && (
                          <p className="text-xs text-destructive mt-1">
                            {log.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.response_time_ms}ms
                      </span>
                      <span className="text-xs">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
